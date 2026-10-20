import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import temml from "temml";
import { mml2omml } from "mathml2omml";
import * as docx from "docx";
import JSZip from "jszip";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared server-side Gemini client as instructed in SKILL.md
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Convert LaTeX formula to OMML XML
function latexToOmml(latex: string, isDisplay: boolean = false): { omml: string; mathml: string } {
  try {
    const mathml = temml.renderToString(latex, {
      displayMode: isDisplay,
    });
    let omml = mml2omml(mathml);
    // Strip unnecessary outer namespaces if present for clean nesting
    omml = omml.replace(/xmlns:m="[^"]*"/g, "").replace(/xmlns:w="[^"]*"/g, "");
    if (isDisplay && !omml.includes("<m:oMathPara>")) {
      omml = `<m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${omml}</m:oMathPara>`;
    }
    return { omml, mathml };
  } catch (err: any) {
    // Fallback: simple text run math
    const escaped = latex.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const omml = `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:r><m:t>${escaped}</m:t></m:r></m:oMath>`;
    return { omml, mathml: `<math><mtext>${escaped}</mtext></math>` };
  }
}

// System prompt for high-precision Math PDF OCR and document reconstruction
const MATH_EXTRACTION_PROMPT = `You are a world-class Mathematical Document Recognition and OCR specialist.
Your task is to transcribe and reconstruct the mathematical document (PDF page or cropped snippet) with absolute fidelity.

Crucial Math & Equation Rules:
1. Preserve ALL mathematical expressions exactly.
2. Inline equations must be enclosed in single dollar signs: $...$
3. Display/block equations must be enclosed in double dollar signs: $$...$$
4. Use standard, correct LaTeX math commands:
   - Fractions: \\frac{numerator}{denominator}
   - Integrals: \\int_{lower}^{upper} f(x) dx
   - Sums: \\sum_{k=1}^{n} a_k
   - Limits: \\lim_{x \\to \\infty}
   - Matrices: \\begin{pmatrix} ... \\end{pmatrix} or \\begin{bmatrix} ... \\end{bmatrix}
   - Square roots: \\sqrt{x} or \\sqrt[n]{x}
   - Greek letters: \\alpha, \\beta, \\theta, \\lambda, \\pi, \\Delta, \\Sigma, etc.
   - Accents: \\hat{x}, \\vec{v}, \\bar{x}, \\dot{x}
   - Relations & operators: \\leq, \\geq, \\neq, \\approx, \\in, \\subset, \\times, \\pm
5. For multiple-choice questions or exams:
   - Preserve question labels like "Question 1:", "Problem 4.", "Bài 1:"
   - Preserve choices (A), (B), (C), (D) on separate lines or clean columns.
6. For theorems, definitions, proofs:
   - Prefix with **Theorem**, **Definition**, **Proof**, etc.
7. Return a clean, structured JSON response with:
   - "title": (string) document or page header title
   - "documentType": (string: "exam", "research_paper", "textbook", "homework", "notes", or "formula_sheet")
   - "markdown": (string) full document formatted in Markdown with $...$ and $$...$$ math delimiters
   - "latex": (string) full compilable LaTeX document code
   - "sections": array of objects:
     {
       "type": "heading" | "paragraph" | "equation_block" | "question" | "table" | "proof",
       "content": string,
       "mathLatexList": string[] (list of any LaTeX formulas found in this section)
     }
   - "extractedEquations": array of extracted formulas:
     {
       "latex": string,
       "isDisplay": boolean,
       "description": string (e.g. "Quadratic equation", "Normal distribution formula", "Navier-Stokes equation")
     }
   - "stats": {
       "equationCount": number,
       "questionCount": number,
       "confidenceScore": number (0 to 100)
     }

Make sure the JSON is 100% valid. Do not wrap with markdown backticks if possible, or use standard json.`;

// API route to recognize and convert math from image or base64 PDF page
app.post("/api/convert-math", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", promptExtra = "" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const contents = [
      {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `${MATH_EXTRACTION_PROMPT}\n\nAdditional user instruction or context: ${promptExtra || "None. Extract accurately with full math formulas."}\n\nRespond ONLY in valid JSON.`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Fallback: cleanup backticks
      const sanitized = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(sanitized);
    }

    // Enhance equations with OMML and MathML for quick Word copy/inspection
    if (Array.isArray(parsed.extractedEquations)) {
      parsed.extractedEquations = parsed.extractedEquations.map((eq: any, index: number) => {
        const { omml, mathml } = latexToOmml(eq.latex || "", eq.isDisplay);
        return {
          id: `eq_${index + 1}`,
          ...eq,
          omml,
          mathml,
        };
      });
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Math conversion error:", error);
    res.status(500).json({
      error: error.message || "Failed to process math document with Gemini",
    });
  }
});

// API route to generate .docx with native OMML equations
app.post("/api/generate-docx", async (req, res) => {
  try {
    const { title = "Converted Math Document", markdown = "", sections = [] } = req.body;

    // Build Word document structure
    const paragraphs: docx.Paragraph[] = [];

    // Title paragraph
    paragraphs.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: title,
            bold: true,
            size: 36, // 18pt
            font: "Calibri",
            color: "1E293B",
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Track placeholders to inject OMML into docx XML
    const ommlReplacements: { placeholder: string; omml: string }[] = [];
    let mathIndex = 0;

    // Helper to process markdown/text line with math
    const processContentToRuns = (text: string): docx.TextRun[] => {
      const runs: docx.TextRun[] = [];
      // Regex for $...$ (inline math) and $$...$$ (display math)
      const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
      let lastIndex = 0;
      let match;

      while ((match = mathRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const plainText = text.substring(lastIndex, match.index);
          runs.push(
            new docx.TextRun({
              text: plainText,
              size: 24, // 12pt
              font: "Cambria",
            })
          );
        }

        const isDisplay = !!match[1];
        const latex = match[1] || match[2];
        mathIndex++;
        const placeholder = `_MATH_OMML_TOKEN_${mathIndex}_`;
        const { omml } = latexToOmml(latex, isDisplay);
        ommlReplacements.push({ placeholder, omml });

        runs.push(
          new docx.TextRun({
            text: placeholder,
          })
        );

        lastIndex = mathRegex.lastIndex;
      }

      if (lastIndex < text.length) {
        runs.push(
          new docx.TextRun({
            text: text.substring(lastIndex),
            size: 24,
            font: "Cambria",
          })
        );
      }

      return runs.length > 0 ? runs : [new docx.TextRun({ text: text || " ", size: 24, font: "Cambria" })];
    };

    // If structured sections exist, use them; otherwise split markdown lines
    if (sections && sections.length > 0) {
      for (const sec of sections) {
        if (sec.type === "heading") {
          paragraphs.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: sec.content,
                  bold: true,
                  size: 28,
                  font: "Calibri",
                  color: "0F172A",
                }),
              ],
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (sec.type === "question") {
          paragraphs.push(
            new docx.Paragraph({
              children: processContentToRuns(sec.content),
              spacing: { before: 180, after: 100 },
              border: {
                left: {
                  color: "3B82F6",
                  size: 12,
                  style: docx.BorderStyle.SINGLE,
                  space: 8,
                },
              },
            })
          );
        } else if (sec.type === "equation_block") {
          const { omml } = latexToOmml(sec.content.replace(/^\$\$|\$\$$/g, ""), true);
          mathIndex++;
          const placeholder = `_MATH_OMML_TOKEN_${mathIndex}_`;
          ommlReplacements.push({ placeholder, omml });
          paragraphs.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: placeholder })],
              alignment: docx.AlignmentType.CENTER,
              spacing: { before: 160, after: 160 },
            })
          );
        } else {
          // Regular paragraph
          paragraphs.push(
            new docx.Paragraph({
              children: processContentToRuns(sec.content),
              spacing: { before: 60, after: 120 },
            })
          );
        }
      }
    } else {
      // Split markdown by lines
      const lines = markdown.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          paragraphs.push(new docx.Paragraph({ text: "", spacing: { after: 100 } }));
          continue;
        }

        if (trimmed.startsWith("# ")) {
          paragraphs.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: trimmed.replace("# ", ""), bold: true, size: 32, font: "Calibri" })],
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (trimmed.startsWith("## ")) {
          paragraphs.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: trimmed.replace("## ", ""), bold: true, size: 28, font: "Calibri" })],
              spacing: { before: 180, after: 80 },
            })
          );
        } else if (trimmed.startsWith("### ")) {
          paragraphs.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: trimmed.replace("### ", ""), bold: true, size: 26, font: "Calibri" })],
              spacing: { before: 140, after: 60 },
            })
          );
        } else {
          paragraphs.push(
            new docx.Paragraph({
              children: processContentToRuns(trimmed),
              spacing: { after: 100 },
            })
          );
        }
      }
    }

    const doc = new docx.Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    const zip = await JSZip.loadAsync(buffer);
    let docXml = await zip.file("word/document.xml")!.async("text");

    // Replace all placeholders with native OMML XML!
    for (const item of ommlReplacements) {
      const targetR = `<w:r><w:t>${item.placeholder}</w:t></w:r>`;
      if (docXml.includes(targetR)) {
        docXml = docXml.replace(targetR, item.omml);
      } else {
        // Fallback replacement if space preserved
        docXml = docXml.replace(item.placeholder, item.omml);
      }
    }

    zip.file("word/document.xml", docXml);
    const finalDocxBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(title)}.docx"`);
    res.send(finalDocxBuffer);
  } catch (error: any) {
    console.error("DOCX generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate Word document" });
  }
});

// Single formula to OMML / MathML quick conversion endpoint
app.post("/api/math-convert", (req, res) => {
  try {
    const { latex = "", isDisplay = false } = req.body;
    const result = latexToOmml(latex, isDisplay);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`PDFtoWordMath server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

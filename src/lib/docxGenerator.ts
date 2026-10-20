import * as docx from "docx";
import JSZip from "jszip";
import { convertLatexToWordMath } from "./ommlConverter";
import { ConvertedDocument } from "../types/math";

export async function exportDocxFromDocument(docData: ConvertedDocument): Promise<Blob> {
  const paragraphs: docx.Paragraph[] = [];

  // Document Title
  paragraphs.push(
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: docData.title || "Mathematical Document",
          bold: true,
          size: 36, // 18pt
          font: "Calibri",
          color: "1E293B",
        }),
      ],
      spacing: { after: 280 },
    })
  );

  const ommlReplacements: { placeholder: string; omml: string }[] = [];
  let mathCounter = 0;

  // Process text line containing math tokens
  const processTextToRuns = (text: string): docx.TextRun[] => {
    const runs: docx.TextRun[] = [];
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
      mathCounter++;
      const placeholder = `_MATH_OMML_INJECT_${mathCounter}_`;
      const { cleanOmml } = convertLatexToWordMath(latex, isDisplay);
      ommlReplacements.push({ placeholder, omml: cleanOmml });

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

  if (docData.sections && docData.sections.length > 0) {
    for (const sec of docData.sections) {
      if (sec.type === "heading") {
        paragraphs.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: sec.content,
                bold: true,
                size: 28, // 14pt
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
            children: processTextToRuns(sec.content),
            spacing: { before: 180, after: 120 },
            border: {
              left: {
                color: "2563EB",
                size: 16,
                style: docx.BorderStyle.SINGLE,
                space: 10,
              },
            },
          })
        );
      } else if (sec.type === "equation_block") {
        mathCounter++;
        const placeholder = `_MATH_OMML_INJECT_${mathCounter}_`;
        const { cleanOmml } = convertLatexToWordMath(sec.content, true);
        ommlReplacements.push({ placeholder, omml: cleanOmml });

        paragraphs.push(
          new docx.Paragraph({
            children: [new docx.TextRun({ text: placeholder })],
            alignment: docx.AlignmentType.CENTER,
            spacing: { before: 160, after: 160 },
          })
        );
      } else {
        paragraphs.push(
          new docx.Paragraph({
            children: processTextToRuns(sec.content),
            spacing: { after: 120 },
          })
        );
      }
    }
  } else {
    // Process markdown string
    const lines = (docData.markdown || "").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new docx.Paragraph({ text: "", spacing: { after: 80 } }));
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
      } else {
        paragraphs.push(
          new docx.Paragraph({
            children: processTextToRuns(trimmed),
            spacing: { after: 100 },
          })
        );
      }
    }
  }

  const wordDoc = new docx.Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
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

  const rawBuffer = await docx.Packer.toBuffer(wordDoc);
  const zip = await JSZip.loadAsync(rawBuffer);
  let docXml = await zip.file("word/document.xml")!.async("text");

  // Inject OMML mathematical XML
  for (const item of ommlReplacements) {
    const targetTag = `<w:r><w:t>${item.placeholder}</w:t></w:r>`;
    if (docXml.includes(targetTag)) {
      docXml = docXml.replace(targetTag, item.omml);
    } else {
      docXml = docXml.replace(item.placeholder, item.omml);
    }
  }

  zip.file("word/document.xml", docXml);
  const finalBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return finalBlob;
}

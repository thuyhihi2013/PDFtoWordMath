import temml from "temml";
import { mml2omml } from "mathml2omml";

/**
 * Converts standard LaTeX math into MathML and native Microsoft Word OMML (Office Math Markup Language)
 */
export function convertLatexToWordMath(latex: string, isDisplay: boolean = false): {
  mathml: string;
  omml: string;
  cleanOmml: string;
} {
  try {
    let cleanLatex = latex.trim();
    if (cleanLatex.startsWith("$$") && cleanLatex.endsWith("$$")) {
      cleanLatex = cleanLatex.slice(2, -2).trim();
      isDisplay = true;
    } else if (cleanLatex.startsWith("$") && cleanLatex.endsWith("$")) {
      cleanLatex = cleanLatex.slice(1, -1).trim();
    }

    const mathml = temml.renderToString(cleanLatex, {
      displayMode: isDisplay,
    });

    let omml = mml2omml(mathml);

    // Make sure it has proper namespace for standalone clipboard or Word XML injection
    let cleanOmml = omml.replace(/xmlns:m="[^"]*"/g, "").replace(/xmlns:w="[^"]*"/g, "");

    if (isDisplay && !cleanOmml.includes("<m:oMathPara>")) {
      cleanOmml = `<m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${cleanOmml}</m:oMathPara>`;
    } else if (!cleanOmml.includes("xmlns:m=")) {
      cleanOmml = cleanOmml.replace("<m:oMath", '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"');
    }

    return {
      mathml,
      omml,
      cleanOmml,
    };
  } catch (err: any) {
    console.warn("LaTeX to Word OMML conversion error:", err);
    const escaped = latex.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fallbackOmml = `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:r><m:t>${escaped}</m:t></m:r></m:oMath>`;
    return {
      mathml: `<math><mtext>${escaped}</mtext></math>`,
      omml: fallbackOmml,
      cleanOmml: fallbackOmml,
    };
  }
}

/**
 * Helper to copy OMML to clipboard in a format Microsoft Word can paste directly
 */
export async function copyOmmlForWord(latex: string, isDisplay: boolean = false): Promise<boolean> {
  try {
    const { cleanOmml, mathml } = convertLatexToWordMath(latex, isDisplay);

    // Modern browsers allow writing text/html to clipboard
    if (navigator.clipboard && window.ClipboardItem) {
      const blobText = new Blob([cleanOmml], { type: "text/plain" });
      const blobHtml = new Blob([`<meta charset="utf-8">${cleanOmml}`], { type: "text/html" });
      const item = new ClipboardItem({
        "text/plain": blobText,
        "text/html": blobHtml,
      });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      await navigator.clipboard.writeText(cleanOmml);
      return true;
    }
  } catch (err) {
    console.error("Clipboard copy error:", err);
    // Fallback to text copy
    const { cleanOmml } = convertLatexToWordMath(latex, isDisplay);
    await navigator.clipboard.writeText(cleanOmml);
    return true;
  }
}

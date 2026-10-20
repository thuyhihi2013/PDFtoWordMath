export interface ExtractedEquation {
  id: string;
  latex: string;
  isDisplay: boolean;
  description?: string;
  omml?: string;
  mathml?: string;
}

export interface DocumentSection {
  type: "heading" | "paragraph" | "equation_block" | "question" | "table" | "proof";
  content: string;
  mathLatexList?: string[];
  level?: number;
}

export interface ConversionStats {
  equationCount: number;
  questionCount: number;
  confidenceScore: number;
  processingTimeMs?: number;
}

export interface ConvertedDocument {
  title: string;
  documentType: "exam" | "research_paper" | "textbook" | "homework" | "notes" | "formula_sheet";
  markdown: string;
  latex: string;
  sections: DocumentSection[];
  extractedEquations: ExtractedEquation[];
  stats: ConversionStats;
}

export interface ConversionOptions {
  detectQuestions: boolean;
  inlineMathDelimiters: "$" | "\\(";
  displayMathDelimiters: "$$" | "\\[";
  preserveLayout: boolean;
  fontSize: "11pt" | "12pt" | "14pt";
}

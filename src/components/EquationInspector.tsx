import React, { useState } from "react";
import { ExtractedEquation } from "../types/math";
import { MathView } from "./MathView";
import { copyOmmlForWord, convertLatexToWordMath } from "../lib/ommlConverter";
import {
  Copy,
  Check,
  Code2,
  FileCode,
  Sparkles,
  ExternalLink,
  Edit2,
  Terminal,
  Zap,
} from "lucide-react";

interface EquationInspectorProps {
  equations: ExtractedEquation[];
  onUpdateEquation?: (id: string, newLatex: string) => void;
}

const COMMON_MATH_SYMBOLS = [
  { label: "Fraction", latex: "\\frac{a}{b}" },
  { label: "Square Root", latex: "\\sqrt{x}" },
  { label: "N-th Root", latex: "\\sqrt[n]{x}" },
  { label: "Definite Integral", latex: "\\int_{a}^{b} f(x) \\, dx" },
  { label: "Summation", latex: "\\sum_{i=1}^{n} x_i" },
  { label: "Limit", latex: "\\lim_{x \\to \\infty}" },
  { label: "Partial", latex: "\\frac{\\partial y}{\\partial x}" },
  { label: "Vector", latex: "\\vec{v}" },
  { label: "Matrix 2x2", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
  { label: "Alpha", latex: "\\alpha" },
  { label: "Beta", latex: "\\beta" },
  { label: "Theta", latex: "\\theta" },
  { label: "Lambda", latex: "\\lambda" },
  { label: "Pi", latex: "\\pi" },
  { label: "Infinity", latex: "\\infty" },
  { label: "Approx", latex: "\\approx" },
  { label: "Neq", latex: "\\neq" },
  { label: "Plus/Minus", latex: "\\pm" },
];

export const EquationInspector: React.FC<EquationInspectorProps> = ({
  equations,
  onUpdateEquation,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLatex, setEditLatex] = useState<string>("");

  // Live Sandbox state
  const [sandboxLatex, setSandboxLatex] = useState<string>(
    "\\int_{0}^{\\infty} \\frac{\\sin(x)}{x} \\, dx = \\frac{\\pi}{2}"
  );

  const handleCopy = async (id: string, text: string, type: string) => {
    try {
      if (type === "omml") {
        await copyOmmlForWord(text, true);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setCopiedType(type);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleInsertSymbol = (symbolLatex: string) => {
    setSandboxLatex((prev) => `${prev} ${symbolLatex}`.trim());
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Interactive Formula Sandbox & Palette */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Live Formula Sandbox & Symbol Palette
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time KaTeX & OMML
          </span>
        </div>

        {/* Quick symbol buttons */}
        <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-slate-800">
          {COMMON_MATH_SYMBOLS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleInsertSymbol(item.latex)}
              className="px-2 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded font-mono transition active:scale-95"
              title={`Insert ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Formula Input */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              LaTeX Code Input:
            </label>
            <input
              type="text"
              value={sandboxLatex}
              onChange={(e) => setSandboxLatex(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Type or paste LaTeX..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Live Rendered Equation:
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center min-h-[46px] flex items-center justify-center">
              <MathView latex={sandboxLatex} displayMode={true} />
            </div>
          </div>
        </div>

        {/* Quick copy buttons for sandbox formula */}
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => handleCopy("sandbox", sandboxLatex, "omml")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow transition"
          >
            {copiedId === "sandbox" && copiedType === "omml" ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Word OMML</span>
          </button>
          <button
            onClick={() => handleCopy("sandbox", sandboxLatex, "latex")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            {copiedId === "sandbox" && copiedType === "latex" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Code2 className="w-3.5 h-3.5" />
            )}
            <span>Copy LaTeX</span>
          </button>
        </div>
      </div>

      {/* Extracted Equations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Document Extracted Equations ({equations.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click "Copy for Word" to paste straight into Word's equation editor
          </span>
        </div>

        {equations.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-sm">
            No formulas detected yet. Convert a PDF page or snip a math formula from the viewer.
          </div>
        ) : (
          equations.map((eq, idx) => {
            const isEditing = editingId === eq.id;
            const currentLatex = isEditing ? editLatex : eq.latex;
            const { mathml } = convertLatexToWordMath(currentLatex, eq.isDisplay);

            return (
              <div
                key={eq.id || idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition shadow-lg space-y-3"
              >
                {/* Header with description and badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-200">
                      {eq.description || "Mathematical Expression"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                      {eq.isDisplay ? "Display Math" : "Inline Math"}
                    </span>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          if (onUpdateEquation) onUpdateEquation(eq.id, editLatex);
                          setEditingId(null);
                        } else {
                          setEditingId(eq.id);
                          setEditLatex(eq.latex);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditing ? "Save" : "Edit"}</span>
                    </button>
                  </div>
                </div>

                {/* Rendered Math Box */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-center overflow-x-auto min-h-[60px] flex items-center justify-center">
                  <MathView latex={currentLatex} displayMode={true} />
                </div>

                {/* LaTeX Code Display or Edit Input */}
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editLatex}
                      onChange={(e) => setEditLatex(e.target.value)}
                      className="w-full bg-slate-950 border border-indigo-500 text-indigo-200 font-mono text-xs px-3 py-2 rounded focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-slate-400 hover:bg-slate-800 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onUpdateEquation) onUpdateEquation(eq.id, editLatex);
                          setEditingId(null);
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded shadow-sm"
                      >
                        Save Formula
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-xs bg-slate-950 px-3 py-2 rounded text-slate-300 border border-slate-800/80 overflow-x-auto select-all">
                    {eq.latex}
                  </div>
                )}

                {/* Action Buttons: Copy Word OMML, Copy LaTeX, Copy MathML */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(eq.id, currentLatex, "omml")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition ${
                      copiedId === eq.id && copiedType === "omml"
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                    title="Copy Office Math XML (OMML) - Paste directly into Microsoft Word"
                  >
                    {copiedId === eq.id && copiedType === "omml" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied for MS Word!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy for MS Word</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(eq.id, currentLatex, "latex")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                    title="Copy LaTeX formula"
                  >
                    {copiedId === eq.id && copiedType === "latex" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>LaTeX Copied!</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Copy LaTeX</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(eq.id, mathml, "mathml")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                    title="Copy MathML XML"
                  >
                    {copiedId === eq.id && copiedType === "mathml" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>MathML Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Copy MathML</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

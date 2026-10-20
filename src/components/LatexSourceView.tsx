import React, { useState } from "react";
import { Copy, Check, Download, FileCode, CheckCircle2 } from "lucide-react";

interface LatexSourceViewProps {
  latex: string;
  markdown: string;
  title: string;
  onUpdateLatex?: (latex: string) => void;
  onUpdateMarkdown?: (markdown: string) => void;
}

export const LatexSourceView: React.FC<LatexSourceViewProps> = ({
  latex,
  markdown,
  title,
  onUpdateLatex,
  onUpdateMarkdown,
}) => {
  const [activeTab, setActiveTab] = useState<"latex" | "markdown">("latex");
  const [isCopied, setIsCopied] = useState(false);

  const currentContent = activeTab === "latex" ? latex : markdown;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = activeTab === "latex" ? "tex" : "md";
    const mimeType = activeTab === "latex" ? "text/x-tex" : "text/markdown";
    const blob = new Blob([currentContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_") || "converted_math"}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("latex")}
            className={`px-3 py-1 rounded font-mono font-medium transition ${
              activeTab === "latex"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            LaTeX (.tex)
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`px-3 py-1 rounded font-mono font-medium transition ${
              activeTab === "markdown"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Markdown (.md)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .{activeTab === "latex" ? "tex" : "md"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-slate-950">
        <textarea
          value={currentContent}
          onChange={(e) => {
            if (activeTab === "latex" && onUpdateLatex) {
              onUpdateLatex(e.target.value);
            } else if (activeTab === "markdown" && onUpdateMarkdown) {
              onUpdateMarkdown(e.target.value);
            }
          }}
          className="w-full h-full bg-transparent resize-none border-0 text-slate-200 font-mono text-xs focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { ConvertedDocument, DocumentSection } from "../types/math";
import { FormattedMathText, MathView } from "./MathView";
import { copyOmmlForWord } from "../lib/ommlConverter";
import {
  FileText,
  Copy,
  Check,
  Edit3,
  Sparkles,
  Maximize2,
  Share2,
  Bookmark,
} from "lucide-react";

interface DocumentPreviewProps {
  document: ConvertedDocument;
  onUpdateSection?: (index: number, updated: DocumentSection) => void;
  onUpdateTitle?: (title: string) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onUpdateSection,
  onUpdateTitle,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const handleCopyWordMath = async (latex: string, id: string) => {
    const success = await copyOmmlForWord(latex, true);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditContent(content);
  };

  const handleSaveEdit = (index: number) => {
    if (onUpdateSection) {
      const current = document.sections[index];
      onUpdateSection(index, { ...current, content: editContent });
    }
    setEditingIndex(null);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex flex-col items-center">
      {/* Paper Container - styled to resemble Microsoft Word document page */}
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-300 p-8 sm:p-12 min-h-[900px] transition font-sans">
        {/* Word Document Header Bar */}
        <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Microsoft Word Ready • Office Math (OMML)</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            {document.documentType?.toUpperCase() || "DOCUMENT"}
          </span>
        </div>

        {/* Editable Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6 pb-2 border-b-2 border-slate-900">
          {document.title || "Untitled Mathematical Document"}
        </h1>

        {/* Document Sections */}
        <div className="space-y-6">
          {document.sections && document.sections.length > 0 ? (
            document.sections.map((sec, idx) => {
              const isEditing = editingIndex === idx;

              if (sec.type === "heading") {
                return (
                  <div key={idx} className="group relative pt-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                      {sec.content}
                    </h2>
                  </div>
                );
              }

              if (sec.type === "question") {
                return (
                  <div
                    key={idx}
                    className="group relative border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/40 rounded-r-lg transition hover:bg-blue-50/70"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-700 tracking-wide uppercase">
                        Problem / Question
                      </span>
                      <button
                        onClick={() => handleStartEdit(idx, sec.content)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition"
                        title="Edit Question Content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-sm font-mono p-2 border border-blue-400 rounded bg-white text-slate-900 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(idx)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium shadow-sm hover:bg-blue-500"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <FormattedMathText
                        text={sec.content}
                        className="text-slate-800 text-sm sm:text-base"
                      />
                    )}
                  </div>
                );
              }

              if (sec.type === "equation_block") {
                const eqId = `block_${idx}`;
                const isCopied = copiedId === eqId;

                return (
                  <div
                    key={idx}
                    className="group relative my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition"
                  >
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition">
                      <button
                        onClick={() => handleCopyWordMath(sec.content, eqId)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded shadow-sm transition ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                        }`}
                        title="Copy native OMML for Microsoft Word (Ctrl+V into Word)"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Word OMML Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy for Word</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center py-2 overflow-x-auto text-slate-900">
                      <MathView latex={sec.content} displayMode={true} />
                    </div>
                  </div>
                );
              }

              // Standard paragraph
              return (
                <div key={idx} className="group relative">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-sm font-mono p-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDoubleClick={() => handleStartEdit(idx, sec.content)}
                      className="cursor-pointer"
                      title="Double click to edit text"
                    >
                      <FormattedMathText
                        text={sec.content}
                        className="text-slate-800 text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <FormattedMathText
              text={document.markdown || "No text converted yet."}
              className="text-slate-800 text-sm sm:text-base"
            />
          )}
        </div>

        {/* Word Footer Stamp */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Formatted for Microsoft Word 2016-365 & LaTeX</span>
          <span>Page 1</span>
        </div>
      </div>
    </div>
  );
};

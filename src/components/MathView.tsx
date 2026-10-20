import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MathView: React.FC<MathViewProps> = ({
  latex,
  displayMode = false,
  className = "",
  onClick,
}) => {
  const renderedHtml = useMemo(() => {
    if (!latex || !latex.trim()) return "";
    try {
      // Clean leading and trailing delimiters if passed
      let clean = latex.trim();
      if (clean.startsWith("$$") && clean.endsWith("$$")) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith("$") && clean.endsWith("$")) {
        clean = clean.slice(1, -1).trim();
      } else if (clean.startsWith("\\[") && clean.endsWith("\\]")) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith("\\(") && clean.endsWith("\\)")) {
        clean = clean.slice(2, -2).trim();
      }

      return katex.renderToString(clean, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch (err: any) {
      console.warn("KaTeX render error:", err);
      return `<span class="text-rose-400 font-mono text-xs">[Math error: ${latex}]</span>`;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`inline-block select-text ${displayMode ? "block my-2 text-center overflow-x-auto py-1" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      onClick={onClick}
    />
  );
};

// Component to parse a block of text containing mixed text and $...$ / $$...$$ math
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  const parts = useMemo(() => {
    if (!text) return [];
    const elements: { type: "text" | "inline_math" | "display_math"; content: string }[] = [];
    const regex = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      if (match[1] !== undefined) {
        elements.push({
          type: "display_math",
          content: match[1],
        });
      } else if (match[2] !== undefined) {
        elements.push({
          type: "inline_math",
          content: match[2],
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    return elements;
  }, [text]);

  return (
    <div className={`leading-relaxed text-slate-200 ${className}`}>
      {parts.map((p, idx) => {
        if (p.type === "display_math") {
          return (
            <div key={idx} className="my-3 overflow-x-auto py-1 text-center bg-slate-900/40 rounded-lg border border-slate-800/60 px-4">
              <MathView latex={p.content} displayMode={true} />
            </div>
          );
        }
        if (p.type === "inline_math") {
          return (
            <MathView
              key={idx}
              latex={p.content}
              displayMode={false}
              className="px-1 text-sky-300 font-medium bg-sky-950/30 rounded"
            />
          );
        }
        return <span key={idx} className="whitespace-pre-wrap">{p.content}</span>;
      })}
    </div>
  );
};

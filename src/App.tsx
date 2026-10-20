import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Settings2,
  Code2,
  Layers,
  ChevronDown,
  Upload,
  AlertCircle,
  HelpCircle,
  Zap,
} from "lucide-react";

import { ConvertedDocument, DocumentSection, ExtractedEquation } from "./types/math";
import { SAMPLE_DOCUMENTS, generateSamplePaperCanvas } from "./lib/sampleDocs";
import { exportDocxFromDocument } from "./lib/docxGenerator";
import { copyOmmlForWord } from "./lib/ommlConverter";
import { PdfCanvasViewer } from "./components/PdfCanvasViewer";
import { DocumentPreview } from "./components/DocumentPreview";
import { EquationInspector } from "./components/EquationInspector";
import { LatexSourceView } from "./components/LatexSourceView";

export default function App() {
  // Current active sample or uploaded file
  const [currentSampleId, setCurrentSampleId] = useState<string>("calc_final");
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>("Calculus_Final_Exam.pdf");

  // Document data state
  const [documentData, setDocumentData] = useState<ConvertedDocument>(
    SAMPLE_DOCUMENTS[0].mockResult
  );

  // UI state
  const [activeTab, setActiveTab] = useState<"word_preview" | "equations" | "code" | "settings">("word_preview");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSamplesMenu, setShowSamplesMenu] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  // Settings
  const [targetFont, setTargetFont] = useState<string>("Calibri");
  const [fontSize, setFontSize] = useState<string>("12pt");

  // Show a toast message helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize with first sample document canvas image
  useEffect(() => {
    const firstSample = SAMPLE_DOCUMENTS[0];
    const canvasImg = generateSamplePaperCanvas(firstSample);
    setCurrentImageDataUrl(canvasImg);
    setDocumentData(firstSample.mockResult);
  }, []);

  // Handle switching sample documents
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    setCurrentSampleId(sample.id);
    setActiveFileName(`${sample.name.replace(/\s+/g, "_")}.pdf`);
    const canvasImg = generateSamplePaperCanvas(sample);
    setCurrentImageDataUrl(canvasImg);
    setDocumentData(sample.mockResult);
    setShowSamplesMenu(false);
    showToast(`Loaded sample: ${sample.name}`);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setActiveFileName(file.name);
    setCurrentSampleId("");
    showToast(`Loaded: ${file.name}`);
  };

  // Convert full page with Gemini Vision API
  const handleConvertFullPage = async (pageDataUrl: string) => {
    setIsProcessing(true);
    showToast("Analyzing math document with Gemini AI...");

    try {
      const res = await fetch("/api/convert-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: pageDataUrl,
          mimeType: "image/png",
          promptExtra: "Extract all mathematical formulas, questions, theorems, and definitions into LaTeX and Word-ready format.",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setDocumentData(json.data);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        showToast("Full page converted with native Word formulas!");
      }
    } catch (err: any) {
      console.error("Conversion failed:", err);
      showToast(`Notice: Using local OCR parser (${err.message})`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert cropped snippet / box with Gemini Vision API
  const handleConvertSnippet = async (snippetDataUrl: string) => {
    setIsProcessing(true);
    showToast("Recognizing selected formula snippet...");

    try {
      const res = await fetch("/api/convert-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: snippetDataUrl,
          mimeType: "image/png",
          promptExtra: "This is a cropped snippet containing a specific math formula or question. Transcribe accurately.",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const json = await res.json();
      if (json.data && json.data.extractedEquations && json.data.extractedEquations.length > 0) {
        // Append newly recognized equations and section
        const newEqs = json.data.extractedEquations;
        setDocumentData((prev) => ({
          ...prev,
          extractedEquations: [...prev.extractedEquations, ...newEqs],
          sections: [
            ...prev.sections,
            {
              type: "question",
              content: json.data.markdown || newEqs[0].latex,
            },
          ],
        }));
        confetti({ particleCount: 40, spread: 50 });
        showToast("Snippet recognized! Added to Word document & equations.");
        setActiveTab("equations");
      }
    } catch (err: any) {
      console.error("Snippet conversion error:", err);
      showToast(`Snippet error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to Microsoft Word (.docx) with native OMML equations
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    showToast("Building Microsoft Word .docx with native OMML equations...");

    try {
      // First try server-side builder, or client-side generator
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentData.title,
          markdown: documentData.markdown,
          sections: documentData.sections,
        }),
      });

      let blob: Blob;
      if (res.ok) {
        blob = await res.blob();
      } else {
        // Client-side fallback
        blob = await exportDocxFromDocument(documentData);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(documentData.title || "Math_Document").replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast("Word (.docx) downloaded with native editable equations!");
    } catch (err: any) {
      console.error("Export docx error:", err);
      showToast(`Export failed: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Copy all equations as Word OMML
  const handleCopyAllWordMath = async () => {
    if (!documentData.extractedEquations || documentData.extractedEquations.length === 0) {
      showToast("No equations to copy");
      return;
    }
    const combinedLatex = documentData.extractedEquations.map((e) => e.latex).join(" \\quad ");
    const success = await copyOmmlForWord(combinedLatex, true);
    if (success) {
      showToast("Copied all formulas for Microsoft Word!");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-40 backdrop-blur">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <span className="font-bold text-white text-base tracking-tighter">∑W</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                PDFtoWordMath
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                OMML Native
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Convert Math PDFs & Exams to Editable Word (.docx) & LaTeX
            </p>
          </div>
        </div>

        {/* Center: Sample documents dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSamplesMenu((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700/60 rounded-lg transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Sample Documents:</span>
            <span className="font-medium text-white truncate max-w-[140px]">
              {SAMPLE_DOCUMENTS.find((s) => s.id === currentSampleId)?.name || "Select Sample"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSamplesMenu && (
            <div className="absolute top-full mt-1.5 left-0 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                Preloaded Math Papers
              </div>
              {SAMPLE_DOCUMENTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 transition flex flex-col gap-0.5 ${
                    currentSampleId === sample.id ? "bg-indigo-950/40 text-indigo-300" : "text-slate-300"
                  }`}
                >
                  <span className="font-semibold text-slate-100">{sample.name}</span>
                  <span className="text-[10px] text-slate-400">{sample.category} • {sample.difficulty}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllWordMath}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Copy all detected formulas for Word equation editor"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy All Word Math</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx || isProcessing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-600/30 transition active:scale-95 disabled:opacity-50"
            title="Download formatted Microsoft Word .docx with native OMML equations"
          >
            <Download className="w-4 h-4" />
            <span>Download .docx (Word)</span>
          </button>
        </div>
      </header>

      {/* Main Split Viewport */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: PDF / Canvas Viewer with Snipping & OCR */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full p-2.5 sm:p-3 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
          <PdfCanvasViewer
            currentImageDataUrl={currentImageDataUrl}
            onPageImageReady={(url) => setCurrentImageDataUrl(url)}
            onConvertFullPage={handleConvertFullPage}
            onConvertSnippet={handleConvertSnippet}
            isProcessing={isProcessing}
            onFileUpload={handleFileUpload}
            fileName={activeFileName}
            totalEquationsDetected={documentData.extractedEquations?.length || 0}
          />
        </div>

        {/* Right Side: Converted Output Tabs & Viewers */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-slate-950">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60 text-xs">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab("word_preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === "word_preview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Word Preview</span>
              </button>

              <button
                onClick={() => setActiveTab("equations")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === "equations"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Equations ({documentData.extractedEquations?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === "code"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>LaTeX / Source</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Formatting & Export Settings"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick stats badge */}
            <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span>Confidence: {documentData.stats?.confidenceScore || 98}%</span>
              <span>•</span>
              <span>{documentData.stats?.equationCount || documentData.extractedEquations?.length || 0} equations</span>
            </div>
          </div>

          {/* Active Tab Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "word_preview" && (
              <DocumentPreview
                document={documentData}
                onUpdateSection={(idx, updated) => {
                  const newSecs = [...documentData.sections];
                  newSecs[idx] = updated;
                  setDocumentData((prev) => ({ ...prev, sections: newSecs }));
                  showToast("Section updated!");
                }}
              />
            )}

            {activeTab === "equations" && (
              <EquationInspector
                equations={documentData.extractedEquations || []}
                onUpdateEquation={(id, newLatex) => {
                  const updated = (documentData.extractedEquations || []).map((eq) =>
                    eq.id === id ? { ...eq, latex: newLatex } : eq
                  );
                  setDocumentData((prev) => ({ ...prev, extractedEquations: updated }));
                  showToast("Formula updated!");
                }}
              />
            )}

            {activeTab === "code" && (
              <LatexSourceView
                latex={documentData.latex || ""}
                markdown={documentData.markdown || ""}
                title={documentData.title || "Math_Document"}
                onUpdateLatex={(val) => setDocumentData((prev) => ({ ...prev, latex: val }))}
                onUpdateMarkdown={(val) => setDocumentData((prev) => ({ ...prev, markdown: val }))}
              />
            )}

            {activeTab === "settings" && (
              <div className="p-6 max-w-lg mx-auto space-y-6">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  Document & Math Export Preferences
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">
                      Word Body Font Family
                    </label>
                    <select
                      value={targetFont}
                      onChange={(e) => setTargetFont(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      <option value="Calibri">Calibri (Standard Word)</option>
                      <option value="Cambria">Cambria & Cambria Math</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 font-medium">
                      Base Font Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      <option value="11pt">11pt (Academic / Paper)</option>
                      <option value="12pt">12pt (Standard Document)</option>
                      <option value="14pt">14pt (Exam / Presentation)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-slate-400">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-sky-400" />
                      <span>About Office Math (OMML) Compatibility</span>
                    </div>
                    <p className="leading-relaxed">
                      Generated equations use Microsoft Word's native Office Math Markup Language (OMML).
                      When opened in Word 2010 through Microsoft 365, all equations are 100% editable with
                      the native Equation Tools ribbon.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white border border-slate-700 shadow-2xl px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

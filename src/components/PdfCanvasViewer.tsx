import React, { useRef, useState, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
  Layers,
  CheckCircle,
  FileText,
  RotateCw,
} from "lucide-react";

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PdfCanvasViewerProps {
  currentImageDataUrl: string | null;
  onPageImageReady: (dataUrl: string) => void;
  onConvertFullPage: (dataUrl: string) => void;
  onConvertSnippet: (snippetDataUrl: string) => void;
  isProcessing: boolean;
  onFileUpload: (file: File) => void;
  fileName?: string;
  totalEquationsDetected?: number;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  currentImageDataUrl,
  onPageImageReady,
  onConvertFullPage,
  onConvertSnippet,
  isProcessing,
  onFileUpload,
  fileName = "Document.pdf",
  totalEquationsDetected = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PDF Document State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);

  // Snip / Crop Tool State
  const [isSnipMode, setIsSnipMode] = useState<boolean>(false);
  const [isDrawingBox, setIsDrawingBox] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  // Render current PDF page onto canvas
  const renderPdfPage = useCallback(
    async (pageNumber: number, pdf: any) => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: scale * 1.5, rotation }); // Higher res for sharp math OCR

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const pageDataUrl = canvas.toDataURL("image/png");
        onPageImageReady(pageDataUrl);
      } catch (err) {
        console.error("PDF page render error:", err);
      }
    },
    [scale, rotation, onPageImageReady]
  );

  // Handle uploaded File (PDF or Image)
  const handleFileProcess = useCallback(
    async (file: File) => {
      if (file.type === "application/pdf") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          await renderPdfPage(1, pdf);
        } catch (err) {
          console.error("Failed to load PDF:", err);
        }
      } else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPdfDoc(null);
          setTotalPages(1);
          setCurrentPage(1);
          drawImageOnCanvas(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [renderPdfPage]
  );

  // Draw static image onto canvas
  const drawImageOnCanvas = useCallback(
    (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        onPageImageReady(dataUrl);
      };
      img.src = dataUrl;
    },
    [onPageImageReady]
  );

  // When external image data URL changes (e.g. sample selected)
  useEffect(() => {
    if (currentImageDataUrl && !pdfDoc) {
      drawImageOnCanvas(currentImageDataUrl);
    }
  }, [currentImageDataUrl, pdfDoc, drawImageOnCanvas]);

  // When page changes in loaded PDF
  useEffect(() => {
    if (pdfDoc) {
      renderPdfPage(currentPage, pdfDoc);
    }
  }, [currentPage, pdfDoc, renderPdfPage]);

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
      handleFileProcess(file);
    }
  };

  // Snipping Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSnipMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawingBox(true);
    setStartPoint({ x, y });
    setBoundingBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingBox || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const curY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const x = Math.min(startPoint.x, curX);
    const y = Math.min(startPoint.y, curY);
    const width = Math.abs(curX - startPoint.x);
    const height = Math.abs(curY - startPoint.y);

    setBoundingBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawingBox) {
      setIsDrawingBox(false);
      if (boundingBox && (boundingBox.width < 10 || boundingBox.height < 10)) {
        setBoundingBox(null);
      }
    }
  };

  // Crop the selected snippet from the main canvas and trigger conversion
  const handleConvertSelection = () => {
    if (!boundingBox || !canvasRef.current) return;
    const mainCanvas = canvasRef.current;
    const rect = mainCanvas.getBoundingClientRect();

    // Scale factors between CSS displayed dimensions and actual canvas resolution
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = Math.max(1, boundingBox.width * scaleX);
    cropCanvas.height = Math.max(1, boundingBox.height * scaleY);
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return;

    cropCtx.drawImage(
      mainCanvas,
      boundingBox.x * scaleX,
      boundingBox.y * scaleY,
      boundingBox.width * scaleX,
      boundingBox.height * scaleY,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    const snippetUrl = cropCanvas.toDataURL("image/png");
    onConvertSnippet(snippetUrl);
    setBoundingBox(null);
    setIsSnipMode(false);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative"
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
        {/* Document Info & File Upload */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg cursor-pointer transition shadow-sm active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>Open PDF / Scan</span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  onFileUpload(f);
                  handleFileProcess(f);
                }
              }}
            />
          </label>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[150px] text-slate-300 font-semibold">{fileName}</span>
            {totalEquationsDetected > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {totalEquationsDetected} math detected
              </span>
            )}
          </div>
        </div>

        {/* Page Switcher */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isProcessing}
              className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-300 font-mono text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isProcessing}
              className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom & Snip Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSnipMode((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition ${
              isSnipMode
                ? "bg-amber-500 text-slate-950 border-amber-400 font-semibold ring-2 ring-amber-500/40"
                : "bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            }`}
            title="Snip / Box specific math formula or question on this page"
          >
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snip Math</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-slate-400 font-mono text-[10px]">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1.0)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Viewport */}
      <div
        className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 relative select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className={`relative shadow-2xl rounded-sm transition-all ${
            isSnipMode ? "cursor-crosshair" : "cursor-default"
          }`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center top",
          }}
        >
          <canvas
            ref={canvasRef}
            className="max-w-none block bg-white shadow-xl ring-1 ring-slate-800/80 rounded-sm"
          />

          {/* Interactive Snipping Box Overlay */}
          {boundingBox && (
            <div
              className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none rounded-xs shadow-lg animate-pulse"
              style={{
                left: `${boundingBox.x}px`,
                top: `${boundingBox.y}px`,
                width: `${boundingBox.width}px`,
                height: `${boundingBox.height}px`,
              }}
            >
              <div className="absolute -top-7 left-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                Selected Formula Box ({Math.round(boundingBox.width)}×{Math.round(boundingBox.height)}px)
              </div>
            </div>
          )}
        </div>

        {/* Snip Action Floating Banner */}
        {boundingBox && !isDrawingBox && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-amber-500/50 shadow-2xl px-4 py-2.5 rounded-xl flex items-center gap-3 backdrop-blur z-20">
            <span className="text-xs text-amber-300 font-medium">
              Formula isolated! Ready to convert.
            </span>
            <button
              onClick={handleConvertSelection}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convert Formula</span>
            </button>
            <button
              onClick={() => setBoundingBox(null)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Processing Banner */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white tracking-wide">
                Analyzing Mathematical Expressions...
              </p>
              <p className="text-xs text-indigo-300 font-mono mt-1">
                Gemini Vision OCR • Recognizing LaTeX • Generating OMML
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Conversion Action Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>High-Resolution Math Vision Active</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (canvasRef.current) {
                const dataUrl = canvasRef.current.toDataURL("image/png");
                onConvertFullPage(dataUrl);
              }
            }}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            <span>Convert Full Page to Word & LaTeX</span>
          </button>
        </div>
      </div>
    </div>
  );
};

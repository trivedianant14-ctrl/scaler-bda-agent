"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfEmbed({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0);

  return (
    <div
      className="overflow-y-auto rounded-lg border border-gray-200 bg-gray-100 space-y-2 p-3"
      style={{ maxHeight: "840px" }}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <p className="p-6 text-sm text-gray-400 animate-pulse">Rendering PDF…</p>
        }
        error={
          <p className="p-6 text-sm text-red-500">Failed to render PDF preview.</p>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={724}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="shadow-sm"
          />
        ))}
      </Document>
    </div>
  );
}

// Extract text from a PDF File using pdfjs-dist (browser).
// Returns a single string with page breaks. Limits to first 30 pages for safety.
import * as pdfjs from "pdfjs-dist";
// @ts-ignore — vite worker import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

(pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdfText(file: File, maxPages = 30): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjs as any).getDocument({ data: buf }).promise;
  const pages = Math.min(pdf.numPages, maxPages);
  let out = "";
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(" ");
    out += `\n\n--- Page ${i} ---\n${text}`;
  }
  return out.trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(file);
  }
  // text-like
  return await file.text();
}
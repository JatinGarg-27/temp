export class PdfExtractionError extends Error {}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Dynamic import keeps pdf-parse (and its pdf.js dependency) out of the
  // client bundle since this only ever runs in the API route.
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";
    if (text.length === 0) {
      throw new PdfExtractionError(
        "No extractable text found in that PDF (it may be a scanned image)."
      );
    }
    return text;
  } catch (err) {
    if (err instanceof PdfExtractionError) throw err;
    console.error("PDF extraction failed", err);
    throw new PdfExtractionError(
      "Couldn't read that PDF. Make sure it isn't password-protected or corrupted."
    );
  } finally {
    await parser.destroy();
  }
}

// lib/pdf-utils.ts
import pdfjsLib from './pdfjs-config';
import Tesseract from 'tesseract.js';

interface ExtractionResult {
  success: boolean;
  text: string;
  warning?: string | null;
}

export async function extractTextFromPDF(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .trim();
      fullText += pageText + '\n';
    }

    if (fullText.trim().length > 0) {
      return {
        success: true,
        text: fullText,
        warning: null,
      };
    }

    console.warn('PDF.js extracted no text. Falling back to Tesseract.js.');
    return await tryTesseractFallback(file);
  } catch (error) {
    console.error('PDF.js extraction failed:', error);
    return await tryTesseractFallback(file);
  }
}

async function tryTesseractFallback(file: File): Promise<ExtractionResult> {
  try {
    const url = URL.createObjectURL(file);
    const { data: { text } } = await Tesseract.recognize(url, 'eng', {
      logger: (m) => console.log(m),
    });
    URL.revokeObjectURL(url);

    return {
      success: true,
      text,
      warning: 'Text extracted via OCR due to PDF processing limitations.',
    };
  } catch (error) {
    console.error('Tesseract.js fallback failed:', error);
    return {
      success: false,
      text: '',
      warning: 'Unable to extract text from the document.',
    };
  }
}
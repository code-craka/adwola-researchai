declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
    const worker: any;
    export default worker;
}

declare module 'pdfjs-dist/legacy/build/pdf' {
    export * from 'pdfjs-dist';
}
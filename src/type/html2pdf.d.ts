// html2pdf.d.ts

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: { type: string; quality: number };
      html2canvas?: object;
      jsPDF?: object;
      pagebreak?: { mode: string[] | string };
    }
  
    function html2pdf(): {
      from: (element: HTMLElement) => {
        set: (options: Html2PdfOptions) => {
          save: () => Promise<void>;
        };
      };
    };
  
    export default html2pdf;
  }
  
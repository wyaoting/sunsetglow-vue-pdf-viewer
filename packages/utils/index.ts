export const handlePdfLocateView = (i: number) => {
    const pdfContainer = document.querySelector(`#scrollIntIndex-${i}`);
    pdfContainer && pdfContainer?.scrollIntoView();
};
export const handlePdfLocateView = (i: number, domClassName: string = `#scrollIntIndex`) => {
    const pdfContainer = document.querySelector(`${domClassName}-${i}`);
    pdfContainer && pdfContainer?.scrollIntoView();
};

export function isInViewPortOfOne(el: HTMLElement, parentEl: HTMLElement, toolHeight: number = 0) {
    // viewPortHeight 兼容所有浏览器写法
    const viewPortHeight = parentEl.clientHeight
    const offsetTop = el.offsetTop
    const scrollTop = parentEl.scrollTop - toolHeight
    const top = offsetTop - scrollTop
    return top >= 0 && top <= viewPortHeight
}
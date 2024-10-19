
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
export const handelRestrictDebounce = (time: number, execute: () => void) => {
    let timeoute: any
    return () => {
        timeoute && clearTimeout(timeoute)
        timeoute = setTimeout(() => {
            execute()
        }, time)
    }
}
export const download = (url: string, filename?: string) => {
    const downloadElement = document.createElement('a')
    downloadElement.style.display = 'none'
    downloadElement.href = url
    if (filename) {
        downloadElement.download = filename
    }
    document.body.appendChild(downloadElement)
    downloadElement.click()
    document.body.removeChild(downloadElement)
}
export const fetchFileResultDownload = async (url: string, fileName = 'preview.pdf') => {
    const blobRes = await fetch(url).then(res => res.arrayBuffer())
    const e = new Blob([blobRes], {
        type: 'application/octet-stream',
    })
    const link = window.URL.createObjectURL(e)
    download(link, fileName)

}

export let pdfContainerExample = null
export class pdfRenderClass {
    canvas: HTMLCanvasElement;
    page: any;
    scale: number;
    constructor(canvas: HTMLCanvasElement, page: any, scale: number,) {
        this.canvas = canvas
        this.page = page
        this.scale = scale
    }
    async handleRender() {
        if (!this.page || !this.canvas) return
        const ctx = this.canvas.getContext("2d", {
            willReadFrequently: true,
            alpha: false,
        }) as any
        const dpr = window.devicePixelRatio || 1;
        const bsr =
            ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio ||
            1;
        const ratio = dpr / bsr;
        const viewport = this.page.getViewport({ scale: this.scale });
        this.canvas.width = viewport.width * ratio;
        this.canvas.height = viewport.height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        // 将 PDF 页面渲染到 canvas 上下文中
        const renderContext = {
            canvasContext: ctx,
            viewport,
        };
        await this.page.render(renderContext).promise;
        return Promise.resolve({
            page: this.page,
            viewport,
        })
    }
    getImageSrc() {
        return this.canvas?.toDataURL("image/png") as string
    }
}
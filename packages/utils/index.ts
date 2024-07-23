
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
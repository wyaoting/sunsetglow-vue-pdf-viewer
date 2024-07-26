import { createApp, h } from 'vue'
import { Pdf } from './component'
import { configOption, option } from './config'
const initPdfView = (container: HTMLElement, option: option) => {
    if (option.pdfOption) configOption.value = { ...configOption.value, ...option.pdfOption }
    const app = createApp(h(Pdf, { ...option }))
    app.mount(container)
}
export { initPdfView }
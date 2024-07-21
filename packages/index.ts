// import { App } from 'vue'
// import components from './component'
// // 所有组件
// export * from './component'

// // 完整引入组件
// const install = function (app: App) {
//     components.forEach(component => {
//         app.use(component as unknown as { install: () => any })
//     })
// }

// export default {
//     install
// }


import { createApp, h } from 'vue'
import { Pdf } from './component'
// import Pdf from './components/pdf.vue'
// export Pdf
const initPdfView = (container: HTMLElement, option: any) => {
    const app = createApp(h(Pdf, { ...option }))
    app.mount(container)

}
export { initPdfView }
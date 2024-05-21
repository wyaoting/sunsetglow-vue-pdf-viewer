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


import { App } from 'vue'
import Pdf from './components/pdf.vue'

Pdf.install = (app: App) => {
    console.log(Pdf, Pdf.name, 'Pdf')
    app.component(Pdf.name as string, Pdf)
    return app
}
export default Pdf

// export { Pdf }
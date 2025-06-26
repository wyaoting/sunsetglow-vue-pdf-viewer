import { createApp, h, App } from "vue";
import { Pdf } from "./component";
export { lang } from "./Lang";
import { configOption, option, configPdfApiOptions, pdfOption } from "./config";
let app: null | App<Element> = null;
const initPdfView = (container: HTMLElement, option: option) => {
  if (app) app.unmount();
  if (option.pdfOption)
    configOption.value = { ...configOption.value, ...option.pdfOption };
  const { pdfOption, ...other } = option;
  app = createApp(h(Pdf, { ...other }));
  app.mount(container);
};
export type { pdfOption };
export { initPdfView, configPdfApiOptions, configOption };

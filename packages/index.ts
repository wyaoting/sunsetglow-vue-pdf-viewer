import { createApp, h } from "vue";
import { Pdf } from "./component";
export { lang } from "./Lang";
import { configOption, option, configPdfApiOptions } from "./config";
const initPdfView = (container: HTMLElement, option: option) => {
  if (option.pdfOption)
    configOption.value = { ...configOption.value, ...option.pdfOption };
  const { pdfOption, ...other } = option;
  const app = createApp(h(Pdf, { ...other }));
  app.mount(container);
};
export { initPdfView, configPdfApiOptions, configOption };

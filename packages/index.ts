import { createApp, h, App } from "vue";
import { Pdf } from "./component";
export { lang } from "./Lang";
import { option, pdfOption, usePdfConfigState } from "./config";
let app: null | App<Element> = null;
let apps = []; // 存储实例
const initPdfView = (container: HTMLElement, option: option) => {
  // if (app) app.unmount();
  const { pdfOption, ...other } = option;
  app = createApp(h(Pdf, { ...other }));
  app.mount(container);
  const { configPdfApiOptions, configOption } = usePdfConfigState(app);
  if (option.pdfOption)
    configOption.value = {
      ...configOption.value,
      ...option.pdfOption,
    };
  configOption.value.appIndex = apps.length;
  apps.push(app);
  return { configPdfApiOptions, configOption, app };
};
export type { pdfOption };
export { initPdfView, usePdfConfigState };

import { createApp, h, App } from "vue";
import { Pdf } from "./component";
export { lang } from "./Lang";
import {
  option,
  pdfOption,
  usePdfConfigState,
  configPdfApiOptionsType,
} from "./config";

let apps = [] as App[]; // 存储实例
const initPdfView = (container: HTMLElement, option: option) => {
  const { pdfOption, ...other } = option;
  let app = createApp(h(Pdf, { ...other }));
  app.mount(container);
  const { configPdfApiOptions, configOption } = usePdfConfigState(app);
  if (option.pdfOption)
    configOption.value = {
      ...configOption.value,
      ...option.pdfOption,
    };
  configOption.value.appIndex = apps.length;
  apps.push(app);
  return {
    configPdfApiOptions,
    configOption,
    app,
  };
};
/**
 * 实例卸载函数
 * @param app
 */
const cleanupPdfView = (app: App) => {
  const { configOption } = usePdfConfigState(app);
  if (configOption.value.appIndex !== undefined) {
    app?.unmount();
    apps = apps.filter((v) => v._uid !== app._uid);
    for (let i = 0; i < apps?.length; i++) {
      const { configOption } = usePdfConfigState(apps[i]);
      configOption.value.appIndex = i;
    }
  }
};
export type { pdfOption, option, configPdfApiOptionsType };
export { initPdfView, usePdfConfigState, cleanupPdfView };

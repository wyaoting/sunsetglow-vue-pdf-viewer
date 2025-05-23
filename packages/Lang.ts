import { configOption } from "./config";
export const lang = {
  zh: {
    Preparing: "准备文档以供打印",
    copySuccess: "复制成功 !",
  },
  en: {
    Preparing: "Preparing document for printing",
    copySuccess: "Copy Success !",
  },
};

export const t = (key: string) => {
  return (
    //@ts-ignore
    (configOption.value.lang &&
      //@ts-ignore
      lang[configOption.value.lang] &&
      //@ts-ignore
      lang[configOption.value.lang][key]) ||
    key
  );
};

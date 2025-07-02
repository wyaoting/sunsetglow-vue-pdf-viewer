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

export const t = (key: string, langType: "zh" | "en") => {
  return (
    //@ts-ignore
    (langType &&
      //@ts-ignore
      lang[langType] &&
      //@ts-ignore
      lang[langType][key]) ||
    key
  );
};

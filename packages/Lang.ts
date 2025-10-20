export const lang = {
  zh: {
    Preparing: "准备文档以供打印",
    copySuccess: "复制成功 !",
    searchScope: "搜索范围：",
    startPage: "开始页面",
    endPage: "结束页面",
    searchEnter: "请输入查找内容",
  },
  en: {
    Preparing: "Preparing document for printing",
    copySuccess: "Copy Success !",
    searchScope: "Search Scope: ",
    startPage: "Start Page",
    endPage: "End Page",
    searchEnter: "Enter Search Content",
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

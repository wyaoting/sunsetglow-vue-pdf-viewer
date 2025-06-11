import { ref, Ref, nextTick } from "vue";
import type { Component, CSSProperties } from "vue";
import { handlePdfLocateView } from "./utils/index";
export const globalStore = ref<{
  searchRef: undefined | Ref<any>;
}>({
  searchRef: undefined,
});
export let file: Ref<{
  data: ArrayBuffer | Uint8Array | undefined;
  url: string | undefined;
}> = ref({
  url: undefined,
  data: new ArrayBuffer(0),
});
// 定义选择配置接口
interface SelectConfig {
  text: string;
  icon?: Component;
  style?: CSSProperties;
  onClick: (text: string, onCopy: (text: string) => void) => void;
}
export type pdfOption = {
  search?: boolean; // 搜索
  scale?: boolean; //缩放
  pdfImageView?: boolean; //pdf 是否可以单片点击预览
  page?: boolean; //分页查看
  navShow?: boolean; //左侧导航
  toolShow?: boolean; // 是否开启顶部导航
  navigationShow?: boolean; // 左侧导航是否自动开启
  pdfViewResize?: boolean; // 是否开启resize 函数
  download?: boolean; //下载
  clearScale?: number; // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
  fileName?: string; //pdf 下载文件名称
  print?: boolean; //pdf 打印
  lang?: enumGlobalLang | "zh" | "en"; //语言 默认zh
  customPdfOption?: {
    //自定义pdf.js 的一些参数
    cMapPacked?: boolean; //   指定 CMap 是否是二进制打包的。  Specifies if the Adobe CMaps are binary packed or not. The default value is `true`.
    cMapUrl?: string; //  预定义 Adob​​e CMaps 所在的 URL。包括尾随  The URL where the predefined Adobe CMaps are located. Include the trailing slash.
    [key: string]: any;
  };
  textLayer?: boolean; //是否开启文字可复制 默认关闭
  renderTotalPage?: number; //是否渲染指定页面总数，-1 则默认默认渲染文件总数，
  pageOption?: {
    current?: number; //当前页码
  };
  containerWidthScale?: number; //pdf 文件占父元素容器width的比例 默认是0.8
  visibleWindowPageRatio?: number; //当前pdf页面在可视窗口多少比例触发分页
  pdfItemBackgroundColor?: string; //pdf 加载时背景颜色 默认#ebebeb
  pdfBodyBackgroundColor?: string; //pdf 容器的背景色 默认#eaeaea
  pdfListContainerPadding?: string; //pdf 容器的padding
  selectConfig?: SelectConfig[];
  watermarkOptions?:
    | {
        columns: number;
        rows: number;
        color: string;
        watermarkLink?: string;
        watermarkTextList?: string[];
        rotation: number;
        fontSize: number;
        opacity: number;
      }
    | undefined; //是否pdf 添加水印
  handleCustomPrint?: (container: HTMLElement, onClose: Function) => void; //自定义打印函数
};
export enum enumGlobalLang {
  zh = "zh",
  en = "en",
}
export interface option {
  loadFileUrl: string | ArrayBuffer | Uint8Array | Ref<string>; // pdf 文件路径 | ArrayBuffer | Uint8Array | Ref<string>
  pdfPath: string; //  GlobalWorkerOptions.workerSrc 的文件路径
  loading?: (load: boolean, fileInfo: { totalPage: number }) => void; //加载完成函数
  pdfOption?: pdfOption;
}
export const configOption: Ref<pdfOption> = ref({
  search: true, //搜索 开启搜索必须开启textLayer 为true
  scale: true, //缩放
  pdfImageView: true, //pdf 是否可以单片点击预览
  page: true, //分页查看
  navShow: true, //左侧导航
  navigationShow: false, // 左侧导航是否开启
  pdfViewResize: true, // 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
  toolShow: true, // 是否开启顶部导航
  download: true, //下载
  clearScale: 1.5, // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
  fileName: "preview.pdf", // pdf 下载文件名称
  print: true, //打印功能
  lang: enumGlobalLang.zh,
  customPdfOption: {},
  textLayer: false, //文字可复制
  pageOption: {
    current: 1,
  },
  renderTotalPage: -1, //是否渲染指定页面总数，-1 则默认默认渲染文件总数，
  visibleWindowPageRatio: 0.5, //当前pdf页面在可视窗口多少比例触发分页 传入0.5 就是 （pdf下一页滚动到容器高度一半的时候 更新当前页码）
  containerWidthScale: 0.8, //
  pdfItemBackgroundColor: "#ebebeb", // pdf单个页面加载时背景颜色 默认#ebebeb
  pdfBodyBackgroundColor: "#eaeaea", //pdf 容器的背景色 默认#eaeaea
  // pdfListContainerPadding: "10px 20px 20px 20px", // pdf 容器的padding默认10px 20px 20px
  watermarkOptions: {
    columns: 3, //列数量
    rows: 4, // 行数量
    color: "#69b82a4f", //字体颜色
    rotation: 25, //旋转角度
    fontSize: 40, //字体大小
    opacity: 0.4, //调整透明度
    watermarkTextList: ["水印水印水印水印"], //（最大展示3个）水印文字和 watermarkLink 冲突，只能展示一个水印内容
    // watermarkLink: "https://www.autodatas.net/png/header-logo-54f61223.png", //水印可以支持公司logo
  }, // 不展示水印传 undefined即可
  selectConfig: undefined,
});

export const configPdfApiOptions = {
  /**
   * 控制pdf 跳到指定页码
   * @param index
   */
  handleChange: (index: number) => {
    handlePdfLocateView(index);
  },
  /**
   * 搜索内置函数
   * @param keyword 搜索内容
   * @param visible 是否展示搜索框 true
   */
  onSearch: (keyword: string, visible: boolean = true) => {
    nextTick(() => {
      globalStore.value.searchRef.open = visible;
      globalStore.value.searchRef.searchText = keyword;
      globalStore.value.searchRef.onSearch();
    });
  },
};

import { ref, } from 'vue'
import { handlePdfLocateView } from './utils/index'
export type pdfOption = {
    search?: boolean // 搜索 
    scale?: boolean //缩放
    pdfImageView?: boolean //pdf 是否可以单片点击预览
    page?: boolean //分页查看
    navShow?: boolean //左侧导航 
    toolShow?: boolean// 是否开启顶部导航
    navigationShow?: boolean // 左侧导航是否自动开启
    pdfViewResize?: boolean// 是否开启resize 函数
    download?: boolean //下载
    clearScale?: number // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
    fileName?: string //pdf 下载文件名称
    print?: boolean //pdf 打印
    lang?: enumGlobalLang | 'zh' | 'en'//语言 默认zh
    customPdfOption?: { //自定义pdf.js 的一些参数
        cMapPacked?: boolean, //   指定 CMap 是否是二进制打包的。  Specifies if the Adobe CMaps are binary packed or not. The default value is `true`.
        cMapUrl?: string, //  预定义 Adob​​e CMaps 所在的 URL。包括尾随  The URL where the predefined Adobe CMaps are located. Include the trailing slash.
        [key: string]: any
    },
    textLayer?: boolean //是否开启文字可复制 默认关闭
    pageOption?: {
        current?: number, //当前页码
    }
}
export enum enumGlobalLang {
    zh = 'zh',
    en = 'en'
}
export interface option {
    loadFileUrl: string; // pdf 文件路径
    pdfPath: string; //  GlobalWorkerOptions.workerSrc 的文件路径
    loading?: (load: boolean) => void //加载完成函数
    pdfOption?: pdfOption
}
export const configOption = ref<pdfOption>({
    search: false, // 搜索  todo 开发中
    scale: true,//缩放
    pdfImageView: true, //pdf 是否可以单片点击预览
    page: true, //分页查看
    navShow: true, //左侧导航
    navigationShow: false, // 左侧导航是否开启
    pdfViewResize: true,// 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
    toolShow: true,// 是否开启顶部导航
    download: true,//下载
    clearScale: 1.5,// 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
    fileName: "preview.pdf", // pdf 下载文件名称
    print: true, //打印功能
    lang: enumGlobalLang.zh,
    customPdfOption: {},
    textLayer: false, //文字可复制
    pageOption: {
        current: 1,
    }
})

export const configPdfApiOptions = {
    /**
     * 控制pdf 跳到指定页码
     * @param index 
     */
    handleChange: (index: number) => {
        handlePdfLocateView(index)
    }
}
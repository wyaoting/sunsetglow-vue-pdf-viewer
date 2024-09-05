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
}
import { ref } from 'vue'
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
    fileName: "preview.pdf" // pdf 下载文件名称
})
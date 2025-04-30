<template>
  <a-spin :spinning="loading">
    <div class="test-pdf" style="height: 100vh"></div>
  </a-spin>
</template>
<script lang="ts" setup>
import { Spin as ASpin } from "ant-design-vue";
import { initPdfView, configOption } from "../packages/index.ts";
import { onMounted } from "vue";
import { ref, watch } from "vue";
const loading = ref(false);
onMounted(() => {
  loading.value = true;
  const pdfPath = new URL("/src/assets/pdf.worker.min.js", import.meta.url)
    .href;
  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl:
      "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    pdfPath: pdfPath,
    loading: (load: boolean, fileInfo: { totalPage: number }) => {
      console.log(`pdf 文件总数：${fileInfo.totalPage}`);
      loading.value = load;
    },
    //可选
    pdfOption: {
      search: true, // 搜索  todo 开发中
      scale: true, //缩放
      pdfImageView: false, //pdf 是否可以单片点击预览
      page: true, //分页查看
      navShow: true, //左侧导航
      navigationShow: false, // 左侧导航是否开启
      pdfViewResize: true, // 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
      toolShow: true, // 是否开启顶部导航
      download: true, //下载
      clearScale: 1.5, // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
      fileName: "preview.pdf", // pdf 下载文件名称
      lang: "en", //字典语言
      print: true, //打印功能
      customPdfOption: {
        // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
        cMapPacked: true, //指定 CMap 是否是二进制打包的
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
      },
      renderTotalPage: -1, //是否渲染指定页面总数，-1 则默认默认渲染文件总数，如果传5 则渲染前五页
      textLayer: true, //文本是否可复制 ， 文本复制和点击查看大图冲突建议把 pdfImageView 改为false
      containerWidthScale: 0.85, //pdf 文件占父元素容器width的比例 默认是0.8
      pdfItemBackgroundColor: "#fff",
      watermarkOptions: {
        columns: 3, //列数量
        rows: 4, // 行数量
        color: "#2f7a54", //字体颜色
        rotation: 25, //旋转角度
        fontSize: 40, //字体大小
        opacity: 0.4, //调整透明度
        watermarkText: "AUTODATAS", //水印文字和 watermarkLink 冲突，只能展示一个水印内容
        // watermarkLink: "https://www.autodatas.net/png/header-logo-54f61223.png", //水印可以支持公司logo
      }, // 不展示水印传 undefined即可
    },
  });
});
watch(
  () => configOption.value?.pageOption?.current,
  (current) => {
    console.log(current, "当前页码");
  }
);
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

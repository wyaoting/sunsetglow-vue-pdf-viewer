<template>
  <a-spin :spinning="loading">
    <div class="test-pdf" style="height: 100vh"></div>
  </a-spin>
</template>
<script lang="ts" setup>
import { Spin as ASpin } from "ant-design-vue";
import { initPdfView } from "../packages/index.ts";
import { onMounted } from "vue";
import { ref } from "vue";
const loading = ref(false);
onMounted(() => {
  loading.value = true;
  const pdfPath = new URL("/src/assets/pdf.worker.min.mjs", import.meta.url)
    .href;
  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl: `/src/assets/test.pdf`,
    pdfPath: pdfPath,
    loading: (load: boolean) => {
      loading.value = load;
    },
    //可选
    pdfOption: {
      search: false, // 搜索  todo 开发中
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
      lang: "en", //字典语言
      print: true, //打印功能
      customPdfOption: {
        // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
        cMapPacked: true, //指定 CMap 是否是二进制打包的
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
      },
    },
  });
});
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

<template>
  <div class="test-pdf" style="height: 100vh"></div>
</template>
<script lang="ts" setup>
import { initPdfView } from "../packages/index.ts";
// import { initPdfView } from "../dist/pdf-view.js";
// import "../dist/style.css";
// console.log(pdfViewContainer, "pdfViewContainer");
import { onMounted } from "vue";
onMounted(() => {
  const pdfPath = new URL("/src/assets/pdf.worker.min.mjs", import.meta.url)
    .href;
  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl: `https://api.autodatas.net/api/v1/sso/oss/files/fileUploadBucket/419fcf13-b7d1-4e0d-87ec-ee49d259bba3NIO%20ET7%20%20(100kWh%20)%20%20High%20Voltage%20System%20Analysis%20Report.pdf`,
    pdfPath: pdfPath,
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

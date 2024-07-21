<template>
  <div class="test-pdf"></div>
</template>
<script lang="ts" setup>
// import { initPdfView } from "../packages/index.ts";
import { initPdfView } from "../dist/pdf-view.js";
import "../dist/style.css";
// console.log(pdfViewContainer, "pdfViewContainer");
import { onMounted } from "vue";
onMounted(() => {
  const pdfPath = new URL("/src/assets/pdf.worker.min.mjs", import.meta.url)
    .href;
  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl: `
  https://192.168.31.2/api/v1/sso/oss/files/3163c9c1-964d-40d0-b9ad-8cfb3f1de981`,
    pdfPath: pdfPath,
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

<template>
  <div class="test-pdf" style="height: 100vh"></div>
</template>
<script lang="ts" setup>
import { initPdfView } from "../packages/index.ts";
// import { initPdfView } from "../dist/pdf-view.js";
import "../dist/style.css";
// console.log(pdfViewContainer, "pdfViewContainer");
import { onMounted } from "vue";
onMounted(() => {
  const pdfPath = new URL("/src/assets/pdf.worker.min.mjs", import.meta.url)
    .href;
  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl: `https://api.autodatas.net/api/v1/sso/oss/files/fileUploadBucket/419fcf13-b7d1-4e0d-87ec-ee49d259bba3NIO%20ET7%20%20(100kWh%20)%20%20High%20Voltage%20System%20Analysis%20Report.pdf`,
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

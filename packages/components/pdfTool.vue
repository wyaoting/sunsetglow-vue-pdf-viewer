<template>
  <div class="pdf-tool-container">
    <div class="tool-view">
      <PdfNav />
      <PageNum />
    </div>
    <div class="tool-content">
      <PdfScale />
    </div>
    <Search />
  </div>
</template>
<script lang="ts" setup>
import PdfScale from "./pdfScale.vue";
import PdfNav from "./pdfNavigation.vue";
import Search from "./search.vue";
import PageNum from "./pageNum.vue";
</script>

<style scoped>
.pdf-tool-container {
  position: sticky;
  top: 0px;
  left: 0px;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0px 20px;
  box-sizing: border-box;
  width: 100%;
  z-index: 88;
  font-size: 14px;
  background-color: #e0e1e2;
  /* border-radius: 10px; */
  border-color: rgba(34, 36, 38, 0.15);
  justify-content: space-between;
}
.pdf-tool-container :deep(img) {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.pdf-tool-container .tool-content {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-tool-container .tool-view {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.pdf-tool-container .search-box {
}
</style>

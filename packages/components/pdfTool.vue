<template>
  <div class="pdf-tool-container">
    <div class="tool-view"></div>
    <PageNum />
    <Search />
  </div>
</template>
<script lang="ts" setup>
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
  background-color: #dddddd;
  /* border-radius: 10px; */
  justify-content: space-between;
}
.pdf-tool-container :deep(img) {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.pdf-tool-container .tool-page {
}
.pdf-tool-container .tool-view {
}
.pdf-tool-container .search-box {
}
</style>

<template>
  <button @click="onChange">切换</button>
  <button @click="onNext">下一页</button>

  <div style="height: 20vh; background-color: pink"></div>
  <!-- <div style="display: grid; grid-template-columns: 50% 50%">
    <pdfView v-if="isDelete" />
    <pdfView v-if="isDelete" />
  </div> -->
  <pdfView v-if="isDelete" />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import pdfView from "./pdfView.vue";
const isDelete = ref(true);
let index = 0;
const urlList = [
  "/src/assets/1748352797096.pdf",
  // "/src/assets/111.pdf",
  "/src/assets/test2.pdf",
  "/src/assets/Owners_Manual.pdf",
];
const url = ref(urlList[index]);

const onChange = () => {
  index++;
  if (index >= urlList.length) index = 0;

  url.value = urlList[index];
  isDelete.value = true;
};

const onNext = () => {
  isDelete.value = false;
  // configPdfApiOptions?.value?.onSearch("Model");
};
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

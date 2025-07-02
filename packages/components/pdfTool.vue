<template>
  <div class="pdf-tool-container" v-if="configOption.toolShow">
    <div class="tool-view">
      <PdfNav v-if="configOption.navShow" />
      <PageNum v-if="configOption.page" />
    </div>
    <div class="tool-content" v-if="configOption.scale">
      <PdfScale />
    </div>
    <div style="display: flex; align-items: center">
      <Annotaion />
      <Print v-if="configOption.print" :pdfContainer="props.pdfContainer" />
      <Download v-if="configOption.download" />
      <Search
        v-if="configOption.search"
        :pdfContainer="props.pdfContainer"
        :pdfJsViewer="props.pdfJsViewer"
        ref="searchRef"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import Annotaion from "./annotation.vue";
import Print from "./print.vue";
import { usePdfConfigState } from "../config";
import { ref, watch } from "vue";
import PdfScale from "./pdfScale.vue";
import PdfNav from "./pdfNavigation.vue";
import Search from "./search.vue";
import PageNum from "./pageNum.vue";
import Download from "./download.vue";
const props = defineProps<{
  pdfContainer: any; //
  pdfJsViewer: any;
}>();
const searchRef = ref();
const { globalStore, configOption } = usePdfConfigState();
watch(
  () => searchRef.value,
  () => {
    globalStore.value.searchRef = searchRef;
  }
);
</script>

<style scoped>
.pdf-tool-container {
  user-select: none;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0px 20px;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  border-bottom: 1px solid #e7e7e7;
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
@media screen and (max-width: 650px) {
  .pdf-view-container .pdf-tool-container .navigation-container {
    display: none;
  }
  .pdf-view-container .pdf-tool-container .scale-container {
    display: none;
  }
}
@media screen and (max-width: 400px) {
  .pdf-view-container .pdf-tool-container .tool-page {
    display: none;
  }
  .pdf-view-container .pdf-tool-container .scale-container {
    display: none;
  }
}
</style>

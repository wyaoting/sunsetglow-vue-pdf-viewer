<template>
  <div class="pdf-view-container">
    <a-image
      class="image"
      width="0"
      height="0"
      style="display: none; overflow: hidden"
      :preview="{
        maskClassName: 'custom-class',
        visible,
        onVisibleChange: setVisible,
      }"
      :src="pdfImageUrl"
    />
    <pdfTool />
    <div style="display: flex">
      <PdfNavContainer
        :navigationRef="navigationRef"
        :pdfJsViewer="pdfJsViewer"
        :pdfContainer="pdfContainer"
        v-if="navigationRef && pdfExamplePages"
      />
      <div v-if="pdfExamplePages" class="pdf-list-container">
        <pdfTarget
          style="margin: 10px 0px"
          @handleSetImageUrl="handleSetImageUrl"
          :pdfJsViewer="pdfJsViewer"
          :pageNum="pdfItem"
          :canvasWidth="canvasWidth"
          :searchValue="searchValue"
          :imageRenderHeight="canvasHeight"
          :pdfContainer="pdfContainer"
          v-for="pdfItem in pdfExamplePages"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "ant-design-vue/lib/image/style";
import { Image as AImage } from "ant-design-vue";
import pdfTool from "./pdfTool.vue";
import pdfTarget from "./pdfTarget.vue";
import PdfNavContainer from "./pdfNavContainer.vue";
import { ref, provide } from "vue";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import * as pdfJsViewer from "pdfjs-dist/web/pdf_viewer.mjs";
import "pdfjs-dist/web/pdf_viewer.css";
const pdfPath = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)
  .href;
GlobalWorkerOptions.workerSrc = pdfPath;
const visible = ref<boolean>(false);
const pdfExamplePages = ref<number>(0);
const navigationRef = ref<boolean>(false);
const canvasHeight = ref(0);
const pdfImageUrl = ref("");
const canvasWidth = ref(0);
const searchValue = ref<string>(""); //搜索
let pdfContainer: any = "";
provide("pdfExamplePages", pdfExamplePages);
provide("searchValue", searchValue);
provide("pdfContainer", pdfContainer);
provide("navigationRef", navigationRef);

const loadFine = (
  loadFileUrl = "/src/assets/text.pdf"
) => {
  getDocument(loadFileUrl).promise.then(async (example: any) => {
    pdfContainer = example;
    // window.$pdfContainerCustom = example;
    await getPdfHeight(example);
    const { numPages } = example;
    pdfExamplePages.value = numPages;
  });
};
const setVisible = (value: boolean): void => {
  visible.value = value;
};
const getPdfHeight = async (pdfContainer: any) => {
  const page = await pdfContainer.getPage(1);
  const height = page.view[3];
  const width = page.view[2];
  canvasHeight.value = height;
  canvasWidth.value = width;
};
const handleSetImageUrl = (url: string) => {
  pdfImageUrl.value = url;
  visible.value = true;
};

loadFine();
</script>

<style scoped>
.pdf-view-container {
  background-color: #6d6a6a;
  position: relative;
  height: 100%;
  width: 100%;
  min-width: 100%;
  min-height: 50vh;
  box-sizing: border-box;
}
.pdf-view-container .pdf-list-container {
  overflow: auto;
  margin: 0 auto;
  /* height: 80vh; */
  padding: 0px 20px 20px;
  width: fit-content;
  box-sizing: border-box;
}

:deep(.ant-image) {
  position: relative;
  display: none;
}
</style>

<script lang="ts">
export default {
  name: "pdfViewContainer",
};
</script>

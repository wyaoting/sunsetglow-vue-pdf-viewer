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
        :canvasWidth="canvasWidth"
        :imageRenderHeight="canvasHeight"
        :pdfJsViewer="pdfJsViewer"
        :pdfContainer="pdfContainer"
        v-if="navigationRef && pdfExamplePages"
      />
      <div v-if="pdfExamplePages" class="pdf-list-container">
        <pdfTarget
          @handleIntersection="handleIntersection"
          style="margin: 10px 0px"
          @handleSetImageUrl="handleSetImageUrl"
          :pdfOptions="{
            containerScale: containerScale,
            scale: 1.5,
          }"
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
<script lang="ts" name="vue-pdf-view" setup>
import "ant-design-vue/lib/image/style";
import { Image as AImage } from "ant-design-vue";
import pdfTool from "./pdfTool.vue";
import pdfTarget from "./pdfTarget.vue";
import PdfNavContainer from "./pdfNavContainer.vue";
import { ref, provide, watch } from "vue";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import * as pdfJsViewer from "pdfjs-dist/web/pdf_viewer.mjs";
import "pdfjs-dist/web/pdf_viewer.css";

const props = defineProps<{
  loadFileUrl: string;
  pdfPath: string;
}>();
const visible = ref<boolean>(false);
const positionIndexMap = ref<Map<number | string, boolean>>(new Map());
const index = ref<number>(1);
const pdfExamplePages = ref<number>(0);
const navigationRef = ref<boolean>(false);
const canvasHeight = ref(0);
const pdfImageUrl = ref("");
const canvasWidth = ref(0);
const containerScale = ref(1);
const searchValue = ref<string>(""); //搜索
let pdfContainer: any = "";
const pdfJsViewer = ref();
const getDocumentRef = ref() as any;
provide("containerScale", containerScale);
provide("index", index);
provide("pdfExamplePages", pdfExamplePages);
provide("searchValue", searchValue);
provide("pdfContainer", pdfContainer);
provide("navigationRef", navigationRef);

const loadFine = (loadFileUrl = props.loadFileUrl) => {
  getDocumentRef.value(loadFileUrl).promise.then(async (example: any) => {
    pdfContainer = example;
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
const handleIntersection = (num: number, isIntersecting: boolean) => {
  positionIndexMap.value.set(num, isIntersecting);
};

loadFine();

watch(
  () => positionIndexMap.value,
  () => {
    let keyIndex = 1000;
    positionIndexMap.value.forEach((value, key) => {
      value && +key < keyIndex && (keyIndex = +key);
    });
    index.value = keyIndex;
  },
  {
    deep: true,
  }
);
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

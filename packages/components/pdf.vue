<template>
  <div class="pdf-view-container" ref="pdfParentContainerRef">
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
    <div ref="pdfToolRef">
      <pdfTool />
    </div>
    <div
      :style="{
        display: 'flex',
        height: `${parentHeight - (pdfToolRef?.clientHeight || 0)}px`,
      }"
      class="pdf-body"
    >
      <PdfNavContainer
        :navigationRef="navigationRef"
        :canvasWidth="canvasWidth"
        :imageRenderHeight="canvasHeight"
        :pdfJsViewer="pdfJsViewer"
        style="flex-shrink: 0"
        :pdfContainer="pdfContainer"
        v-if="navigationRef && pdfExamplePages"
      />
      <div v-if="pdfExamplePages" class="pdf-list-container">
        <pdfTarget
          @handleIntersection="handleIntersection"
          style="margin: 10px auto"
          @handleSetImageUrl="handleSetImageUrl"
          :pdfOptions="{
            containerScale: containerScale,
            scale: configOption.clearScale,
          }"
          :pdfImageView="configOption.pdfImageView"
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
import { configOption } from "../config";
import { Image as AImage } from "ant-design-vue";
import pdfTool from "./pdfTool.vue";
import pdfTarget from "./pdfTarget.vue";
import { handelRestrictDebounce } from "../utils/index";
import PdfNavContainer from "./pdfNavContainer.vue";
import { ref, provide, watch, computed, onMounted, onUnmounted } from "vue";
import "pdfjs-dist/web/pdf_viewer.css";

const props = defineProps<{
  loadFileUrl: string;
  pdfPath: string;
  loading?: (load: boolean) => void; //加载完成函数
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
const pdfParentContainerRef = ref();
const pdfToolRef = ref();
const pdfJsViewer = ref();
const getDocumentRef = ref() as any;
const parentHeight = computed(() => pdfParentContainerRef?.value?.clientHeight);
provide("containerScale", containerScale);
provide("index", index);
provide("pdfExamplePages", pdfExamplePages);
provide("searchValue", searchValue);
provide("pdfContainer", pdfContainer);
provide("navigationRef", navigationRef);
provide("parentHeight", parentHeight);
provide("pdfFileUrl", props.loadFileUrl);
const loadFine = (loadFileUrl = props.loadFileUrl) => {
  getDocumentRef.value(loadFileUrl).promise.then(async (example: any) => {
    pdfContainer = example;
    await getPdfHeight(example);
    const { numPages } = example;
    pdfExamplePages.value = numPages;
    navigationRef.value = configOption.value.navigationShow as boolean;
    props?.loading && props?.loading(false);
  });
};
const setVisible = (value: boolean): void => {
  visible.value = value;
};
const getPdfHeight = async (pdfContainer: any) => {
  const page = await pdfContainer.getPage(1);
  const height = page.view[3];
  const width = page.view[2];
  const { w, h } = returnResizeView(width, height, true);
  canvasHeight.value = h;
  canvasWidth.value = w;
};
const returnResizeView = (
  w: number,
  h: number,
  auto?: boolean,
  scale: number = 0.8
) => {
  const containerW = pdfParentContainerRef?.value?.clientWidth;
  const scaleW = w / containerW;
  return w > containerW || auto
    ? {
        w: containerW * scale,
        h: (h / scaleW) * scale,
      }
    : { w, h };
};
const handleSetImageUrl = (url: string) => {
  pdfImageUrl.value = url;
  visible.value = true;
};
const handleIntersection = (num: number, isIntersecting: boolean) => {
  positionIndexMap.value.set(num, isIntersecting);
};
const debounce = handelRestrictDebounce(100, () => {
  const { w, h } = returnResizeView(
    canvasWidth.value,
    canvasHeight.value,
    true
  );
  canvasHeight.value = h;
  canvasWidth.value = w;
});
const handlePdfElementResize = () => {
  debounce();
};

const asyncImportComponents = () => {
  import("pdfjs-dist").then(({ GlobalWorkerOptions, getDocument }) => {
    import("pdfjs-dist/web/pdf_viewer.mjs").then((val) => {
      pdfJsViewer.value = val;
      getDocumentRef.value = getDocument;
      GlobalWorkerOptions.workerSrc = props.pdfPath;
      loadFine();
    });
  });
  //
};
asyncImportComponents();
onMounted(() => {
  configOption.value.pdfViewResize &&
    window.addEventListener("resize", handlePdfElementResize);
});
onUnmounted(() => {
  configOption.value.pdfViewResize &&
    window.removeEventListener("resize", handlePdfElementResize);
});
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
  user-select: none;
  height: 100%;
  width: 100%;
  min-width: 100%;
  min-height: 50vh;
  box-sizing: border-box;
}
.pdf-body {
  align-items: center;
  background-color: #e5e5e5;
}
.pdf-view-container .pdf-list-container {
  overflow: auto;
  width: 100%;
  height: 100%;
  /* height: 80vh; */
  padding: 0px 20px 20px;
  box-sizing: border-box;
}

:deep(.ant-image) {
  position: relative;
  display: none;
}
</style>
<style>
@media (max-width: 650px) {
  .pdf-view-container .pdf-tool-container .tool-content {
    left: 325px;
  }
}
</style>

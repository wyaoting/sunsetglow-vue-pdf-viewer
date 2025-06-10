<template>
  <div class="pdf-view-container" ref="pdfParentContainerRef" tabindex="0">
    <Image
      :src="pdfImageUrl"
      v-model:visible="visible"
      v-if="configOption.pdfImageView"
    />
    <div ref="pdfToolRef">
      <pdfTool :pdfContainer="pdfContainer" :pdfJsViewer="pdfJsViewer" />
    </div>
    <div
      v-if="isContainerVisible"
      :style="{
        display: 'flex',
        ...(configOption?.pdfBodyBackgroundColor && {
          backgroundColor: configOption.pdfBodyBackgroundColor,
        }),
        height: `${containerHeight}px`,
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
      <div
        v-if="pdfExamplePages"
        class="pdf-list-container"
        @scroll="handleScroll"
      >
        <pdfTarget
          :textLayer="configOption.textLayer"
          style="margin: 10px auto"
          @handleSetImageUrl="handleSetImageUrl"
          :pdfOptions="{
            containerScale: containerScale,
            scale: configOption.clearScale,
          }"
          :pdfImageView="configOption.pdfImageView"
          :watermarkOptions="configOption.watermarkOptions"
          :pdfJsViewer="pdfJsViewer"
          :targetSearchPageItem="targetSearchPageItem"
          :pageNum="pdfItem"
          :canvasWidth="canvasWidth"
          :searchValue="searchValue"
          :imageRenderHeight="canvasHeight"
          :pdfContainer="pdfContainer"
          v-for="pdfItem in pdfExamplePages"
        />
      </div>
    </div>
    <div id="print-pdf-container" v-show="false"></div>
    <div id="search-sunsetglow-pdf-container" v-show="false"></div>
  </div>
  <SelectPopup :target="pdfParentContainerRef"></SelectPopup>
</template>
<script lang="ts" name="vue-pdf-view" setup>
import SelectPopup from "./selectPopup.vue";
import Image from "./image.vue";
import "ant-design-vue/lib/image/style";
import { configOption, file } from "../config";
import pdfTool from "./pdfTool.vue";
import pdfTarget from "./pdfTarget.vue";
import { handelRestrictDebounce, isFile } from "../utils/index";
import PdfNavContainer from "./pdfNavContainer.vue";
import { ref, provide, onMounted, watch, Ref, isRef } from "vue";
import "pdfjs-dist/web/pdf_viewer.css";

const props = defineProps<{
  loadFileUrl: string | ArrayBuffer | Uint8Array | Ref<string>;
  pdfPath: string;
  loading?: (load: boolean, fileInfo: { totalPage: number }) => void; //加载完成函数
}>();
const visible = ref<boolean>(false);
const index = ref<number>(1);
const isContainerVisible = ref(true);
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
const containerHeight = ref(0);
const parentHeight = ref();
// search 当前page 的信息
const targetSearchPageItem = ref<{
  textTotal: number;
  currentIndex: number;
  searchTotal: number;
  beforeTotal: number;
  searchIndex: number;
}>();
provide("targetSearchPageItem", targetSearchPageItem);

provide("containerScale", containerScale);
provide("index", index);
provide("pdfExamplePages", pdfExamplePages);
provide("searchValue", searchValue);
provide("navigationRef", navigationRef);
provide("parentHeight", parentHeight);
function isStringRef(value: unknown): value is Ref<string> {
  return isRef(value) && typeof value.value === "string";
}
const loadFine = (
  loadFileUrl:
    | string
    | ArrayBuffer
    | Uint8Array
    | Ref<string> = props.loadFileUrl
) => {
  let _params = {};
  if (typeof loadFileUrl === "string") {
    _params = {
      url: loadFileUrl,
    };
    file.value.url = loadFileUrl;
  } else if (isStringRef(loadFileUrl)) {
    _params = {
      url: loadFileUrl.value,
    };
    file.value.url = loadFileUrl.value;
  } else if (isFile(loadFileUrl)) {
    _params = {
      data: loadFileUrl,
    };
    const arrayBuffer =
      loadFileUrl instanceof Uint8Array
        ? loadFileUrl.buffer.slice(0)
        : loadFileUrl.slice(0);

    file.value = {
      url: undefined,
      data: arrayBuffer,
    };
  }
  if (!Object.keys(_params).length) {
    props?.loading && props?.loading(false, { totalPage: 0 });
    return console.error(
      "Error: The file type must be URL or ArrayBuffer | Uint8Array | string | Ref<string>"
    );
  }
  const params = {
    ..._params,
    ...(configOption.value.customPdfOption
      ? configOption.value.customPdfOption
      : ""),
  };
  getDocumentRef.value(params).promise.then(async (example: any) => {
    if (!isContainerVisible.value) isContainerVisible.value = true;
    pdfContainer = example;
    await getPdfHeight(example);
    const { numPages } = example;
    const { renderTotalPage } = configOption.value || { renderTotalPage: -1 };
    pdfExamplePages.value =
      renderTotalPage === -1
        ? numPages
        : (renderTotalPage as number) > numPages
        ? numPages
        : renderTotalPage;
    navigationRef.value = configOption.value.navigationShow as boolean;
    props?.loading && props?.loading(false, { totalPage: numPages });
  });
};

const getPdfHeight = async (pdfContainer: any) => {
  const page = await pdfContainer.getPage(1);
  var { height, width } = page.getViewport({ scale: 1 });
  const { w, h } = returnResizeView(width, height, true);
  canvasHeight.value = h;
  canvasWidth.value = w;
};
const returnResizeView = (
  w: number,
  h: number,
  auto?: boolean,
  scale: number = configOption?.value?.containerWidthScale || 0.8
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

const debounce = handelRestrictDebounce(100, () => {
  const { w, h } = returnResizeView(
    canvasWidth.value,
    canvasHeight.value,
    true
  );
  containerHeight.value =
    parentHeight.value - (pdfToolRef.value?.clientHeight || 0);
  canvasHeight.value = h;
  canvasWidth.value = w;
});
const handlePdfElementResize = () => {
  debounce();
};

const asyncImportComponents = () => {
  import("pdfjs-dist").then(({ GlobalWorkerOptions, getDocument }) => {
    import("pdfjs-dist/web/pdf_viewer.js").then((val) => {
      pdfJsViewer.value = val;
      getDocumentRef.value = getDocument;
      GlobalWorkerOptions.workerSrc = props.pdfPath;
      loadFine();
    });
  });
  //
};

// 监听滚动计算 scrollTop 去区分当前那个页码触发
const handleScroll = (event: Event) => {
  const id = requestIdleCallback(() => {
    const e = event.target as HTMLElement;
    let childrenHeight = 0;
    let currentIndex = 1;
    const childNodes = e.childNodes;
    for (let i = 1; i < childNodes.length; i++) {
      const el = childNodes[i] as HTMLElement;
      const height =
        el?.clientHeight * (configOption.value.visibleWindowPageRatio || 0.5) ||
        0;
      if (childrenHeight < e.scrollTop + height) {
        currentIndex = i;
      }
      childrenHeight += (el?.clientHeight || 0) + 10;
    }
    index.value = currentIndex;
    if (configOption.value.pageOption?.current) {
      configOption.value.pageOption.current = index.value;
    }
    cancelIdleCallback(id);
  });
};

const resizeObserve = () => {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { height } = entry.contentRect;
      parentHeight.value = height;
    }
    handlePdfElementResize();
  });
  pdfParentContainerRef.value && observer.observe(pdfParentContainerRef.value);
};
asyncImportComponents();
onMounted(() => {
  parentHeight.value = pdfParentContainerRef?.value?.clientHeight;
  configOption.value.pdfViewResize && resizeObserve();
  !configOption.value.pdfViewResize && handlePdfElementResize();
  // configOption.value.pdfViewResize &&
  //   window.addEventListener("resize", handlePdfElementResize);
});
// onUnmounted(() => {
//   configOption.value.pdfViewResize &&
//     window.removeEventListener("resize", handlePdfElementResize);
// });
isStringRef(props.loadFileUrl) &&
  watch(
    () => props.loadFileUrl,
    () => {
      if (
        isStringRef(props.loadFileUrl) &&
        pdfJsViewer.value &&
        getDocumentRef.value
      ) {
        isContainerVisible.value = false;
        loadFine();
      } else {
        if (!isStringRef(props.loadFileUrl))
          console.error("Error: The type is not ref<string>");
        if (!pdfJsViewer.value || !getDocumentRef.value)
          console.error("Error: PdfJsViewer and getDocumentRef cannot be null");
      }
    },
    { deep: true } // 如果需要深度监听对象/数组变化
  );
</script>

<style scoped>
.pdf-view-container {
  height: 100%;
  width: 100%;
  min-width: 100%;
  min-height: 50vh;
  box-sizing: border-box;
}
.pdf-body {
  align-items: center;
  background-color: #eaeaea;
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
.pdf-view-container #print-pdf-container {
  text-align: center;
}
</style>
<style>
/* .textLayer {
  opacity: 1 !important;
}
.textLayer span,
.textLayer br {
  color: pink;
} */
@media (max-width: 650px) {
  .pdf-view-container .pdf-tool-container .tool-content {
    left: 325px;
  }
}
</style>

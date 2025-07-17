<template>
  <div class="pdf-view-container" ref="pdfParentContainerRef" tabindex="0">
    <Image
      :src="pdfImageUrl"
      v-model:visible="visible"
      v-if="configOption.pdfImageView"
    />

    <div ref="pdfToolRef" v-if="isContainerVisible">
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
        :pdfJsViewer="pdfJsViewer"
        style="flex-shrink: 0"
        :pdfContainer="pdfContainer"
        v-if="navigationRef && pdfExamplePages"
      />
      <div
        v-if="pdfExamplePages"
        class="pdf-list-container"
        ref="pdfListContainerRef"
        @scroll="handleScroll"
        :style="{
          ...(configOption?.pdfListContainerPadding && {
            padding: configOption?.pdfListContainerPadding,
          }),
        }"
      >
        <pdfTarget
          :textLayer="configOption.textLayer"
          @handleSetImageUrl="handleSetImageUrl"
          :pdfOptions="{
            containerScale: containerScale,
            scale: configOption.clearScale,
          }"
          :onPageRenderEnd="onPageRenderEnd"
          style="margin: 0px auto 10px auto"
          :pdfImageView="configOption.pdfImageView"
          :watermarkOptions="configOption.watermarkOptions"
          :pdfJsViewer="pdfJsViewer"
          :pdfPageWidthMax="containerWidth"
          :targetSearchPageItem="targetSearchPageItem"
          :pageNum="pdfItem"
          :searchValue="searchValue"
          :pdfContainer="pdfContainer"
          v-for="pdfItem in pdfExamplePages"
        />
      </div>
    </div>
    <div
      id="print-pdf-container"
      v-if="isContainerVisible"
      v-show="false"
    ></div>
    <div
      id="search-sunsetglow-pdf-container"
      v-if="isContainerVisible"
      v-show="false"
    ></div>
  </div>
  <SelectPopup
    v-if="isContainerVisible"
    :target="pdfParentContainerRef"
  ></SelectPopup>
</template>
<script lang="ts" name="vue-pdf-view" setup>
import SelectPopup from "./selectPopup.vue";
import Image from "./image.vue";
import "ant-design-vue/lib/image/style";
import { usePdfConfigState } from "../config";
import pdfTool from "./pdfTool.vue";
import pdfTarget from "./pdfTarget.vue";
import {
  handelRestrictDebounce,
  isFile,
  handlePdfLocateView,
} from "../utils/index";
import PdfNavContainer from "./pdfNavContainer.vue";
import {
  ref,
  provide,
  onMounted,
  watch,
  Ref,
  isRef,
  onUnmounted,
  computed,
  nextTick,
} from "vue";
import "pdfjs-dist/web/pdf_viewer.css";

const props = defineProps<{
  loadFileUrl: string | ArrayBuffer | Uint8Array | Ref<string>;
  pdfPath: string;
  loading?: (load: boolean, fileInfo: { totalPage: number }) => void; //加载完成函数
  onError?: (error: Error) => void;
}>();
const { configOption, file, globalStore } = usePdfConfigState();
const visible = ref<boolean>(false);
const index = ref<number>(1);
const isContainerVisible = ref(true);
const pdfExamplePages = ref<number>(0);
const navigationRef = ref<boolean>(false);
const pdfImageUrl = ref("");
const pdfListContainerRef = ref<null | HTMLElement>();
const containerScale = computed({
  set(v: number) {
    if (v < (configOption?.value?.customMinScale || 0.1))
      return console.error(`最小缩放值不能小于 pdfOption.customMinScale`);
    if (configOption.value.containerScale) {
      configOption.value.containerScale = v;
      // 监听值变化触发滚动事件
      nextTick(() => {
        handlePdfLocateView(
          index.value,
          `#scrollIntIndex-${configOption.value.appIndex}`,
          configOption.value.appIndex as number
        );
      });
    }
  },
  get() {
    if (
      configOption.value?.containerScale &&
      configOption.value.containerScale <
        (configOption?.value?.customMinScale || 0.1)
    ) {
      console.error(`最小缩放值不能小于 pdfOption.customMinScale`);
      return configOption?.value?.customMinScale || 0.1;
    }
    return configOption.value.containerScale as number;
  },
});
const searchValue = ref<string>(""); //搜索
let pdfContainer: any = "";
const pdfParentContainerRef = ref();
const pdfToolRef = ref();
const pdfJsViewer = ref();
const getDocumentRef = ref() as any;
const containerHeight = ref(0); //容器高度
const containerWidth = ref(0); // 容器宽度
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

const handleSetImageUrl = (url: string) => {
  pdfImageUrl.value = url;
  visible.value = true;
};
const onPageRenderEnd = () => {
  configOption.value?.onPageRenderEnd && configOption.value?.onPageRenderEnd();
};
const debounce = handelRestrictDebounce(100, () => {
  containerHeight.value =
    parentHeight.value - (pdfToolRef.value?.clientHeight || 0);
  containerWidth.value =
    pdfParentContainerRef?.value?.clientWidth *
    (configOption?.value?.containerWidthScale || 0.8);
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
const handleScroll = handelRestrictDebounce(0, (event: Event) => {
  const id = requestIdleCallback(() => {
    const e = event.target as HTMLElement;
    let currentIndex = 1;
    const { visibleWindowPageRatio = 0.5 } = configOption.value;
    const childNodes = e.childNodes as any;
    const pageRation = 1 - Math.min(visibleWindowPageRatio, 1);
    for (let i = 1; i < childNodes.length; i++) {
      const el = childNodes[i] as HTMLElement;
      // 判断下一页到可视窗口比例
      if (el.offsetTop <= e.scrollTop + parentHeight.value * pageRation) {
        currentIndex = i;
      }
    }
    index.value = currentIndex;
    if (configOption.value.pageOption?.current) {
      configOption.value.pageOption.current = index.value;
    }
    cancelIdleCallback(id);
  });
});

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
const onUnhandledrejection = (event: { reason: Error }) => {
  props.onError && props.onError(event.reason);
};
asyncImportComponents();
onMounted(() => {
  parentHeight.value = pdfParentContainerRef?.value?.clientHeight;
  configOption.value.pdfViewResize && resizeObserve();
  !configOption.value.pdfViewResize && handlePdfElementResize();
  // 捕获未处理的 Promise 错误
  window.addEventListener("unhandledrejection", onUnhandledrejection);

  // configOption.value.pdfViewResize &&
  //   window.addEventListener("resize", handlePdfElementResize);
});
onUnmounted(() => {
  window.removeEventListener("unhandledrejection", onUnhandledrejection);
});
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
        if (configOption.value.searchOption) {
          configOption.value.searchOption.searchIndex = 0;
          configOption.value.searchOption.searchTotal = 0;
        }
        searchValue.value = "";
        if (globalStore.value?.searchRef) {
          globalStore.value.searchRef.searchText = "";
          globalStore.value.searchRef.open = false;
        }
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
  padding: 10px 20px 20px;
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

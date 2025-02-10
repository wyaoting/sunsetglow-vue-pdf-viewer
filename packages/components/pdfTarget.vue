<template>
  <div
    :style="`height:${containerHeight}px;width:${containerWidth}px;`"
    class="pdf-Container-Ref pdfViewer"
    :class="{ pdfLoading: pdfLoading }"
    :id="`${
      props.scrollIntIndexShow && 'scrollIntIndex' + '-' + props.pageNum
    }`"
    @click="handleToImage"
    ref="pdfContainerRef"
  >
    <canvas
      v-if="!pdfBoothShow"
      :style="`height:${containerHeight}px;width:${containerWidth}px;`"
      class="pdf-render"
      ref="pdfRender"
    >
    </canvas>
    <div
      v-if="pdfLoading"
      class="loading-container"
      :style="`height:${containerHeight}px;width:${containerWidth}px;`"
    >
      <img
        style="width: 24px; object-fit: cover"
        class="loading-icon-image"
        src="../assets/pdf/loading-icon.gif"
        alt=""
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { pdfRenderClass } from "../utils/index";
import { ref, onMounted, nextTick, watch, defineExpose, computed } from "vue";
export type options = {
  scale?: number; //控制canvas 高清度 默认是1.5
  containerScale: number; // 控制 pdf 容器缩放度
};
const props = withDefaults(
  defineProps<{
    scrollIntIndexShow?: boolean;
    pageNum: number;
    pdfContainer: any; //
    pdfJsViewer: any; // pdfJsViewer
    searchValue?: string; // 搜索内容
    canvasWidth?: number; //pdf 宽带
    imageRenderHeight?: number; //pdf 高度
    pdfOptions?: options;
    pdfImageView?: boolean; //是否点击预览
    textLayer?: boolean; //是否可复制文本
    targetSearchPageItem?: {
      //搜索当前高亮
      textTotal: number;
      currentIndex: number;
      searchTotal: number;
      beforeTotal: number;
      searchIndex: number;
    };
  }>(),
  {
    pdfOptions: () => ({
      scale: 1,
      containerScale: 1,
    }),
    scrollIntIndexShow: true,
    textLayer: false,
  }
);
const eventEmit = defineEmits<{
  (e: "handleSetImageUrl", url: string): void;
  (e: "handleIntersection", num: number, isIntersecting: boolean): void;
}>();

let pefTextContainer = ref<null | HTMLElement>(null);
const renderRes = ref();
const searchValve = ref(false);
const textContentCreated = ref();
const pdfContainerRef = ref();
const total = ref();
const pdfRender = ref<HTMLCanvasElement>();
const pdfLoading = ref<boolean>(false);
const pdfBoothShow = ref<boolean>(true);
const ioRef = ref();
const isIntersectingRef = ref<boolean>(false);

const containerWidth = computed(
  () => (props?.canvasWidth || 100) * props.pdfOptions.containerScale
);
const containerHeight = computed(
  () => (props?.imageRenderHeight || 100) * props.pdfOptions.containerScale
);

const renderPage = async (num: number, searchVisible = false) => {
  pdfBoothShow.value = false;
  pdfLoading.value = true;
  nextTick(() => {
    props.pdfContainer.getPage(num).then(async (page: any) => {
      if (!pdfRender.value || pdfBoothShow.value) return;
      const pdfCanvas = new pdfRenderClass(
        pdfRender.value,
        page,
        props.pdfOptions.scale as number
      );
      renderRes.value = await pdfCanvas.handleRender();
      pdfLoading.value = false;
      if (!props.textLayer) return;
      // 文本复制 初始渲染一次
      if (!textContentCreated.value) {
        const scale =
          containerWidth.value / renderRes?.value?.viewport.rawDims.pageWidth;
        const { TextLayerBuilder } = props.pdfJsViewer;
        const textContainer = await pdfCanvas.handleRenderTextContent(
          TextLayerBuilder,
          scale,
          pdfContainerRef.value
        );
        pefTextContainer.value = textContainer.container;
        textContentCreated.value = true;
      }
      if (
        searchVisible &&
        pefTextContainer.value &&
        props.searchValue &&
        !searchValve.value
      ) {
        searchValve.value = true;
        total.value = pdfCanvas.handleSearch(
          pefTextContainer.value,
          props.searchValue as string
        );
      }
    });
  });
};
const highlightAction = (index: number) => {
  nextTick(() => {
    const parentContainer = pdfContainerRef.value;
    const highlightTextDomList =
      parentContainer.querySelectorAll(".pdf-highlight");
    const domList = document.querySelectorAll(".pdf-highlight");
    // 全量删除
    for (let i = 0; i < domList.length; i++) {
      const node = domList[i];
      node.classList.remove("search-action-highlight");
    }
    for (let i = 0; i < highlightTextDomList.length; i++) {
      const node = highlightTextDomList[i];
      if (index === i) {
        node.classList.add("search-action-highlight");
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
};
const handleToImage = () => {
  if (!props.pdfImageView) return;
  eventEmit(
    "handleSetImageUrl",
    pdfRender.value?.toDataURL("image/png") as string
  );
};

const ioCallback = (entries: any) => {
  const { isIntersecting } = entries[0];
  isIntersectingRef.value = isIntersecting;
  if (isIntersecting) {
    renderPage(props.pageNum, !!props.searchValue);
  } else {
    pdfBoothShow.value = true;
  }
  eventEmit("handleIntersection", props.pageNum, isIntersecting);
};
onMounted(() => {
  ioRef.value = new IntersectionObserver(ioCallback, {
    root: null,
  });
  ioRef.value.observe(pdfContainerRef.value);
});

defineExpose({
  pdfContainerRef,
});
watch(
  () => props.searchValue,
  () => {
    searchValve.value = false;
    isIntersectingRef.value && renderPage(props.pageNum, true);
  }
);

watch(
  [() => total.value, () => props.targetSearchPageItem?.searchIndex],
  () => {
    if (props.targetSearchPageItem) {
      const { searchIndex, currentIndex, beforeTotal } =
        props.targetSearchPageItem;
      if (currentIndex === props.pageNum) {
        highlightAction(searchIndex - beforeTotal - 1);
      }
    }
  }
);
// 监听缩放
watch(
  () => containerWidth.value,
  (containerWidth) => {
    if (!renderRes?.value?.viewport.rawDims.pageWidth) return;
    const scale = containerWidth / renderRes?.value?.viewport.rawDims.pageWidth;
    pdfContainerRef.value.style.setProperty("--scale-factor", `${scale}`);
  }
);
</script>

<style scoped>
.pdf-render {
  display: block;
}

.pdf-Container-Ref {
  background-color: #f5f5f5;
  position: relative;
}

.pdf-Container-Ref .loading-icon-image {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 4;
  transform: translate(-50%, -50%);
}

.loading-container {
  position: absolute;
  left: 0px;
  top: 0px;
  opacity: 1;
  background-color: #ebebeb;
  z-index: 4;
}

.pdf-Container-Ref :deep(.pdf-highlight) {
  background-color: #ff4444;
  height: fit-content;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  opacity: 0.4;
}
.pdf-Container-Ref :deep(.search-action-highlight) {
  background-color: #72f110;
  /* color: #389e0d; */
  /* opacity: 1; */
}
</style>

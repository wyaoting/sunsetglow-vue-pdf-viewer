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
    <!-- <canvas
      ref="annotationVisibleRef"
      v-if="props.isAnnotationVisible"
      style="z-index: 99; position: absolute; left: 0; top: 0; right: 0"
      :style="`height:${containerHeight}px;width:${containerWidth}px;`"
    >
    </canvas> -->
    <!--  display: 'flex',
        'align-items': 'center',
        'justify-content': 'center', -->
    <div
      class="watermark-container"
      v-if="props.watermarkOptions && watermarkTotal && !pdfLoading"
      :style="{
        color: props.watermarkOptions?.color || '#000',
        'font-size': `${props.watermarkOptions?.fontSize}px`,
        height: `${containerHeight}px`,
        width: `${containerWidth}px`,
        overflow: 'hidden',

        opacity: props.watermarkOptions?.opacity || '1',
      }"
    >
      <div
        :style="{
          height: `100%`,
          width: `100%`,
          display: 'grid',
          'grid-template-columns': ` repeat(${props.watermarkOptions?.columns}, auto)`,
          gap: `10px`,
        }"
      >
        <!--  transform: `rotate(${props.watermarkOptions?.rotation}deg)`, -->
        <div
          :style="{
            position: 'relative',
          }"
          v-for="item in watermarkTotal"
          :key="item"
        >
          <div
            :style="{
              transform: `translate(-50%, -50%) rotate(${props.watermarkOptions?.rotation}deg)`,
            }"
            class="watermark-origin"
            style="white-space: nowrap"
            v-if="props.watermarkOptions?.watermarkTextList"
          >
            <div v-for="item in props.watermarkOptions?.watermarkTextList">
              {{ item }}
            </div>
          </div>

          <img
            :style="{
              transform: `translate(-50%, -50%) rotate(${props.watermarkOptions?.rotation}deg)`,
            }"
            class="watermark-origin"
            v-else-if="props.watermarkOptions?.watermarkLink"
            width="80%"
            :src="props.watermarkOptions?.watermarkLink"
            alt=""
          />
        </div>
      </div>
    </div>
    <div
      v-if="pdfLoading"
      class="loading-container"
      :style="{
        backgroundColor: configOption?.pdfItemBackgroundColor,
        height: `${containerHeight}px`,
        width: `${containerWidth}px`,
      }"
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
import {
  canvasPainting,
  toolsOption,
  constDrawToolType,
} from "../utils/annotation.ts";
import { pdfRenderClass, closeCanvas } from "../utils/index";
import { configOption, globalStore } from "../config";
import {
  ref,
  onMounted,
  nextTick,
  watch,
  defineExpose,
  computed,
  onUnmounted,
} from "vue";
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
    canvasWidth?: number; //pdf 宽
    imageRenderHeight?: number; //pdf 高度
    pdfOptions?: options;
    pdfImageView?: boolean; //是否点击预览
    textLayer?: boolean; //是否可复制文本
    isAnnotationVisible?: boolean; //是否开启批注功能
    watermarkOptions?:
      | {
          columns: number;
          rows: number;
          color: string;
          watermarkLink?: string;
          watermarkTextList?: string[];
          rotation: number;
          fontSize: number;
          opacity: number;
        }
      | undefined;
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
    isAnnotationVisible: false,
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
let annotationCanvas: any = null;
let canvasEl: null | HTMLCanvasElement = null;
const pdfRender = ref<HTMLCanvasElement>();
const pdfLoading = ref<boolean>(false);
const pdfBoothShow = ref<boolean>(true);
const ioRef = ref();
const isIntersectingRef = ref<boolean>(false);
const watermarkTotal = ref(0);
const containerWidth = computed(
  () => (props?.canvasWidth || 100) * props.pdfOptions.containerScale
);
const containerHeight = computed(
  () => (props?.imageRenderHeight || 100) * props.pdfOptions.containerScale
);
const onWatermarkInit = () => {
  if (!props.watermarkOptions) return;
  const { rows, columns } = props.watermarkOptions;
  watermarkTotal.value = parseInt(`${+rows * +columns}`);
};
// const
const initAnnotation = () => {
  // const cvs = document.querySelector(
  //   `#annotation-${props.pageNum}`
  // ) as HTMLCanvasElement;
  console.log(
    pdfBoothShow.value,
    "pdfBoothShow.value---2",
    globalStore.value.isAnnotaion
  );
  // 离开当前可视窗口，或者标注功能关闭清除标注canvas
  if (pdfBoothShow.value) {
    if (canvasEl) closeCanvas(canvasEl);
    return;
  }
  const { fontColor, fontSize, lineWidth, currentTool } =
    globalStore.value.annotationOption;
  const drawTools = {};
  const tools = {
    undo: document.querySelector("#undoBtn"),
    clear: document.querySelector("#clearBtn"),
    save: document.querySelector("#saveBtn"),
    load: document.querySelector("#loadBtn"),
  };
  if (!canvasEl) {
    canvasEl = document.createElement("canvas");
    canvasEl.style.position = "absolute";
    canvasEl.style.left = "0px";
    canvasEl.style.top = "0px";
    canvasEl.style.right = "0px";
    canvasEl.style.zIndex = "3";
    canvasEl.setAttribute("id", `annotation-${props.pageNum}`);
    canvasEl.style.height = `${containerHeight.value}px`;
    canvasEl.style.width = `${containerWidth.value}px`;
  }
  if (canvasEl && !annotationCanvas) {
    //@ts-ignore
    annotationCanvas = new canvasPainting(
      canvasEl,
      {
        tools,
        drawTools,
      } as toolsOption,
      {
        option: {
          lineWidth, //边框大小
          strokeStyle: fontColor, //边框颜色
          fontSize: fontSize, //字体大小
          fillStyle: fontColor, //字体颜色
          currentTool,
          canvasAttribute: {
            //canvas 属性
            width: containerWidth.value,
            height: containerHeight.value,
          },
        },
      }
    );
    pdfContainerRef.value.appendChild(canvasEl);
  } else if (annotationCanvas && canvasEl) {
    canvasEl.style.height = `${containerHeight.value}px`;
    canvasEl.style.width = `${containerWidth.value}px`;
    canvasEl.style.display = "block";
    pdfContainerRef.value.appendChild(canvasEl);
    annotationCanvas._option.currentTool = currentTool;
    annotationCanvas._methods.restoreCanvas();
  }
};
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
      onWatermarkInit();
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
    const container = document.querySelector(".pdf-list-container");
    // 全量删除
    for (let i = 0; i < domList.length; i++) {
      const node = domList[i];
      node.classList.remove("search-action-highlight");
    }
    for (let i = 0; i < highlightTextDomList.length; i++) {
      const node = highlightTextDomList[i];
      const customId = node.parentNode.getAttribute("custom-search-id");
      if (index === customId - 1 && container) {
        node.classList.add("search-action-highlight");
        const elementRect = node.getBoundingClientRect();
        const absoluteElementTop =
          elementRect.top + pdfContainerRef.value.offsetTop;
        const middle = absoluteElementTop - container?.clientHeight / 2;
        container?.scrollTo({
          top: middle > 0 ? middle : 0,
          behavior: "smooth",
        });
      }
    }
  });
};
const handleToImage = () => {
  if (!props.pdfImageView || !pdfRender.value) return;

  // 使用requestIdleCallback将非关键操作放入空闲时段执行
  // requestIdleCallback(() => {
  try {
    const imageUrl = pdfRender?.value?.toDataURL("image/jpeg");
    imageUrl && eventEmit("handleSetImageUrl", imageUrl);
  } catch (error) {
    console.error("生成图片失败:", error);
  }
  // });
};

const ioCallback = (entries: any) => {
  const { isIntersecting } = entries[0];
  isIntersectingRef.value = isIntersecting;
  if (isIntersecting) {
    renderPage(props.pageNum, !!props.searchValue);
  } else {
    nextTick(() => {
      if (pdfRender.value) {
        pdfRender.value.width = 0;
        pdfRender.value.height = 0;
        pdfRender.value.style.height = "0px";
        pdfRender.value.style.width = "0px";
        pdfBoothShow.value = true;
        // initAnnotation();
      }
    });
  }
  eventEmit("handleIntersection", props.pageNum, isIntersecting);
};
onMounted(() => {
  ioRef.value = new IntersectionObserver(ioCallback, {
    root: null,
    threshold: 0.2,
  });
  ioRef.value.observe(pdfContainerRef.value);
});

defineExpose({
  pdfContainerRef,
});
/**
 * 监听绘画是否开始
 */
// pdfBoothShow
watch([() => globalStore.value.isAnnotaion, () => pdfBoothShow.value], () => {
  if (globalStore.value?.isAnnotaion && props.isAnnotationVisible)
    nextTick(() => {
      initAnnotation();
    });
});
// watch
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
watch(
  () => globalStore.value.annotationOption,
  (annotationOption) => {
    if (
      globalStore.value?.isAnnotaion &&
      props.isAnnotationVisible &&
      !pdfBoothShow.value &&
      annotationCanvas
    ) {
      const { fontColor, fontSize, lineWidth, currentTool } = annotationOption;
      annotationCanvas._option.lineWidth = lineWidth;
      annotationCanvas._option.fillStyle = fontColor;
      annotationCanvas._option.strokeStyle = fontColor;
      annotationCanvas._option.currentTool = currentTool;
    }
  },
  {
    deep: true,
  }
);
// 添加组件卸载时的清理
onUnmounted(() => {
  annotationCanvas && annotationCanvas._methods.onUnMethods;
  if (ioRef.value) {
    ioRef.value.disconnect();
    ioRef.value = null;
  }
});
</script>

<style scoped>
.pdf-render {
  display: block;
}

.pdf-Container-Ref {
  background-color: #f5f5f5;
  position: relative;
}
.pdf-Container-Ref .watermark-container {
  position: absolute;
  opacity: 1;
  left: 0px;
  top: 0px;
  z-index: 0;
}

.watermark-origin {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: 100%;
  user-select: none;
  -webkit-user-drag: none;
  max-height: 100%;
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
  opacity: 0.7;
}
.pdf-Container-Ref :deep(.search-action-highlight) {
  background-color: #72f110;
  /* color: #389e0d; */
  /* opacity: 1; */
}
</style>

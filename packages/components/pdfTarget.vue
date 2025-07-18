<template>
  <div
    :style="{
      height: `${containerHeight}px`,
      width: `${containerWidth}px`,
      ...(configOption?.pdfItemBackgroundColor && {
        backgroundColor: configOption?.pdfItemBackgroundColor,
      }),
    }"
    class="pdf-Container-Ref pdfViewer"
    :class="{ pdfLoading: pdfLoading }"
    :id="`${
      props.scrollIntIndexShow &&
      `scrollIntIndex-${configOption.appIndex}` + '-' + props.pageNum
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
    <!--  display: 'flex',
        'align-items': 'center',
        'justify-content': 'center', -->
    <div
      class="watermark-container"
      v-if="props.watermarkOptions && watermarkTotal && !pdfLoading"
      :style="{
        color: props.watermarkOptions?.color || '#000',
        'font-size': `${
          props.watermarkOptions?.fontSize * props.pdfOptions.containerScale
        }px`,
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
import { pdfRenderClass, setScale } from "../utils/index";
import { usePdfConfigState } from "../config";
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
    //page 渲染结束函数
    onPageRenderEnd?: () => void;
    scrollIntIndexShow?: boolean;
    pageNum: number;
    pdfContainer: any; //
    pdfJsViewer: any; // pdfJsViewer
    searchValue?: string; // 搜索内容
    pdfPageWidthMax?: number; //pdf最大的宽度
    // 传入此参数会按照最大宽度去计算出高度， 宽度默认为最大宽度 ，不会取pdf 的宽高
    pdfOptions?: options;
    pdfImageView?: boolean; //是否点击预览
    textLayer?: boolean; //是否可复制文本
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
    textLayer: false,
  }
);
const eventEmit = defineEmits<{
  (e: "handleSetImageUrl", url: string): void;
  (e: "handleIntersection", num: number, isIntersecting: boolean): void;
}>();
const { configOption } = usePdfConfigState();

let pefTextContainer = ref<null | HTMLElement>(null);
const renderRes = ref();
const searchValve = ref(false);
const textContentCreated = ref();
const pdfContainerRef = ref();
const total = ref();
let pageContainer: any | null = null;
const pdfRender = ref<HTMLCanvasElement>();
const pdfLoading = ref<boolean>(false);
const pdfBoothShow = ref<boolean>(true);
const ioRef = ref();
const isIntersectingRef = ref<boolean>(false);
const watermarkTotal = ref(0);
const defineH = ref(0);
const defineW = ref(0);
const containerWidth = computed(
  () => (defineW.value || 300) * props.pdfOptions.containerScale
);
const containerHeight = computed(
  () => (defineH.value || 300) * props.pdfOptions.containerScale
);
const onWatermarkInit = () => {
  if (!props.watermarkOptions) return;
  const { rows, columns } = props.watermarkOptions;
  watermarkTotal.value = parseInt(`${+rows * +columns}`);
};
function getActualSize(
  originalWidth: number,
  originalHeight: number,
  totalRotation: number
) {
  // 标准化为0/90/180/270
  const normalizedRotation = ((totalRotation % 360) + 360) % 360;

  // 判断是否需要交换宽高
  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { w: originalHeight, h: originalWidth }; // 旋转90或270度时，实际宽度变为原始高度
  } else {
    return { w: originalWidth, h: originalHeight }; // 0或180度时保持原始宽度
  }
}
const onPdfPageResize = async () => {
  if (!pageContainer) {
    pageContainer = await props.pdfContainer.getPage(props.pageNum);
  }
  if (pageContainer) {
    var { height, width } = pageContainer.getViewport({ scale: 1 });
    defineH.value = props.pdfPageWidthMax
      ? height * (props.pdfPageWidthMax / width)
      : height;
    defineW.value = props.pdfPageWidthMax ? props.pdfPageWidthMax : width;
  }
};
const renderPage = async (num: number, searchVisible = false) => {
  pdfBoothShow.value = false;
  pdfLoading.value = true;
  nextTick(() => {
    props.pdfContainer.getPage(num).then(async (page: any) => {
      if (!pageContainer) pageContainer = page;

      if (!pdfRender.value || pdfBoothShow.value) return;
      const pdfCanvas = new pdfRenderClass(
        pdfRender.value,
        page,
        props.pdfOptions.scale as number,
        props?.textLayer && configOption?.value?.getPdfScaleView
          ? configOption.value.getPdfScaleView
          : undefined
      );
      renderRes.value = await pdfCanvas.handleRender();
      pdfLoading.value = false;
      props?.onPageRenderEnd && props?.onPageRenderEnd();
      onWatermarkInit();
      if (!props.textLayer) return;
      // 文本复制 初始渲染一次
      if (!textContentCreated.value) {
        // 根据缩放换算真正的宽度
        const { rawDims, rotation } = renderRes?.value?.viewport;
        const { w } = getActualSize(
          rawDims.pageWidth,
          rawDims.pageHeight,
          rotation
        );
        const scale = containerWidth.value / w;
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
    const container = document.querySelectorAll(".pdf-list-container")[
      configOption.value.appIndex as number
    ] as HTMLElement;
    const domList = document
      .querySelectorAll(".pdf-body")
      [configOption.value.appIndex as number].querySelectorAll(
        ".pdf-highlight"
      );

    // 全量删除
    for (let i = 0; i < domList.length; i++) {
      const node = domList[i];
      node.classList.remove("search-action-highlight");
    }
    for (let i = 0; i < highlightTextDomList.length; i++) {
      const node = highlightTextDomList[i];
      const customId =
        node.getAttribute("custom-search-id") ||
        node.parentNode.getAttribute("custom-search-id");
      if (index === customId - 1 && container) {
        node.classList.add("search-action-highlight");
        const absoluteElementTop =
          node.offsetParent.offsetTop + pdfContainerRef.value.offsetTop;
        const middle = absoluteElementTop - container?.clientHeight / 2;
        container?.scrollTo({
          top: Math.max(0, middle),
          // behavior: "smooth",
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
    // 获取当前选中对象
    const selection = window.getSelection();
    // 方法1：移除所有选中范围
    selection?.removeAllRanges();
    pdfBoothShow.value = true;
  }
  eventEmit("handleIntersection", props.pageNum, isIntersecting);
};
onMounted(() => {
  ioRef.value = new IntersectionObserver(ioCallback, {
    root: null,
    threshold: configOption?.value?.threshold,
  });
  ioRef.value.observe(pdfContainerRef.value);
  if (!defineH.value || !defineW.value) {
    onPdfPageResize();
  }
});
defineExpose({
  pdfContainerRef,
  onPdfPageResize,
});
watch(
  () => props.searchValue,
  () => {
    searchValve.value = false;
    isIntersectingRef.value && renderPage(props.pageNum, true);
  }
);

watch(
  () => props?.pdfPageWidthMax,
  (pdfPageWidthMax) => {
    pdfPageWidthMax && onPdfPageResize();
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
    const { rawDims, rotation } = renderRes?.value?.viewport;
    const { w } = getActualSize(
      rawDims.pageWidth,
      rawDims.pageHeight,
      rotation
    );
    let scaleFactor = containerWidth / w;
    pdfContainerRef.value.style.setProperty("--scale-factor", `${scaleFactor}`);
    setScale(
      scaleFactor,
      renderRes?.value?.viewport.rawDims,
      configOption.value.getPdfScaleView
    );
  }
);
// 添加组件卸载时的清理
onUnmounted(() => {
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
  /* margin: 0px auto 10px auto; */
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

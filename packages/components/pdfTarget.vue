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
// const searchValue = inject("searchValue") as Ref;
const eventEmit = defineEmits<{
  (e: "handleSetImageUrl", url: string): void;
  (e: "handleIntersection", num: number, isIntersecting: boolean): void;
}>();
let findTextContent = ref();
let viewportRef = ref();
let textPage = ref();

const renderRes = ref();
const textContentCreated = ref();
const pdfContainerRef = ref();
const pdfRender = ref<HTMLCanvasElement>();
const pdfLoading = ref<boolean>(false);
const pdfBoothShow = ref<boolean>(true);
const ioRef = ref();
const canvasCreatedValve = ref<boolean>(false); //

const containerWidth = computed(
  () => (props?.canvasWidth || 100) * props.pdfOptions.containerScale
);
const containerHeight = computed(
  () => (props?.imageRenderHeight || 100) * props.pdfOptions.containerScale
);

const renderPage = async (num: number) => {
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
      if (textContentCreated.value) return;
      const scale =
        containerWidth.value / renderRes?.value?.viewport.rawDims.pageWidth;
      const { TextLayerBuilder } = props.pdfJsViewer;
      await pdfCanvas.handleRenderTextContent(
        TextLayerBuilder,
        scale,
        pdfContainerRef.value
      );
      textContentCreated.value = true;
      // props.searchValue &&
      //   renderTextContent(
      //     findTextContent.value,
      //     viewportRef.value,
      //     textPage.value
      //   );
    });
  });
};
const renderTextContent = (findTextContent: any, viewport: any, page: any) => {
  if (!findTextContent || !viewport || !page || !props.searchValue) return;
  if (canvasCreatedValve.value) return;
  const { TextLayerBuilder } = props.pdfJsViewer;
  const textLayerDiv = document.createElement("div");
  textLayerDiv.setAttribute("class", "textLayer");
  var textLayer = new TextLayerBuilder({
    textLayerDiv: textLayerDiv,
    pageIndex: page._pageIndex,
    pdfPage: page,
  });
  const pdfViewer = document.querySelector(".pdfViewer") as HTMLElement;
  //换算缩放值
  const scale = containerWidth.value / viewport.rawDims.pageWidth;
  console.log(scale, viewport.rawDims.pageWidth, "viewport.rawDims.pageWidth");
  pdfViewer.style.setProperty("--scale-factor", `${scale}`);
  textLayer.render(viewport, findTextContent);
  pdfContainerRef.value.appendChild(textLayer.div);
  canvasCreatedValve.value = true;
  // nextTick(() => {
  //   const dom = pdfContainerRef.value;
  //   const childElement = dom.querySelector(".textLayer");
  //   childElement.childNodes.forEach((element: HTMLSpanElement) => {
  //     element.innerHTML = findTextMap(
  //       element.textContent as string,
  //       props.searchValue as string
  //     );
  //   });
  // });
};

const handleToImage = () => {
  if (!props.pdfImageView) return;
  eventEmit(
    "handleSetImageUrl",
    pdfRender.value?.toDataURL("image/png") as string
  );
};
const findTextMap = (text: string, findText: string) => {
  const target = text.toLowerCase().indexOf(findText.toLowerCase());
  const searchTargetValue = target !== -1;
  const index = searchTargetValue ? target : 0;
  let value = text;
  let before = text.substr(0, index); // split into a part before the match
  let targetValue = text.substr(index, findText.length);
  let middle = text.substr(
    searchTargetValue ? index + findText.length : 0,
    text.length
  );

  if (searchTargetValue && findText) {
    value = `${before}<span  class="pdf-highlight">${targetValue}</span>${
      middle.toLowerCase().indexOf(findText.toLowerCase()) == -1
        ? middle
        : findTextMap(middle, findText)
    }`;
  } else {
    value = `${before}${middle}`;
  }
  return value;
};

const ioCallback = (entries: any) => {
  const { isIntersecting } = entries[0];
  if (isIntersecting) {
    renderPage(props.pageNum);
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
  (val) => {
    !pdfBoothShow.value &&
      val &&
      renderTextContent(
        findTextContent.value,
        viewportRef.value,
        textPage.value
      );
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
  box-sizing: border-box;
  opacity: 0.4;
  /* color: #fff; */
}
</style>

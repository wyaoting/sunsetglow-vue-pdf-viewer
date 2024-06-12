<template>
  <div :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`" class="pdf-Container-Ref pdfViewer"
    :class="{ pdfLoading: pdfLoading }" :id="`${props.scrollIntIndexShow && 'scrollIntIndex' + '-' + props.pageNum
      }`" @click="handleToImage" ref="pdfContainerRef">
    <canvas v-if="!pdfBoothShow" :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`" class="pdf-render"
      ref="pdfRender">
    </canvas>
    <div v-if="pdfLoading" class="loading-container"
      :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`">
      <img style="width: 24px; object-fit: cover" class="loading-icon-image" src="../assets/pdf/loading-icon.gif"
        alt="" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  onMounted,
  nextTick,
  watch,
  defineExpose,
} from "vue";
export type options = {
  scale: number; //控制canvas 高清度
};
const props = withDefaults(
  defineProps<{
    scrollIntIndexShow?: boolean;
    pageNum: number;
    pdfContainer: any;
    pdfJsViewer: any;
    searchValue?: string;
    canvasWidth?: number;
    imageRenderHeight?: number;
    options?: options;
  }>(),
  {
    scrollIntIndexShow: true,
  }
);
// const searchValue = inject("searchValue") as Ref;
const eventEmit = defineEmits<{
  (e: "handleSetImageUrl", url: string): void;
}>();
let findTextContent = ref();
let viewportRef = ref();
let textPage = ref();

const pdfContainerRef = ref();
const pdfRender = ref<HTMLCanvasElement>();
const pdfLoading = ref<boolean>(false);
const pdfBoothShow = ref<boolean>(true);
const ioRef = ref();
const canvasCreatedValve = ref<boolean>(false); //创建阀门
const renderPage = async (num: number) => {
  pdfBoothShow.value = false;
  pdfLoading.value = true;
  nextTick(() => {
    props.pdfContainer.getPage(num).then(async (page: any) => {
      if (!pdfRender.value || pdfBoothShow.value) return;
      const canvas: any = pdfRender.value;
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
        alpha: false,
      });
      const dpr = window.devicePixelRatio || 1;
      const bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
      const ratio = dpr / bsr;
      const viewport = page.getViewport({ scale: props.options?.scale || 2 });
      const canvasWidth = viewport.width * ratio;
      canvas.width = canvasWidth;
      canvas.height = viewport.height * ratio;

      // const width = `100%` || `${viewport.viewBox[2]}px`;
      // const height = `auto` || `${viewport.viewBox[3]}px`;
      // canvas.style.width = width;
      // canvas.style.height = height;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // 将 PDF 页面渲染到 canvas 上下文中
      const renderContext = {
        canvasContext: ctx,
        viewport,
      };
      if (pdfBoothShow.value) return;
      textPage.value = page;
      await page.render(renderContext);
      viewportRef.value = viewport;
      console.log(viewport.value, "viewport.value");
      findTextContent.value = await page.getTextContent();
      pdfLoading.value = false;
      props.searchValue &&
        renderTextContent(
          findTextContent.value,
          viewportRef.value,
          textPage.value
        );
    });
  });
};

// const
const renderTextContent = (findTextContent: any, viewport: any, page: any) => {
  console.log(findTextContent, viewport, page, "page", props.searchValue);
  if (!findTextContent || !viewport || !page || !props.searchValue) return;
  if (canvasCreatedValve.value) return;
  const { TextLayerBuilder } = props.pdfJsViewer;
  const textLayerDiv = document.createElement("div");
  textLayerDiv.setAttribute("class", "textLayer");
  var textLayer = new TextLayerBuilder({
    textLayerDiv: textLayerDiv,
    pageIndex: page._pageIndex,
    viewport: viewport,
  });

  textLayer.setTextContentSource(findTextContent);
  textLayer.render(viewport);
  console.log(textLayer, viewport, "textLayer", page._pageIndex);

  pdfContainerRef.value.appendChild(textLayer.div);
  canvasCreatedValve.value = true;
  nextTick(() => {
    const dom = pdfContainerRef.value;
    const childElement = dom.querySelector(".textLayer");
    childElement.childNodes.forEach((element: HTMLSpanElement) => {
      element.innerHTML = findTextMap(
        element.textContent as string,
        props.searchValue as string
      );
    });
  });
};

const handleToImage = () => {
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
    value = `${before}<span  class="pdf-highlight">${targetValue}</span>${middle.toLowerCase().indexOf(findText.toLowerCase()) == -1
      ? middle
      : findTextMap(middle, findText)
      }`;
  } else {
    value = `${before}${middle}`;
  }
  return value;
};

const ioCallback = (entries: any) => {
  const { isIntersecting, } = entries[0];
  if (isIntersecting) {
    renderPage(props.pageNum);
  } else {
    pdfBoothShow.value = true;
  }
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
  background-color: #ededed;
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

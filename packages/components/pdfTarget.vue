<template>
  <div
    :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`"
    class="pdf-Container-Ref pdfViewer"
    :class="{ pdfLoading: pdfLoading }"
    @click="handleToImage"
    ref="pdfContainerRef"
  >
    <canvas
      v-if="!pdfBoothShow"
      :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`"
      class="pdf-render"
      ref="pdfRender"
    >
    </canvas>
    <div
      v-if="pdfLoading"
      class="loading-container"
      :style="`height:${props.imageRenderHeight}px;width:${canvasWidth}px;`"
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
import { ref, onMounted, nextTick, inject, Ref, watch } from "vue";
const props = defineProps<{
  pageNum: number;
  pdfContainer: any;
  pdfJsViewer: any;
  canvasWidth?: number;
  imageRenderHeight?: number;
}>();
const searchValue = inject("searchValue") as Ref;
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
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
      const ratio = dpr / bsr;
      const viewport = page.getViewport({ scale: 2 });
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
      searchValue.value &&
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
  console.log(findTextContent, viewport, page, "page", searchValue.value);
  if (!findTextContent || !viewport || !page) return;
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
    console.log(childElement, "childElement");
    childElement.childNodes.forEach((element: HTMLSpanElement) => {
      element.innerHTML = findTextMap(
        element.textContent as string,
        searchValue.value
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
  ); // the matched word to preserve case
  // const beforeLength = before.length;
  // const middleLength = middle.length;
  // if (beforeLength > 250) {
  // 	before = before.trim().slice(-230)
  // }
  // if (middleLength > 250) {
  // 	middle = middle.trim().slice(0, 230) + '...'
  // }

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
  const { isIntersecting, intersectionRatio } = entries[0];
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

watch(
  () => searchValue.value,
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
  margin: 8px auto 0px;
}
.pdf-Booth {
  margin: 8px auto 0px;
  background-color: #f5f5f5;
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

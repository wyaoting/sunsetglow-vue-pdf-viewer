<template>
  <div class="nav-container">
    <div class="nav-container-image">
      <div class="image-box" v-for="(item, i) in pdfExamplePages">
        <div class="image-item" :id="`img-canvas-${i}`">
          <PdfTarget
            :pdfJsViewer="props.pdfJsViewer"
            :pageNum="i + 1"
            :canvasWidth="143"
            :imageRenderHeight="80"
            :option="{ scale: 0.5 }"
            :pdfContainer="props.pdfContainer"
          />
        </div>

        <p>{{ i + 1 }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject, nextTick, watchEffect } from "vue";
import PdfTarget from "./pdfTarget.vue";
const renderValveRef = ref<boolean>(false);
const pdfExamplePages = inject("pdfExamplePages");
const props = defineProps<{
  navigationRef: boolean;
  pdfContainer: any;
  pdfJsViewer: any;
  canvasWidth?: number;
  imageRenderHeight?: number;
}>();
const pdfContainer = inject("pdfContainer");
const imageList = ref<{ imageElement: HTMLCanvasElement; index: number }[]>([]);

const getImageView = async (num) => {
  return window.$pdfContainerCustom.getPage(num + 1).then(async (page) => {
    const canvas: any = document.createElement("canvas");
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
    const viewport = page.getViewport({ scale: 0.8 });
    const canvasWidth = viewport.width * ratio;
    canvas.width = canvasWidth;
    canvas.style.width = "100%";
    canvas.height = viewport.height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // 将 PDF 页面渲染到 canvas 上下文中
    const renderContext = {
      canvasContext: ctx,
      viewport,
    };
    await page.render(renderContext);
    document.querySelector(`#img-canvas-${num}`)?.appendChild(canvas);
    return canvas;
  });
};

const handelCreatedView = async () => {
  if (renderValveRef.value) return;
  const renderList = [];
  for (let index = 0; index < pdfExamplePages.value; index++) {
    renderList.push(getImageView(index));
  }
  const data = await Promise.all(renderList);
  renderValveRef.value = true;
};
watchEffect(() => {
  console.log("执行", props.navigationRef);
  //   props.navigationRef && handelCreatedView();
});
console.log(window.$pdfContainerCustom, pdfContainer, "pdfContainer");
</script>

<style scoped>
.nav-container {
  width: 200px;
  padding: 0px 20px 20px;
  box-sizing: border-box;
  height: calc(100vh - 40px);
  background-color: #ededed;
  overflow-y: auto;
  position: sticky;
  left: 0px;
  top: 40px;
}
.nav-container .nav-container-image {
  height: fit-content;
}
.nav-container .nav-container-image .image-box {
  text-align: center;
  margin-top: 20px;
}
.nav-container .nav-container-image .image-box .image-item {
  background-color: #333;
  display: flex;
  align-content: center;
  justify-content: center;
  height: 80px;
}
.nav-container .nav-container-image .image-box p {
  font-size: 12px;
  margin-top: 8px;
  color: #333;
  line-height: 20px;
}
</style>

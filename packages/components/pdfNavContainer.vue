<template>
  <div class="nav-container" ref="navContainerRef">
    <div class="nav-container-image">
      <div class="image-box" :id="`img-canvas-${i}`" v-for="i in pdfExamplePages" @click="handleLocate(i)">
        <div class="image-item" :class="{ 'image-item-action': i === actionIndex }">
          <PdfTarget :scrollIntIndexShow="false" ref="pdfExampleList" :pdfJsViewer="props.pdfJsViewer" :pageNum="i"
            :canvasWidth="Width" :imageRenderHeight="Height" :pdfOptions="{ scale: 0.5, containerScale: 1 }"
            :pdfContainer="props.pdfContainer" />
        </div>

        <p>{{ i }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { handlePdfLocateView, isInViewPortOfOne } from "../utils/index";
import { ref, inject, Ref, watchEffect } from "vue";
import PdfTarget from "./pdfTarget.vue";
const index = inject<Ref<number>>("index");
const pdfExamplePages = inject<Ref<number>>("pdfExamplePages") as Ref<number>;
const props = defineProps<{
  navigationRef: boolean;
  pdfContainer: any;
  pdfJsViewer: any;
  canvasWidth: number;
  imageRenderHeight: number;
}>();
const navContainerRef = ref<HTMLDivElement>()
const Width = 140;
const Height = ref(0);
const actionIndex = ref<number>(1);
const defaultIndex = ref<number>(0)
const pdfExampleList = ref();
const handleLocate = (i: number) => {
  handlePdfLocateView(i);
  actionIndex.value = i;
};
const compareDomSize = () => {
  const { canvasWidth, imageRenderHeight } = props;
  const size = canvasWidth / imageRenderHeight;
  Height.value = Width / size;
};

const comparePdfIndex = () => {
  index?.value && (actionIndex.value = index.value)
  const imageTarget = document.querySelector(`#img-canvas-${actionIndex.value}`) as HTMLDivElement
  const toolHeight = document.querySelector('.pdf-tool-container')?.clientHeight
  const imgaeContainer = document.querySelector(`.nav-container-image`) as HTMLDivElement
  const imageBox = document.querySelector('.image-box') as HTMLDivElement
  if (!navContainerRef.value || !imageTarget || !imgaeContainer || !imageBox) return
  let scollTop = imageTarget.offsetTop - navContainerRef.value.clientHeight
  const clientHeightDom = scollTop ? imageTarget.clientHeight : 0
  if (defaultIndex.value > actionIndex.value || actionIndex.value - defaultIndex.value > 2) {
    scollTop = imageTarget?.offsetTop
  } else (scollTop += clientHeightDom)
  !isInViewPortOfOne(imageTarget, navContainerRef.value, toolHeight) && (navContainerRef.value.scrollTop = scollTop || 0)
  defaultIndex.value = actionIndex.value




}
compareDomSize();
watchEffect(() => {
  index?.value && comparePdfIndex()
})
</script>

<style scoped>
.nav-container {
  width: 200px;
  padding: 10px 14px 20px;
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
  padding-top: 10px;
  /* margin-top: 20px; */
}

.nav-container .nav-container-image .image-box .image-item {
  /* background-color: #333; */
  display: flex;
  align-content: center;
  justify-content: center;
  background-color: transparent;
  opacity: 0.5;
  border-radius: 4px;
  transition: opacity 300ms;
  padding: 7px;
  cursor: pointer;
  width: fit-content;
}

.nav-container .nav-container-image .image-box .image-item:hover {
  opacity: 1;

}

.nav-container .nav-container-image .image-box .image-item-action {
  background-color: #8ab4f8;
  opacity: 1;
  box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f,
    0 5px 12px 4px #00000017;
}

.nav-container .nav-container-image .image-box p {
  font-size: 12px;
  margin-top: 4px;
  color: #333;
  line-height: 20px;
}
</style>

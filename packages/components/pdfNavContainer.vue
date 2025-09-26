<template>
  <div class="nav-container" ref="navContainerRef">
    <div class="nav-container-image">
      <div
        class="image-box"
        :id="`img-canvas-${i}`"
        v-for="i in pdfExamplePages"
        @click.stop="handleLocate(i)"
      >
        <div
          class="image-item"
          :class="{ 'image-item-action': i === actionIndex }"
        >
          <PdfTarget
            :key="`${i}-page-nav`"
            style="border-radius: 4px; overflow: hidden"
            :scrollIntIndexShow="false"
            ref="pdfExampleList"
            :pdfPageWidthMax="Width"
            :pdfJsViewer="props.pdfJsViewer"
            :pageNum="i"
            :pdfOptions="{ scale: 0.3, containerScale: 1 }"
            :pdfContainer="props.pdfContainer"
          />
        </div>

        <p>{{ i }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { handlePdfLocateView, isInViewPortOfOne } from "../utils/index";
import { ref, inject, Ref, watchEffect } from "vue";
import { usePdfConfigState } from "../config";
import PdfTarget from "./pdfTarget.vue";
const index = inject<Ref<number>>("index");
const pdfExamplePages = inject<Ref<number>>("pdfExamplePages") as Ref<number>;
const { configOption } = usePdfConfigState();
const props = defineProps<{
  navigationRef: boolean;
  pdfContainer: any;
  pdfJsViewer: any;
}>();
const navContainerRef = ref<HTMLDivElement>();
const Width = 120;
const actionIndex = ref<number>(1);
const defaultIndex = ref<number>(0);
const pdfExampleList = ref();
const positioningVisible = ref(false);
const handleLocate = (i: number) => {
  handlePdfLocateView(
    i,
    `#scrollIntIndex-${configOption.value.appIndex}`,
    configOption.value.appIndex as number
  );
  positioningVisible.value = true;
  actionIndex.value = i;
};

const comparePdfIndex = () => {
  if (positioningVisible.value) return (positioningVisible.value = false);
  index?.value && (actionIndex.value = index.value);
  const imageTarget = document.querySelector(
    `#img-canvas-${actionIndex.value}`
  ) as HTMLDivElement;
  const imageContainer = document.querySelector(
    `.nav-container-image`
  ) as HTMLDivElement;
  const imageBox = document.querySelector(".image-box") as HTMLDivElement;
  if (!navContainerRef.value || !imageTarget || !imageContainer || !imageBox)
    return;
  let scrollTop = imageTarget.offsetTop - navContainerRef.value.clientHeight;
  const clientHeightDom = scrollTop ? imageTarget.clientHeight : 0;
  if (
    defaultIndex.value > actionIndex.value ||
    actionIndex.value - defaultIndex.value > 2
  ) {
    scrollTop = imageTarget?.offsetTop;
  } else scrollTop += clientHeightDom;
  !isInViewPortOfOne(imageTarget, navContainerRef.value) &&
    (navContainerRef.value.scrollTop = scrollTop || 0);
  defaultIndex.value = actionIndex.value;
};
watchEffect(() => {
  index?.value && comparePdfIndex();
});
</script>

<style scoped>
.nav-container {
  width: 200px;
  height: 100%;
  padding: 10px 14px 20px;
  box-sizing: border-box;
  background-color: #fff;
  overflow-y: auto;
  position: sticky;
  left: 0px;
  top: 40px;
}

.nav-container .nav-container-image {
  height: fit-content;
}

.nav-container .nav-container-image .image-box {
  display: grid;
  justify-content: center;
  padding-top: 10px;
  /* margin-top: 20px; */
}

.nav-container .nav-container-image .image-box .image-item {
  /* background-color: #333; */
  display: flex;
  align-content: center;
  justify-content: center;
  opacity: 0.9;
  border-radius: 6px;
  transition: box-shadow 300ms;
  padding: 7px 10px;
  border: 1px solid #e9e9e9;
  cursor: pointer;
  width: fit-content;
}

.nav-container .nav-container-image .image-box .image-item:hover {
  opacity: 1;
  box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f,
    0 5px 12px 4px #00000017;
}

.nav-container .nav-container-image .image-box .image-item-action {
  background-color: #0071e352;
  opacity: 1;
  border: 1px solid #91caff;

  box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f,
    0 5px 12px 4px #00000017;
}

.nav-container .nav-container-image .image-box p {
  font-size: 12px;
  margin-top: 4px;
  line-height: 20px;
  text-align: center;
}
</style>

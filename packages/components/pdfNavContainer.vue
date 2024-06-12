<template>
  <div class="nav-container">
    <div class="nav-container-image">
      <div class="image-box" v-for="(i) in pdfExamplePages">
        <div class="image-item" :id="`img-canvas-${i}`" :class="{ 'image-item-action': i === actionIndex }"
          @click="handleLocate(i)">
          <PdfTarget :scrollIntIndexShow="false" ref="pdfExampleList" :pdfJsViewer="props.pdfJsViewer" :pageNum="i + 1"
            :canvasWidth="134" :imageRenderHeight="80" :options="{ scale: 0.5 }" :pdfContainer="props.pdfContainer" />
        </div>

        <p>{{ i + 1 }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject, Ref } from "vue";
import PdfTarget from "./pdfTarget.vue";
const pdfExamplePages = inject<Ref<number>>("pdfExamplePages") as Ref<number>;
const props = defineProps<{
  navigationRef: boolean;
  pdfContainer: any;
  pdfJsViewer: any;
  canvasWidth?: number;
  imageRenderHeight?: number;
}>();
const actionIndex = ref<number>(0);
const pdfExampleList = ref();
const handleLocate = (i: number) => {
  const pdfContainer = document.querySelector(`#scrollIntIndex-${i + 1}`);
  pdfContainer && pdfContainer?.scrollIntoView();
  actionIndex.value = i;
};
</script>

<style scoped>
.nav-container {
  width: 200px;
  padding: 0px 14px 20px;
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
  /* background-color: #333; */
  display: flex;
  align-content: center;
  justify-content: center;
  height: 80px;
  background-color: transparent;
  transition: all 200ms;
  padding: 10px 0px;
  border-radius: 4px;
}

.nav-container .nav-container-image .image-box .image-item:hover {
  background-color: #525659e8;
  box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f,
    0 5px 12px 4px #00000017;
}

.nav-container .nav-container-image .image-box .image-item-action {
  background-color: #525659e8;
  box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f,
    0 5px 12px 4px #00000017;
}

.nav-container .nav-container-image .image-box p {
  font-size: 12px;
  margin-top: 8px;
  color: #333;
  line-height: 20px;
}
</style>

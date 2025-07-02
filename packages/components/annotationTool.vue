<template>
  <div class="annotation-tool-container" ref="toolRef">
    <div class="move">
      <img class="annotation-move-image" src="../assets/move.svg" />
    </div>
    <div class="dividing"></div>
    <button
      id="freeBtn"
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === free,
      }"
      @click.stop="setTool(free)"
    >
      自由绘制
    </button>
    <button
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === rect,
      }"
      id="rectBtn"
      @click.stop="setTool(rect)"
    >
      矩形
    </button>
    <button
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === circle,
      }"
      id="circleBtn"
      @click.stop="setTool(circle)"
    >
      圆形
    </button>
    <button
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === triangle,
      }"
      id="triangleBtn"
      @click.stop="setTool(triangle)"
    >
      三角形
    </button>
    <button
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === arrow,
      }"
      id="arrowBtn"
      @click.stop="setTool(arrow)"
    >
      箭头
    </button>
    <button
      :class="{
        'action-btn': globalStore.annotationOption.currentTool === text,
      }"
      id="textBtn"
      @click.stop="setTool(text)"
    >
      文本
    </button>
    <div class="dividing"></div>
    <button id="clearBtn">清除</button>
    <button id="undoBtn">撤销</button>
    <button id="saveBtn">保存</button>
    <button id="loadBtn">加载</button>
    <AnnotationColor v-if="globalStore.annotationOption.currentTool" />
  </div>
</template>
<script lang="ts" setup>
import { constDrawToolType } from "../utils/annotation";
import AnnotationColor from "./annotationColor.vue";
import { usePdfConfigState } from "../config";
import { useToolMove } from "../hooks/useMoveTemplate";
import { onMounted, ref } from "vue";
const { globalStore } = usePdfConfigState();
const toolRef = ref<HTMLElement>();
const { initElement } = useToolMove({
  elName: ".annotation-tool-container",
  matchClass: "annotation-move-image",
});
const { free, rect, circle, triangle, arrow, text } = constDrawToolType;
const setTool = (key: string) => {
  globalStore.value.annotationOption.currentTool = key;
};
onMounted(() => {
  initElement();
});
</script>
<style scoped>
.annotation-tool-container {
  width: fit-content;
  position: fixed;
  right: 18px;
  top: 40px;
  z-index: 111;
  /* background-color: #f8f8f8; */
  background-color: #ffffff;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  border: 1px solid #f5f5f5;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}
.annotation-tool-container .dividing {
  width: 2px;
  min-height: 20px;
  border-radius: 1px;
  background-color: #dfdfdf;
}
.annotation-tool-container .move {
  display: flex;
  align-items: center;
  cursor: move;
}
.annotation-tool-container button {
  background-color: #f5f5f5;
  white-space: nowrap;
  border-radius: 6px;
  border: 0px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 100ms;
}
.annotation-tool-container .action-btn {
  background-color: #171717;
  color: #fff;
}
.annotation-tool-container button:hover {
  background-color: #171717;
  color: #fff;
}
.annotation-tool-container .move .annotation-move-image {
  width: 24px;
}
</style>

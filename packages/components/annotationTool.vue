<template>
  <div class="annotation-tool-container">
    <div class="move">
      <svg
        t="1749110035243"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5347"
        width="24"
        height="24"
      >
        <path
          d="M404.032 792a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168z m280 0a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168zM403.904 549.312a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168z m280 0a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168zM404.096 306.688a83.968 83.968 0 1 1 0 168 83.968 83.968 0 0 1 0-168z m280 0a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168zM403.904 64a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168z m280 0a84.032 84.032 0 1 1 0 168 84.032 84.032 0 0 1 0-168z"
          fill="#707070"
          p-id="5348"
        ></path>
      </svg>
    </div>
    <div class="dividing"></div>
    <button id="freeBtn">自由绘制</button>
    <button id="rectBtn">矩形</button>
    <button id="circleBtn">圆形</button>
    <button id="triangleBtn">三角形</button>
    <button id="arrowBtn">箭头</button>
    <button id="textBtn">文本</button>
    <div class="dividing"></div>
    <button id="clearBtn">清除</button>
    <button id="undoBtn">撤销</button>
    <button id="saveBtn">保存</button>
    <button id="loadBtn">加载</button>
  </div>
</template>
<script lang="ts" setup>
import { useToolMove } from "../hooks/useMoveTemplate";
// import { canvasPainting } from "../utils/annotation";
import { onMounted, onUnmounted } from "vue";
// 工具按钮
const { initElement, removeElement } = useToolMove({
  elName: ".annotation-tool-container",
});

onMounted(() => {
  initElement();
});
onUnmounted(() => {
  removeElement();
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
  border-radius: 4px;
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
</style>

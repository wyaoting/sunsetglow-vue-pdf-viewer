<template>
  <div
    class="image-container"
    :class="{ visible: props.visible }"
    @wheel.stop="onWheel"
    @click.stop="onClose(false)"
  >
    <div class="image-preview-container">
      <div class="image-preview-operations">
        <div class="operation-item" @click.stop="onRotate('-')">
          <svg
            focusable="false"
            data-icon="rotate-left"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            viewBox="64 64 896 896"
          >
            <path
              d="M672 418H144c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H188V494h440v326z"
            ></path>
            <path
              d="M819.3 328.5c-78.8-100.7-196-153.6-314.6-154.2l-.2-64c0-6.5-7.6-10.1-12.6-6.1l-128 101c-4 3.1-3.9 9.1 0 12.3L492 318.6c5.1 4 12.7.4 12.6-6.1v-63.9c12.9.1 25.9.9 38.8 2.5 42.1 5.2 82.1 18.2 119 38.7 38.1 21.2 71.2 49.7 98.4 84.3 27.1 34.7 46.7 73.7 58.1 115.8a325.95 325.95 0 016.5 140.9h74.9c14.8-103.6-11.3-213-81-302.3z"
            ></path>
          </svg>
        </div>
        <div class="operation-item" @click.stop="onRotate('+')">
          <svg
            focusable="false"
            data-icon="rotate-right"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            viewBox="64 64 896 896"
          >
            <path
              d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2A399.75 399.75 0 00123.5 631h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z"
            ></path>
            <path
              d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z"
            ></path>
          </svg>
        </div>

        <div
          class="operation-item"
          :style="{
            color: scale3dValue > 0.5 ? 'rgb(255, 255, 255)' : '#adabab',
          }"
          @click.stop="
            scale3dValue > 0.5 && (scale3dValue = scale3dValue - 0.5)
          "
        >
          <MinusSquareOutlined />
        </div>
        <div
          class="operation-item"
          @click.stop="scale3dValue = scale3dValue + 0.5"
        >
          <PlusSquareOutlined />
        </div>
        <div
          class="operation-item"
          style="margin-right: 20px"
          @click.stop="onClose(false)"
        >
          <CloseOutlined />
        </div>
      </div>
      <div
        @click.stop="(e) => e.preventDefault()"
        @touchstart.stop="onTouchstart"
        @touchend.stop="onTouchend"
        @mousedown.stop="onMousedown"
        @mousemove.stop="onMousemove"
        @touchmove.stop="onTouchmove"
        @mouseup.stop="onTouchend"
        class="view-image"
        :style="{
          transform: `translate3d(${dx}px, ${dy}px, 0px)`,
        }"
      >
        <img
          :style="{
            transform: `scale3d(${scale3dValue},${scale3dValue},${scale3dValue}) rotate(${rotate}deg) `,
          }"
          draggable="false"
          :src="props.src"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  CloseOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons-vue";
import { ref } from "vue";
const props = defineProps<{
  visible: boolean;
  src: string;
}>();
const emit = defineEmits<{
  (event: "update:visible", data: boolean): void;
}>();
let rotateValue = 90;
let isDragging = false;
let scale3dValue = ref(1);
let rotate = ref(0);
let startX = 0;
let startY = 0;
let dy = ref<number>(0);
let dx = ref<number>(0);
let beforeX = ref<number>(0);
let beforeY = ref<number>(0);
const onClose = (visible: boolean) => {
  dy.value = 0;
  dx.value = 0;
  rotate.value = 0;
  scale3dValue.value = 1;
  isDragging = false;
  beforeX.value = 0;
  beforeY.value = 0;
  emit("update:visible", visible);
};
const onMousedown = (event: any) => {
  event.preventDefault(); // 阻止默认触摸行为
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
};
const onRotate = (type: "+" | "-") => {
  if (type === "+") {
    rotate.value += rotateValue;
  } else {
    rotate.value -= rotateValue;
  }
};
const onTouchstart = (e: any) => {
  e.preventDefault(); // 阻止默认触摸行为
  const { clientX, clientY } = e.touches[0];
  startX = clientX;
  startY = clientY;
  isDragging = true;
};
const templateMove = (x: number, y: number) => {
  dx.value = beforeX.value + (x - startX);
  dy.value = beforeY.value + (y - startY);
};
const onTouchmove = (e: any) => {
  e.preventDefault(); // 阻止默认触摸行为
  if (isDragging) {
    const { clientX, clientY } = e.touches[0];
    templateMove(clientX, clientY);
  }
};
const onMousemove = (event: any) => {
  event.preventDefault();
  if (isDragging) {
    templateMove(event.clientX, event.clientY);
  }
};

const onTouchend = (e: Event) => {
  e.preventDefault();
  if (isDragging) {
    beforeX.value = dx.value;
    beforeY.value = dy.value;
    isDragging = false;
  }
};
const onWheel = (event: any) => {
  event.preventDefault();
  // 获取滚动方向
  const deltaY = event.deltaY; // 垂直滚动量
  // 判断滚动方向
  if (deltaY > 0) {
    scale3dValue.value > 0.5 && (scale3dValue.value = scale3dValue.value - 0.5);
  } else if (deltaY < 0) {
    scale3dValue.value = scale3dValue.value + 0.5;
  }
};
</script>
<style scoped>
.image-container {
  background-color: rgba(0, 0, 0, 0.45);
  position: fixed;
  top: 0px;
  left: 0px;
  overflow: hidden;
  z-index: 2000;
  width: 100vw;
  height: 100vh;
  display: none;
}
.image-container .image-preview-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.image-container .view-image {
  transition: all 50ms;
  cursor: grab;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation; /* 优化触摸响应 */
}
.image-container .view-image img {
  max-width: 100%;
  max-height: 100%;
  transition: all 500ms;
}
.image-container .image-preview-operations {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2100;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  height: 40px;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.1);
}
.image-container .image-preview-operations .operation-item {
  -webkit-touch-callout: none; /* 禁用长按菜单 */
  -webkit-user-select: none; /* 禁用文本选择 */
  user-select: none;
  touch-action: manipulation; /* 优化触摸响应 */
  color: rgb(255, 255, 255);
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  padding: 0px 16px;
  transition: all 200ms;
}
.image-container .image-preview-operations .operation-item:hover {
  background-color: #12101051;
}
.visible {
  display: block;
}
.visible .image-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

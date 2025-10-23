<template>
  <div
    class="rotate-container"
    @click="handleRotate('left')"
    v-if="configOption.isRotateType?.includes('left')"
  >
    <RotateLeftOutlined />
  </div>
  <div
    class="rotate-container"
    @click="handleRotate('right')"
    v-if="configOption.isRotateType?.includes('right')"
  >
    <RotateRightOutlined />
  </div>
</template>
<script lang="ts" setup>
import { usePdfConfigState } from "../config";
import { RotateRightOutlined, RotateLeftOutlined } from "@ant-design/icons-vue";
const { configOption } = usePdfConfigState();
const handleRotate = (type: "right" | "left") => {
  let currentRotate = configOption.value.currentRotate || 0;
  if (type === "left") {
    currentRotate -= 90;
  } else if (type === "right") {
    currentRotate += 90;
  }
  configOption.value.currentRotate = currentRotate == 360 ? 0 : currentRotate;
};
</script>

<style scoped>
.rotate-container {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border-radius: 4px;
  transition: all 300ms;
  cursor: pointer;
  margin-right: 4px;
}
.rotate-container:hover {
  background-color: #0000000f;
}
</style>

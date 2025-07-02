<template>
  <div class="annotation-color-container">
    <div
      class="color-size-container"
      v-if="globalStore.annotationOption.currentTool !== constDrawToolType.text"
    >
      <div
        :style="{
          background: getFontColor?.color,
          ...(getFontColor?.border && {
            border: `1px solid ${getFontColor?.border}`,
          }),
        }"
        class="color-min color-item"
      ></div>
      <Slider
        :tooltipOpen="false"
        style="width: 80px"
        v-model:value="globalStore.annotationOption.lineWidth"
        :max="12"
        :min="1"
      />
      <!-- <input type="range" class="custom-range" min="4" max="20" value="2" /> -->
      <div
        :style="{
          background: getFontColor?.color,
          ...(getFontColor?.border && {
            border: `1px solid ${getFontColor?.border}`,
          }),
        }"
        class="color-max color-item"
      ></div>
    </div>
    <a-select
      v-else
      v-model:value="globalStore.annotationOption.fontSize"
      size="small"
      style="width: 70px"
      :options="
        textSizeList.map((v) => ({
          value: v,
          label: `${v}px`,
        }))
      "
    ></a-select>
    <div class="dividing"></div>
    <div
      class="color-select-item"
      @click.stop="globalStore.annotationOption.fontColor = item.color"
      :style="{
        background: item.color,
        ...(item?.border && { border: `1px solid ${item?.border}` }),
        ...(item?.fontColor && { color: item.fontColor }),
      }"
      v-for="item in colorList"
    >
      <CheckOutlined
        v-if="globalStore.annotationOption.fontColor === item.color"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Select as ASelect } from "ant-design-vue";
import { constDrawToolType } from "../utils/annotation";
import { usePdfConfigState } from "../config";
import { computed } from "vue";
import { CheckOutlined } from "@ant-design/icons-vue";
import { Slider } from "ant-design-vue";
import { colorList, textSizeList } from "../define";
const { globalStore } = usePdfConfigState();
const getFontColor = computed(() =>
  colorList.find(
    (v) => v.color === globalStore.value.annotationOption.fontColor
  )
);
</script>
<style scoped>
.annotation-color-container {
  width: fit-content;
  position: absolute;
  right: 0px;
  top: 48px;
  z-index: 111;
  /* background-color: #f8f8f8; */
  background-color: #ffffff;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 0px 10px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid #f5f5f5;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}
.annotation-color-container .color-select-item {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}
.annotation-tool-container .dividing {
  width: 2px;
  min-height: 20px;
  border-radius: 1px;
  background-color: #dfdfdf;
}
.annotation-color-container .color-size-container {
  display: flex;
  gap: 10px;
  align-items: center;
}
.annotation-color-container .color-size-container .color-item {
  border-radius: 50%;
  box-sizing: border-box;
}
.annotation-color-container .color-size-container .color-min {
  width: 8px;
  height: 8px;
}
.annotation-color-container .color-size-container .color-max {
  width: 18px;
  height: 18px;
}
.annotation-color-container
  .color-size-container
  :where(.css-dev-only-do-not-override-1p3hq3p).ant-slider {
  margin: 0px;
}
</style>

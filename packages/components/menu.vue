<template>
  <div class="menu-container" :style="{ '--menu-color': selectedColor }">
    <button
      v-for="{ color, border, fontColor } in colorList"
      :key="color"
      class="color-option"
      :class="{ 'color-option-active': selectedColor === color }"
      :style="{
        backgroundColor: color,

        ...(border && { borderColor: border }),
        ...(fontColor && { color: fontColor }),
      }"
      @click="selectColor(color)"
    >
      <CheckOutlined v-if="selectedColor === color" />
    </button>
    <div class="dividing"></div>
    <button class="delete-button" @click="confirmDelete">
      <DeleteOutlined />
    </button>
  </div>
</template>

<script setup lang="ts">
import { colorList } from "../define";
import { DeleteOutlined, CheckOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";

interface Props {
  initialColor?: string;
}

interface Emits {
  (e: "color-change", color: string): void;
  (e: "delete"): void;
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialColor: colorList[0].color,
});
const emit = defineEmits<Emits>();
const selectedColor = ref<string>(props.initialColor);
const selectColor = (color: string): void => {
  selectedColor.value = color;
  emit("color-change", color);
};

const confirmDelete = (): void => {
  emit("delete");
};
</script>

<style scoped>
.dividing {
  width: 2px;
  min-height: 20px;
  border-radius: 1px;
  background-color: #dfdfdf;
}
/* 样式保持不变，同之前版本 */
.menu-container {
  display: flex;
  align-items: center;
  gap: 10px;
  --menu-color: #3b82f6;
  /* width: 240px; */
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #f5f5f5;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  padding: 6px 10px;
}

.color-option {
  flex-shrink: 1;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option-active {
  border-color: var(--menu-color);
}

.delete-button {
  width: 26px;
  height: 26px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #fecaca;
}
</style>

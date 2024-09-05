<template>
  <div class="scale-container">
    <!-- <div
      :class="{ 'pdf-disabled': scale > 1.2 }"
      class="pdf-icon"
      @click="() => scale < 1.3 && handleScale(containerScale + 0.1)"
    >
      <PlusSquareOutlined />
    </div> -->
    <a class="pdf-icon" @click="() => handleScale(containerScale + 0.1)">
      <PlusSquareOutlined />
    </a>
    <div style="padding: 0px 8px">{{ (containerScale * 100).toFixed(0) }}%</div>
    <a
      :class="{ 'pdf-disabled': scale < 0.8 }"
      class="pdf-icon"
      @click="() => scale > 0.7 && handleScale(containerScale - 0.1)"
    >
      <MinusSquareOutlined />
    </a>
  </div>
</template>
<script lang="ts" setup>
import { inject, Ref, computed } from "vue";
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons-vue";
const containerScale = inject<Ref<number>>("containerScale") as Ref<number>;
const handleScale = (scale: number) => {
  containerScale.value = scale;
};
const scale = computed(() => +containerScale.value.toFixed(1));
</script>

<style scoped>
.scale-container {
  display: flex;
  align-items: center;
}

.scale-container .pdf-icon {
  color: #333;
  cursor: pointer;
  font-size: 18px;
  transition: all 200ms;
  padding: 2px 10px;
  border-radius: 6px;
  background-color: transparent;
}

.scale-container .pdf-icon:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.scale-container .pdf-disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>

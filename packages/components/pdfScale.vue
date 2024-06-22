<template>
  <div class="scale-container">
    <div :class="{ 'pdf-disabled': scale > 1.2 }" class="pdf-icon"
      @click="() => (scale < 1.3) && handleScale(containerScale + 0.1)">
      <PlusSquareOutlined />
    </div>
    <div style="margin: 0px 10px">{{ (containerScale * 100).toFixed(0) }}%</div>
    <div :class="{ 'pdf-disabled': scale < 0.8 }" class="pdf-icon"
      @click="() => (scale > 0.7) && handleScale(containerScale - 0.1)">
      <MinusSquareOutlined />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { inject, Ref, computed } from 'vue'
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons-vue";
const containerScale = inject<Ref<number>>('containerScale') as Ref<number>
const handleScale = (scale: number) => {
  containerScale.value = scale
}
const scale = computed(() => +containerScale.value.toFixed(1))
</script>

<style scoped>
.scale-container {
  display: flex;
  align-items: center;
}

.scale-container .pdf-icon {
  cursor: pointer;
  font-size: 18px;
  transition: all 200ms;
  color: #282727;
}

.scale-container .pdf-icon:hover {
  color: #1677ff;
}

.scale-container .pdf-disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>

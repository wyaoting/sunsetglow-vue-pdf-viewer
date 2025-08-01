<template>
  <span
    id="annotation-container"
    :class="{ 'is-annotation': globalStore.isAnnotation }"
    @click="globalStore.isAnnotation = !globalStore.isAnnotation"
  >
    <FormOutlined />
  </span>
  <AnnotationsTool v-show="globalStore.isAnnotation" />
</template>
<script lang="ts" setup>
import AnnotationsTool from "./annotationTool.vue";
import { usePdfConfigState } from "../config";
import { FormOutlined } from "@ant-design/icons-vue";
const { globalStore } = usePdfConfigState();
</script>
<style scoped>
#annotation-container {
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border-radius: 4px;
  transition: all 300ms;
  margin: 0px 4px;
}
#annotation-container:hover {
  background-color: #0000000f;
}
.is-annotation {
  background-color: #0000000f;
}
</style>

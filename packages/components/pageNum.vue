<template>
  <div class="tool-page">
    <a-pagination
      :defaultPageSize="1"
      v-model:current="current"
      simple
      :total="pageNum"
    />
  </div>
</template>
<script lang="ts" setup>
import { handlePdfLocateView } from "../utils/index";
import { Pagination as APagination } from "ant-design-vue";
import { inject, ref, watch } from "vue";
const current = ref<number>(1);
const pageNum = inject<number>("pdfExamplePages");
watch(
  () => current.value,
  (index) => {
    handlePdfLocateView(index);
  }
);
</script>

<style scoped>
.tool-page {
}
</style>

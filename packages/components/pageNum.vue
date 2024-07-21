<template>
  <div class="tool-page">
    <a-pagination
      @change="onChange"
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
import { inject, ref, watchEffect, Ref } from "vue";
const current = ref<number>(1);
const pageNum = inject<number>("pdfExamplePages");
const index = inject<Ref<number>>("index");
const onChange = (index: number) => handlePdfLocateView(index);
watchEffect(() => {
  if (index?.value) current.value = index.value;
});
</script>

<style scoped>
.tool-page {
}
</style>

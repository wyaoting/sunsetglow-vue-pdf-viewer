<template>
  <div class="tool-page">
    <a-pagination
      ref="paginationRef"
      @change="onChange"
      :defaultPageSize="1"
      v-model:current="current"
      simple
      :total="pageNum"
    />
  </div>
</template>
<script lang="ts" setup>
import { usePdfConfigState } from "../config";
import { handlePdfLocateView } from "../utils/index";
import { Pagination as APagination } from "ant-design-vue";
import { inject, ref, watchEffect, Ref, onMounted, onUnmounted } from "vue";
const { configOption } = usePdfConfigState();
const current = ref<number>(1);
const pageNum = inject<Ref<number>>("pdfExamplePages");
const index = inject<Ref<number>>("index");
const paginationRef = ref();
const onChange = (index: number) =>
  handlePdfLocateView(
    index,
    `#scrollIntIndex-${configOption.value.appIndex}`,
    configOption.value.appIndex as number
  );

const onBlur = (event: InputEvent) => {
  // @ts-ignore
  if (event?.target?.value !== undefined) {
    current.value = Math.min(
      // @ts-ignore
      Math.max(event?.target?.value, 1),
      pageNum?.value as number
    );
    // @ts-ignore
    event.target.value = current.value;
    onChange(current.value);
  }
};
onMounted(() => {
  const input = paginationRef?.value?.$el?.querySelector("input");
  input && input?.addEventListener("blur", onBlur);
});
onUnmounted(() => {
  const input = paginationRef?.value?.$el?.querySelector("input");
  input && input?.removeEventListener("blur", onBlur);
});
watchEffect(() => {
  if (index?.value) current.value = index.value;
});
</script>

<style scoped>
.tool-page {
}
</style>

<template>
  <div class="tool-page">
    <span class="current-page"> 当前页数：1 </span>
    <span> 总页数 ： {{ pageNum }} </span>
  </div>
</template>
<script lang="ts" setup>
import { inject } from "vue";
const pageNum = inject("pdfExamplePages");
</script>

<style scoped>
.tool-page {
  padding: 6px 20px;
  display: flex;
  align-items: center;
  /* border-radius: 8px; */
  background: #fff;
  font-size: 12px;
  color: #333;
}
.tool-page .current-page {
  margin-right: 20px;
}
</style>

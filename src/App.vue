<template>
  <div class="test-pdf">
    <pdfViewContainer />
  </div>
</template>
<script lang="ts" setup>
// import pdfViewContainer from "../packages/components/pdf.vue";
import pdfViewContainer from "../packages/index";
console.log(pdfViewContainer, 'pdfViewContainer')
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

<template>
  <div class="download-container">
    <DownloadOutlined @click="handleDownload" />
  </div>
</template>
<script lang="ts" setup>
import { inject } from "vue";
import { fetchFileResultDownload } from "../utils/index";
import { DownloadOutlined } from "@ant-design/icons-vue";
const pdfFileUrl = inject("pdfFileUrl");
const handleDownload = () => {
  pdfFileUrl && fetchFileResultDownload(pdfFileUrl as string);
};
</script>

<style scoped>
.download-container {
  font-size: 20px;
  margin-right: 10px;
}
</style>

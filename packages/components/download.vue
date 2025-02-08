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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border-radius: 4px;
  transition: all 300ms;
  margin: 0px 4px;
}
.download-container:hover {
  background-color: #0000000f;
}
</style>

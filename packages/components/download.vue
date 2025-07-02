<template>
  <div class="download-container">
    <DownloadOutlined @click="handleDownload" />
  </div>
</template>
<script lang="ts" setup>
import { usePdfConfigState } from "../config";

import { fetchFileResultDownload } from "../utils/index";
import { DownloadOutlined } from "@ant-design/icons-vue";
const { configOption, file } = usePdfConfigState();

function ensurePdfExtension(filename: string) {
  return !filename.endsWith(".pdf") ? filename + ".pdf" : filename;
}
const handleDownload = () => {
  const fileName = ensurePdfExtension(
    configOption?.value?.fileName || "preview.pdf"
  );
  if (file.value?.url) {
    fetchFileResultDownload(file.value.url, fileName);
  } else if (file.value?.data) {
    // 处理 ArrayBuffer 或 Uint8Array 数据
    const blob = new Blob([file.value.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
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

<template>
  <div class="scale-container">
    <div class="pdf-icon">
      <PlusSquareOutlined />
    </div>
    <div style="margin: 0px 10px">100 %</div>
    <div class="pdf-icon">
      <MinusSquareOutlined />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons-vue";
</script>

<style scoped>
.scale-container {
  display: flex;
  align-items: center;
}
.scale-container .pdf-icon {
  font-size: 18px;
  color: #282727;
}
</style>

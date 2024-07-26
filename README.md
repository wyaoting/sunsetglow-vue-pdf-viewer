# @sunsetglow/vue-pdf-viewer

用来预览 pdf 文件，开箱即用，无需多余的开发，操作简单，支持 vue2，vue3，

## installation

```
pnpm i @sunsetglow/vue-pdf-viewer

yarn add @sunsetglow/vue-pdf-viewer

npm i @sunsetglow/vue-pdf-viewer
```

## example

```vue
<template>
  <div id="pdf-container" style="height: 100vh"></div>
</template>
<script lang="ts" setup>
import { initPdfView } from "@sunsetglow/vue-pdf-viewer";
import "@sunsetglow/vue-pdf-viewer/dist/style.css";
import { onMounted } from "vue";
const pdfPath = new URL("/src/assets/pdf.worker.min.mjs", import.meta.url).href;
onMounted(() => {
  initPdfView(document.querySelector("#pdf-container") as HTMLElement, {
    loadFileUrl: `https:xxx.pdf`, //文件路径
    pdfPath: pdfPath, // pdf.js 里需要指定的文件路径
    pdfOption: {
      scale: true, //缩放
      pdfImageView: true, //pdf 是否可以单片点击预览
      page: true, //分页查看
      navShow: true, //左侧导航
      navigationShow: false, // 左侧导航是否开启
      pdfViewResize: true, // 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
      toolShow: true, // 是否开启顶部导航
      download: true, //下载
      clearScale: 1.5, // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
      fileName: "preview.pdf", // pdf 下载文件名称
    },
  });
});
</script>

<style scoped>
#pdf-container {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>
```

## 参数说明

|    参数名称 | 内容 说明                                           |
| ----------: | --------------------------------------------------- |
| loadFileUrl | 文件地址（必选）                                    |
|     pdfPath | pdf.js 里所需的 pdf.worker.min.mjs 指向地址（必选） |
|   pdfOption | pdf 的配置选项 （可选）                             |

## 感谢

- 此库基于 [pdf.js](https://github.com/mozilla/pdf.js) 进行二次封装感谢大佬的开源贡献精神

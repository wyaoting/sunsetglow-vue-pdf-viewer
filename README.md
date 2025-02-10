# @sunsetglow/vue-pdf-viewer

用来预览 pdf 文件，开箱即用，无需多余的开发，操作简单，支持 vue3 vite，

## installation

```
pnpm i @sunsetglow/vue-pdf-viewer

yarn add @sunsetglow/vue-pdf-viewer

npm i @sunsetglow/vue-pdf-viewer
```

## example

```vue
<template>
  <div id="pdf-container"></div>
</template>
<script lang="ts" setup>
import {
  initPdfView,
  configPdfApiOptions,
  configOption,
} from "@sunsetglow/vue-pdf-viewer";
import "@sunsetglow/vue-pdf-viewer/dist/style.css";
import { onMounted } from "vue";
const loading = ref(false);
const pdfPath = new URL(
  "@sunsetglow/vue-pdf-viewer/dist/libs/pdf.worker.min.js",
  import.meta.url
).href;
onMounted(() => {
  loading.value = true;
  initPdfView(document.querySelector("#pdf-container") as HTMLElement, {
    loadFileUrl: `https:xxx.pdf`, //文件路径
    pdfPath: pdfPath, // pdf.js 里需要指定的文件路径
    loading: (load: boolean) => {
      loading.value = load;
      //加载完成会返回 false
      //四秒之后跳转到指定页
      setTimeout(() => {
        configPdfApiOptions.handleChange(2);
      }, 4000);
    },
    pdfOption: {
      search: true, // 搜索 开启搜索必须开启textLayer 为true
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
      lang: "en", //字典语言
      print: true, //打印功能
      customPdfOption: {
        // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
        cMapPacked: true, //指定 CMap 是否是二进制打包的
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
      },
      textLayer: true, //文本是否可复制 ， 文本复制和点击查看大图冲突建议把 pdfImageView 改为false
      pageOption: {
        current: 1, //当前页码
      },
      // 不传默认是 0.5
      visibleWindowPageRatio: 0.5, //当前pdf页面在可视窗口多少比例触发分页 传入0.5 就是 （pdf下一页滚动到容器高度一半的时候 更新当前页码）
    },
  });
});
// 监听内容页码变化
watch(
  () => configOption.value?.pageOption?.current,
  (current) => {
    console.log(current, "当前页码");
  }
);
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
|     loading | pdf 加载完成执行函数 （可选）                       |

## api 事件说明

- 对外开放 api 通一在 configPdfApiOptions 对象上

```ts
import { configPdfApiOptions } from "@sunsetglow/vue-pdf-viewer";
/**
 * 控制pdf 跳到指定页码
 * @param index
 * 类型 number
 */
configPdfApiOptions.handleChange(1);
```

## 欢迎大家的使用

- 如果帮助到你，帮忙点个 star ，有任何改进可直接提 issue 或者私信邮箱 wyaoting999@163.com

- github 仓库地址 [sunsetglow-vue-pdf-viewer](https://github.com/wyaoting/sunsetglow-vue-pdf-viewer)

## 致谢

- 此库基于 [pdf.js](https://github.com/mozilla/pdf.js) 进行二次封装感谢大佬的开源贡献精神

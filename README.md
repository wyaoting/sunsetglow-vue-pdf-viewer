# @sunsetglow/vue-pdf-viewer

用来预览 pdf 文件，开箱即用，无需多余的开发，操作简单，支持 vue3 vite，

## installation

```
pnpm i @sunsetglow/vue-pdf-viewer

yarn add @sunsetglow/vue-pdf-viewer

npm i @sunsetglow/vue-pdf-viewer
```

## 功能介绍

- 支持搜索，文本复制，自定义水印，打印，下载，缩放，左侧导航，分页等功能
- pdf 渲染采用虚拟列表，可以使你轻松展示大文件 pdf

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
    loading: (load: boolean, fileInfo: { totalPage: number }) => {
      loading.value = load;
      console.log(`pdf 文件总数：${fileInfo.totalPage}`);
      //加载完成会返回 false
      configPdfApiOptions.onSearch("产品力成为推动其发展", false);
    },
    pdfOption: {
      search: true, // 搜索 开启搜索必须开启textLayer 为true
      scale: true, //缩放
      pdfImageView: false, //pdf 是否可以单片点击预览
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
      renderTotalPage: 5, //是否渲染指定页面总数，-1 则默认渲染文件总数，如果传5 则渲染前五页
      // 不传默认是 0.5
      visibleWindowPageRatio: 0.5, //当前pdf页面在可视窗口多少比例触发分页 传入0.5 就是 （pdf下一页滚动到容器高度一半的时候 更新当前页码）
      containerWidthScale: 0.97, //pdf 文件占父元素容器width的比例 默认是0.8
      pdfItemBackgroundColor: "#fff", //pdf 加载时背景颜色 默认#ebebeb
      watermarkOptions: {
        //水印功能
        columns: 3, //列数量
        rows: 4, // 行数量
        color: "#2f7a54", //字体颜色
        rotation: 25, //旋转角度
        fontSize: 40, //字体大小
        opacity: 0.4, //调整透明度
        watermarkTextList: ["第一行", "第二行", "第三行"], //水印文字和 watermarkLink 冲突，只能展示一个水印内容
        // watermarkLink: "https://xxx.png", //水印可以支持公司logo（图片路径）
      }, // 不展示水印传 undefined即可
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

|    参数名称 | 内容 说明                                          |
| ----------: | -------------------------------------------------- |
| loadFileUrl | 文件地址（必选）                                   |
|     pdfPath | pdf.js 里所需的 pdf.worker.min.js 指向地址（必选） |
|   pdfOption | pdf 的配置选项 （可选）                            |
|     loading | pdf 加载完成执行函数 （可选）                      |

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
/**
 * 搜索内置函数（在loading 函数里调用）
 * @param keyword 搜索内容
 * @param visible 是否展示搜索框 true
 */
configPdfApiOptions.onSearch("产品力成为推动其发展", false);
```

## 欢迎大家的使用

- 如果帮助到你，帮忙点个 star ，有任何改进可直接提 issue 或者私信邮箱 wyaoting999@163.com

- github 仓库地址 [sunsetglow-vue-pdf-viewer](https://github.com/wyaoting/sunsetglow-vue-pdf-viewer)

## 致谢

- 此库基于 [pdf.js](https://github.com/mozilla/pdf.js) 进行二次封装感谢大佬的开源贡献精神

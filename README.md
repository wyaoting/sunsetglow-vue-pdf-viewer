# @sunsetglow/vue-pdf-viewer

用来预览 pdf 文件，开箱即用，无需多余的开发，操作简单，支持 vue3 vite，

## installation

```
pnpm i @sunsetglow/vue-pdf-viewer

yarn add @sunsetglow/vue-pdf-viewer

npm i @sunsetglow/vue-pdf-viewer
```

## 🎊 功能介绍

- 支持搜索，文本复制，自定义水印，打印，下载，缩放，左侧导航，分页等功能
- pdf 渲染采用虚拟列表，可以使你轻松展示大文件 pdf

## ⭐ demo

![demo](/src/assets/demo.gif)

## 🌰 example

```vue
<template>
  <div id="pdf-container"></div>
</template>
<script lang="ts" setup>
import type {
  pdfOption,
  option,
  configPdfApiOptionsType,
} from "@sunsetglow/vue-pdf-viewer";
import {
  initPdfView,
  usePdfConfigState,
  cleanupPdfView, //组件内部实例卸载函数
} from "@sunsetglow/vue-pdf-viewer";
import "@sunsetglow/vue-pdf-viewer/dist/style.css";
import { onMounted, onUnmounted, App, ref } from "vue";
const loading = ref(false);
let instanceApp = null as App | null;
const url = ref("https:xxx.pdf");
const pdfPath = new URL(
  "@sunsetglow/vue-pdf-viewer/dist/libs/pdf.worker.min.js",
  import.meta.url
).href;
// usePdfConfigState 0.3.55 版本之前没有这函数 configOption 和 configPdfApiOptions直接从@sunsetglow/vue-pdf-viewer import 就行
let configOption = ref<pdfOption>();
let configPdfApiOptions = ref<configPdfApiOptionsType>();
onMounted(() => {
  loading.value = true;
  const { app } = initPdfView(
    document.querySelector("#pdf-container") as HTMLElement,
    {
      loadFileUrl: url, //文件路径 string | ArrayBuffer | Uint8Array|Ref<string> 响应式内部会监听
      pdfPath: pdfPath, // pdf.js 里需要指定的文件路径
      loading: (load: boolean, fileInfo: { totalPage: number }) => {
        loading.value = load;
        console.log(`pdf 文件总数：${fileInfo.totalPage}`);
        //加载完成会返回 false
        nextTick(() => {
          configPdfApiOptions?.value?.handleChange(4);
        });
      },
      onError: (erorr: Error) => {
        console.log(erorr, "报错内容处理");
      },
      pdfOption: {
        customPdfOption: {
          // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
          cMapPacked: true, //指定 CMap 是否是二进制打包的
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
        },
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
        selectConfig: [
          //自定义选中文字弹窗不需要该功能不传此参数即可
          {
            icon: SearchOutlined, //图标 Component
            text: ` AI 搜索`, // 文字
            style: { color: "red" }, // style
            onClick: (text: string) => {
              // 自定义实现功能
              console.log("选中文字", text);
            },
          },
          {
            icon: FileSearchOutlined,
            text: `联网搜索`,
            onClick: (text: string) => {
              // 需自定义实现功能
              console.log("选中文字", text);
            },
          },
          {
            icon: CopyOutlined,
            text: `复制`,
            onClick: (text: string, onCopy) => {
              // 组件内置实现的copy函数该功能直接调用即可
              onCopy(text);
              console.log("选中文字", text);
            },
          },
        ],
        // 不需要的话不传此参数就行 ，（pdf展示大小变化会触发函数）
        getPdfScaleView: (params: {
          scale?: number; //pdf 原始宽高和 展示pdf 宽高换算的 缩放值
          pdfViewport?: { width: number; height: number }; //文件宽高
        }) => {
          console.log(params, "scale");
        },
        /**
         * 可选（不需要不传入即可）
         * @param container 打印pdf容器（会生成一份完整pdf）
         * @param onClose //关闭内部状态函数
         */
        handleCustomPrint: (container: HTMLElement, onClose: Function) => {
          const printContent = container?.innerHTML;
          const iframe = document.createElement("iframe");
          iframe.setAttribute(
            "style",
            "position: absolute; width: 0; height: 0;display: none;"
          );
          document.body.appendChild(iframe);
          if (iframe?.contentWindow?.document) {
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.write(`<style media="print">@page {size: auto;  margin: 0;}  body {
              margin: 1cm;
                  }
                img{
                  max-width:100%;
                  width:88%;
                  margin:0px auto;
                  height:auto;
                }  </style>`);
            iframeDoc.write(
              `<link href="./print.css" media="print" rel="stylesheet" />`
            );
            iframe.contentWindow.onafterprint = function () {
              document.body.removeChild(iframe);
              // container?.innerHTML && (container.innerHTML = "");
            };
            iframeDoc.write("<div>" + printContent + "</div>");
            // 调用内部关闭弹窗函数
            onClose();
            iframe.contentWindow?.print();
          } else {
            document.body.removeChild(iframe);
          }
        },
      },
    } as option
  );
  // 从内部实例拿到数据进行监听
  const config = usePdfConfigState(app);
  instanceApp = app;
  // 监听内部状态
  configOption.value = config.configOption.value;
  //  configPdfApiOptions 函数在loading 执行之后调用
  configPdfApiOptions.value = config.configPdfApiOptions;
});
// 监听内容页码变化
watch(
  () => configOption.value?.pageOption?.current,
  (current) => {
    console.log(current, "当前页码");
  },
  {
    deep: true,
  }
);

/**
 * 获得搜索内容总数和选中当前选中页数
 */
watch(
  () => configOption.value?.searchOption?.searchTotal,
  () => {
    if (configOption.value?.searchOption) {
      const { searchIndex, searchTotal } = configOption.value?.searchOption;
      console.log(`当前选中页码：${searchIndex}, 搜索匹配总数：${searchTotal}`);
    }
  },
  {
    deep: true,
  }
);
// 监听内部缩放值
watch(
  () => configOption.value?.containerScale,
  (containerScale) => {
    console.log(`内部缩放值：${containerScale},  `);
  },
  {
    deep: true,
  }
);
onUnmounted(() => {
  //清除实例
  instanceApp && cleanupPdfView(instanceApp);
  console.log("实例销毁");
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

| 参数名称    | 内容 说明                                          | 类型                                      |
| ----------- | -------------------------------------------------- | ----------------------------------------- |
| loadFileUrl | pdf 文件路径 （必选）ref 内部会监听其他类型不会    | string,ArrayBuffer,Uint8Array,Ref<string> |
| pdfPath     | pdf.js 里所需的 pdf.worker.min.js 指向地址（必选） | string                                    |
| pdfOption   | pdf 的配置选项 （可选）                            | pdfOption                                 |
| loading     | pdf 加载完成执行函数 （可选）                      | Function                                  |
| onError     | 组件内部报错函数处理 （可选）                      | Function                                  |

## **pdfOption** 参数说明

| 参数名称                | 内容 说明                                                                                                                                                                                                            | 类型                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| search                  | 是否开启文件搜索 -默认开启（可选） **_开启搜索必须开启 textLayer 为 true_**                                                                                                                                          | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| scale                   | 是否开启缩放 -默认开启 （可选）                                                                                                                                                                                      | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| page                    | 是否开启分页查看 -默认开启 （可选）                                                                                                                                                                                  | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| navShow                 | 是否开启左侧导航 -默认开启 （可选）                                                                                                                                                                                  | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| toolShow                | 是否开启顶部导航 -默认开启 （可选）                                                                                                                                                                                  | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| navigationShow          | 左侧导航是否自动开启 （可选）                                                                                                                                                                                        | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| pdfViewResize           | 是否开启 监听 resize 函数确保 pdf 根据可视窗口缩放大小 -默认开启（可选）                                                                                                                                             | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| download                | 是否开启下载功能 -默认开启 （可选）                                                                                                                                                                                  | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| fileName                | pdf 下载文件名默认"preview.pdf"（可选）                                                                                                                                                                              | string                                                                                                                                                                                                                                                                                                                                                                                                   |
| print                   | 是否开启打印 -默认开启 （可选）                                                                                                                                                                                      | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| lang                    | 内部多语言控制字段 -默认 zh （可选）                                                                                                                                                                                 | **_zh 或 en_**                                                                                                                                                                                                                                                                                                                                                                                           |
| customPdfOption         | customPdfOption 是 pdfjs getDocument 函数中一些配置参数 具体可参考***https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters*** （可选）                                             | object                                                                                                                                                                                                                                                                                                                                                                                                   |
| textLayer               | 是否开启文字可复制 -默认开启 （可选）                                                                                                                                                                                | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| renderTotalPage         | 是否渲染指定页面总数 如果传 5 则渲染前五页，-1 则默认渲染文件总数，-默认 **_-1_** （可选）                                                                                                                           | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| containerWidthScale     | pdf 文件占父元素容器 width 的比例 -默认是 0.8 （可选）                                                                                                                                                               | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| clearScale              | 清晰度调整 感觉不清晰 调大 ,当然清晰度越高 pdf 生成性能有影响 -默认 1.5 （可选）                                                                                                                                     | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| visibleWindowPageRatio  | 当前 pdf 页面在可视窗口多少比例触发分页 ,-默认 0.5， 传入 0.5 就是 （pdf 下一页滚动到容器高度一半的时候 更新当前页码）（可选）                                                                                       | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| pdfItemBackgroundColor  | pdf 单个页面加载时背景颜色 -默认#fff（可选）                                                                                                                                                                         | string                                                                                                                                                                                                                                                                                                                                                                                                   |
| pdfBodyBackgroundColor  | pdf 容器的背景色 -默认#eaeaea（可选）                                                                                                                                                                                | string                                                                                                                                                                                                                                                                                                                                                                                                   |
| pdfListContainerPadding | pdf 容器的 padding -默认 "10px 20px 20px 20px"（可选）                                                                                                                                                               | string                                                                                                                                                                                                                                                                                                                                                                                                   |
| watermarkOptions        | 不展示水印传 undefined 即可                                                                                                                                                                                          | `watermarkOptions:{columns:3,//列数量,rows: 4, // 行数量, color: "#69b82a4f", //字体颜色,rotation: 25, //旋转角度, fontSize: 40, //字体大小, opacity: 0.4, //调整透明度,watermarkTextList: ["水印水印水印水印"], //（最大展示3个）水印文字和 watermarkLink 冲突，只能展示一个水印内容   ,watermarkLink: "https://www.autodatas.net/png/header-logo-54f61223.png", //水印可以支持公司logo} ` 或 undefined |
| handleCustomPrint       | 自定义打印函数 `container 打印pdf容器（会生成一份完整pdf）` ` onClose //关闭内部状态函数`（可选）                                                                                                                    | `handleCustomPrint?: (container: HTMLElement, onClose: Function) => void;`                                                                                                                                                                                                                                                                                                                               |
| searchToolVisible       | 是否展示搜索图标和搜索下拉框 ,默认 true（可选）                                                                                                                                                                      | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| containerScale          | 缩放功能的初始值（展示用默认**1** 组件内部会 containerScale \* 100 ）（可选）                                                                                                                                        | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| getPdfScaleView         | pdf 展示大小变化会触发函数 , 返回 pdf 文件大小和页面大小的换算值和原生文件的 width， height` scale?: number; //pdf 原始宽高和 展示pdf 宽高换算的 缩放值` ,`pdfViewport?: { width: number; height: number };`（可选） | ` getPdfScaleView?: (params: {scale?: number;pdfViewport?: { width: number; height: number }; }) => void;`                                                                                                                                                                                                                                                                                               |
| selectConfig            | 自定义选中文字弹窗不需要该功能不传此参数即可                                                                                                                                                                         | `[{text: string;icon?: Component;style?: CSSProperties;onClick: (text: string, onCopy: (text: string) => void) => void; }]`                                                                                                                                                                                                                                                                              |
| threshold               | 阈值为 1.0 意味着目标元素完全出现在可视窗口 100% 可见时，pdf 页面会渲染触发 -默认 0.18（可选）可                                                                                                                     | number                                                                                                                                                                                                                                                                                                                                                                                                   |
|                         |
| customMinScale          | 自定义最小缩放比例 -默认 0.1（可选）                                                                                                                                                                                 | number                                                                                                                                                                                                                                                                                                                                                                                                   |
| onPageRenderEnd         | 单个 pdf 页面渲染显示结束之后触发，不需要不传此参数即可 （可选）                                                                                                                                                     | Function                                                                                                                                                                                                                                                                                                                                                                                                 |
| isPinchToZoom           | 移动端双指缩放功能 -默认关闭，不需要不传此参数即可 （可选）                                                                                                                                                          | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| isScopeSearch           | 是否开启范围搜索（针对文件大，搜索时间较长，可对指定范围进行搜索如**20 页-40 页**） -默认关闭，不需要不传此参数即可 （可选）                                                                                         | boolean                                                                                                                                                                                                                                                                                                                                                                                                  |
| isRotateType            | 是否开启旋转功能，有顺时针旋转和逆时针旋转 -默认关闭，不需要不传此参数即可 （可选）                                                                                                                                  | ['left','right'] 或者 undefined                                                                                                                                                                                                                                                                                                                                                                          |

## api 事件说明

- 对外开放 api 通一在 configPdfApiOptions 对象上

```ts
import { initPdfView, usePdfConfigState } from "@sunsetglow/vue-pdf-viewer";
// 从initPdfView 函数里拿到该函数实例 ，然后调用usePdfConfigState拿到组件内方法
const { app } = initPdfView(...)
const {configPdfApiOptions} = usePdfConfigState(app);
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
 * @param isNext 是否自动跳转匹配到搜索结果页 默认跳转 true
 */
configPdfApiOptions.onSearch("产品力成为推动其发展", false);

/**
 * 需要在onSearch函数执行之后调用
 * 搜索到匹配条件执行下一步 上一步函数
 * @param type next（下一步） |  previous（上一步）
 * @returns
 */
configPdfApiOptions.onSearchNext("next");
```

## 🎆 欢迎大家的使用

- 如果帮助到你，帮忙点个 star ，有任何改进可直接提 issue 或者私信邮箱 wyaoting999@163.com

- github 仓库地址 [sunsetglow-vue-pdf-viewer](https://github.com/wyaoting/sunsetglow-vue-pdf-viewer)

## 🌹🌹 致谢

- 此库基于 [pdf.js](https://github.com/mozilla/pdf.js) 进行二次封装感谢大佬的开源贡献精神

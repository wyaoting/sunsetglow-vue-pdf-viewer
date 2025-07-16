<template>
  <a-spin :spinning="loading">
    <button @click="onChange">切换</button>
    <button @click="onNext">下一页</button>
    <div ref="pdfView" style="height: 40vh"></div>
  </a-spin>
</template>
<script lang="ts" setup>
import { Spin as ASpin } from "ant-design-vue";
import {
  initPdfView,
  usePdfConfigState,
  cleanupPdfView,
} from "../packages/index.ts";
import type {
  pdfOption,
  option,
  configPdfApiOptionsType,
} from "../packages/index.ts";

import { ref, watch, onMounted, nextTick, onUnmounted, App } from "vue";
const loading = ref(false);
const pdfView = ref();
const pdfPath = new URL("/src/assets/pdf.worker.min.js", import.meta.url).href;
let index = 0;
const urlList = [
  // "/src/assets/111.pdf",
  "/src/assets/Owners_Manual.pdf",
  "/src/assets/test2.pdf",
  "/src/assets/1748352797096.pdf",
];
const url = ref(urlList[index]);
let configOption = ref<pdfOption>();
let configPdfApiOptions = ref<configPdfApiOptionsType>();
let appVue = null as App | null;
// let unmount
const onCreated = () => {
  loading.value = true;
  const { app } = initPdfView(
    pdfView.value as HTMLElement,
    {
      // loadFileUrl: props.url,
      loadFileUrl: url,
      pdfPath: pdfPath,
      loading: () => {
        loading.value = false;
        nextTick(() => {
          // configPdfApiOptions?.value?.onSearch("车主");
        });
      },
      pdfOption: {
        onPageRenderEnd: () => {
          console.log("onPageRenderEnd");
        },
        search: true, // 搜索 开启搜索必须开启textLayer 为true
        searchToolVisible: true, // 是否展示搜索图标和搜索下拉框 ,，默认true
        scale: true, //缩放
        pdfImageView: false, //pdf 是否可以单片点击预览
        page: true, //分页查看
        navShow: true, //左侧导航
        navigationShow: false, // 左侧导航是否开启
        pdfViewResize: true, // 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
        toolShow: true, // 是否开启顶部导航
        download: true, //下载
        clearScale: 2.5, // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
        fileName: "preview.pdf", // pdf 下载文件名称
        lang: "en", //字典语言
        // renderTotalPage: 5,
        print: true, //打印功能
        customPdfOption: {
          // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
          cMapPacked: true, //指定 CMap 是否是二进制打包的
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
        },
        textLayer: true, //文本是否可复制 ， 文本复制和点击查看大图冲突建议把 pdfImageView 改为false

        // 不传默认是 0.5
        visibleWindowPageRatio: 0.5, // 下一个页面展示的比例触发页码变更 默认0.5（可选）
        containerWidthScale: 1, //pdf 文件占父元素容器width的比例 默认是0.8
        containerScale: 0.8, //缩放功能的初始值 会和 containerWidthScale 参数重和（展示用默认1组件内部会 containerScale * 100 ）
        pdfItemBackgroundColor: "#fff", //pdf 加载时背景颜色 默认#ebebeb （可选）
        pdfBodyBackgroundColor: "#eaeaea", //pdf 容器的背景色 默认#eaeaea （可选）
        pdfListContainerPadding: "10px 20px 20px 20px", // pdf 容器的padding默认10px 20px 20px（可选）
        customMinScale: 0.4,
        threshold: 0,
        watermarkOptions: {
          //水印功能
          columns: 3, //列数量
          rows: 4, // 行数量
          color: "#2f7a54", //字体颜色
          rotation: 25, //旋转角度
          fontSize: 30, //字体大小
          opacity: 0.4, //调整透明度
          watermarkTextList: ["第一行", "第二行", "第三行"], //水印文字和 watermarkLink 冲突，只能展示一个水印内容
          // watermarkLink: "https://xxx.png", //水印可以支持公司logo（图片路径）
        }, // 不展示水印传 undefined即可
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
      } as pdfOption,
    } as option
  );
  const config = usePdfConfigState(app);
  appVue = app;
  configOption.value = config.configOption.value;
  configPdfApiOptions.value = config.configPdfApiOptions;
};
onMounted(async () => {
  onCreated();
});
const onChange = () => {
  index++;
  if (index >= urlList.length) index = 0;

  url.value = urlList[index];
  //   onCreated();
};
const onNext = () => {
  configPdfApiOptions?.value?.onSearch("Model");
};
watch(
  () => configOption?.value?.pageOption?.current,
  (current) => {
    console.log(current, "当前页码");
  },
  {
    deep: true,
  }
);
/**
 * 搜索内容总数和选中当前选中页数
 */
watch(
  () => configOption?.value?.searchOption?.searchTotal,
  () => {
    if (configOption?.value?.searchOption) {
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
  () => configOption?.value?.containerScale,
  (containerScale) => {
    console.log(`内部缩放值：${containerScale},  `);
  },
  {
    deep: true,
  }
);
onUnmounted(() => {
  appVue && cleanupPdfView(appVue);
  console.log("实例销毁");
});
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

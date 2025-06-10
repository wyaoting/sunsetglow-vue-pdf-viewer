<template>
  <button @click="onclick">切换路径</button>
  <a-spin :spinning="loading">
    <div class="test-pdf" style="height: 90vh"></div>
  </a-spin>
</template>
<script lang="ts" setup>
import { Spin as ASpin } from "ant-design-vue";
import { initPdfView, configOption } from "../packages/index.ts";
import type { pdfOption } from "../packages/index.ts";
import { onMounted } from "vue";
import {
  SearchOutlined,
  CopyOutlined,
  FileSearchOutlined,
} from "@ant-design/icons-vue";
import { ref, watch } from "vue";
const loading = ref(false);
const url = ref("/src/assets/test2.pdf");
const pdfPath = new URL("/src/assets/pdf.worker.min.js", import.meta.url).href;
onMounted(() => {
  loading.value = true;

  initPdfView(document.querySelector(".test-pdf") as HTMLElement, {
    loadFileUrl: url,
    // loadFileUrl: "/src/assets/Owners_Manual.pdf",
    pdfPath: pdfPath,
    loading: (load: boolean, fileInfo: { totalPage: number }) => {
      console.log(`pdf 文件总数：${fileInfo.totalPage}`);
      // let timeout = setTimeout(() => {
      //   clearTimeout(timeout);
      //   configPdfApiOptions.onSearch("Model", true);
      // }, 2000);
      // configPdfApiOptions.onSearch("Model", true);
      loading.value = load;
    },
    //可选
    pdfOption: {
      search: true, // 搜索
      scale: true, //缩放
      pdfImageView: false, //pdf 是否可以单片点击预览
      page: true, //分页查看
      navShow: true, //左侧导航
      navigationShow: false, // 左侧导航是否开启
      pdfViewResize: true, // 是否开启resize 函数 确保pdf 根据可视窗口缩放大小
      toolShow: true, // 是否开启顶部导航
      download: true, //下载
      clearScale: 3, // 清晰度 默认1.5 感觉不清晰调大 ,当然清晰度越高pdf生成性能有影响
      fileName: "preview.pdf", // pdf 下载文件名称
      lang: "en", //字典语言
      print: true, //打印功能
      customPdfOption: {
        // customPdfOption是 pdfjs getDocument 函数中一些配置参数 具体可参考 https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters
        cMapPacked: true, //指定 CMap 是否是二进制打包的
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/cmaps/", //预定义 Adob​​e CMaps 所在的 URL。可解决字体加载错误
      },
      renderTotalPage: -1, //是否渲染指定页面总数，-1 则默认默认渲染文件总数，如果传5 则渲染前五页
      textLayer: true, //文本是否可复制 ， 文本复制和点击查看大图冲突建议把 pdfImageView 改为false
      containerWidthScale: 0.85, //pdf 文件占父元素容器width的比例 默认是0.8
      pdfItemBackgroundColor: "#fff",
      watermarkOptions: {
        columns: 3, //列数量
        rows: 4, // 行数量
        color: "#2f7a54", //字体颜色
        rotation: 25, //旋转角度
        fontSize: 10, //字体大小
        opacity: 0.4, //调整透明度
        watermarkTextList: ["AUTODATS", "", ""], //水印文字和 watermarkLink 冲突，只能展示一个水印内容
        // watermarkLink: "https://www.autodatas.net/png/header-logo-54f61223.png", //水印可以支持公司logo
      }, // 不展示水印传 undefined即可
      selectConfig: [
        //自定义选中文字弹窗不需要该功能不穿此参数即可
        {
          icon: SearchOutlined, //图标
          text: ` AI 搜索`, // 文字
          style: { color: "red" }, // style
          onClick: (text: string) => {
            console.log("选中文字", text);
          },
        },
        {
          icon: FileSearchOutlined,
          text: `联网搜索`,
          onClick: (text: string) => {
            // 复制文字函数
            console.log("选中文字", text);
          },
        },
        {
          icon: CopyOutlined,
          text: `复制`,
          onClick: (text: string, onCopy) => {
            // 复制文字函数
            onCopy(text);
            console.log("选中文字", text);
          },
        },
      ],
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
  });
});
const onclick = () => {
  loading.value = true;
  url.value = "/src/assets/Owners_Manual.pdf";
};
watch(
  () => configOption.value?.pageOption?.current,
  (current) => {
    console.log(current, "当前页码");
  }
);
</script>

<style scoped>
.test-pdf {
  width: 100%;
  padding: 0px;
  height: 100%;
}
</style>

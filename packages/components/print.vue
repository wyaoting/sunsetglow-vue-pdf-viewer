<template>
  <div class="pinter-container" @click="handlePrint">
    <PrinterOutlined />
  </div>
  <a-modal
    :footer="null"
    :maskClosable="false"
    :closable="false"
    destroyOnClose
    v-model:open="open"
  >
    <p style="margin: 0px 0px 10px 0px">{{ t("Preparing") }}</p>
    <a-progress :percent="percent" size="small" />
  </a-modal>
</template>
<script lang="ts" setup>
import { t } from "../Lang";
import { Modal as AModal, Progress as AProgress } from "ant-design-vue";
import { ref, nextTick } from "vue";
import { PrinterOutlined } from "@ant-design/icons-vue";
import { pdfRenderClass } from "../utils/index";
import { inject } from "vue";
const printLimitation = ref(false);
const percent = ref(0);
const open = ref(false);
const props = defineProps<{
  pdfContainer: any; //
}>();
const pdfExamplePages = inject("pdfExamplePages") as any;

const pdfRenderToImage = async (printFun: () => void) => {
  let canvasImage = [] as any;
  const num = pdfExamplePages.value + 1;
  const computed = 100 / num;
  for (let i = 1; i < num; i++) {
    canvasImage.push(
      new Promise(async (resolve) => {
        const canvas = document.createElement("canvas");
        props.pdfContainer.getPage(i).then(async (page: never) => {
          const pdfCanvas = new pdfRenderClass(canvas, page, 1);
          await pdfCanvas.handleRender();
          percent.value = Math.min(percent.value + Math.floor(computed), 100);
          resolve(pdfCanvas);
        });
      })
    );
  }
  await Promise.all(canvasImage).then((image) => {
    const printContainer = document.querySelector("#print-pdf-container");
    image.forEach((pdfCanvas) => {
      const img = document.createElement("img");
      img.style.display = "block";
      img.style.margin = "0px auto";
      img.src = pdfCanvas.getImageSrc();
      printContainer?.appendChild(img);
    });
    printFun();
  });
};

const handlePrint = () => {
  if (printLimitation.value) return;
  percent.value = 0;
  printLimitation.value = true;
  open.value = true;
  pdfRenderToImage(() => {
    nextTick(() => {
      const pdfPrintContainer = document.querySelector("#print-pdf-container");
      const printContent = pdfPrintContainer?.innerHTML;
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
      }
  </style>`);
        iframeDoc.write(
          `<link href="./print.css" media="print" rel="stylesheet" />`
        );
        iframe.contentWindow.onafterprint = function () {
          if (open.value) open.value = false;
          document.body.removeChild(iframe);
          pdfPrintContainer?.innerHTML && (pdfPrintContainer.innerHTML = "");
        };
        iframeDoc.write("<div>" + printContent + "</div>");
        percent.value = 100;
        open.value = false;
        printLimitation.value = false;
        iframe.contentWindow?.print();
      }
    });
  });
};
</script>

<style scoped>
.pinter-container {
  font-size: 20px;
  margin-right: 10px;
  cursor: pointer;
}
</style>

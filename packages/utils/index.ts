export const handlePdfLocateView = (
  i: number,
  domClassName: string = `#scrollIntIndex`
) => {
  const pdfContainer = document.querySelector(`${domClassName}-${i}`);
  pdfContainer && pdfContainer?.scrollIntoView();
};

export function isInViewPortOfOne(el: HTMLElement, parentEl: HTMLElement) {
  // viewPortHeight 兼容所有浏览器写法
  const viewPortHeight = parentEl.clientHeight - el.clientHeight;
  const offsetTop = el.offsetTop;
  const scrollTop = parentEl.scrollTop;
  const top = offsetTop - scrollTop;
  return top >= 0 && top <= viewPortHeight;
}
export const handelRestrictDebounce = (time: number, execute: Function) => {
  let timeoute: any;
  return (...args: any[]) => {
    timeoute && clearTimeout(timeoute);
    timeoute = setTimeout(() => {
      execute(...args);
    }, time);
  };
};
export const download = (url: string, filename?: string) => {
  const downloadElement = document.createElement("a");
  downloadElement.style.display = "none";
  downloadElement.href = url;
  if (filename) {
    downloadElement.download = filename;
  }
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
};
export const fetchFileResultDownload = async (
  url: string,
  fileName = "preview.pdf"
) => {
  const blobRes = await fetch(url).then((res) => res.arrayBuffer());
  const e = new Blob([blobRes], {
    type: "application/octet-stream",
  });
  const link = window.URL.createObjectURL(e);
  download(link, fileName);
};
export const removeNodesButKeepText = (className: string, dom: HTMLElement) => {
  // 获取所有具有指定类名的节点
  const nodes = dom.querySelectorAll(`.${className}`);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i] as any;
    const textNode = document.createTextNode(node.textContent);
    // 用文本节点替换原来的节点
    node.parentNode.replaceChild(textNode, node);
  }
};

export let pdfContainerExample = null;
export class pdfRenderClass {
  canvas: HTMLCanvasElement;
  page: any;
  scale: number;
  viewport: any;
  constructor(canvas: HTMLCanvasElement, page: any, scale: number) {
    this.canvas = canvas;
    this.page = page;
    this.scale = scale;
  }
  async handleRender() {
    if (!this.page || !this.canvas) return;
    const ctx = this.canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: false,
    }) as any;
    const dpr = window.devicePixelRatio || 1;
    const bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
    const ratio = dpr / bsr;
    const viewport = this.page.getViewport({ scale: this.scale });
    this.canvas.width = viewport.width * ratio;
    this.canvas.height = viewport.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // 将 PDF 页面渲染到 canvas 上下文中
    const renderContext = {
      canvasContext: ctx,
      viewport,
    };
    await this.page.render(renderContext).promise;
    this.viewport = viewport;
    return Promise.resolve({
      page: this.page,
      viewport: viewport,
    });
  }
  // 文字可复制
  async handleRenderTextContent(
    TextLayerBuilder: any,
    scale: number,
    container: HTMLElement,
    searchOption?: { visible: boolean; text: string }
  ) {
    const textLayerDiv = document.createElement("div");
    textLayerDiv.setAttribute("class", "textLayer");
    var textLayer = new TextLayerBuilder({
      textLayerDiv: textLayerDiv,
      pageIndex: this.page._pageIndex,
      pdfPage: this.page,
    });
    //换算缩放值
    container.style.setProperty("--scale-factor", `${scale}`);
    const textContent = await this.page.getTextContent();
    textLayer.setTextContentSource(textContent);
    await textLayer.render(this.viewport);
    container.appendChild(textLayer.div);
    if (searchOption?.visible) this.handleSearch(container, searchOption.text);
    return Promise.resolve({
      textLayer,
      container,
    });
  }

  handleSearch(
    container: HTMLElement,
    search: string,
    highlightVisible = true
  ) {
    let index = 0;
    let textTotal = 0;
    const childElement = container.querySelector(".textLayer");
    if (childElement) {
      removeNodesButKeepText("pdf-highlight", childElement as HTMLElement);
      childElement.childNodes.forEach((element: any, i: number) => {
        if (element.textContent && search) {
          if (
            element.textContent.toLowerCase().includes(search.toLowerCase())
          ) {
            !index && (index = i + 1);
            textTotal++;
          }
          // 是否高亮字段替换
          if (highlightVisible) {
            const replaceText = this.findTextMap(
              element.textContent as string,
              search as string
            );
            element.innerHTML = element.innerHTML.replace(
              element.textContent,
              replaceText
            );
          }
        }
      });
    }
    return {
      textTotal,
      index,
    };
  }

  findTextMap(text: string, findText: string) {
    if (text === findText) return `<span  class="pdf-highlight">${text}</span>`;
    const target = text.toLowerCase().indexOf(findText.toLowerCase());
    const searchTargetValue = target !== -1;
    const index = searchTargetValue ? target : 0;
    let value = text;
    let before = text.substr(0, index); // split into a part before the match
    let targetValue = text.substr(index, findText.length);
    let middle = text.substr(
      searchTargetValue ? index + findText.length : 0,
      text.length
    );
    if (searchTargetValue && findText) {
      value = `${before}<span  class="pdf-highlight">${targetValue}</span>${
        middle.toLowerCase().indexOf(findText.toLowerCase()) == -1
          ? middle
          : this.findTextMap(middle, findText)
      }`;
    } else if (target) {
      value = `${before}${middle}`;
    }
    return value as string;
  }

  getImageSrc() {
    return this.canvas?.toDataURL("image/png") as string;
  }
}

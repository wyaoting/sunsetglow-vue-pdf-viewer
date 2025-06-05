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
interface DataItem {
  text: string;
  id: number;
  element: HTMLSpanElement;
}

interface HighlightedItem extends DataItem {
  highlightedText: string;
  matchType: "single" | "multiple";
}

interface SearchResult {
  matches: HighlightedItem[];
  totalGroups: number;
  totalItems: number;
}

function formatSpaces(targetStr: string, sourceStr: string, isMatch: boolean) {
  // 1. 提取span标签及其内容
  const spanMatch =
    targetStr.match(
      /<span\s+class="multiple-highlight pdf-highlight">([^<]*)<\/span>/
    ) || targetStr.match(/<span\s+class="pdf-highlight">([^<]*)<\/span>/);
  if (!spanMatch) return sourceStr; // 如果没有span标签直接返回
  const spanStart = spanMatch.index as number;

  let targetIndex = 0;
  const sourceWords = sourceStr.split("");
  let spanText = "";
  let spanEnd = spanMatch[1].length;
  for (let i = 0; i < sourceWords.length; i++) {
    let text = sourceWords[i];
    if (targetIndex < spanStart || !spanEnd) {
      if (text !== " ") targetIndex++;
    } else {
      spanText += text;
      if (text !== " " && !!spanEnd) spanEnd--;
      // span 匹配到的文字
    }
  }
  if (!isMatch)
    return sourceStr.replace(
      spanText,
      `<span class="pdf-highlight">${spanText}</span>`
    );
  return spanText === sourceStr
    ? `<span class='pdf-highlight multiple-highlight'>${spanText}</span>`
    : sourceStr
        .split(spanText)
        .map((v) => {
          return v
            ? v
            : `<span class="pdf-highlight multiple-highlight">${spanText}</span>`;
        })
        .join("");
}

function advancedTextSearch(
  data: DataItem[],
  query: string,
  caseSensitive: boolean = true
): SearchResult {
  const result: SearchResult = {
    matches: [],
    totalGroups: 0,
    totalItems: 0,
  };

  if (!data || !query) return result;

  // 预处理查询词（支持中文连续匹配）
  const queryText = caseSensitive ? query.trim() : query.trim().toLowerCase();
  const queryWords = queryText.split(/[\s\/]+/).filter(Boolean);

  if (queryWords.length === 0) return result;

  // 预处理数据
  const processedData = data
    .map((item, index) => ({
      ...item,
      originalIndex: index,
      processedText: caseSensitive ? item.text : item.text.toLowerCase(),
      isEmpty: !item.text || !item.text.trim(),
    }))
    .filter((item) => !item.isEmpty);

  // 主搜索逻辑
  const matchedGroups: number[][] = [];
  const itemMatchInfo = new Map<
    number,
    {
      count: number;
      isPartOfMultiMatch: boolean;
    }
  >();

  // 构建完整的文本串以便连续匹配
  let fullText = "";
  const textSegments: {
    start: number;
    end: number;
    originalIndex: number;
  }[] = [];

  processedData.forEach((item) => {
    const start = fullText.length;
    fullText += item.processedText;
    textSegments.push({
      start,
      end: fullText.length - 1,
      originalIndex: item.originalIndex,
    });
  });

  // 在完整文本中搜索
  const searchText = caseSensitive ? queryText : queryText.toLowerCase();
  let searchPos = 0;
  while ((searchPos = fullText.indexOf(searchText, searchPos)) !== -1) {
    const matchEnd = searchPos + searchText.length - 1;
    // 找出所有被匹配到的文本段
    const matchedSegments = textSegments.filter(
      (seg) =>
        (seg.start <= searchPos && seg.end >= searchPos) ||
        (seg.start <= matchEnd && seg.end >= matchEnd) ||
        (searchPos <= seg.start && matchEnd >= seg.end)
    );
    if (matchedSegments.length > 0) {
      const originalIndices = matchedSegments.map((seg) => seg.originalIndex);
      matchedGroups.push(originalIndices);

      originalIndices.forEach((index) => {
        const info = itemMatchInfo.get(index) || {
          count: 0,
          isPartOfMultiMatch: false,
        };
        info.count++;
        info.isPartOfMultiMatch =
          info.isPartOfMultiMatch || originalIndices.length > 1;
        itemMatchInfo.set(index, info);
      });
    }

    searchPos = matchEnd;
  }
  function getMatchedTextForItem(
    itemId: number,
    matchedGroups: number[][],
    processedData: { originalIndex: number; processedText: string }[]
  ): string {
    for (const group of matchedGroups) {
      if (group.includes(itemId)) {
        // 找到该item所属的匹配组，拼接所有匹配的文本
        const matchedTexts = group.map(
          (index) =>
            processedData.find((item) => item.originalIndex === index)
              ?.processedText || ""
        );
        return matchedTexts.join("");
      }
    }
    return ""; // 如果不是多匹配，返回空（交给单匹配逻辑处理）
  }
  // 高亮生成函数
  const highlightMatch = (
    text: string,
    isMultiMatch: boolean,
    matchedText: string // 新增：传入实际匹配的文本（跨item匹配的部分）
  ): string => {
    if (!isMultiMatch) {
      // 单匹配：直接高亮整个查询词
      const escapedQuery = queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedQuery, caseSensitive ? "g" : "gi");
      return text.replace(regex, `<span class="pdf-highlight">$&</span>`);
    }
    // 多匹配：仅高亮匹配的部分（matchedText）
    const match = matchedText.toLowerCase().split(searchText.toLowerCase());
    const resText =
      match.find(
        (v) => v.length && text.toLowerCase().includes(v.toLowerCase())
      ) || "";
    const textSplits = !resText
      ? [text]
      : text.toLowerCase().split(resText.toLowerCase());

    return textSplits
      .map((v) =>
        !!v
          ? `<span class="multiple-highlight pdf-highlight">${v}</span>`
          : resText
      )
      .join("");
  };
  // 构建结果
  result.totalGroups = matchedGroups.length;
  result.totalItems = itemMatchInfo.size;
  // 如果是跨行从外面打标识
  result.matches = data
    .filter((_, index) => itemMatchInfo.has(index))
    .map((item) => {
      const matchInfo = itemMatchInfo.get(item.id)!;
      // 新增：计算该item实际匹配的文本部分
      const matchedText = getMatchedTextForItem(
        item.id,
        matchedGroups,
        processedData
      );
      return {
        ...item,
        highlightedText: highlightMatch(
          item.text,
          matchInfo.isPartOfMultiMatch,
          matchedText // 传入实际匹配的文本
        ),
        matchType: matchInfo.isPartOfMultiMatch ? "multiple" : "single",
      } as HighlightedItem;
    });

  return result;
}
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
    let realCanvas = document.createElement("canvas") as HTMLCanvasElement;
    let realContext = realCanvas.getContext("2d", {
      willReadFrequently: false,
      alpha: false,
    }) as CanvasRenderingContext2D;
    const ctx = this.canvas.getContext("2d", {
      willReadFrequently: false,
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
    let w = viewport.width * ratio;
    let h = viewport.height * ratio;
    this.canvas.width = w;
    this.canvas.height = h;
    realCanvas.width = w;
    realCanvas.height = h;
    realCanvas.style.width = this.canvas.clientWidth + "px";
    realCanvas.style.height = this.canvas.clientHeight + "px";
    realContext.fillStyle = "#FFFFFF";
    realContext.fillRect(0, 0, realCanvas.width, realCanvas.height);
    realContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    // 将 PDF 页面渲染到 canvas 上下文中
    const renderContext = {
      canvasContext: realContext,
      viewport,
      intent: "display",
    };
    await this.page.render(renderContext).promise;
    ctx.drawImage(realCanvas, 0, 0);
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
  onToolText(textContent: string) {
    return textContent
      .split("")
      .filter((v: string) => !!v.trim())
      .join("");
  }
  handleSearch(
    container: HTMLElement,
    search: string,
    highlightVisible = true
  ) {
    let textTotal = 0;
    const textSearchList: { text: string; id: number; element: HTMLElement }[] =
      [];
    const childElement = container.querySelector(".textLayer");
    if (childElement) {
      if (!search) return { textTotal };
      childElement.childNodes.forEach((element: any, i: number) => {
        textSearchList.push({
          text: this.onToolText(element.textContent),
          id: i,
          element,
        });
      });
      if (textSearchList.length) {
        const { totalGroups, matches } = advancedTextSearch(
          textSearchList,
          this.onToolText(search)
        );
        textTotal = totalGroups;
        if (!highlightVisible) return { textTotal };
        childElement.innerHTML = "";
        let index = 0;
        let multipleVisible = false;
        for (let j = 0; j < textSearchList.length; j++) {
          const _item = textSearchList[j];
          const target = matches?.find(
            (v: { id: number }) => v.id === _item.id
          );
          if (target && _item?.element?.textContent) {
            const ismMultiple = target.matchType === "multiple";
            _item?.element.removeAttribute("custom-search-id");
            _item.element.innerHTML = formatSpaces(
              target.highlightedText,
              JSON.parse(JSON.stringify(_item?.element?.textContent)),
              ismMultiple
            );
            // _item.element.innerHTML = target.highlightedText;
            if (ismMultiple) {
              if (!multipleVisible) {
                multipleVisible = true;
                index++;
              }
            } else {
              index++;
              multipleVisible = false;
            }
            _item.element.setAttribute("custom-search-id", `${index}`);
            childElement.appendChild(_item.element);
          } else {
            childElement.appendChild(_item.element);
          }
        }
      }
    }

    return {
      textTotal,
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

export const isArrayBuffer = (loadFileUrl: any) => {
  return Object.prototype.toString.call(loadFileUrl) === "[object ArrayBuffer]";
};

export const isUint8Array = (loadFileUrl: any) => {
  return Object.prototype.toString.call(loadFileUrl) === "[object Uint8Array]";
};

export const isFile = (loadFileUrl: any) => {
  return isUint8Array(loadFileUrl) || isArrayBuffer(loadFileUrl);
};

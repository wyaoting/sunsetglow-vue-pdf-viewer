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
      ctx,
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
/**
 * 清除canvas资源
 * @param canvasEl
 * @returns
 */
export const closeCanvas = (canvasEl: HTMLCanvasElement) => {
  if (!canvasEl) return;
  canvasEl.style.height = `${0}px`;
  canvasEl.style.width = `${0}px`;
  canvasEl.style.display = "none";
  canvasEl.remove();
  canvasEl.parentElement?.removeChild(canvasEl);
};

export interface DOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export enum EnumDrawType {
  solid = "solid", //下划线
  dashed = "dashed", //虚线
  wavy = "wavy", //波浪线
  dotted = "dotted", //点线
  highlight = "highlight", //高亮
  delete = "delete", //删除线
}
export interface DrawLineOption {
  color?: string; //下划线颜色
  style?: EnumDrawType | string; //下划线样式(solid/dashed/wavy/dotted)
  thickness?: number; //下划线粗细(px)
  wavyAmplitude?: number; //波浪线幅度(仅wavy样式有效)
  offset?: number; //距离文字底部的偏移量(px)
  wavyFrequency?: number; //波浪线频率(仅wavy样式有效)
}
export class drawToolClass {
  canvas: HTMLCanvasElement;
  scaleX: number;
  scaleY: number;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const canvasDisplayWidth = canvas.clientWidth;
    const canvasDisplayHeight = canvas.clientHeight;
    const canvasNativeWidth = canvas.width;
    const canvasNativeHeight = canvas.height;
    // 计算缩放比例
    this.scaleX = canvasNativeWidth / canvasDisplayWidth;
    this.scaleY = canvasNativeHeight / canvasDisplayHeight;
  }

  convertDOMRectToCanvasCoords(domRect: DOMRect) {
    // 1. 获取canvas相对于视口的位置
    const canvasRect = this.canvas.getBoundingClientRect();

    // 2. 计算相对于canvas的坐标
    const x = (domRect.x - canvasRect.x) * this.scaleX;
    const y = (domRect.y - canvasRect.y) * this.scaleY;
    const width = domRect.width * this.scaleX;
    const height = domRect.height * this.scaleY;

    return { x, y, width, height };
  }

  // 绘制虚线
  drawDashedLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dashLen: number,
    gapLen: number
  ) {
    ctx.beginPath();
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dashCount = len / (dashLen + gapLen);
    const dxDash = dx / dashCount;
    const dyDash = dy / dashCount;

    let x = x1;
    let y = y1;
    let isDash = true;

    for (let i = 0; i < dashCount; i++) {
      if (isDash) {
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + (dxDash * dashLen) / (dashLen + gapLen),
          y + (dyDash * dashLen) / (dashLen + gapLen)
        );
      }
      x += dxDash;
      y += dyDash;
      isDash = !isDash;
    }
    ctx.stroke();
  }

  // 绘制点线
  drawDottedLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dotCount = len / (radius * 3);
    const dxDot = dx / dotCount;
    const dyDot = dy / dotCount;

    ctx.beginPath();
    for (let i = 0; i <= dotCount; i++) {
      ctx.moveTo(x1 + dxDot * i, y1 + dyDot * i);
      ctx.arc(x1 + dxDot * i, y1 + dyDot * i, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // 绘制波浪线
  drawWavyLine(
    ctx: CanvasRenderingContext2D,
    startX: number,
    baseY: number,
    endX: number,
    amplitude: number,
    frequency: number
  ) {
    ctx.beginPath();
    ctx.moveTo(startX, baseY + amplitude * Math.sin(startX * frequency));

    for (let x = startX; x <= endX; x++) {
      const y = baseY + amplitude * Math.sin(x * frequency);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  roundRect(rect: DOMRect, y: number, height: number): DOMRect {
    return new DOMRect(
      Math.round(rect.x),
      y,
      Math.round(rect.width),
      Math.round(height)
    );
  }
  mergeSameLineRects(rectList: DOMRect[]) {
    if (rectList.length <= 1) return rectList;
    const rects = rectList;
    console.log(rects, "rects");
    const difference = 10;
    // 按y坐标分组并合并接近的y坐标
    //保存当前节点高度
    const groupedRects: {
      [key: string | number]: { list: DOMRect[]; height: number };
    } = {};

    // 1. 首先按y坐标进行分组，允许小范围误差
    rects.forEach((rect) => {
      // 查找最接近的现有组
      const existingGroup = Object.keys(groupedRects).find(
        (key) =>
          Math.abs(
            Number(key) + groupedRects[key].height - (rect.y + rect.height)
          ) <= difference &&
          groupedRects[key].height > difference &&
          rect.height > difference
      );

      if (existingGroup) {
        groupedRects[existingGroup].list = [
          ...groupedRects[existingGroup].list,
          rect,
        ];
      } else {
        groupedRects[rect.y] = {
          list: [rect],
          height: rect.height,
        };
      }
    });
    for (let key in groupedRects) {
      const totalY =
        groupedRects[key].list.reduce((sum, rect) => +sum + +rect.y, 0) /
        groupedRects[key].list.length;
      const totalH =
        groupedRects[key].list.reduce((sum, rect) => +sum + +rect.height, 0) /
        groupedRects[key].list.length;
      groupedRects[key].list = groupedRects[key].list.map((v: DOMRect) =>
        this.roundRect(v, +totalY, totalH)
      );
    }
    console.log(groupedRects, "groupedRects");
    // 2. 在每个组内合并重叠或相邻的矩形
    const mergedRects: DOMRect[] = [];

    Object.values(groupedRects).forEach(({ list: group }) => {
      // 按x坐标排序
      const sortedRects = group.sort((a, b) => a.x - b.x);
      let currentRect = sortedRects[0];

      for (let i = 1; i < sortedRects.length; i++) {
        const nextRect = sortedRects[i];
        // 如果两个矩形重叠或非常接近（距离小于5px）
        if (nextRect.x <= currentRect.x + currentRect.width + 5) {
          // 合并矩形
          currentRect = new DOMRect(
            currentRect.x,
            currentRect.y,
            Math.max(
              nextRect.x + nextRect.width - currentRect.x,
              currentRect.width
            ),
            currentRect.height
          );
        } else {
          mergedRects.push(currentRect);
          currentRect = nextRect;
        }
      }
      mergedRects.push(currentRect);
    });

    return mergedRects;
  }
  /**
   * 合并相邻的下划线矩形
   * @param rectList 矩形数组
   * @param mergeThreshold 合并阈值，默认为6像素
   * @returns 合并后的矩形数组
   */
  mergeUnderlines(
    rectList: DOMRect[],
    mergeThresholdScale: number = 2
  ): DOMRect[] {
    // 按 y 坐标分组（允许小误差）
    const yGroups: { [key: number]: DOMRect[] } = {};
    let rects = rectList.map(
      ({ x, y, width, height, top, right, bottom, left }: DOMRect) => ({
        x,
        y,
        width,
        height,
        top,
        right,
        bottom,
        left,
      })
    );
    let mergeThreshold = mergeThresholdScale * this.scaleY;
    console.log(mergeThreshold, "mergeThreshold");
    rects.forEach((rect) => {
      const y = rect.y;
      let closestY: number | null = null;
      let minDiff = Infinity;

      for (const groupY in yGroups) {
        const diff = Math.abs(y - parseFloat(groupY));
        if (diff <= rect.height / 2 && diff < minDiff) {
          closestY = parseFloat(groupY);
          minDiff = diff;
        }
      }

      if (closestY !== null) {
        yGroups[closestY].push(rect);
      } else {
        yGroups[y] = [rect];
      }
    });

    // 合并每组内的相邻矩形
    const mergedRects: DOMRect[] = [];

    Object.values(yGroups).forEach((rectsInGroup) => {
      // 按 x 坐标排序
      rectsInGroup.sort((a, b) => a.x - b.x);

      let merged: DOMRect[] = [];

      rectsInGroup.forEach((rect) => {
        if (merged.length === 0) {
          merged.push({ ...rect });
        } else {
          const last = merged[merged.length - 1];
          // 检查是否相邻且应合并
          if (rect.left - last.right <= mergeThreshold) {
            merged[merged.length - 1] = {
              ...last,
              width: rect.right - last.x,
              right: rect.right,
            };
          } else {
            merged.push({ ...rect });
          }
        }
      });

      mergedRects.push(...merged);
    });

    return mergedRects;
  }
  /**
   * 在Canvas上绘制精确下划线
   * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
   * @param {DOMRect|DOMRectList} rects - 要添加下划线的元素位置信息
   * @param {DrawLineOption} [options] - 配置选项
   * @param {string} [options.color='#000000'] - 下划线颜色
   * @param {number} [options.thickness=3] - 下划线粗细(px)
   * @param {string} [options.style='solid'] - 下划线样式(EnumDrawType)
   * @param {number} [options.offset=2] - 距离文字底部的偏移量(px)
   * @param {number} [options.wavyAmplitude=3] - 波浪线幅度(仅wavy样式有效)
   * @param {number} [options.wavyFrequency=0.05] - 波浪线频率(仅wavy样式有效)
   */
  drawUnderlineOnCanvas(
    ctx: CanvasRenderingContext2D,
    rects: DOMRect[],
    options?: DrawLineOption
  ) {
    // 合并默认选项
    const {
      color = "red",
      thickness = 3,
      style = "solid",
      offset = 1,
      wavyAmplitude = 3,
      wavyFrequency = 0.1,
    } = options || {};
    // 保存当前绘图状态
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.fillStyle = color;
    // 合并多行矩形
    const mergedRect = this.mergeSameLineRects(rects);
    console.log(mergedRect, "mergeLineRects", rects);

    mergedRect.forEach((rect: DOMRect) => {
      // 转换为Canvas坐标
      const canvasRect = this.convertDOMRectToCanvasCoords(rect);
      const startX = canvasRect.x;
      const endX = canvasRect.x + canvasRect.width;
      const baselineY = canvasRect.y + canvasRect.height + offset;
      // 根据样式绘制
      switch (style) {
        case EnumDrawType.dashed:
          this.drawDashedLine(ctx, startX, baselineY, endX, baselineY, 5, 3);
          break;

        case EnumDrawType.dotted:
          this.drawDottedLine(ctx, startX, baselineY, endX, baselineY, 3);
          break;

        case EnumDrawType.wavy:
          this.drawWavyLine(
            ctx,
            startX,
            baselineY,
            endX,
            wavyAmplitude,
            wavyFrequency
          );
          break;
        case EnumDrawType.highlight:
          ctx.beginPath();
          ctx.rect(
            canvasRect.x,
            canvasRect.y,
            canvasRect.width,
            canvasRect.height
          );
          ctx.fill(); //绘画背景色
          break;
        case EnumDrawType.delete:
          ctx.beginPath();
          ctx.moveTo(startX, canvasRect.y + canvasRect.height / 2);
          ctx.lineTo(endX, canvasRect.y + canvasRect.height / 2);
          ctx.stroke();
          break;

        default: // solid
          ctx.beginPath();
          ctx.moveTo(startX, baselineY);
          ctx.lineTo(endX, baselineY);
          ctx.stroke();
      }
    });

    // 恢复绘图状态
    ctx.restore();
  }
}
/**
 * 清除选中对象
 */
export function closeAllRanges() {
  // 获取当前选中对象
  const selection = window.getSelection();
  // 方法1：移除所有选中范围
  selection?.removeAllRanges();
}

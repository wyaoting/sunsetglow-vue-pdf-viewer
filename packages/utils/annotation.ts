/**
 * 绘画工具
 * @param canvas
 * @param toolsOption
 * @param option
 */

// 首先在文件顶部添加类型定义
export interface CanvasPaintingThis {
  _canvas: HTMLCanvasElement;
  _option: {
    rectFileStyle?: string;
    lineWidth?: number;
    strokeStyle?: string;
    fontSize?: string | number;
    fillStyle?: string;
    canvasAttribute?: {
      width: number;
      height: number;
    };
    currentTool?: string | null;
  };
  _methods: {
    onUnMethods: () => void;
    onSave: () => void;
    initCanvas: (canvasEl: HTMLCanvasElement) => void;
    onInitMethods: () => void;
    restoreCanvas: () => void;
    onResetCanvas: (option: { width: number; height: number }) => void;
    setCurrentTool: (key?: null | string) => string | null;
    closeTextInput: () => void;
    initTextInput: () => void;
  };
}
export const constDrawToolType = {
  free: "free",
  rect: "rect",
  circle: "circle",
  triangle: "triangle",
  arrow: "arrow",
  text: "text",
};
export type toolsOption = {
  drawTools: {
    [constDrawToolType.free]?: HTMLElement;
    [constDrawToolType.rect]?: HTMLElement;
    [constDrawToolType.circle]?: HTMLElement;
    [constDrawToolType.triangle]?: HTMLElement;
    [constDrawToolType.arrow]?: HTMLElement;
    [constDrawToolType.text]?: HTMLElement;
  };
  tools: {
    undo: HTMLElement;
    clear: HTMLElement;
    save: HTMLElement;
    load: HTMLElement;
  };
};
export interface canvasPaintingApi {
  //获取内部选中那个工具
  getSetTool?: (currentTool: string | null) => void;
}
let customToolMark = "currentAction";
export function canvasPainting(
  canvasContainer: HTMLCanvasElement,
  toolsOption: toolsOption,
  config: {
    paintingApi?: canvasPaintingApi;
    option?: CanvasPaintingThis["_option"];
  }
) {
  // @ts-ignore
  const self = this as CanvasPaintingThis;
  self._canvas = canvasContainer;
  self._option = {
    rectFileStyle: "#ffffff00", //矩形颜色
    lineWidth: 2, //边框大小
    strokeStyle: "#000", //边框颜色
    fontSize: "12", //字体大小
    fillStyle: "red", //字体颜色
    canvasAttribute: {
      //canvas 属性
      width: 600,
      height: 400,
    },
    currentTool: null, // 默认工具状态
    ...config.option,
  };
  const { paintingApi } = config;
  const { _option, _canvas: canvas } = self as any;
  const { width, height } = _option.canvasAttribute;
  let { tools, drawTools } = toolsOption;
  let ctx = canvas.getContext("2d", {
    // alpha: false,
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  canvas.width = width;
  canvas.height = height;
  let drawings: ImageData[] = [];
  let textInput: HTMLElement | null = null;
  let textPosition = {
    x: 0,
    y: 0,
  };
  let startX = 0,
    startY = 0;
  let isDrawing = false;
  let currentStep = -1;

  function initTextInput() {
    const inputEl = document.querySelector("#annotation-text-input-dom");
    if (inputEl) return (textInput = inputEl as HTMLElement);
    textInput = document.createElement("div");
    textInput.style.display = "none";
    var contenteditable = document.createAttribute("contenteditable");
    contenteditable.value = "true";
    textInput.setAttributeNode(contenteditable);
    textInput.style.position = "absolute";
    textInput.style.lineHeight = "1.4";
    textInput.style.background = "#ffffff0d";
    textInput.style.minWidth = "20px";
    textInput.style.width = "fit-content";
    textInput.style.borderRadius = "4px";
    textInput.style.fontFamily = "Arial";
    textInput.style.outline = "none";
    textInput.style.minHeight = "14px";
    textInput.setAttribute("id", "annotation-text-input-dom");
    document.body.appendChild(textInput);
  }
  function closeTextInput() {
    if (textInput) {
      textInput.parentElement?.removeChild(textInput);
      textInput = null;
    }
  }
  function ininCanvas() {
    closeCnavasText();
    ctx.fillStyle = "rgba(16, 185, 129, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawings = [];
    currentStep = -1;
    saveDrawing();
  }
  function finishTextInput() {
    if (!textInput?.textContent?.trim()) return;
    ctx.font = `${_option.fontSize}px Arial`;
    ctx.fillStyle = _option.fillStyle;
    const scale = _option.fontSize / 16;
    ctx.fillText(
      textInput.textContent,
      textPosition.x,
      //@ts-ignore
      textPosition.y + _option.fontSize * 1.4 - 5.5 * scale
    );
    saveDrawing();
  }
  //获得按下坐标轴
  // mousedown
  function onStartDrawing(e: MouseEvent) {
    if (_option.currentTool === "text") {
      finishTextInput();
      // 修复文本标注点击位置问题
      const rect = canvas?.getBoundingClientRect() as any;
      textPosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
      if (textInput) {
        textInput.style.left = rect.x + e.offsetX + "px";
        textInput.style.top = rect.y + e.offsetY + "px";
        textInput.style.display = "block";
        textInput.style.border = `1px dashed ${_option.fillStyle}`;
        textInput.style.color = `${_option.fillStyle}`;
        textInput.style.fontSize = `${_option?.fontSize}px`;
        textInput.textContent = "";
      }

      return;
    }
    startX = e.offsetX as number;
    startY = e.offsetY as number;
    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    isDrawing = true;
    if (_option.currentTool === "free") {
      saveDrawing();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    }
  }
  // 恢复画布到指定步骤
  function restoreCanvas() {
    const imageData = drawings[currentStep];
    ctx.putImageData(imageData, 0, 0);
  }
  //保存函数
  function saveDrawing() {
    // 如果当前不是最后一步，则删除后面的步骤
    if (currentStep < drawings.length - 1) {
      drawings = drawings.slice(0, currentStep + 1);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawings.push(imageData as ImageData);
    currentStep++;
  }
  //三角绘制
  function onTriangle(x: number, y: number) {
    if (!startX || !startY) return;
    // 描边三角形
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.lineTo(startX * 2 - x, y);
    ctx.closePath();
    ctx.stroke();
    onFill();
  }
  //箭头
  function onArrow(x: number, y: number) {
    if (!startX || !startY) return;
    const headLength = 15;
    const angle = Math.atan2(y - startY, x - startX);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.lineTo(
      x - headLength * Math.cos(angle - Math.PI / 6),
      y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - headLength * Math.cos(angle + Math.PI / 6),
      y - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
  }
  //撤销
  function onUndo() {
    closeCnavasText();
    if (currentStep <= 0) {
      return ininCanvas();
    }
    currentStep--;
    restoreCanvas();
  }
  //渲染矩形颜色
  function onFill() {
    _option.rectFileStyle && ctx.fill();
  }
  //绘画过程
  function onDraw(e: MouseEvent) {
    if (!isDrawing || _option.currentTool === "text") return;
    let x = e.offsetX;
    let y = e.offsetY;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (_option.rectFileStyle) ctx.fillStyle = _option.rectFileStyle;
    if (_option.strokeStyle) ctx.strokeStyle = _option.strokeStyle;
    if (_option.lineWidth) ctx.lineWidth = _option.lineWidth;

    // 先恢复上一步状态
    if (currentStep >= 0) {
      ctx.putImageData(drawings[currentStep], 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    switch (_option.currentTool) {
      case "free":
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case "rect":
        ctx.beginPath();
        ctx.rect(startX, startY, x - startX, y - startY);
        ctx.stroke();
        onFill();
        break;

      case "circle":
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
        );
        ctx.arc(startX, startY, radius, 0, Math.PI * 2, true); // 绘制
        ctx.stroke();
        onFill();
        break;

      case "triangle":
        onTriangle(x, y);
        break;
      case "arrow":
        onArrow(x, y);
        break;
    }
  }
  function endDraw() {
    if (isDrawing && _option.currentTool !== "text") {
      isDrawing = false;
      saveDrawing();
    } else if (_option.currentTool === "text") {
      textInput && textInput.focus();
    }
  }
  function setTool(key: string, customSetToolVisible = true) {
    _option.currentTool = key;
    if (customSetToolVisible) {
      // //@ts-ignore
      const dom = drawTools[key] as HTMLElement;
      drawTools &&
        Object.keys(drawTools).forEach((key) => {
          //@ts-ignore
          const targetDom = drawTools[key] as HTMLElement;
          targetDom && targetDom?.classList?.remove("action-btn");
          targetDom && targetDom?.removeAttribute(customToolMark);
        });
      dom && dom.classList.add("action-btn");
      dom && dom?.setAttribute(customToolMark, "true");
      paintingApi?.getSetTool && paintingApi?.getSetTool(_option.currentTool);
    }

    closeCnavasText();
  }
  // 清除保存画布文字
  function closeCnavasText() {
    if (_option.currentTool !== "text" && textInput) {
      finishTextInput();
      textInput.style.display = "none";
    }
  }
  //加载图片
  function onLoad() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      //@ts-ignore
      const file = e?.target?.files[0] as any;
      if (!file) return;
      let reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          saveDrawing();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveDrawing();
        };
        img.src = event?.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  //保存
  function onSave() {
    const url = canvas.toDataURL("image/webp");
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_painting.png";
    a.style.display = "none";
    a.click();
    closeCnavasText();
  }
  // 内部更新 tool 状态
  function setCurrentTool(key?: string | null) {
    //@ts-ignore
    if (key && constDrawToolType[key]) {
      setTool(key, false);
      return key;
    }
    let mark = null;
    Object.keys(drawTools).forEach((key) => {
      //@ts-ignore
      const dom = drawTools[key];
      dom && dom.getAttribute(customToolMark) && setTool(key) && (mark = key);
    });
    return mark;
  }
  //初始化保存事件
  function onInitMethods() {
    drawTools &&
      Object.keys(drawTools).forEach((key) => {
        if (key === _option.currentTool) setTool(key);
        //@ts-ignore
        drawTools[key].addEventListener("click", () => setTool(key));
        //@ts-ignore
        drawTools[key] && drawTools[key]?.setAttribute("actionType", key);
      });
    canvas.addEventListener("mousedown", onStartDrawing);
    canvas.addEventListener("mousemove", onDraw);
    canvas.addEventListener("mouseout", endDraw);
    canvas.addEventListener("mouseup", endDraw);
    tools?.undo && tools.undo.addEventListener("click", onUndo);
    tools?.clear && tools.clear.addEventListener("click", ininCanvas);
    tools?.save && tools.save.addEventListener("click", onSave);
    tools?.load && tools.load.addEventListener("click", onLoad);
  }
  //卸载绑定事件
  function onUnMethods() {
    drawTools &&
      Object.keys(drawTools).forEach((key) => {
        //@ts-ignore
        drawTools[key].removeEventListener("click", () => setTool(key));
      });
    canvas.removeEventListener("mousedown", onStartDrawing);
    canvas.removeEventListener("mousemove", onDraw);
    canvas.removeEventListener("mouseout", endDraw);
    canvas.removeEventListener("mouseup", endDraw);
    tools?.undo && tools.undo.removeEventListener("click", onUndo);
    tools?.clear && tools.clear.removeEventListener("click", ininCanvas);
    tools?.save && tools.save.removeEventListener("click", onSave);
    tools?.load && tools.load.removeEventListener("click", onLoad);
  }
  function onResetCanvas(option: { width: number; height: number }) {
    const { width, height } = option;
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d", {
      // alpha: false,
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
  }
  function initCanvas(canvasEl: HTMLCanvasElement) {
    self._canvas = canvasEl;
    ctx = canvas.getContext("2d", {
      // alpha: false,
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    canvas.width = width;
    canvas.height = height;
  }
  self._methods = {
    onUnMethods, //卸载绑定方法
    onSave,
    initCanvas,
    onInitMethods,
    restoreCanvas,
    onResetCanvas,
    setCurrentTool,
    closeTextInput,
    initTextInput,
  };

  //初始化调用
  initTextInput();
  ininCanvas();
  onInitMethods();
}

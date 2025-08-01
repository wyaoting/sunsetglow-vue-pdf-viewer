// export
import { colorList } from "../define";
import { showMenu, type MenuOptions } from "./dynamicMenu";
export interface graphicsItem {
  x: number;
  y: number;
  w: number;
  h: number;
  graphicsSizeId: string; //自定义id 用来区分
  isSelect: boolean; //是否选中
  color: string;
  el?: HTMLElement; //元素dom
  customOption?: any; //自定义参数
  onCustomDraw?: (params: { color: string; [key: string]: any }) => void; //自定义执行参数
}
export enum EnumRadiusType {
  leftTop, //左上
  leftCenter, //左居中
  leftBottom, //左下
  topCenter, //顶部中间
  rightTop, //右上
  rightCenter, //右居中
  rightBottom, //右下
  bottomCenter, //底部中间
}
function render(
  tag: string,
  attributes: { [key: string]: any },
  children: Element | string
) {
  const element = document.createElement(tag);

  // 设置属性
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }

  // 添加子元素
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    } else if (typeof children === "string") {
      element.textContent = children;
    } else {
      element.appendChild(children);
    }
  }

  return element;
}

export const engineeringCreatedDom = (option: {
  w?: string;
  h?: string;
  x: string;
  y: string;
  borderColor?: string;
  type?: EnumRadiusType;
  background?: string;
  borderRadius?: string;
}): HTMLElement => {
  const {
    w = "10px",
    h = "10px",
    x,
    y,
    borderColor,
    background = "transparent",
    type,
    borderRadius,
  } = option;

  const dom = document.createElement("div");
  if (!dom) return dom;
  dom.style.position = "absolute";
  dom.style.left = x;
  dom.style.top = y;
  background && (dom.style.background = background);
  dom.style.height = h;
  dom.style.width = w;
  dom.style.cursor = "pointer";
  borderColor && (dom.style.border = `1px solid ${borderColor}`);
  borderRadius && (dom.style.borderRadius = borderRadius);
  if (type) dom.setAttribute("custom-radius-engineering-id", `${type}`);

  return dom;
};
export let selectKey = "_annotation-select-template";
export let selectDomList: HTMLDivElement[] = [];
export const closeAnnotationSelectTemplate = (parent: HTMLElement) => {
  if (!parent) return;
  const el = selectDomList[0];
  el && el?.style?.opacity !== "0" && (el.style.opacity = "0");
  if (selectDomList.length) return;
  const dom = parent.querySelectorAll(`.${selectKey}`);
  for (let i = 0; i < dom.length; i++) {
    const el = dom[i] as HTMLDivElement;
    el && el.style?.opacity !== "0" && (el.style.opacity = "0");
  }
};
/**
 * 选中类
 * 负责选中绘画在canvas 上的内容进行颜色变更，删除绘画，拉伸变形等功能
 */
export class SelectGraphics {
  graphicsList: graphicsItem[]; //存储选中内容
  parentCtx: CanvasRenderingContext2D;
  color: string;
  isPotion: boolean; //是否绘画
  currentIndex: string; //当前选中
  appIndex: number;
  initialPageImageData: ImageData; //初始page 页面 imageData
  constructor(
    color: string,
    ctx: CanvasRenderingContext2D,
    isPotion: boolean,
    appIndex: number,
    initialPageImageData: ImageData
  ) {
    this.color = color;
    this.graphicsList = [];
    this.isPotion = isPotion;
    this.currentIndex = "";
    this.appIndex = appIndex;
    this.parentCtx = ctx;
    this.initialPageImageData = initialPageImageData;
  }
  getSelectGraphics() {
    return this.graphicsList.find(
      (v) => v.graphicsSizeId === this.currentIndex
    );
  }
  //图形边框绘画
  // graphicsDraw() {
  //   // if (true) return;
  //   if (!this.getSelectGraphics()) return;
  //   const { x, y, w, h } = this.getSelectGraphics() as graphicsItem;
  //   this.parentCtx.beginPath();
  //   this.parentCtx.lineWidth = 2;
  //   this.parentCtx.strokeStyle = this.color;
  //   this.parentCtx.strokeRect(x, y, w, h);
  //   if (!this.isPotion) return;
  //   const points = this.getControlPoints();
  //   this.parentCtx.fillStyle = "white";
  //   this.parentCtx.lineWidth = 1;
  //   points.forEach((point) => {
  //     this.parentCtx.beginPath();
  //     this.parentCtx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  //     this.parentCtx.fill();
  //     this.parentCtx.stroke();
  //   });
  // }
  //创建选择菜单
  newMenuGraphics(option: { el: HTMLElement; x: number; y: number }) {
    const { el, x, y } = option;
    if (!el) return;
    const options: MenuOptions = {
      parentSelector: el,
      position: {
        top: `calc( ${y} / var(--draw-scale-factor) * 1px)`,
        left: `calc( ${x} / var(--draw-scale-factor) * 1px)`,
      },
      initialColor: colorList[0].color, // 红色
      onColorChange: (color: string) => {
        // 可以在这里更新应用的主题颜色
        this.parentCtx?.putImageData(this.initialPageImageData, 0, 0);
        this.graphicsList.forEach((item) => {
          item.graphicsSizeId === this.currentIndex &&
            (item.customOption.options.color = color);
          item.onCustomDraw &&
            item.onCustomDraw({
              color: item.customOption.options.color,
              rects: item.customOption.rects,
              options: item.customOption.options,
              canvasRect: item.customOption.canvasRect,
              ...(item.graphicsSizeId === this.currentIndex && {
                color: color,
              }),
            });
        });
      },
      onDelete: () => {
        this.parentCtx?.putImageData(this.initialPageImageData, 0, 0);
        const list = [] as graphicsItem[];
        this.graphicsList.forEach((item) => {
          if (item.graphicsSizeId !== this.currentIndex) {
            item.onCustomDraw &&
              item.onCustomDraw({
                color: item.customOption.options.color,
                rects: item.customOption.rects,
                options: item.customOption.options,
                canvasRect: item.customOption.canvasRect,
              });
            list.push(item);
          } else {
            item.el?.parentNode?.removeChild(item.el);
          }
        });
        this.graphicsList = list;
      },
      onClose: () => {
        console.log("Menu closed");
      },
    };

    showMenu(options, (dom: HTMLElement) => {
      dom && (dom.style.transform = `translateX( -50%)`);
    });
  }
  graphicsDomCreated(option: {
    w: number;
    h: number;
    x: number;
    y: number;
    zIndex: string;
    selectGraphicsIndex: string; //当前页面选中框
    parentEl?: HTMLElement;
    scale: number;
  }) {
    const { w, h, x, y, zIndex, selectGraphicsIndex, scale } = option;
    const dom = engineeringCreatedDom({
      w: `calc( ${w}px / var(--draw-scale-factor))`,
      h: `calc( ${h}px / var(--draw-scale-factor))`,
      x: `calc( ${x}px / var(--draw-scale-factor))`,
      y: `calc( ${y}px / var(--draw-scale-factor))`,
      borderRadius: "6px",
    });
    if (!dom) return;
    dom.style.zIndex = zIndex;
    // dom.style.setProperty("--draw-scale-factor", `${scale}`);
    dom.setAttribute("id", `annotation-select-${this.appIndex}`);
    dom.setAttribute("class", selectKey);

    dom.style.border = `2px solid ${this.color}`;
    // dom.setAttribute("canvas-graphics", `${JSON.stringify({ x, y, w, h })}`);
    dom.setAttribute("canvas-graphics-id", `${selectGraphicsIndex}`);
    const parent = option?.parentEl;
    if (parent) {
      parent.appendChild(dom);
      parent.style.setProperty("--draw-scale-factor", `${scale}`);
    }
    this.getFrameSelectData(0, 0, w, h)?.forEach((element) => {
      const radiusDom = engineeringCreatedDom({
        x: `calc( ${element.x} / var(--draw-scale-factor) * 1px)`,
        y: `calc( ${element.y} / var(--draw-scale-factor) * 1px)`,
        type: element.dir,
        borderRadius: "50%",
        borderColor: this.color,
        background: "#fff",
      });
      if (radiusDom) {
        radiusDom.style.transform = `translate(-50%, -50%)`;
        radiusDom.style.zIndex = `${zIndex + 3}`;
        radiusDom.style.cursor = `${element.cursor}`;
        dom.appendChild(radiusDom);
      }
    });
    dom.addEventListener("click", () =>
      this.onClick(dom as HTMLDivElement, selectGraphicsIndex)
    );
    this.newMenuGraphics({
      x: w * 0.5,
      y: h + 10,
      el: dom as HTMLElement,
    });
    return dom;
  }
  closeSelect(isAll = false) {
    if (isAll) {
      const dom = document.querySelectorAll(
        `#annotation-select-${this.appIndex}`
      );
      for (let i = 0; i < dom.length; i++) {
        const el = dom[i] as HTMLDivElement;
        el && (el.style.opacity = "0");
      }
    } else {
      for (let i = 0; i < this.graphicsList.length; i++) {
        if (!this.graphicsList[i]) return;
        this.graphicsList[i].isSelect = false;
        const el = this.graphicsList[i]?.el as HTMLDivElement;
        el && (el.style.opacity = "0");
      }
    }
  }
  restoreCanvas() {
    this.parentCtx?.putImageData(this.initialPageImageData, 0, 0);
    this.graphicsList.forEach((item) => {
      item.onCustomDraw &&
        item.onCustomDraw({
          color: item.customOption.options.color,
          rects: item.customOption.rects,
          options: item.customOption.options,
          canvasRect: item.customOption.canvasRect,
        });
    });
  }
  onClick(dom: HTMLDivElement, selectGraphicsIndex: string) {
    this.closeSelect(true);
    dom.style.opacity = "1";
    this.currentIndex = selectGraphicsIndex;
    selectDomList = [dom];
  }
  //dom 实现选中框
  getFrameSelectData(x = 0, y = 0, width: number, height: number) {
    return [
      // 四个角
      { x: x, y: y, dir: EnumRadiusType.leftTop, cursor: "nwse-resize" },
      { x: x + width, y, dir: EnumRadiusType.rightTop, cursor: "nesw-resize" },
      {
        x: x + width,
        y: y + height,
        dir: EnumRadiusType.rightBottom,
        cursor: "nwse-resize",
      },
      {
        x: x,
        y: y + height,
        dir: EnumRadiusType.leftBottom,
        cursor: "nesw-resize",
      },

      // 四条边中点
      {
        x: x + width / 2,
        y: y,
        dir: EnumRadiusType.topCenter,
        cursor: "ns-resize",
      },
      {
        x: x + width,
        y: y + height / 2,
        dir: EnumRadiusType.rightCenter, //右居中
        cursor: "ew-resize",
      },
      {
        x: x + width / 2,
        y: y + height,
        dir: EnumRadiusType.bottomCenter,
        cursor: "ns-resize",
      },
      {
        x: x,
        y: y + height / 2,
        cursor: "ew-resize",
        dir: EnumRadiusType.leftCenter, //左居中
      },
    ];
  }
  //   //canvas 实现选中框
  //   getControlPoints() {
  //     if (!this.getSelectGraphics()) return [];
  //     const {
  //       x,
  //       y,
  //       w: width,
  //       h: height,
  //     } = this.getSelectGraphics() as graphicsItem;
  //     return [
  //       // 四个角
  //       { x, y, dir: "nw" },
  //       { x: x + width, y, dir: "ne" },
  //       { x: x + width, y: y + height, dir: "se" },
  //       { x: x, y: y + height, dir: "sw" },

  //       // 四条边中点
  //       { x: x + width / 2, y: y, dir: "n" },
  //       { x: x + width, y: y + height / 2, dir: "e" },
  //       { x: x + width / 2, y: y + height, dir: "s" },
  //       { x: x, y: y + height / 2, dir: "w" },
  //     ];
  //   }
}

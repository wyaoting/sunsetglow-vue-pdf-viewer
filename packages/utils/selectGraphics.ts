// export
import { createApp, h, ref } from "vue";
import { colorList } from "../define";
export interface graphicsItem {
  x: number;
  y: number;
  w: number;
  h: number;
  isSelect: boolean; //是否选中
  color: string;
  el?: HTMLElement; //元素dom
  customOption?: any; //自定义参数
  onCustomDraw?: () => void; //自定义执行参数
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
function onSwitchColor() {}
export const engineeringCreatedDom = (
  option: {
    w?: string;
    h?: string;
    x: number;
    y: number;
    borderColor?: string;
    type?: EnumRadiusType;
    background?: string;
    borderRadius?: string;
  },
  call?: Function
) => {
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
  if (!dom) return;
  dom.style.position = "absolute";
  dom.style.left = `${x}px`;
  dom.style.top = `${y}px`;
  background && (dom.style.background = background);
  dom.style.height = h;
  dom.style.width = w;
  dom.style.cursor = "pointer";
  borderColor && (dom.style.border = `1px solid ${borderColor}`);
  borderRadius && (dom.style.borderRadius = borderRadius);
  if (type) dom.setAttribute("custom-radius-engineering-id", `${type}`);

  call && call(dom);
  return dom;
};
export class SelectGraphics {
  graphicsList: graphicsItem[];
  parentCtx: CanvasRenderingContext2D;
  color: string;
  isPotion: boolean; //是否绘画
  cuurentIndex: number; //当前选中
  appIndex: number;
  constructor(
    color: string,
    ctx: CanvasRenderingContext2D,
    isPotion: boolean,
    appIndex: number
  ) {
    this.color = color;
    this.graphicsList = [];
    this.isPotion = isPotion;
    this.cuurentIndex = 0;
    this.appIndex = appIndex;
    this.parentCtx = ctx;
  }
  getSelectGraphics() {
    return this.graphicsList[this.cuurentIndex];
  }
  //图形边框绘画
  graphicsDraw() {
    // if (true) return;
    if (!this.getSelectGraphics()) return;
    const { x, y, w, h } = this.getSelectGraphics();
    this.parentCtx.beginPath();
    this.parentCtx.lineWidth = 2;
    this.parentCtx.strokeStyle = this.color;
    this.parentCtx.strokeRect(x, y, w, h);
    if (!this.isPotion) return;
    const points = this.getControlPoints();
    this.parentCtx.fillStyle = "white";
    this.parentCtx.lineWidth = 1;
    points.forEach((point) => {
      this.parentCtx.beginPath();
      this.parentCtx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      this.parentCtx.fill();
      this.parentCtx.stroke();
    });
  }
  //创建选择菜单
  graphicsMenuCreated(
    option: {
      w: number;
      h: number;
      x: number;
      y: number;
    },
    call?: Function
  ) {
    const { w, h } = option;
    const parentContainer = engineeringCreatedDom({
      w: "fit-content",
      h: "fit-content",
      borderRadius: "10px",
      x: w / 2,
      y: h + 4,
      background: "#f6ffed",
      borderColor: "#b7eb8f",
    });
    if (parentContainer) {
      parentContainer.style.padding = "8px";
      parentContainer.style.display = "flex";
      parentContainer.style.gap = "0px 20px";
      parentContainer.appendChild(render("button", {}, "删除"));
      parentContainer.appendChild(render("button", {}, "颜色变更"));
      parentContainer.style.transform = `translateX(-50%)`;
    }
    call && call();
    return parentContainer;
  }
  graphicsDomCreated(
    option: {
      w: number;
      h: number;
      x: number;
      y: number;
      zIndex: string;
      selectGraphicsIndex: number; //当前页面选中框
      parentEl?: HTMLElement;
    },
    call?: Function
  ) {
    const { w, h, x, y, zIndex, selectGraphicsIndex } = option;
    return engineeringCreatedDom(
      {
        w: w + "px",
        h: h + "px",
        x,
        y,
        borderRadius: "6px",
      },
      (dom: HTMLElement) => {
        if (!dom) return;
        dom.style.zIndex = zIndex;
        dom.setAttribute("id", `annotation-select-${this.appIndex}`);
        dom.style.border = `2px solid ${this.color}`;
        dom.setAttribute(
          "canvas-graphics",
          `${JSON.stringify({ x, y, w, h })}`
        );
        dom.setAttribute("canvas-graphics-id", `${selectGraphicsIndex}`);
        const parent = option?.parentEl;
        if (parent) parent.appendChild(dom);
        this.getFrameSelectData(0, 0, w, h)?.forEach((element) => {
          const radiusDom = engineeringCreatedDom({
            x: element.x,
            y: element.y,
            type: element.dir,
            borderRadius: "50%",
            borderColor: this.color,
            background: "#fff",
          });
          radiusDom && (radiusDom.style.transform = `translate(-50%, -50%)`);
          radiusDom && (radiusDom.style.zIndex = `${zIndex + 3}`);
          radiusDom && (radiusDom.style.cursor = `${element.cursor}`);

          radiusDom && dom.appendChild(radiusDom);
        });
        dom.addEventListener("click", () => this.onClick(dom));
        let menu = this.graphicsMenuCreated({ w, h }) as HTMLDivElement;
        dom.appendChild(menu);
        call && call(dom);

        return dom;
      }
    );
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
        const el = this.graphicsList[i].el as HTMLDivElement;
        el && (el.style.opacity = "0");
      }
    }
  }
  onClick(dom: HTMLElement) {
    this.closeSelect(true);
    dom.style.opacity = "1";
  }
  getFrameSelectData(x = 0, y = 0, width: number, height: number) {
    // if (!this.selectGraphics) return [];
    // const { x, y, w: width, h: height } = this.selectGraphics;
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
  getControlPoints() {
    if (!this.getSelectGraphics()) return [];
    const { x, y, w: width, h: height } = this.getSelectGraphics();
    return [
      // 四个角
      { x, y, dir: "nw" },
      { x: x + width, y, dir: "ne" },
      { x: x + width, y: y + height, dir: "se" },
      { x: x, y: y + height, dir: "sw" },

      // 四条边中点
      { x: x + width / 2, y: y, dir: "n" },
      { x: x + width, y: y + height / 2, dir: "e" },
      { x: x + width / 2, y: y + height, dir: "s" },
      { x: x, y: y + height / 2, dir: "w" },
    ];
  }
}

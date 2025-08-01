import { createApp, App } from "vue";
import MenuComponent from "../components/menu.vue";

// 定义菜单选项类型
interface MenuOptions {
  parentSelector?: HTMLElement;
  position?: {
    top: string;
    left: string;
  };
  initialColor?: string;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

// 定义返回的菜单控制对象类型
interface MenuInstance {
  unmount: () => void;
  setPosition: (position: { top: string; left: string }) => void;
}

export function showMenu(
  options: MenuOptions = {},
  fun?: Function
): MenuInstance | null {
  // 解构选项并提供默认值
  const {
    parentSelector = document.querySelector("body"),
    position = { top: "0", left: "0" },
    initialColor = "#3b82f6",
    onColorChange = () => {},
    onDelete = () => {},
    onClose = () => {},
  } = options;

  // 创建容器元素
  const container: HTMLDivElement = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = position.top;
  container.style.left = position.left;
  container.style.zIndex = "1000";

  // 查找父元素
  const parent: HTMLElement | null = parentSelector;
  if (!parent) {
    console.error(`Parent element "${parentSelector}" not found`);
    return null;
  }
  parent.appendChild(container);

  // 创建Vue应用实例
  let app: App<Element>;
  try {
    app = createApp(MenuComponent, {
      initialColor,
      onColorChange: (color: string) => {
        onColorChange(color);
      },
      onDelete: () => {
        onDelete();
      },
      onClose: () => {
        unmount();
        onClose();
      },
    });

    // 挂载到容器
    app.mount(container);
    fun && fun(container);
  } catch (error) {
    console.error("Failed to create menu:", error);
    parent.removeChild(container);
    return null;
  }

  // 卸载函数
  const unmount = (): void => {
    app.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // 设置位置函数
  const setPosition = (newPosition: { top: string; left: string }): void => {
    container.style.top = newPosition.top;
    container.style.left = newPosition.left;
  };

  return {
    unmount,
    setPosition,
  };
}

// 导出类型
export type { MenuOptions, MenuInstance };

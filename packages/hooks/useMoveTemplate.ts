import { ref, onUnmounted } from "vue";
export const useToolMove = (option: {
  elName: string; //拖拽元素类名
  matchClass?: string; //拖拽元素DOM
}) => {
  let moveOption = ref({
    x: 0,
    visible: false,
    startPageX: 0,
    startPageY: 0,
    y: 0,
  });
  let observer: MutationObserver | null = null;
  let position = {
    pageX: 0,
    pageY: 0,
  };
  let el: null | HTMLElement = null;

  function getPagePosition(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return {
      pageX: rect.left + window.scrollX,
      pageY: rect.top + window.scrollY,
    };
  }

  // 按下事件
  const onMousedown = (event: MouseEvent) => {
    //@ts-ignore
    if (option.matchClass && event?.target?.classList[0] !== option.matchClass)
      return;
    moveOption.value.visible = true;
    event.preventDefault();
    if (el) position = getPagePosition(el);
    moveOption.value.startPageX = event.pageX;
    moveOption.value.startPageY = event.pageY;
  };

  //鼠标移动
  const onMousemove = (event: MouseEvent) => {
    if (!moveOption.value.visible) return;
    if (el?.style) {
      moveOption.value.x =
        position.pageX + event.pageX - moveOption.value.startPageX;
      moveOption.value.y =
        position.pageY + event.pageY - moveOption.value.startPageY;
      const { x, y } = moveOption.value;
      el.style.setProperty("left", x + "px", "important");
      el.style.setProperty("top", y + "px", "important");
    }
  };
  // 监听元素是否被移除
  const setupElementObserver = () => {
    if (!el || !el.parentNode) return;

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const removedNodes = Array.from(mutation.removedNodes);
        if (removedNodes.includes(el!)) {
          removeElement(); // 元素被移除时自动解绑
        }
      });
    });

    observer.observe(el.parentNode, { childList: true });
  };
  const onMouseup = () => {
    moveOption.value.visible = false;
    position.pageX = 0;
    position.pageY = 0;
  };
  const onClick = () => {
    const { x, y } = moveOption.value;
    const dom = el;
    if (dom?.style && (x || y)) {
      dom.style.setProperty("left", x + "px", "important");
      dom.style.setProperty("top", y + "px", "important");
    }
  };
  const initElement = () => {
    el = document.querySelector(option.elName) as HTMLElement;
    el && el?.addEventListener("mousedown", onMousedown);
    el && el?.addEventListener("click", onClick);
    window?.addEventListener("mousemove", onMousemove);
    window?.addEventListener("mouseup", onMouseup);
    setupElementObserver(); // 监听元素销毁
  };
  const removeElement = () => {
    el && el?.removeEventListener("mousedown", onMousedown);
    window?.removeEventListener("mousemove", onMousedown);
    window?.removeEventListener("mouseup", onMouseup);
    el && el?.removeEventListener("click", onClick);
    moveOption.value = {
      x: 0,
      visible: false,
      startPageX: 0,
      startPageY: 0,
      y: 0,
    };
    el = null;
  };
  // 组件卸载时清理
  onUnmounted(removeElement);
  return { removeElement, initElement, moveOption };
};

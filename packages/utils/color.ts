/**
 * 为颜色添加透明度
 * @param color - 颜色值，支持hex、rgb、rgba或颜色名称
 * @param opacity - 透明度，0-1之间的数字
 * @returns 返回rgba颜色字符串
 */
export function addOpacityToColor(color: string, opacity: number): string {
  // 确保透明度在0-1之间
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  // 创建临时div元素来解析颜色
  const tempDiv = document.createElement("div");
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);

  try {
    // 获取计算后的rgb值
    const computedColor = window.getComputedStyle(tempDiv).color;

    // 解析rgb/rgba值
    const rgbaMatch = computedColor.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i
    );

    if (rgbaMatch) {
      const r = rgbaMatch[1];
      const g = rgbaMatch[2];
      const b = rgbaMatch[3];
      return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
    }

    return color;
  } finally {
    document.body.removeChild(tempDiv);
  }
}

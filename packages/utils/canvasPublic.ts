export const canvasAnnotationSelectMap = new Map();

export const getCanvasAnnotationData = (index: number) => {
  return (
    (canvasAnnotationSelectMap.has(index) &&
      canvasAnnotationSelectMap.get(index)) ||
    []
  );
};

export const setCanvasAnnotationData = (
  index: number,
  canvas: HTMLCanvasElement
) => {
  let ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: false,
  }) as CanvasRenderingContext2D;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvasAnnotationSelectMap.set(index, [
    ...(canvasAnnotationSelectMap.get(index) || []),
    imageData,
  ]);
};

export const restoreCanvasAnnotationData = (
  index: number,
  canvas: HTMLCanvasElement
) => {
  const data = getCanvasAnnotationData(index).at(-1);
  if (data) {
    let ctx = canvas.getContext("2d", {
      willReadFrequently: false,
      alpha: false,
    }) as CanvasRenderingContext2D;
    ctx.putImageData(data, 0, 0);
  }
};

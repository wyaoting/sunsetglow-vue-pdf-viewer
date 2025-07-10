export let canvasAnnotationSelectMap = new Map();

export const getCanvasAnnotationData = (index: number | string) => {
  return (
    (canvasAnnotationSelectMap.has(+index) &&
      canvasAnnotationSelectMap.get(+index)) ||
    []
  );
};

export const setCanvasAnnotationData = (
  index: number | string,
  canvas: HTMLCanvasElement,
  imageData?: ImageData
) => {
  let ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: false,
  }) as CanvasRenderingContext2D;
  const data = imageData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvasAnnotationSelectMap.set(+index, [
    ...(canvasAnnotationSelectMap.get(+index) || []),
    data,
  ]);
};

export const restoreCanvasAnnotationData = (
  index: number | string,
  canvas: HTMLCanvasElement
) => {
  const data = getCanvasAnnotationData(+index).at(-1);
  if (data) {
    let ctx = canvas.getContext("2d", {
      willReadFrequently: false,
      alpha: false,
    }) as CanvasRenderingContext2D;
    console.log(canvas, "canvas", ctx);
    ctx?.putImageData(data, 0, 0);
  }
};

export const closeCanvasAnnotationData = () => {
  canvasAnnotationSelectMap = new Map();
};

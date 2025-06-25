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
  canvas: HTMLCanvasElement
) => {
  console.log(canvasAnnotationSelectMap, "canvasAnnotationSelectMap");
  let ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: false,
  }) as CanvasRenderingContext2D;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvasAnnotationSelectMap.set(+index, [
    ...(canvasAnnotationSelectMap.get(+index) || []),
    imageData,
  ]);
};

export const restoreCanvasAnnotationData = (
  index: number | string,
  canvas: HTMLCanvasElement
) => {
  const data = getCanvasAnnotationData(+index).at(-1);
  console.log(data, "data", canvasAnnotationSelectMap, index);
  if (data) {
    let ctx = canvas.getContext("2d", {
      willReadFrequently: false,
      alpha: false,
    }) as CanvasRenderingContext2D;
    ctx.putImageData(data, 0, 0);
  }
};

export const closeCanvasAnnotationData = () => {
  canvasAnnotationSelectMap = new Map();
};

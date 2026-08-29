// Paper.js needs a 2D canvas during module initialization in browser-like tests.
// Happy DOM intentionally does not implement CanvasRenderingContext2D, so provide
// the rendering surface only; application geometry and Paper.js remain real.
if (typeof HTMLCanvasElement !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const contexts = new WeakMap<HTMLCanvasElement, ReturnType<typeof createCanvas2DContext>>();

  function createCanvas2DContext(canvas: HTMLCanvasElement) {
    const gradient = () => ({ addColorStop: (_offset: number, _color: string) => undefined });
    const pattern = () => ({ setTransform: (_transform?: unknown) => undefined });
    const noop = () => undefined;
    const context = {
      canvas,
      save: noop,
      restore: noop,
      beginPath: noop,
      closePath: noop,
      moveTo: noop,
      lineTo: noop,
      bezierCurveTo: noop,
      quadraticCurveTo: noop,
      arc: noop,
      arcTo: noop,
      ellipse: noop,
      rect: noop,
      roundRect: noop,
      clip: noop,
      fill: noop,
      stroke: noop,
      clearRect: noop,
      fillRect: noop,
      strokeRect: noop,
      fillText: noop,
      strokeText: noop,
      translate: noop,
      scale: noop,
      rotate: noop,
      transform: noop,
      setTransform: noop,
      resetTransform: noop,
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, is2D: true }),
      drawImage: noop,
      putImageData: noop,
      setLineDash: noop,
      getLineDash: () => [] as number[],
      isPointInPath: () => false,
      isPointInStroke: () => false,
      measureText: (text: string) => ({ width: text.length * 6 }),
      createLinearGradient: gradient,
      createRadialGradient: gradient,
      createConicGradient: gradient,
      createPattern: pattern,
      createImageData: (widthOrSource: number | { width: number; height: number }, requestedHeight?: number) => {
        const width = typeof widthOrSource === 'number' ? widthOrSource : widthOrSource.width;
        const height = typeof widthOrSource === 'number' ? requestedHeight ?? 0 : widthOrSource.height;
        return { width, height, data: new Uint8ClampedArray(Math.max(0, width * height * 4)) };
      },
      getImageData: (_x: number, _y: number, width: number, height: number) => ({ width, height, data: new Uint8ClampedArray(Math.max(0, width * height * 4)) }),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      filter: 'none',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
      lineCap: 'butt',
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 1,
      miterLimit: 10,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      direction: 'inherit',
      font: '10px sans-serif',
      fontKerning: 'auto',
      textAlign: 'start',
      textBaseline: 'alphabetic'
    };
    return context;
  }

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: function getContext(this: HTMLCanvasElement, contextId: string, ...options: unknown[]) {
      if (contextId !== '2d') return originalGetContext.call(this, contextId, ...options);
      let context = contexts.get(this);
      if (!context) {
        context = createCanvas2DContext(this);
        contexts.set(this, context);
      }
      return context;
    }
  });
}

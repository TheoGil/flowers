type FlowerNodes = {
  count: number;
  type: NodeType;
  from: number;
  to: number;
  size: number;
  sizeModifierProgress: number;
  sizeModifierEase: (p: number) => number;
  thickness: number;
  angle: number;
  shape?: angle;
};

type FlowerFlower = {
  petalsCount: number;
  petalsSize: number;
  petalsShape: number;
};

type FlowerParams = {
  ctx: CanvasRenderingContext2D;
  height: number;
  stem: QuadraticBezier;
  nodes: FlowerNodes;
  flower?: FlowerFlower;
  palette: string[];
};

export { FlowerNodes, FlowerFlower, FlowerParams };

import { NodeLeaveSettings, NodeSettings, QuadraticBezier } from ".";

export type PlantSettings = {
  ctx: CanvasRenderingContext2D;
  height: number;
  palette: string[];
  stem: QuadraticBezier;
  nodes: (NodeSettings | NodeLeaveSettings)[];
};

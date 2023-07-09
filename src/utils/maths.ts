import { Vector2D } from "../types";

export function rotate2D({ x, y }: Vector2D, angle: number): Vector2D {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

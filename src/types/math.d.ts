type Vector2D = {
  x: number;
  y: number;
};

type QuadraticBezier = {
  from: Vector2D;
  to: Vector2D;
  ctrl: Vector2D;
};

export { Vector2D, QuadraticBezier };

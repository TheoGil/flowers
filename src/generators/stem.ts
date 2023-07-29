import { map, randomFloat } from "math-toolbox";

import { Vector2D } from "../types";

const getRandomStemSettings = ({
  origin,
  plantSize,
}: {
  origin: Vector2D;
  plantSize: number;
}) => {
  // Given origin position, compute end position of stem curve
  const X_OFFSET_MIN = -0.5;
  const X_OFFSET_MAX = 0.5;
  const relativeXOffset = randomFloat(X_OFFSET_MIN, X_OFFSET_MAX);
  const to = {
    x: origin.x + relativeXOffset * plantSize,
    y: origin.y - plantSize,
  };

  // Y position of control point is relative to x offset of curve end point.
  // This means that stems with a larger horizontal offset will bend more
  // than straight line vertical stems which will have no bend at all.
  const CTRL_Y_OFFSET_MIN = 0.5;
  const CTRL_Y_OFFSET_MAX = 0.1;
  const ctrlYOffset = map(
    Math.abs(relativeXOffset),
    0,
    X_OFFSET_MAX,
    CTRL_Y_OFFSET_MIN,
    CTRL_Y_OFFSET_MAX
  );
  const ctrl = {
    x: origin.x,
    y: to.y + ctrlYOffset * plantSize,
  };

  return {
    from: origin,
    to: to,
    ctrl: ctrl,
  };
};

export { getRandomStemSettings };

import { Stem } from "./Stem";
import { degToRad } from "math-toolbox";

import crosshair from "../utils/crosshair";
import { Leaf } from "./Leaf";
import { PARAMS } from "../settings";

export class Plant {
  strokeStyle = "black";
  leaves = [];

  constructor({ ctx, position, stem, leaves }) {
    this.ctx = ctx;
    this.position = position;

    this.initStem(stem);
    this.initLeaves(leaves);
  }

  initStem(stem) {
    this.stem = new Stem({
      ctx: this.ctx,
      position: this.position,
      handle: stem.handle,
      to: stem.to,
    });
  }

  initLeaves(leaves) {
    const lut = this.stem.bezier.getLUT(leaves.lut);
    lut.forEach((p, i) => {
      if (i > 0) {
        const side = i % 2 === 0 ? 1 : -1;
        const normal = this.stem.bezier.normal(i / leaves.lut);
        const baseAngle = Math.atan2(normal.y, normal.x) + degToRad(90) * side;

        const leaf = new Leaf({
          ctx: this.ctx,
          x: p.x,
          y: p.y,
          angle: baseAngle + degToRad(PARAMS.leaf.angle) * side,
          length: PARAMS.leaf.length,
          width: PARAMS.leaf.width,
          shapeBase: PARAMS.leaf.shapeBase,
          shapeApex: PARAMS.leaf.shapeApex,
        });

        this.leaves.push(leaf);
      }
    });
  }
}

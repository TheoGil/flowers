import { Vec2 } from "../utils/Vec2";
import crosshair from "../utils/crosshair";
import { DEBUG_COLOR_LINE } from "../settings";

export class Leaf {
  strokeStyle = "black";
  debug = true;

  constructor({
    ctx,
    x,
    y,
    length,
    width,
    angle,
    shape1,
    shapeBase,
    shapeApex,
  }) {
    this.origin = new Vec2(x, y);
    this.ctx = ctx;
    this.length = length;
    this.width = width;
    this.angle = angle;
    this.shape1 = shape1;
    this.shapeBase = shapeBase;
    this.shapeApex = shapeApex;

    this.render();
  }

  render() {
    // COMPUTE POINTS
    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;
    const CPBaseY = -halfLength * this.shapeBase;
    const CPApexY = -this.length + halfLength * this.shapeApex;

    // Left Control Point 1
    const lcp1 = new Vec2(-halfWidth, CPBaseY);

    // Left Control Point 2
    const lcp2 = new Vec2(-halfWidth, CPApexY);

    // Right Control Point 1
    const rcp1 = new Vec2(halfWidth, CPApexY);

    // Right Control Point 2
    const rcp2 = new Vec2(halfWidth, CPBaseY);

    // START DRAWING
    this.ctx.save();

    this.ctx.translate(this.origin.x, this.origin.y);
    this.ctx.rotate(this.angle);

    this.ctx.strokeStyle = this.stokeStyle;
    this.ctx.beginPath();

    // Outer shape
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(lcp1.x, lcp1.y, lcp2.x, lcp2.y, 0, -this.length);
    this.ctx.bezierCurveTo(rcp1.x, rcp1.y, rcp2.x, rcp2.y, 0, 0);

    // Midrib
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, -this.length);

    this.ctx.stroke();

    // if (this.debug) {
    //   this.renderDebug(lcp1, lcp2, rcp1, rcp2);
    // }

    this.ctx.restore();
  }

  renderDebug(lcp1, lcp2, rcp1, rcp2) {
    this.ctx.strokeStyle = DEBUG_COLOR_LINE;
    this.ctx.setLineDash([5, 5]);

    // DEBUG BASE
    crosshair({ ctx: this.ctx, x: 0, y: 0 });

    // DEBUG lcp1
    crosshair({ ctx: this.ctx, x: lcp1.x, y: lcp1.y });
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(lcp1.x, lcp1.y);
    this.ctx.stroke();

    // DEBUG lcp2
    crosshair({ ctx: this.ctx, x: lcp2.x, y: lcp2.y });
    this.ctx.beginPath();
    this.ctx.moveTo(lcp2.x, lcp2.y);
    this.ctx.lineTo(0, -this.length);
    this.ctx.stroke();

    // DEBUG rcp1
    crosshair({ ctx: this.ctx, x: rcp1.x, y: rcp1.y });
    this.ctx.beginPath();
    this.ctx.moveTo(rcp1.x, rcp1.y);
    this.ctx.lineTo(0, -this.length);
    this.ctx.stroke();

    // DEBUG rcp2
    crosshair({ ctx: this.ctx, x: rcp2.x, y: rcp2.y });
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(rcp2.x, rcp2.y);
    this.ctx.stroke();
  }
}

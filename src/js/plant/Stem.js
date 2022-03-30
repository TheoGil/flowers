import { Bezier } from "bezier-js";
import crosshair from "../utils/crosshair";
import { PARAMS } from "../settings";

export class Stem {
  strokeStyle = "black";

  constructor({ ctx, position, handle, to }) {
    this.ctx = ctx;
    this.position = position;
    this.handle = handle;
    this.to = to;
    this.bezier = new Bezier([this.position, this.handle, this.to]);

    this.render();
  }

  render() {
    this.ctx.strokeStyle = this.strokeStyle;

    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.quadraticCurveTo(
      this.handle.x,
      this.handle.y,
      this.to.x,
      this.to.y
    );
    this.ctx.stroke();

    // if (PARAMS.debug) {
    //   this.renderDebug();
    // }
  }

  renderDebug() {
    // DEBUG "RANDOM AREAS"
    this.ctx.save();
    this.ctx.translate(this.position.x - PARAMS.stem.to.randX, this.position.y);
    this.ctx.fillStyle = PARAMS.stem.to.fillStyle;
    this.ctx.fillRect(
      0,
      -PARAMS.stem.to.randY.min,
      PARAMS.stem.to.randX * 2,
      -PARAMS.stem.to.randY.max + PARAMS.stem.to.randY.min
    );
    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(
      this.position.x - PARAMS.stem.handle.randX,
      this.position.y
    );
    this.ctx.fillStyle = PARAMS.stem.handle.fillStyle;
    this.ctx.fillRect(
      0,
      -PARAMS.stem.handle.randY.min,
      PARAMS.stem.handle.randX * 2,
      -PARAMS.stem.handle.randY.max + PARAMS.stem.handle.randY.min
    );
    this.ctx.restore();

    // DEBUG CURVE POINTS
    crosshair({ ctx: this.ctx, x: this.position.x, y: this.position.y });
    crosshair({ ctx: this.ctx, x: this.handle.x, y: this.handle.y });
    crosshair({ ctx: this.ctx, x: this.to.x, y: this.to.y });

    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 15]);
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.lineTo(this.handle.x, this.handle.y);
    this.ctx.lineTo(this.to.x, this.to.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
}

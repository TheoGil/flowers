function crosshair({ ctx, x, y, size = 2, strokeStyle = "red" }) {
  ctx.save();

  ctx.strokeStyle = strokeStyle;

  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.stroke();

  ctx.restore();
}

export class Flower {
  strokeStyle = "black";

  constructor({ ctx, stem }) {
    this.ctx = ctx;
    this.stem = stem;

    this.render();
  }

  render() {
    this.ctx.strokeStyle = this.strokeStyle;

    this.ctx.beginPath();
    this.ctx.moveTo(this.stem.from.x, this.stem.from.y);
    this.ctx.quadraticCurveTo(
      this.stem.handle.x,
      this.stem.handle.y,
      this.stem.to.x,
      this.stem.to.y
    );
    this.ctx.stroke();

    crosshair({ ctx: this.ctx, x: this.stem.from.x, y: this.stem.from.y });
    crosshair({ ctx: this.ctx, x: this.stem.handle.x, y: this.stem.handle.y });
    crosshair({ ctx: this.ctx, x: this.stem.to.x, y: this.stem.to.y });

    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 15]);
    this.ctx.moveTo(this.stem.from.x, this.stem.from.y);
    this.ctx.lineTo(this.stem.handle.x, this.stem.handle.y);
    this.ctx.lineTo(this.stem.to.x, this.stem.to.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
}

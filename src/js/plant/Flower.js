import { rotatePoint } from "../utils/rotatePoint";

const PETALS_LENGTH_RANDOMIZER = 0.025;

export class Flower {
  strokeStyle = "black";

  constructor({ ctx, position, pistilRadius, petalsCount, petalsLength }) {
    this.ctx = ctx;
    this.position = position;
    this.pistilRadius = pistilRadius;
    this.petalsCount = petalsCount;
    this.petalsLength = petalsLength;

    this.render();
  }

  render() {
    this.ctx.save();

    this.ctx.strokeStyle = this.strokeStyle;

    this.ctx.translate(this.position.x, this.position.y);

    const inc = (Math.PI * 2) / this.petalsCount;
    for (let angle = 0; angle < Math.PI * 2; angle += inc) {
      this.ctx.moveTo(0, 0);
      this.ctx.save();
      this.ctx.rotate(angle);

      const petalLength =
        this.petalsLength +
        this.petalsLength *
          PETALS_LENGTH_RANDOMIZER *
          (Math.random() > 0.5 ? 1 : -1);

      const halfInc = inc / 2;
      const bezierShape = 5;
      const ctrlDistance = -petalLength * bezierShape;

      const from = rotatePoint(0, -petalLength, -halfInc);
      const ctrl1 = rotatePoint(0, ctrlDistance, -halfInc);
      const ctrl2 = rotatePoint(0, ctrlDistance, halfInc);
      const to = rotatePoint(0, -petalLength, halfInc);

      this.ctx.moveTo(0, 0);
      this.ctx.beginPath();
      this.ctx.lineTo(from.x, from.y);
      this.ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, to.x, to.y);

      this.ctx.lineTo(0, 0);

      this.ctx.fillStyle = "white";
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.restore();
    }

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.pistilRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fillStyle = "white";
    this.ctx.fill();

    this.ctx.restore();
  }

  renderDebug() {}
}

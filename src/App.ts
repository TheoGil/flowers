import { Pane } from "tweakpane";
import { Bezier } from "bezier-js";

type Vector2D = {
  x: number;
  y: number;
};

type BezierPoint = {
  x: number;
  y: number;
  t: number;
};

type QuadraticBezier = {
  from: Vector2D;
  to: Vector2D;
  ctrl: Vector2D;
};

type FlowerParams = {
  ctx: CanvasRenderingContext2D;
  height: number;
  stem: QuadraticBezier;
  leaves: {
    count: number;
    size: number;
    sizeTemper: number;
  };
};

function drawCrossHair(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const size = 5;
  const halfSize = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(x - halfSize, y - halfSize);
  ctx.lineTo(x + halfSize, y + halfSize);
  ctx.moveTo(x + halfSize, y - halfSize);
  ctx.lineTo(x - halfSize, y + halfSize);
  ctx.stroke();
  ctx.restore();
}

const params = {
  size: 0.1,
  stemTopXOffset: 0.5,
  stemCtrlYOffset: 0.2,
  leavesCount: 10,
  leavesSize: 0.5,
  leavesSizeTemper: 1,
  leavesAngle: 0,
};

class Flower {
  ctx: CanvasRenderingContext2D;
  stemBezier: Bezier;
  height: number;

  constructor(params: FlowerParams) {
    this.ctx = params.ctx;
    this.height = params.height;
    this.stemBezier = new Bezier(
      params.stem.from,
      params.stem.ctrl,
      params.stem.to
    );

    this.drawStem(params.stem);
    this.drawLeaves(params.leaves);
  }

  drawStem({ from, to, ctrl }: FlowerParams["stem"]) {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
    this.ctx.stroke();

    // this.ctx.save();
    // this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // this.ctx.setLineDash([2]);
    // this.ctx.beginPath();
    // this.ctx.moveTo(from.x, from.y);
    // this.ctx.lineTo(ctrl.x, ctrl.y);
    // this.ctx.lineTo(to.x, to.y);
    // this.ctx.stroke();
    // this.ctx.setLineDash([]);
    // this.ctx.restore();
    // drawCrossHair(this.ctx, from.x, from.y);
    // drawCrossHair(this.ctx, to.x, to.y);
    // drawCrossHair(this.ctx, ctrl.x, ctrl.y);
  }

  drawLeaves(leavesParams: FlowerParams["leaves"]) {
    // Bezier.get expects value in range [0, 1].
    // In order to compute this value without rounding error, we work
    // with higher value and ultimately divide those to go back to expected range.
    const base = 100;

    const inc = base / params.leavesCount;

    for (let t = 0; t <= base; t += inc) {
      this.drawLeave(this.stemBezier.get(t / base), leavesParams, false);
      this.drawLeave(this.stemBezier.get(t / base), leavesParams, true);
    }
  }

  drawLeave(
    p: BezierPoint,
    { count, size, sizeTemper }: FlowerParams["leaves"],
    mirror: boolean
  ) {
    // drawCrossHair(this.ctx, p.x, p.y);

    const n = this.stemBezier.normal(p.t);
    let angle =
      Math.atan2(n.y, n.x) -
      params.leavesAngle * (mirror ? -1 : 1) +
      (mirror ? Math.PI : 0);

    const shape = 1 - Math.pow(Math.abs(p.t * 2 - 1), params.leavesSizeTemper);
    const length = size * this.height * shape;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(p.x, p.y);
    this.ctx.moveTo(0, 0);
    this.ctx.rotate(angle);
    this.ctx.lineTo(length, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }
}

export class App {
  canvasEl!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  pane = new Pane();

  constructor() {
    this.initCanvas();
    this.setCanvasSize();

    this.drawFlower({
      x: this.canvasEl.width / 2,
      y: this.canvasEl.height / 2,
    });

    const folder = this.pane
      .addFolder({
        title: "params",
      })
      .on("change", () => {
        this.drawFlower({
          x: this.canvasEl.width / 2,
          y: this.canvasEl.height / 2,
        });
      });

    const globalFolder = folder.addFolder({
      title: "global",
    });

    globalFolder.addInput(params, "size", {
      label: "size",
      min: 0,
      max: 1,
    });

    const stemFolder = folder.addFolder({
      title: "stem",
    });

    stemFolder.addInput(params, "stemTopXOffset", {
      label: "spread",
      min: -0.7,
      max: 0.7,
    });
    stemFolder.addInput(params, "stemCtrlYOffset", {
      label: "curve",
      min: -0.5,
      max: 0.5,
    });

    const leavesFolder = folder.addFolder({
      title: "leaves",
    });

    leavesFolder.addInput(params, "leavesCount", {
      label: "count",
      min: 0,
      max: 10,
      step: 1,
    });

    leavesFolder.addInput(params, "leavesSize", {
      label: "length",
      min: 0,
      max: 1,
    });

    leavesFolder.addInput(params, "leavesSizeTemper", {
      label: "length shaping",
      min: 0.25,
      max: 3.5,
    });

    leavesFolder.addInput(params, "leavesAngle", {
      label: "angle",
      min: 0,
      max: Math.PI,
    });
  }

  initCanvas() {
    this.canvasEl = document.querySelector("#canvas") as HTMLCanvasElement;
    this.ctx = this.canvasEl.getContext("2d")!;
  }

  setCanvasSize() {
    this.canvasEl.width = window.innerWidth;
    this.canvasEl.height = window.innerHeight;
  }

  drawFlower(origin: Vector2D) {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    const height = this.canvasEl.height * params.size;

    // Horizontal offset between base and top of stem is relative to its height
    const stemTopXOffset = height * params.stemTopXOffset;
    const stemTopX = origin.x + stemTopXOffset;
    const stemTopY = origin.y - height;

    // Control point vertical position is relative to stem height
    const ctrlYOffset = height * params.stemCtrlYOffset;
    const ctrlX = origin.x;
    const ctrlY = stemTopY + ctrlYOffset;

    new Flower({
      ctx: this.ctx,
      height: height,
      stem: {
        from: {
          x: origin.x,
          y: origin.y,
        },
        to: {
          x: stemTopX,
          y: stemTopY,
        },
        ctrl: {
          x: ctrlX,
          y: ctrlY,
        },
      },
      leaves: {
        count: params.leavesCount,
        size: params.leavesSize,
        sizeTemper: params.leavesSizeTemper,
      },
    });
  }
}

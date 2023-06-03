import { Plant } from "./Plant";
import { randomFloat, degToRad } from "math-toolbox";
import { Pane } from "tweakpane";

type Vector2D = {
  x: number;
  y: number;
};

type QuadraticBezier = {
  from: Vector2D;
  to: Vector2D;
  ctrl: Vector2D;
};

type FlowerParams = {
  ctx: CanvasRenderingContext2D;
  stem: QuadraticBezier;
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

class Flower {
  ctx: CanvasRenderingContext2D;

  constructor(params: FlowerParams) {
    this.ctx = params.ctx;

    this.drawStem(params.stem);
  }

  drawStem({ from, to, ctrl }: QuadraticBezier) {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.setLineDash([2]);
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(ctrl.x, ctrl.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
    drawCrossHair(this.ctx, from.x, from.y);
    drawCrossHair(this.ctx, to.x, to.y);
    drawCrossHair(this.ctx, ctrl.x, ctrl.y);
  }
}

const params = {
  heightRatio: 0.1,
  stemTopXOffset: 0.5,
  stemCtrlYOffset: 0.2,
};

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

    globalFolder.addInput(params, "heightRatio", {
      label: "height",
      min: 0,
      max: 1,
    });

    const stemFolder = folder.addFolder({
      title: "stem",
    });

    stemFolder.addInput(params, "stemTopXOffset", {
      label: "aperture",
      min: -0.7,
      max: 0.7,
    });
    stemFolder.addInput(params, "stemCtrlYOffset", {
      label: "curve",
      min: -0.5,
      max: 0.5,
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

    const height = this.canvasEl.height * params.heightRatio;

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
    });
  }
}

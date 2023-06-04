import { Pane } from "tweakpane";
import { Bezier } from "bezier-js";
import eases from "eases";
import { map } from "math-toolbox";

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
  height: number;
  stem: QuadraticBezier;
  leaves: {
    count: number;
    size: number;
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
  size: 0.5,
  //
  stemBend: 0.29,
  stemCurve: 0.5,
  //
  leavesCount: 10,
  leavesSize: 0.5,
  leavesAngle: 1.27,
  //
  leavesShape: 0.5,
  leavesThickness: 0.17,
  leavesLengthModifier: 0.8,
  leavesLengthEasing: "quadOut",
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
      const point = this.stemBezier.get(t / base);
      const normal = this.stemBezier.normal(point.t);
      const angle = Math.atan2(normal.y, normal.x);

      // this.drawLeave(point, leavesParams, false);
      // this.drawLeave(point, leavesParams, true);
      this.drawLeave({
        position: { x: point.x, y: point.y },
        progress: point.t,
        angle: angle + params.leavesAngle,
        size: leavesParams.size,
      });

      this.drawLeave({
        position: { x: point.x, y: point.y },
        progress: point.t,
        angle: angle + Math.PI - (Math.PI + params.leavesAngle),
        size: leavesParams.size,
      });
    }
  }

  drawLeave({
    position,
    progress,
    angle,
    size,
  }: {
    position: Vector2D;
    progress: number;
    angle: number;
    size: number;
  }) {
    const remappedProgressMedian = params.leavesLengthModifier;

    let remappedProgress = map(progress, 0, remappedProgressMedian, 0, 0.5);

    if (progress >= remappedProgressMedian) {
      remappedProgress = map(progress, remappedProgressMedian, 1, 0.5, 1);
    }

    const lengthMultiplier =
      1 - eases[params.leavesLengthEasing](Math.abs(remappedProgress * 2 - 1));

    const length = size * this.height * lengthMultiplier;

    const thickness = this.height * params.leavesThickness * lengthMultiplier;

    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);

    const ctrl1 = {
      x: -thickness / 2,
      y: -length * params.leavesShape,
    };
    this.ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, 0, -length);

    const ctrl2 = {
      x: thickness / 2,
      y: -length * params.leavesShape,
    };
    this.ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, 0, 0);

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

    this.drawFlower();

    const folder = this.pane
      .addFolder({
        title: "params",
      })
      .on("change", () => {
        this.drawFlower();
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

    stemFolder.addInput(params, "stemBend", {
      label: "bend",
      min: -0.7,
      max: 0.7,
    });
    stemFolder.addInput(params, "stemCurve", {
      label: "curve",
      min: -0.5,
      max: 0.5,
    });

    const leavesArrangement = folder.addFolder({
      title: "leaves arrangement",
    });

    leavesArrangement.addInput(params, "leavesCount", {
      label: "count",
      min: 0,
      max: 30,
      step: 1,
    });

    leavesArrangement.addInput(params, "leavesSize", {
      label: "length",
      min: 0,
      max: 1,
    });

    leavesArrangement.addInput(params, "leavesAngle", {
      label: "angle",
      min: 0.75,
      max: 2.39,
    });

    const leavesShape = folder.addFolder({
      title: "leaves shape",
    });

    leavesShape.addInput(params, "leavesShape", {
      label: "shape",
      min: 0,
      max: 1,
    });

    leavesShape.addInput(params, "leavesThickness", {
      label: "thickness",
      min: 0,
      max: 0.5,
    });

    leavesShape.addInput(params, "leavesLengthModifier", {
      label: "length mod offset",
      min: 0,
      max: 1,
    });

    leavesShape.addInput(params, "leavesLengthEasing", {
      label: "length mod easing",
      options: {
        backInOut: "backInOut",
        backIn: "backIn",
        backOut: "backOut",
        bounceInOut: "bounceInOut",
        bounceIn: "bounceIn",
        bounceOut: "bounceOut",
        circInOut: "circInOut",
        circIn: "circIn",
        circOut: "circOut",
        cubicInOut: "cubicInOut",
        cubicIn: "cubicIn",
        cubicOut: "cubicOut",
        elasticInOut: "elasticInOut",
        elasticIn: "elasticIn",
        elasticOut: "elasticOut",
        expoInOut: "expoInOut",
        expoIn: "expoIn",
        expoOut: "expoOut",
        linear: "linear",
        quadInOut: "quadInOut",
        quadIn: "quadIn",
        quadOut: "quadOut",
        quartInOut: "quartInOut",
        quartIn: "quartIn",
        quartOut: "quartOut",
        quintInOut: "quintInOut",
        quintIn: "quintIn",
        quintOut: "quintOut",
        sineInOut: "sineInOut",
        sineIn: "sineIn",
        sineOut: "sineOut",
      },
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

  drawFlower() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    const height = this.canvasEl.height * params.size;

    const origin = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + height / 2,
    };

    // Horizontal offset between base and top of stem is relative to its height
    const stemBend = height * params.stemBend;
    const stemTopX = origin.x + stemBend;
    const stemTopY = origin.y - height;

    // Control point vertical position is relative to stem height
    const ctrlYOffset = height * params.stemCurve;
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
      },
    });
  }
}

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

type NodeType = "branches" | "leaves";

type NodeParams = {
  position: Vector2D;
  progress: number;
  angle: number;
  size: number;
};

interface LeaveParams extends NodeParams {
  thickness: number;
}

interface BanchParams extends NodeParams {
  side: "left" | "right";
}

type FlowerParams = {
  ctx: CanvasRenderingContext2D;
  height: number;
  stem: QuadraticBezier;
  nodes: {
    count: number;
    size: number;
    type: NodeType;
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
  stemBend: 0,
  stemCurve: 0.5,
  //
  nodesCount: 10,
  nodesSize: 0.5,
  nodesAngle: Math.PI / 2,
  nodesLengthModPos: 0.8,
  nodesLengthEase: "quadOut",
  nodesType: "branches",
  //
  leavesShape: 0.5,
  leavesThickness: 0.17,
  //
  petalsCount: 6,
  petalsSize: 0.1,
  petalsShape: 0.5,
};

function rotate2D({ x, y }: Vector2D, angle: number): Vector2D {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

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

    // this.drawStem(params.stem);
    // this.drawNodes(params.nodes);
    this.drawFlower();
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

  drawNodes(nodes: FlowerParams["nodes"]) {
    // Bezier.get expects value in range [0, 1].
    // In order to compute this value without rounding error, we work
    // with higher value and ultimately divide those to go back to expected range.
    const base = 100;

    const inc = base / params.nodesCount;

    for (let t = 0; t <= base; t += inc) {
      const point = this.stemBezier.get(t / base);
      const normal = this.stemBezier.normal(point.t);
      const angle = Math.atan2(normal.y, normal.x) - Math.PI / 2;
      const lengthMultiplier = this.computeNodeLengthMultiplier(point.t);
      const size = nodes.size * this.height * lengthMultiplier;

      const nodeParams: NodeParams = {
        position: { x: point.x, y: point.y },
        progress: point.t,
        angle: angle + params.nodesAngle,
        size: size,
      };

      switch (nodes.type) {
        case "branches":
          // Draw left side branch
          this.drawBranch({
            ...nodeParams,
            side: "left",
          });

          // Drawn right side branch
          this.drawBranch({
            ...nodeParams,
            // angle: angle + Math.PI - (Math.PI + params.nodesAngle),
            side: "right",
          });

          break;
        case "leaves":
          const thickness =
            this.height * params.leavesThickness * lengthMultiplier;

          // Draw left side leave
          this.drawLeave({
            ...nodeParams,
            thickness,
          });

          // Drawn right side leave
          this.drawLeave({
            ...nodeParams,
            angle: angle + Math.PI - (Math.PI + params.nodesAngle),
            thickness: thickness,
          });

          break;
      }
    }
  }

  drawLeave({ position, angle, size, thickness }: LeaveParams) {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);

    const ctrl1 = {
      x: -size * params.leavesShape,
      y: thickness / 2,
    };
    this.ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, -size, 0);

    const ctrl2 = {
      x: -size * params.leavesShape,
      y: -thickness / 2,
    };
    this.ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, 0, 0);

    this.ctx.stroke();

    this.ctx.restore();
  }

  drawBranch({ position, angle, size, side }: BanchParams) {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);

    const x = side === "left" ? -size : size;

    this.ctx.quadraticCurveTo(x, 0, x, -size);

    this.ctx.stroke();

    this.ctx.restore();
  }

  drawFlower() {
    // --------------- V1 ------------------------
    // const inc = (Math.PI * 2) / params.petalsCount;
    // this.ctx.save();
    // this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    // for (let i = 0; i < params.petalsCount; i++) {
    //   const length = 100;

    //   const point = { x: -length, y: 0 };
    //   const rotated = rotate2D(point, i * inc);
    //   const rotated1 = rotate2D(point, i * inc + inc);
    //   const head = rotate2D(
    //     {
    //       x: -length * 2,
    //       y: 0,
    //     },
    //     inc * i + inc / 2
    //   );

    //   this.ctx.beginPath();
    //   this.ctx.moveTo(0, 0);
    //   this.ctx.quadraticCurveTo(rotated.x, rotated.y, head.x, head.y);
    //   this.ctx.quadraticCurveTo(rotated1.x, rotated1.y, 0, 0);
    //   this.ctx.stroke();

    //   drawCrossHair(this.ctx, 0, 0);
    //   drawCrossHair(this.ctx, rotated.x, rotated.y);
    //   drawCrossHair(this.ctx, rotated1.x, rotated1.y);
    //   drawCrossHair(this.ctx, head.x, head.y);
    // }
    // this.ctx.restore();

    // this.ctx.save();
    // this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    // this.ctx.beginPath();
    // this.ctx.arc(0, 0, 50, 0, 2 * Math.PI);
    // this.ctx.fillStyle = "white";
    // this.ctx.stroke();
    // this.ctx.restore();

    // --------------- V2 ------------------------
    const inc = (Math.PI * 2) / params.petalsCount;
    const size = this.height * params.petalsSize;
    const base = size * params.petalsShape;

    this.ctx.save();
    this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    for (let i = 0; i < params.petalsCount; i++) {
      const angle = i * inc;

      const baseA = rotate2D({ x: -base, y: 0 }, angle);
      const baseB = rotate2D({ x: -base, y: 0 }, angle + inc);
      const ctrl1 = rotate2D({ x: -size, y: 0 }, angle);
      const ctrl2 = rotate2D({ x: -size, y: 0 }, angle + inc);
      const head = rotate2D({ x: -size, y: 0 }, angle + inc / 2);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(baseA.x, baseA.y);
      this.ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, head.x, head.y);
      this.ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, baseB.x, baseB.y);
      this.ctx.lineTo(0, 0);
      this.ctx.stroke();

      drawCrossHair(this.ctx, head.x, head.y);
      drawCrossHair(this.ctx, ctrl1.x, ctrl1.y);
      drawCrossHair(this.ctx, ctrl2.x, ctrl2.y);
    }
    this.ctx.restore();
  }

  computeNodeLengthMultiplier(progress: number) {
    const remappedProgressMedian = params.nodesLengthModPos;

    let remappedProgress = map(progress, 0, remappedProgressMedian, 0, 0.5);

    if (progress >= remappedProgressMedian) {
      remappedProgress = map(progress, remappedProgressMedian, 1, 0.5, 1);
    }

    return (
      1 - eases[params.nodesLengthEase](Math.abs(remappedProgress * 2 - 1))
    );
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

    const nodesFolder = folder.addFolder({
      title: "nodes",
    });

    nodesFolder.addInput(params, "nodesType", {
      label: "types",
      options: {
        leaves: "leaves",
        branches: "branches",
      },
    });

    nodesFolder.addInput(params, "nodesCount", {
      label: "count",
      min: 0,
      max: 30,
      step: 1,
    });

    nodesFolder.addInput(params, "nodesSize", {
      label: "length",
      min: 0,
      max: 1,
    });

    nodesFolder.addInput(params, "nodesAngle", {
      label: "angle",
      min: 0.75,
      max: 2.39,
    });

    nodesFolder.addInput(params, "nodesLengthModPos", {
      label: "length mod pos",
      min: 0,
      max: 1,
    });

    nodesFolder.addInput(params, "nodesLengthEase", {
      label: "length mod ease",
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

    const petalsFolder = folder.addFolder({
      title: "petals",
    });

    petalsFolder.addInput(params, "petalsCount", {
      label: "count",
      min: 2,
      max: 20,
      step: 1,
    });

    petalsFolder.addInput(params, "petalsSize", {
      label: "size",
      min: 0,
      max: 1,
    });

    petalsFolder.addInput(params, "petalsShape", {
      label: "shape",
      min: 0,
      max: 1,
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
      nodes: {
        type: params.nodesType,
        count: params.nodesCount,
        size: params.nodesSize,
      },
    });
  }
}

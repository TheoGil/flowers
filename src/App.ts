import { Pane } from "tweakpane";
import { Bezier } from "bezier-js";
import { map } from "math-toolbox";
import eases from "eases";
import palettes from "nice-color-palettes";

const randomArrayEntry = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

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
  stemBend: -0.26,
  stemCurve: 0.29,
  //
  nodesType: "leaves",
  subdivisions: 7,
  nodesSize: 0.25,
  nodesSizeEase: "quadIn",
  nodesSizeModPos: 1,
  nodesProgressFrom: 0.17,
  nodesProgressTo: 0.74,
  nodesAngle: 1.972,
  //
  leavesShape: 0.5,
  leavesThickness: 0.14,
  //
  petalsCount: 9,
  petalsSize: 0.16,
  petalsShape: 0.21,
};

function rotate2D({ x, y }: Vector2D, angle: number): Vector2D {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

const MIN_SIZE_MULT = 0.1;

function computeNodeSizeMultiplier(p: number) {
  if (p < params.nodesSizeModPos) {
    return eases[params.nodesSizeEase](
      map(p, 0, params.nodesSizeModPos, MIN_SIZE_MULT, 1)
    );
  }

  return eases[params.nodesSizeEase](
    map(p, params.nodesSizeModPos, 1, 1, MIN_SIZE_MULT)
  );
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
    this.palette = params.palette;

    this.drawStem(params.stem);
    this.drawNodes(params.nodes);
    this.drawFlower(params.stem.to);
  }

  drawStem({ from, to, ctrl }: FlowerParams["stem"]) {
    this.ctx.strokeStyle = this.palette[1];
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
    if (params.subdivisions === 1) {
      this.drawNode({
        p: params.nodesProgressFrom,
        sizeMultiplier: 1,
        type: nodes.type,
      });
    } else if (params.subdivisions > 1) {
      const inc = 1 / params.subdivisions;

      const from = params.nodesProgressFrom;
      const to = params.nodesProgressTo;

      for (let progress = 0; progress <= 1; progress += inc) {
        const sizeMultiplier = computeNodeSizeMultiplier(progress);

        this.drawNode({
          p: map(progress, 0, 1, from, to),
          sizeMultiplier,
          type: nodes.type,
        });
      }
    }
  }

  drawNode({
    p,
    type,
    sizeMultiplier,
  }: {
    p: number;
    type: NodeType;
    sizeMultiplier: number;
  }) {
    const { x, y } = this.stemBezier.get(p);

    const normal = this.stemBezier.normal(p);
    const angle = Math.atan2(normal.y, normal.x) - Math.PI / 2;

    const size = sizeMultiplier * params.nodesSize * this.height;

    const nodeParams: NodeParams = {
      position: { x, y },
      progress: p,
      angle: angle + params.nodesAngle,
      size: size,
    };

    switch (type) {
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
        const thickness = this.height * params.leavesThickness * sizeMultiplier;

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

  drawLeave({ position, angle, size, thickness }: LeaveParams) {
    this.ctx.save();
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
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

    this.ctx.fill();

    this.ctx.restore();
  }

  drawBranch({ position, angle, size, side }: BanchParams) {
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
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

  drawFlower(position: Vector2D) {
    const inc = (Math.PI * 2) / params.petalsCount;
    const size = this.height * params.petalsSize;
    const base = size * params.petalsShape;

    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.fillStyle = this.palette[4];

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
      this.ctx.fill();
    }

    this.ctx.fillStyle = this.palette[3];
    this.ctx.beginPath();
    this.ctx.arc(0, 0, base, 0, 2 * Math.PI);
    this.ctx.fill();

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

    nodesFolder.addInput(params, "subdivisions", {
      label: "subdivisions",
      min: 0,
      max: 30,
      step: 1,
    });

    nodesFolder.addInput(params, "nodesProgressFrom", {
      label: "from",
      min: 0,
      max: 1,
    });

    nodesFolder.addInput(params, "nodesProgressTo", {
      label: "to",
      min: 0,
      max: 1,
    });

    nodesFolder.addInput(params, "nodesAngle", {
      label: "angle",
      min: 0.75,
      max: 2.39,
    });

    nodesFolder.addInput(params, "nodesSize", {
      label: "size",
      min: 0,
      max: 1,
    });

    nodesFolder.addInput(params, "nodesSizeEase", {
      label: "length mod easing",
      options: {
        circInOut: "circInOut",
        circIn: "circIn",
        circOut: "circOut",
        cubicInOut: "cubicInOut",
        cubicIn: "cubicIn",
        cubicOut: "cubicOut",
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

    nodesFolder.addInput(params, "nodesSizeModPos", {
      label: "size mod pos",
      min: 0,
      max: 1,
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
    const palette = randomArrayEntry(palettes);

    this.ctx.fillStyle = palette[0];
    this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);

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
      palette: palette,
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
        count: params.subdivisions,
      },
    });
  }
}

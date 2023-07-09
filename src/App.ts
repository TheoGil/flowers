import { Pane, FolderApi } from "tweakpane";
import { Bezier } from "bezier-js";
import { map } from "math-toolbox";
import eases from "eases";
import palettes from "nice-color-palettes";

import {
  NodeBranch,
  FlowerParams,
  NodeLeave,
  Node,
  NodeType,
  Vector2D,
} from "./types";
import params from "./params";

function drawCrossHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color = "red"
) {
  const size = 5;
  const halfSize = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x - halfSize, y - halfSize);
  ctx.lineTo(x + halfSize, y + halfSize);
  ctx.moveTo(x + halfSize, y - halfSize);
  ctx.lineTo(x - halfSize, y + halfSize);
  ctx.stroke();
  ctx.restore();
}

function rotate2D({ x, y }: Vector2D, angle: number): Vector2D {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

const MIN_SIZE_MULT = 0.1;

function computeNodeSizeMultiplier(
  p: number,
  pMod: number,
  ease: (p: number) => number
) {
  if (p < pMod) {
    return ease(map(p, 0, pMod, MIN_SIZE_MULT, 1));
  }

  return ease(map(p, pMod, 1, 1, MIN_SIZE_MULT));
}

class Flower {
  ctx: CanvasRenderingContext2D;
  stemBezier: Bezier;
  height: number;
  palette: string[];

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

    if (params.flower) {
      this.drawFlower({
        position: params.stem.to,
        petalsCount: params.flower.petalsCount,
        petalsSize: params.flower.petalsSize,
        petalsShape: params.flower.petalsShape,
      });
    }
  }

  drawStem({ from, to, ctrl }: FlowerParams["stem"]) {
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
    this.ctx.stroke();
  }

  drawNodes(nodes: FlowerParams["nodes"]) {
    if (nodes.count === 1) {
      this.drawNode({
        p: nodes.from,
        size: nodes.size,
        sizeMultiplier: 1,
        type: nodes.type,
        thickness: nodes.thickness,
        angle: nodes.angle,
        shape: nodes.shape,
      });
    } else if (nodes.count > 1) {
      const inc = 1 / nodes.count;

      for (let progress = 0; progress <= 1; progress += inc) {
        const sizeMultiplier = computeNodeSizeMultiplier(
          progress,
          nodes.sizeModifierProgress,
          nodes.sizeModifierEase
        );

        this.drawNode({
          p: map(progress, 0, 1, nodes.from, nodes.to),
          size: nodes.size,
          sizeMultiplier: sizeMultiplier,
          type: nodes.type,
          thickness: nodes.thickness,
          angle: nodes.angle,
          shape: nodes.shape,
        });
      }
    }
  }

  drawNode(node: {
    p: number;
    type: NodeType;
    size: number;
    sizeMultiplier: number;
    angle: number;
    thickness?: number;
    shape?: number;
  }) {
    const { x, y } = this.stemBezier.get(node.p);

    // const baseAngle = Math.atan2(normal.y, normal.x) + node.angle;

    const normalVector = this.stemBezier.normal(node.p);
    const normalAngle = Math.atan2(normalVector.y, normalVector.x);

    switch (node.type) {
      case "branches":
        const branchParams = {
          angle: normalAngle + node.angle,
          position: { x, y },
          progress: node.p,
          size: node.size,
          sizeMultiplier: node.sizeMultiplier,
          side: "left",
        };

        // right side
        this.drawBranch({
          ...branchParams,
          side: "left",
        });

        // left side
        this.drawBranch({
          ...branchParams,
          side: "right",
        });

        break;
      case "leaves":
        if (!node.thickness || !node.shape) return;

        const thickness = this.height * node.thickness * node.sizeMultiplier;

        const leavesParams = {
          position: { x, y },
          progress: node.p,
          shape: node.shape,
          size: node.sizeMultiplier * node.size * this.height,
          thickness: thickness,
        };

        // right side
        this.drawLeave({
          ...leavesParams,
          angle: normalAngle + node.angle,
        });

        // left side
        this.drawLeave({
          ...leavesParams,
          angle: normalAngle - Math.PI - node.angle,
        });

        break;
    }
  }

  drawLeave({ position, angle, size, thickness, shape }: NodeLeave) {
    this.ctx.save();
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);

    this.ctx.quadraticCurveTo(size * shape, thickness / 2, size, 0);
    this.ctx.quadraticCurveTo(size * shape, -thickness / 2, 0, 0);

    this.ctx.fill();

    this.ctx.restore();
  }

  drawBranch({ position, angle, size, sizeMultiplier, side }: NodeBranch) {
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(angle);

    const newSize = size * this.height * sizeMultiplier;

    // draw branch
    const x = side === "right" ? -newSize : newSize;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(x, 0, x, -newSize);
    this.ctx.stroke();

    console.log("size", newSize);

    // draw flower
    this.drawFlower({
      position: {
        x: x,
        y: -newSize,
      },
      petalsCount: 10,
      petalsSize: 0.05 * sizeMultiplier,
      petalsShape: 0.2 * sizeMultiplier,
    });

    this.ctx.restore();
  }

  drawFlower(flower: {
    position: Vector2D;
    petalsCount: number;
    petalsSize: number;
    petalsShape: number;
  }) {
    const inc = (Math.PI * 2) / flower.petalsCount;
    const size = this.height * flower.petalsSize;
    const base = size * flower.petalsShape;

    this.ctx.save();
    this.ctx.translate(flower.position.x, flower.position.y);
    this.ctx.fillStyle = this.palette[4];

    for (let i = 0; i < flower.petalsCount; i++) {
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
  pane = new Pane() as FolderApi;

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
      min: -Math.PI / 2,
      max: Math.PI / 2,
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
    // const paletteIndex = Math.floor(Math.random() * palettes.length);
    const paletteIndex = 11;
    const palette = palettes[paletteIndex];
    console.log(`Palette ID ${paletteIndex}`, palette);

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
        from: params.nodesProgressFrom,
        to: params.nodesProgressTo,
        size: params.nodesSize,
        sizeModifierProgress: params.nodesSizeModPos,
        sizeModifierEase: eases[params.nodesSizeEase] as (t: number) => number,
        thickness: params.leavesThickness,
        angle: params.nodesAngle,
        shape: params.leavesShape,
      },
      flower: {
        petalsCount: params.petalsCount,
        petalsSize: params.petalsSize,
        petalsShape: params.petalsShape,
      },
    });
  }
}

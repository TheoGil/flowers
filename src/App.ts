import { map } from "math-toolbox";
import eases from "eases";
import palettes from "nice-color-palettes";
import { fitAndPosition } from "object-fit-math";

import params from "./params";
import { Plant } from "./Plant";
import { initDebug } from "./debug";
import { NodeSettings, Vector2D } from "./types";

const MIN_SIZE_MULT = 0.5;

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

export class App {
  canvasEl!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  points: Vector2D[] = [];
  palette: string[] = [];

  constructor() {
    this.initCanvas();
    this.setCanvasSize();
    this.randomizePalette();

    // this.drawSVG();
    this.drawDebug();

    initDebug(() => {
      // this.drawSVG();
      this.drawDebug();
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

  randomizePalette() {
    // const paletteIndex = Math.floor(Math.random() * palettes.length);
    const paletteIndex = 11;
    this.palette = palettes[paletteIndex];
    console.log(`Palette ID ${paletteIndex}`, this.palette);
  }

  generateRandomPointsWithinLogo() {
    this.points = [];

    // Matches the original SVG viewbox definition
    const svgSize = {
      width: 100,
      height: 100,
    };

    // EPIC logo path
    const path = new Path2D(
      "M88 37.8 69.075 26.5V4L12 37.8v45L31.025 94 50.05 82.8 31.025 71.5V49L50.05 60.3 69.075 49v22.5L50.05 82.8 69.075 94 88 82.8V47.71z"
    );

    const contain = fitAndPosition(
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      svgSize,
      "contain",
      "50%",
      "50%"
    );

    const scale = Math.max(
      contain.width / svgSize.width,
      contain.height / svgSize.height
    );

    this.ctx.save();
    for (let i = 0; i < params.count; i++) {
      const x = Math.random() * svgSize.width;
      const y = Math.random() * svgSize.height;
      if (this.ctx.isPointInPath(path, x, y)) {
        this.points.push({
          x: contain.x + x * scale,
          y: contain.y + y * scale,
        });
      }
    }
    this.ctx.restore();
  }

  drawSVG() {
    this.generateRandomPointsWithinLogo();

    this.ctx.fillStyle = this.palette[0];
    this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    for (let i = 0; i < this.points.length; i++) {
      const origin = this.points[i];
      this.drawPlant(origin);
    }
  }

  drawDebug() {
    this.ctx.fillStyle = this.palette[0];
    this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    this.drawPlant({
      x: window.innerWidth / 2,
      y: window.innerHeight - window.innerHeight / 4,
    });
  }

  drawPlant(origin: Vector2D) {
    const size = params.size / 100;
    const height = this.canvasEl.height * size;

    // Horizontal offset between base and top of stem is relative to its height
    const stemBend = height * params.stem.bend;
    const stemTopX = origin.x + stemBend;
    const stemTopY = origin.y - height;

    // Control point vertical position is relative to stem height
    const ctrlYOffset = height * params.stem.curve;
    const ctrlX = origin.x;
    const ctrlY = stemTopY + ctrlYOffset;

    const sizeModifierEase = eases[params.nodes.sizeEase] as (
      t: number
    ) => number;

    const nodes: NodeSettings[] = [];

    if (params.nodes.count) {
      const { count, progressFrom, progressTo, sizeModPos } = params.nodes;

      // Normalized distance between nodes
      const step = 1 / count;

      // Make sure that nodes are evenly distributed
      // First one starts at progressFrom, last at progressTo
      // Note that if count > 1, it represents the divisions count, not the nodes count.
      const forLoopLength = count === 1 ? count - 1 : count;

      // Default node size, without being affected by nodeSizeMultiplier
      // Only need to compute that once
      const rootSize = params.nodes.size * height;

      for (let i = 0; i <= forLoopLength; i++) {
        const progress = map(i * step, 0, 1, progressFrom, progressTo);

        // Alters the size of the nodes along the stem
        const sizeMultiplier = computeNodeSizeMultiplier(
          progress,
          sizeModPos,
          sizeModifierEase
        );

        const size = rootSize * sizeMultiplier;

        switch (params.nodes.type) {
          case "branch":
            nodes.push({
              progress: progress,
              type: "branch",
              size: size,
              angle: 0,
              side: "right",
            });

            nodes.push({
              progress: progress,
              type: "branch",
              size: size,
              angle: 0,
              side: "left",
            });
            break;
          case "leave":
            nodes.push({
              progress: progress,
              type: "leave",
              thickness: size * params.leaves.thickness,
              shape: params.leaves.shape,
              side: "right",
              size: size,
              angle: params.nodes.angle,
            });

            nodes.push({
              progress: progress,
              type: "leave",
              thickness: size * params.leaves.thickness,
              shape: params.leaves.shape,
              side: "left",
              size: size,
              angle: params.nodes.angle,
            });
            break;
          case "berry":
            nodes.push({
              progress: progress,
              type: "berry",
              side: "left",
              size: size,
              angle: 0,
              lineWidth: 1,
            });
            break;
          default:
            break;
        }
      }
    }

    new Plant({
      ctx: this.ctx,
      palette: this.palette,
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
      nodes: nodes,
      // flower: {
      //   angle: Math.random() * Math.PI,
      //   petals: {
      //     count: params.flower.petals.count,
      //     size: params.flower.petals.size,
      //     shape: params.flower.petals.shape,
      //   },
      // },
    });
  }
}

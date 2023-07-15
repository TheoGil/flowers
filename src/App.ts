import { map } from "math-toolbox";
import eases from "eases";
import palettes from "nice-color-palettes";

import params from "./params";
import { Plant } from "./Plant";
import { initDebug } from "./debug";
import { NodeLeaveSettings, NodeSettings } from "./types";

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

  constructor() {
    this.initCanvas();
    this.setCanvasSize();
    this.drawPlant();

    initDebug(() => {
      this.drawPlant();
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

  drawPlant() {
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

    const sizeModifierEase = eases[params.nodesSizeEase] as (
      t: number
    ) => number;

    const nodes: NodeSettings[] = [];

    if (params.subdivisions) {
      const step = 1 / params.subdivisions;
      for (let i = 0; i < params.subdivisions; i++) {
        const progress = map(
          (i + 1) * step,
          0,
          1,
          params.nodesProgressFrom,
          params.nodesProgressTo
        );

        const sizeMultiplier = computeNodeSizeMultiplier(
          progress,
          params.nodesSizeModPos,
          sizeModifierEase
        );

        const size = params.nodesSize * sizeMultiplier * height;

        // BRANCH RIGHT
        // nodes.push({
        //   progress: progress,
        //   type: "branch",
        //   size: size,
        //   angle: params.nodesAngle,
        //   side: "right",
        // });

        // BRANCH LEFT
        // nodes.push({
        //   progress: progress,
        //   type: "branch",
        //   size: size,
        //   angle: params.nodesAngle,
        //   side: "left",
        // });

        // LEAVE RIGHT
        // nodes.push({
        //   progress: progress,
        //   type: "leave",
        //   thickness: size * params.leavesThickness,
        //   shape: params.leavesShape,
        //   side: "right",
        //   size: size,
        //   angle: params.nodesAngle,
        // });

        // LEAVE LEFT
        // nodes.push({
        //   progress: progress,
        //   type: "leave",
        //   thickness: size * params.leavesThickness,
        //   shape: params.leavesShape,
        //   side: "left",
        //   size: size,
        //   angle: params.nodesAngle,
        // });

        // BERRY LEFT
        nodes.push({
          progress: progress,
          type: "berry",
          side: "right",
          size: size,
          angle: params.nodesAngle,
          lineWidth: 1,
        });
      }
    }

    new Plant({
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
      nodes: nodes,
    });
  }
}

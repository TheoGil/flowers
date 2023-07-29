import palettes from "nice-color-palettes";
import { fitAndPosition } from "object-fit-math";

import params from "./params";
import { Plant } from "./Plant";
import { initDebug } from "./debug";
import { Vector2D } from "./types";
import {
  getRandomStemSettings,
  getRandomFlowerSettings,
  getRandomNodesSettings,
} from "./generators";

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

    const stemSettings = getRandomStemSettings({
      origin: origin,
      plantSize: height,
    });
    const flowerSettings = getRandomFlowerSettings();
    const nodesSettings = getRandomNodesSettings({
      flowerSettings: flowerSettings,
      plantSize: height,
    });

    new Plant({
      ctx: this.ctx,
      palette: this.palette,
      height: height,
      stem: stemSettings,
      nodes: nodesSettings,
      flower: flowerSettings,
    });
  }
}

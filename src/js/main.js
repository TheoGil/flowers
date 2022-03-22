import "../css/style.css";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { Flower } from "./Flower";
import { Vec2 } from "./Vec2";
import { randomFloat } from "math-toolbox";

const PARAMS = {
  debug: true,
  stem: {
    to: {
      fillStyle: "rgba(255, 0, 0, 0.1)",
      randX: 150,
      randY: { min: 100, max: 300 },
    },
    handle: {
      fillStyle: "rgba(0, 255, 0, 0.1)",
      randX: 40,
      randY: { min: 25, max: 180 },
    },
  },
};

class App {
  constructor() {
    console.clear();
    console.log("🌼🌻🌸");

    this.onResize = this.onResize.bind(this);
    this.resetFlower = this.resetFlower.bind(this);

    this.canvasEl = document.querySelector("canvas");
    this.ctx = this.canvasEl.getContext("2d");

    window.addEventListener("resize", this.onResize);
    this.setCanvasSize();

    this.initDebug();
    this.initFlower();
  }

  onResize() {
    this.setCanvasSize();
  }

  setCanvasSize() {
    this.canvasEl.width = innerWidth;
    this.canvasEl.height = innerHeight;
  }

  initDebug() {
    this.gui = new Pane();
    this.gui.registerPlugin(EssentialsPlugin);

    const flowerFolder = this.gui
      .addFolder({
        title: "Flower",
      })
      .on("change", this.resetFlower);

    flowerFolder
      .addButton({
        title: "Reset",
      })
      .on("click", this.resetFlower);

    const stemFolder = flowerFolder.addFolder({
      title: "Stem",
    });

    const stemToFolder = stemFolder.addFolder({
      title: "To",
    });

    stemToFolder.addInput(PARAMS.stem.to, "randX", {
      min: 0,
      max: 500,
      step: 1,
    });

    stemToFolder.addInput(PARAMS.stem.to, "randY", {
      min: 0,
      max: 500,
      step: 1,
    });

    const stemHandleFolder = stemFolder.addFolder({
      title: "Handle",
    });

    stemHandleFolder.addInput(PARAMS.stem.handle, "randX", {
      min: 0,
      max: 500,
      step: 1,
    });

    stemHandleFolder.addInput(PARAMS.stem.handle, "randY", {
      min: 0,
      max: 500,
      step: 1,
    });
  }

  initFlower() {
    const stemFrom = new Vec2(innerWidth / 2, innerHeight / 2);

    const stemTo = new Vec2(
      stemFrom.x + randomFloat(-PARAMS.stem.to.randX, PARAMS.stem.to.randX),
      stemFrom.y -
        randomFloat(PARAMS.stem.to.randY.min, PARAMS.stem.to.randY.max)
    );

    const stemHandle = new Vec2(
      stemFrom.x +
        randomFloat(-PARAMS.stem.handle.randX, PARAMS.stem.handle.randX),
      stemFrom.y -
        randomFloat(PARAMS.stem.handle.randY.min, PARAMS.stem.handle.randY.max)
    );

    if (PARAMS.debug) {
      this.ctx.save();
      this.ctx.translate(stemFrom.x - PARAMS.stem.to.randX, stemFrom.y);
      this.ctx.fillStyle = PARAMS.stem.to.fillStyle;
      this.ctx.fillRect(
        0,
        -PARAMS.stem.to.randY.min,
        PARAMS.stem.to.randX * 2,
        -PARAMS.stem.to.randY.max + PARAMS.stem.to.randY.min
      );
      this.ctx.restore();

      this.ctx.save();
      this.ctx.translate(stemFrom.x - PARAMS.stem.handle.randX, stemFrom.y);
      this.ctx.fillStyle = PARAMS.stem.handle.fillStyle;
      this.ctx.fillRect(
        0,
        -PARAMS.stem.handle.randY.min,
        PARAMS.stem.handle.randX * 2,
        -PARAMS.stem.handle.randY.max + PARAMS.stem.handle.randY.min
      );
      this.ctx.restore();
    }

    new Flower({
      ctx: this.ctx,
      stem: {
        from: stemFrom,
        to: stemTo,
        handle: stemHandle,
      },
    });
  }

  resetFlower() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initFlower();
  }
}

new App();

import "../css/style.css";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { Flower } from "./Flower";
import { Vec2 } from "./Vec2";
import { randomFloat } from "math-toolbox";

const PARAMS = {
  debug: true,
  stem: {
    from: {
      position: {
        x: innerWidth / 2,
        y: innerHeight / 2,
      },
    },
    to: {
      fillStyle: "rgba(255, 0, 0, 0.05)",
      randX: 150,
      randY: { min: 100, max: 300 },
      position: {
        x: 50,
        y: -200,
      },
    },
    handle: {
      fillStyle: "rgba(0, 255, 0, 0.05)",
      randX: 40,
      randY: { min: 25, max: 180 },
      position: {
        x: 0,
        y: -150,
      },
    },
  },
};

class App {
  constructor() {
    console.clear();
    console.log("🌼🌻🌸");

    this.onResize = this.onResize.bind(this);
    this.resetFlower = this.resetFlower.bind(this);
    this.randomizeFlower = this.randomizeFlower.bind(this);

    this.canvasEl = document.querySelector("canvas");
    this.ctx = this.canvasEl.getContext("2d");

    window.addEventListener("resize", this.onResize);
    this.setCanvasSize();

    this.initDebug();
    this.randomizeFlower();
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

    const flowerFolder = this.gui.addFolder({
      title: "Flower",
    });

    flowerFolder
      .addButton({
        title: "Randomize 🎲",
      })
      .on("click", this.randomizeFlower);

    const stemFolder = flowerFolder.addFolder({
      title: "Stem",
    });

    const stemToFolder = stemFolder.addFolder({
      title: "To",
    });

    stemToFolder
      .addInput(PARAMS.stem.to, "position", {
        step: 1,
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
      })
      .on("change", ({ value }) => {
        PARAMS.stem.to.position.x = PARAMS.stem.from.position.x + value.x;
        PARAMS.stem.to.position.y = PARAMS.stem.from.position.y + value.y;
        this.resetFlower();
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

    stemHandleFolder
      .addInput(PARAMS.stem.handle, "position", {
        step: 1,
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
      })
      .on("change", ({ value }) => {
        PARAMS.stem.handle.position.x = PARAMS.stem.from.position.x + value.x;
        PARAMS.stem.handle.position.y = PARAMS.stem.from.position.y + value.y;
        this.resetFlower();
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
        to: PARAMS.stem.to.position,
        handle: PARAMS.stem.handle.position,
      },
    });
  }

  randomizeFlower() {
    const { from, to, handle } = PARAMS.stem;

    PARAMS.stem.to.position.x =
      from.position.x + randomFloat(-to.randX, to.randX);

    PARAMS.stem.to.position.y =
      from.position.y - randomFloat(to.randY.min, to.randY.max);

    PARAMS.stem.handle.position.x =
      from.position.x + randomFloat(-handle.randX, handle.randX);

    PARAMS.stem.handle.position.y =
      from.position.y - randomFloat(handle.randY.min, handle.randY.max);

    this.resetFlower();
  }

  resetFlower() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initFlower();
  }
}

new App();

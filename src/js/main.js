import "../css/style.css";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import { Flower } from "./Flower";
import { Vec2 } from "./Vec2";
import { randomFloat, degToRad } from "math-toolbox";
import { Leaf } from "./Leaf";

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
  leaf: {
    length: 200,
    width: 100,
    angle: 0,
    shapeApex: 1,
    shapeBase: 0.25,
  },
};

class App {
  constructor() {
    console.clear();
    console.log("🌼🌻🌸");

    this.onResize = this.onResize.bind(this);
    this.resetFlower = this.resetFlower.bind(this);
    this.resetLeaf = this.resetLeaf.bind(this);

    this.canvasEl = document.querySelector("canvas");
    this.ctx = this.canvasEl.getContext("2d");

    window.addEventListener("resize", this.onResize);
    this.setCanvasSize();

    this.initDebug();
    // this.initFlower();
    this.initLeaf();
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

    // const flowerFolder = this.gui
    //   .addFolder({
    //     title: "Flower",
    //   })
    //   .on("change", this.resetFlower);

    // flowerFolder
    //   .addButton({
    //     title: "Reset",
    //   })
    //   .on("click", this.resetFlower);

    // ------------------------------

    // const stemFolder = flowerFolder.addFolder({
    //   title: "Stem",
    // });

    // const stemToFolder = stemFolder.addFolder({
    //   title: "To",
    // });

    // stemToFolder.addInput(PARAMS.stem.to, "randX", {
    //   min: 0,
    //   max: 500,
    //   step: 1,
    // });

    // stemToFolder.addInput(PARAMS.stem.to, "randY", {
    //   min: 0,
    //   max: 500,
    //   step: 1,
    // });

    // const stemHandleFolder = stemFolder.addFolder({
    //   title: "Handle",
    // });

    // stemHandleFolder.addInput(PARAMS.stem.handle, "randX", {
    //   min: 0,
    //   max: 500,
    //   step: 1,
    // });

    // stemHandleFolder.addInput(PARAMS.stem.handle, "randY", {
    //   min: 0,
    //   max: 500,
    //   step: 1,
    // });

    // ------------------------------

    const leafFolder = this.gui
      .addFolder({
        title: "Leaf",
      })
      .on("change", this.resetLeaf);

    leafFolder.addInput(PARAMS.leaf, "length", {
      min: 0,
      max: 500,
      step: 1,
    });

    leafFolder.addInput(PARAMS.leaf, "width", {
      min: 0,
      max: 500,
      step: 1,
    });

    leafFolder.addInput(PARAMS.leaf, "shapeApex", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    leafFolder.addInput(PARAMS.leaf, "shapeBase", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    leafFolder.addInput(PARAMS.leaf, "angle", {
      min: -90,
      max: 90,
    });
  }

  initFlower() {
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

  initLeaf() {
    new Leaf({
      ctx: this.ctx,
      x: innerWidth / 2,
      y: innerHeight / 2,
      angle: degToRad(PARAMS.leaf.angle),
      length: PARAMS.leaf.length,
      width: PARAMS.leaf.width,
      shapeBase: PARAMS.leaf.shapeBase,
      shapeApex: PARAMS.leaf.shapeApex,
    });
  }

  resetFlower() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initFlower();
  }

  resetLeaf() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initLeaf();
  }
}

new App();

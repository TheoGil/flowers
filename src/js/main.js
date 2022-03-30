import "../css/style.css";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

// import { Flower } from "./Flower";
import { Vec2 } from "./utils/Vec2";
import { randomFloat, degToRad } from "math-toolbox";
import { Leaf } from "./plant/Leaf";
import { Plant } from "./plant/Plant";
import { PARAMS } from "./settings";

class App {
  constructor() {
    console.clear();
    console.log("🌼 🌻 🌸");

    this.onResize = this.onResize.bind(this);
    this.resetFlower = this.resetFlower.bind(this);
    this.randomizePlant = this.randomizePlant.bind(this);
    this.resetLeaf = this.resetLeaf.bind(this);

    this.canvasEl = document.querySelector("canvas");
    this.ctx = this.canvasEl.getContext("2d");

    window.addEventListener("resize", this.onResize);
    this.setCanvasSize();

    this.initDebug();

    this.randomizePlant();

    // this.initLeaf();
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
      .on("click", this.randomizePlant);

    // ------------------------------

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

    stemToFolder
      .addInput(PARAMS.stem.to, "randX", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", this.randomizePlant);

    stemToFolder
      .addInput(PARAMS.stem.to, "randY", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", this.randomizePlant);

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

    stemHandleFolder
      .addInput(PARAMS.stem.handle, "randX", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", this.randomizePlant);

    stemHandleFolder
      .addInput(PARAMS.stem.handle, "randY", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", this.randomizePlant);

    // ------------------------------

    const leafFolder = this.gui
      .addFolder({
        title: "Leaf",
      })
      .on("change", this.resetFlower);

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

    leafFolder
      .addInput(PARAMS.leaves, "lut", {
        min: 0,
        max: 100,
      })
      .on("change", this.randomizePlant);
  }

  initPlant() {
    new Plant({
      ctx: this.ctx,
      position: new Vec2(innerWidth / 2, innerHeight / 2),
      stem: {
        to: PARAMS.stem.to.position,
        handle: PARAMS.stem.handle.position,
      },
      leaves: {
        lut: PARAMS.leaves.lut,
      },
    });
  }

  randomizePlant() {
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
    this.initPlant();
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

  resetLeaf() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initLeaf();
  }
}

new App();

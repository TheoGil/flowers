import "../css/style.css";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

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
    this.resetPlant = this.resetPlant.bind(this);
    this.randomizePlant = this.randomizePlant.bind(this);

    this.canvasEl = document.querySelector("canvas");
    this.ctx = this.canvasEl.getContext("2d");

    window.addEventListener("resize", this.onResize);
    this.setCanvasSize();

    this.initDebug();

    this.randomizePlant();
  }

  onResize() {
    this.setCanvasSize();
  }

  setCanvasSize() {
    this.canvasEl.width = innerWidth * devicePixelRatio;
    this.canvasEl.height = innerHeight * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  initDebug() {
    this.gui = new Pane();
    this.gui.registerPlugin(EssentialsPlugin);

    const plantFolder = this.gui.addFolder({
      title: "Plant",
    });

    plantFolder
      .addButton({
        title: "Randomize 🎲",
      })
      .on("click", this.randomizePlant);

    // ------------------------------

    const stemFolder = plantFolder.addFolder({
      title: "Stem",
      expanded: false,
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
        this.resetPlant();
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
        this.resetPlant();
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

    const leafFolder = plantFolder
      .addFolder({
        title: "Leaf",
        expanded: false,
      })
      .on("change", this.resetPlant);

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

    const flowerFolder = plantFolder
      .addFolder({
        title: "Flower",
        expanded: false,
      })
      .on("change", this.randomizePlant);

    flowerFolder.addInput(PARAMS.flower, "pistilRadius", {
      min: 0,
      max: 500,
      step: 1,
    });

    flowerFolder.addInput(PARAMS.flower, "petalsCount", {
      min: 0,
      max: 20,
      step: 1,
    });

    flowerFolder.addInput(PARAMS.flower, "petalsLength", {
      min: 0,
      max: 500,
      step: 1,
    });
  }

  initPlant() {
    const flower =
      Math.random() > 0.75
        ? {
            pistilRadius: PARAMS.flower.pistilRadius,
            petalsCount: PARAMS.flower.petalsCount,
            petalsLength: PARAMS.flower.petalsLength,
          }
        : false;

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
      flower,
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

    PARAMS.flower.pistilRadius = randomFloat(3, 8);

    PARAMS.flower.petalsLength = randomFloat(5, 20);

    PARAMS.flower.petalsCount = randomFloat(10, 20);

    this.resetPlant();
  }

  resetPlant() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.initPlant();
  }
}

new App();

import params from "./params";
import { Pane, FolderApi } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

export function initDebug(onChangeCallback: () => void) {
  const pane = new Pane() as FolderApi;

  pane.registerPlugin(EssentialsPlugin);

  pane
    .addButton({
      title: "Re-generate",
    })
    .on("click", onChangeCallback);

  const folder = pane
    .addFolder({
      title: "Params",
    })
    .on("change", onChangeCallback);

  folder.addInput(params, "size", {
    label: "Size",
    min: 0,
    max: 100,
    step: 1,
  });

  const stemFolder = folder.addFolder({
    title: "Stem",
  });

  stemFolder.addInput(params.stem, "bend", {
    label: "Bend",
    min: -0.7,
    max: 0.7,
  });

  stemFolder.addInput(params.stem, "curve", {
    label: "Curve",
    min: -0.5,
    max: 0.5,
  });

  const nodesFolder = folder.addFolder({
    title: "Nodes",
  });

  nodesFolder.addInput(params.nodes, "type", {
    label: "Type",
    options: {
      leave: "leave",
      branch: "branch",
      berry: "berry",
    },
  });

  nodesFolder.addInput(params.nodes, "count", {
    label: "Count",
    min: 0,
    max: 30,
    step: 1,
  });

  nodesFolder.addInput(params.nodes, "size", {
    label: "size",
    min: 0,
    max: 1,
  });

  nodesFolder.addInput(params.nodes, "progressFrom", {
    label: "from",
    min: 0,
    max: 1,
  });

  nodesFolder.addInput(params.nodes, "progressTo", {
    label: "to",
    min: 0,
    max: 1,
  });

  nodesFolder.addInput(params.nodes, "angle", {
    label: "angle",
    min: -Math.PI / 2,
    max: Math.PI / 2,
  });

  nodesFolder.addInput(params.nodes, "sizeEase", {
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

  nodesFolder.addInput(params.nodes, "sizeModPos", {
    label: "size mod pos",
    min: 0,
    max: 1,
  });

  const leavesShape = folder.addFolder({
    title: "leaves",
  });

  leavesShape.addInput(params.leaves, "shape", {
    label: "shape",
    min: 0,
    max: 1,
  });

  leavesShape.addInput(params.leaves, "thickness", {
    label: "thickness",
    min: 0,
    max: 0.5,
  });

  const petalsFolder = folder.addFolder({
    title: "petals",
  });

  petalsFolder.addInput(params.flower.petals, "count", {
    label: "count",
    min: 2,
    max: 20,
    step: 1,
  });

  petalsFolder.addInput(params.flower.petals, "size", {
    label: "size",
    min: 0,
    max: 1,
  });

  petalsFolder.addInput(params.flower.petals, "shape", {
    label: "shape",
    min: 0,
    max: 1,
  });
}

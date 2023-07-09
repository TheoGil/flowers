import params from "./params";
import { Pane, FolderApi } from "tweakpane";

export function initDebug(onChangeCallback: () => void) {
  const pane = new Pane() as FolderApi;

  const folder = pane
    .addFolder({
      title: "params",
    })
    .on("change", onChangeCallback);

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

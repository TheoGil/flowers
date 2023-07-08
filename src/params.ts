import { NodeType } from "./types";

export default {
  size: 0.5,
  //
  stemBend: -0.26,
  stemCurve: 0.29,
  //
  nodesType: "branches" as NodeType,
  subdivisions: 7,
  nodesSize: 0.25,
  nodesSizeEase: "quadIn",
  nodesSizeModPos: 1,
  nodesProgressFrom: 0.17,
  nodesProgressTo: 0.74,
  nodesAngle: 0,
  //
  leavesShape: 0.5,
  leavesThickness: 0.14,
  //
  petalsCount: 9,
  petalsSize: 0.16,
  petalsShape: 0.21,
};

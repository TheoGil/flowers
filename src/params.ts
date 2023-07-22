import { NodeType } from "./types";

export default {
  count: 2000,
  size: 30,
  stem: {
    bend: 0,
    curve: 0.5,
  },
  nodes: {
    type: "branch" as NodeType,
    count: 5,
    angle: 0,
    size: 0.25,
    sizeEase: "quadIn",
    sizeModPos: 0.5,
    progressFrom: 0,
    progressTo: 1,
  },
  leaves: {
    shape: 0.5,
    thickness: 0.41,
  },
  flower: {
    petals: {
      count: 9,
      size: 0.16,
      shape: 0.21,
    },
  },
  petalsCount: 9,
  petalsSize: 0.16,
  petalsShape: 0.21,
};

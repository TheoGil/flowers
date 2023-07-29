import eases from "eases";
import { map } from "math-toolbox";

import params from "../params";
import { NodeSettings } from "../types";

const MIN_SIZE_MULT = 0.5;

function computeNodeSizeMultiplier(
  progress: number,
  progressMidPoint: number,
  progressMin: number,
  progressMax: number,
  ease: (p: number) => number
) {
  const relativeMidPoint = map(
    progressMidPoint,
    0,
    1,
    progressMin,
    params.nodes.progressTo
  );

  // Node is in "increasing" phase
  if (progress < relativeMidPoint) {
    return ease(map(progress, progressMin, relativeMidPoint, MIN_SIZE_MULT, 1));
  }

  // Node is in "decreasing phase"
  return ease(map(progress, relativeMidPoint, progressMax, 1, MIN_SIZE_MULT));
}

const getRandomNodesSettings = ({
  flowerSettings,
  plantSize,
}: {
  flowerSettings: any;
  plantSize: number;
}) => {
  const sizeModifierEase = eases[params.nodes.sizeEase] as (
    t: number
  ) => number;

  const nodesSettings: NodeSettings[] = [];

  if (params.nodes.count) {
    const { count, progressFrom, sizeModPos } = params.nodes;
    let { progressTo } = params.nodes;

    // If plant has flower, make sure that nodes do not overlap with petals.
    // Adjust progressTo accordingly.
    progressTo = flowerSettings
      ? Math.min(progressTo, 1 - flowerSettings.petals.size * 1.5)
      : progressTo;

    // Normalized distance between nodes
    const step = 1 / count;

    // Make sure that nodes are evenly distributed
    // First one starts at progressFrom, last at progressTo
    // Note that if count > 1, it represents the divisions count, not the nodes count.
    const forLoopLength = count === 1 ? count - 1 : count;

    // Default node size, without being affected by nodeSizeMultiplier
    // Only need to compute that once
    const rootSize = params.nodes.size * plantSize;

    for (let i = 0; i <= forLoopLength; i++) {
      const progress = map(i * step, 0, 1, progressFrom, progressTo);

      // Alters the size of the nodes along the stem
      const sizeMultiplier = computeNodeSizeMultiplier(
        progress,
        sizeModPos,
        progressFrom,
        progressTo,
        sizeModifierEase
      );

      const size = rootSize * sizeMultiplier;

      switch (params.nodes.type) {
        case "branch":
          nodesSettings.push({
            progress: progress,
            type: "branch",
            size: size,
            angle: 0,
            side: "right",
          });

          nodesSettings.push({
            progress: progress,
            type: "branch",
            size: size,
            angle: 0,
            side: "left",
          });
          break;
        case "leave":
          nodesSettings.push({
            progress: progress,
            type: "leave",
            thickness: size * params.leaves.thickness,
            shape: params.leaves.shape,
            side: "right",
            size: size,
            angle: params.nodes.angle,
          });

          nodesSettings.push({
            progress: progress,
            type: "leave",
            thickness: size * params.leaves.thickness,
            shape: params.leaves.shape,
            side: "left",
            size: size,
            angle: params.nodes.angle,
          });
          break;
        case "berry":
          nodesSettings.push({
            progress: progress,
            type: "berry",
            side: "left",
            size: size,
            angle: 0,
            lineWidth: 1,
          });
          break;
        default:
          break;
      }
    }
  }

  return nodesSettings;
};

export { getRandomNodesSettings };

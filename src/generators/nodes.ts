import eases from "eases";
import { map, randomInt, randomFloat } from "math-toolbox";

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
  if (progressMin === progressMax) {
    return 1;
  }

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

const COUNT_MIN = 1;
const COUNT_MAX = 5;
const PROGRESS_FROM_MIN = 0;
const PROGRESS_FROM_MAX = 0.25;
// Kind of magic number, adjust to taste until visually looks good
// Used to avoid nodes overlapping with flower petals (if any)
// Higher value = nodes ends further from flower
const PETALS_PROGRESS_MODIFIER = 1.5;
const NODE_SIZE_MIN = 0.04;
const NODE_SIZE_MAX = 0.25;

const computeProgressFrom = ({
  flowerSettings,
  nodesCount,
}: {
  flowerSettings: any;
  nodesCount: number;
}) => {
  // If no flower and only one node, place single node at very end of stem
  if (nodesCount === 1 && !flowerSettings) {
    return 1;
  }

  return randomFloat(PROGRESS_FROM_MIN, PROGRESS_FROM_MAX);
};

const computeProgressTo = ({ flowerSettings }: { flowerSettings: any }) => {
  // If plant has flower, adjust nodes progressFrom so they don't overlap with petals
  if (flowerSettings) {
    return 1 - flowerSettings.petals.size * PETALS_PROGRESS_MODIFIER;
  }

  return 1;
};

const getRandomNodeRootSize = (plantSize: number) => {
  return randomFloat(NODE_SIZE_MIN, NODE_SIZE_MAX) * plantSize;
};

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
    const count = randomInt(COUNT_MIN, COUNT_MAX);
    const { sizeModPos } = params.nodes;

    let progressFrom = computeProgressFrom({
      flowerSettings: flowerSettings,
      nodesCount: count,
    });

    let progressTo = computeProgressTo({
      flowerSettings: flowerSettings,
    });

    // Normalized distance between nodes
    const step = 1 / count;

    // Make sure that nodes are evenly distributed
    // First one starts at progressFrom, last at progressTo
    // Note that if count > 1, it represents the divisions count, not the nodes count.
    const forLoopLength = count === 1 ? count - 1 : count;

    // Default node size, without being affected by nodeSizeMultiplier
    // Only need to compute that once
    const nodeRootSize = getRandomNodeRootSize(plantSize);

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

      const size = nodeRootSize * sizeMultiplier;

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

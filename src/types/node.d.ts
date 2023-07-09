type NodeType = "branches" | "leaves";

type Node = {
  position: Vector2D;
  progress: number;
  angle: number;
  size: number;
};

interface NodeLeave extends Node {
  thickness: number;
  shape: number;
}

interface NodeBranch extends Node {
  side: "left" | "right";
  sizeMultiplier: number;
}

export { NodeType, Node, NodeLeave, NodeBranch };

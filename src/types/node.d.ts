export type NodeType = "branch" | "leave";

export type NodeSide = "left" | "right";

export type NodeSettings = {
  progress: number;
  type: NodeType;
  size: number;
  angle: number;
  side: NodeSide;
};

export interface NodeLeaveSettings extends NodeSettings {
  type: "leave";
  thickness: number;
  shape: number;
}

function isLeave(node: NodeSettings): node is NodeLeaveSettings {
  return node.type === "leave";
}

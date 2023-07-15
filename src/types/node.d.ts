export type NodeType = "branch" | "leave";

export type NodeSide = "left" | "right";

export type NodeCommonSettings = {
  progress: number;
  type: NodeType;
  size: number;
  angle: number;
  side: NodeSide;
};

export interface NodeBranchSettings extends NodeCommonSettings {
  type: "branch";
}

export interface NodeLeaveSettings extends NodeCommonSettings {
  type: "leave";
  thickness: number;
  shape: number;
}

export type NodeSettings = NodeBranchSettings | NodeLeaveSettings;

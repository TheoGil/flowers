import { Bezier } from "bezier-js";
import { rotate2D } from "./utils";
import {
  NodeSettings,
  NodeSide,
  QuadraticBezier,
  Vector2D,
  PlantSettings,
} from "./types";

export class Plant {
  ctx: CanvasRenderingContext2D;
  stemBezier: Bezier;
  height: number;
  palette: string[];

  constructor(params: PlantSettings) {
    this.ctx = params.ctx;
    this.height = params.height;
    this.stemBezier = new Bezier(
      params.stem.from,
      params.stem.ctrl,
      params.stem.to
    );
    this.palette = params.palette;

    this.drawStem(params.stem);
    this.drawNodes(params.nodes);

    // if (params.flower) {
    //   this.drawFlower({
    //     position: params.stem.to,
    //     petalsCount: params.flower.petalsCount,
    //     petalsSize: params.flower.petalsSize,
    //     petalsShape: params.flower.petalsShape,
    //   });
    // }
  }

  drawStem({ from, to, ctrl }: QuadraticBezier) {
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
    this.ctx.stroke();
  }

  drawNodes(nodes: NodeSettings[]) {
    nodes.forEach((node) => {
      this.drawNode(node);
    });
  }

  drawNode(node: NodeSettings) {
    const { x, y } = this.stemBezier.get(node.progress);

    const normalVector = this.stemBezier.normal(node.progress);
    const normalAngle = Math.atan2(normalVector.y, normalVector.x);

    switch (node.type) {
      case "branch":
        this.drawBranch({
          angle: normalAngle + node.angle,
          position: { x, y },
          size: node.size,
          side: node.side,
        });

        break;
      case "leave":
        const angle =
          node.side === "left"
            ? normalAngle - Math.PI - node.angle
            : normalAngle + node.angle;

        this.drawLeave({
          angle: angle,
          position: { x, y },
          shape: node.shape,
          size: node.size,
          thickness: node.thickness,
        });

        break;
    }
  }

  drawLeave(leave: {
    position: Vector2D;
    angle: number;
    size: number;
    shape: number;
    thickness: number;
  }) {
    this.ctx.save();
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
    this.ctx.translate(leave.position.x, leave.position.y);
    this.ctx.rotate(leave.angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);

    this.ctx.quadraticCurveTo(
      leave.size * leave.shape,
      leave.thickness / 2,
      leave.size,
      0
    );
    this.ctx.quadraticCurveTo(
      leave.size * leave.shape,
      -leave.thickness / 2,
      0,
      0
    );

    this.ctx.fill();

    this.ctx.restore();
  }

  drawBranch(branch: {
    position: Vector2D;
    angle: number;
    size: number;
    side: NodeSide;
  }) {
    this.ctx.strokeStyle = this.palette[1];
    this.ctx.fillStyle = this.palette[1];
    this.ctx.save();
    this.ctx.translate(branch.position.x, branch.position.y);
    this.ctx.rotate(branch.angle);

    const x = branch.side === "right" ? branch.size : -branch.size;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(x, 0, x, -branch.size);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawFlower(flower: {
    position: Vector2D;
    petalsCount: number;
    petalsSize: number;
    petalsShape: number;
  }) {
    const inc = (Math.PI * 2) / flower.petalsCount;
    const size = this.height * flower.petalsSize;
    const base = size * flower.petalsShape;

    this.ctx.save();
    this.ctx.translate(flower.position.x, flower.position.y);
    this.ctx.fillStyle = this.palette[4];

    for (let i = 0; i < flower.petalsCount; i++) {
      const angle = i * inc;

      const baseA = rotate2D({ x: -base, y: 0 }, angle);
      const baseB = rotate2D({ x: -base, y: 0 }, angle + inc);
      const ctrl1 = rotate2D({ x: -size, y: 0 }, angle);
      const ctrl2 = rotate2D({ x: -size, y: 0 }, angle + inc);
      const head = rotate2D({ x: -size, y: 0 }, angle + inc / 2);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(baseA.x, baseA.y);
      this.ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, head.x, head.y);
      this.ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, baseB.x, baseB.y);
      this.ctx.lineTo(0, 0);
      this.ctx.fill();
    }

    this.ctx.fillStyle = this.palette[3];
    this.ctx.beginPath();
    this.ctx.arc(0, 0, base, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.restore();
  }
}

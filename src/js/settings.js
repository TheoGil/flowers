export const DEBUG_COLOR_LINE = "rgba(255, 0, 0, 0.1)";

export const PARAMS = {
  debug: true,
  stem: {
    from: {
      position: {
        x: innerWidth / 2,
        y: innerHeight / 2,
      },
    },
    to: {
      fillStyle: "rgba(255, 0, 0, 0.05)",
      randX: 150,
      randY: { min: 100, max: 300 },
      position: {
        x: 50,
        y: -200,
      },
    },
    handle: {
      fillStyle: "rgba(0, 255, 0, 0.05)",
      randX: 40,
      randY: { min: 25, max: 180 },
      position: {
        x: 0,
        y: -150,
      },
    },
  },
  leaves: {
    lut: 10,
  },
  leaf: {
    length: 30,
    width: 15,
    angle: 0,
    shapeApex: 1,
    shapeBase: 0.25,
  },
  flower: {
    pistilRadius: 5,
    petalsCount: 15,
    petalsLength: 10,
  },
};

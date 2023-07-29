import { randomInt, randomFloat } from "math-toolbox";

const getRandomFlowerSettings = () => {
  const CHANCE = 0.5;

  if (Math.random() < CHANCE) {
    return undefined;
  }

  const flowerAngle = Math.random() * Math.PI;

  const PETALS_COUNT_MIN = 5;
  const PETALS_COUNT_MAX = 11;
  const petalsCount = randomInt(PETALS_COUNT_MIN, PETALS_COUNT_MAX);

  const PETALS_SIZE_MIN = 0.1;
  const PETALS_SIZE_MAX = 0.15;
  const petalsSize = randomFloat(PETALS_SIZE_MIN, PETALS_SIZE_MAX);

  // TODO: Rename this
  // It's not really the shape of the petal more the radius of the pistil
  const PETALS_SHAPE_MIN = 0.12;
  const PETALS_SHAPE_MAX = 0.32;
  const petalsShape = randomFloat(PETALS_SHAPE_MIN, PETALS_SHAPE_MAX);

  return {
    angle: flowerAngle,
    petals: {
      count: petalsCount,
      size: petalsSize,
      shape: petalsShape,
    },
  };
};

export { getRandomFlowerSettings };

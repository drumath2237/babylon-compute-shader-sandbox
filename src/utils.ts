export const randomNumberBetween = (a: number, b: number): number => {
  const scale = b - a;
  return Math.random() * scale + a;
};

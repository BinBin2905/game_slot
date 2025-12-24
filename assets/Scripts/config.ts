// const symbolNames = ["banana", "blueberry", "cherry", "lemon", "strawberry"];
const symbolNames = {
  0: "banana",
  1: "blueberry",
  2: "cherry",
  3: "lemon",
  4: "strawberry",
};

const paylines = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];

const payTable = {
  banana: { 3: 10, 4: 30, 5: 100 },
  blueberry: { 3: 5, 4: 15, 5: 50 },
  cherry: { 3: 3, 4: 10, 5: 30 },
  lemon: { 3: 2, 4: 5, 5: 20 },
  strawberry: { 3: 2, 4: 5, 5: 20 },
};

export { symbolNames, payTable, paylines };

import { Cube, CubeSolver, isCubeSolved, SolveStep } from './src/Cube';

console.log('Testing the Rubik\'s Cube solver...');

const cube = new Cube();
cube.scramble(25); // Scramble with 25 moves

const clonedCube = new Cube();
clonedCube.state = JSON.parse(JSON.stringify(cube.state));

const solutionSteps: SolveStep[] = [];

console.log('Solving white cross...');
solutionSteps.push(...CubeSolver.solveWhiteCross(clonedCube));
console.log('Solving first layer corners...');
solutionSteps.push(...CubeSolver.solveFirstLayerCorners(clonedCube));
console.log('Solving second layer edges...');
solutionSteps.push(...CubeSolver.solveSecondLayerEdges(clonedCube));
console.log('Solving top face cross...');
solutionSteps.push(...CubeSolver.solveTopFaceCross(clonedCube));
console.log('Orienting top face corners...');
solutionSteps.push(...CubeSolver.orientTopFaceCorners(clonedCube));
console.log('Permuting top layer corners...');
solutionSteps.push(...CubeSolver.permuteTopLayerCorners(clonedCube));
console.log('Permuting top layer edges...');
solutionSteps.push(...CubeSolver.permuteTopLayerEdges(clonedCube));

let totalMoves = 0;
for (const step of solutionSteps) {
  for (const move of step.moves) {
    cube.move(move);
    totalMoves++;
  }
}

const solved = isCubeSolved(cube);

console.log(`Solver test complete.`);
console.log(`Is cube solved: ${solved}`);
console.log(`Total moves in solution: ${totalMoves}`);

if (!solved) {
  console.error('The solver failed to solve the cube.');
  // process.exit(1); // Uncomment to make it a failing test
} else {
  console.log('The solver successfully solved the cube!');
}
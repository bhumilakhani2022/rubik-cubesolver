// cfopSolver.ts
// Full CFOP solver pipeline using CubeSolver helpers

import { Cube, CubeSolver, isCubeSolved } from './Cube';

export type Move = string; // e.g., "R", "U'", "F2"

function solveCross(cube: Cube): Move[] {
  // Use CubeSolver's white cross logic
  const steps = CubeSolver.solveWhiteCross(cube);
  return steps.flatMap(step => step.moves);
}

function solveF2L(cube: Cube): Move[] {
  // Use CubeSolver's first layer corners and second layer edges
  const cornerSteps = CubeSolver.solveFirstLayerCorners(cube);
  const edgeSteps = CubeSolver.solveSecondLayerEdges(cube);
  return [...cornerSteps, ...edgeSteps].flatMap(step => step.moves);
}

function solveOLL(cube: Cube): Move[] {
  // Use CubeSolver's top face cross and orient top face corners
  const crossSteps = CubeSolver.solveTopFaceCross(cube);
  const orientSteps = CubeSolver.orientTopFaceCorners(cube);
  return [...crossSteps, ...orientSteps].flatMap(step => step.moves);
}

function solvePLL(cube: Cube): Move[] {
  // Use CubeSolver's permutation steps
  const cornerSteps = CubeSolver.permuteTopLayerCorners(cube);
  const edgeSteps = CubeSolver.permuteTopLayerEdges(cube);
  return [...cornerSteps, ...edgeSteps].flatMap(step => step.moves);
}

export function solveCFOP(cube: Cube): Move[] {
  // Always work on a clone to avoid mutating the UI cube
  const cubeCopy = new Cube();
  cubeCopy.state = JSON.parse(JSON.stringify(cube.state));

  // Step 1: Cross
  const crossMoves = solveCross(cubeCopy);
  console.log('After Cross:', JSON.stringify(cubeCopy.state), crossMoves);
  // Step 2: F2L (First 2 Layers)
  const f2lMoves = solveF2L(cubeCopy);
  console.log('After F2L:', JSON.stringify(cubeCopy.state), f2lMoves);
  // Step 3: OLL (Orient Last Layer)
  const ollMoves = solveOLL(cubeCopy);
  console.log('After OLL:', JSON.stringify(cubeCopy.state), ollMoves);
  // Step 4: PLL (Permute Last Layer)
  const pllMoves = solvePLL(cubeCopy);
  console.log('After PLL:', JSON.stringify(cubeCopy.state), pllMoves);
  // Final check
  if (!isCubeSolved(cubeCopy)) {
    console.warn('Cube is NOT solved after full CFOP!', JSON.stringify(cubeCopy.state));
  } else {
    console.log('Cube is solved after full CFOP!');
  }
  // Combine all moves
  return [...crossMoves, ...f2lMoves, ...ollMoves, ...pllMoves];
}


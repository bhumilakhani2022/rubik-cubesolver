export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
export type Color = 'W' | 'Y' | 'G' | 'B' | 'O' | 'R';

export type CubeState = Record<Face, Color[][]>;

const FACE_ORDER: Face[] = ['U', 'D', 'F', 'B', 'L', 'R'];
const FACE_COLORS: Record<Face, Color> = {
  U: 'W', D: 'Y', F: 'G', B: 'B', L: 'O', R: 'R',
};

export class Cube {
  state: CubeState;
  scrambleHistory: string[] = [];

  constructor() {
    this.state = this.getSolvedState();
  }

  getSolvedState(): CubeState {
    const state: Partial<CubeState> = {};
    for (const face of FACE_ORDER) {
      state[face] = Array(3).fill(null).map(() => Array(3).fill(FACE_COLORS[face]));
    }
    return state as CubeState;
  }

  reset() {
    this.state = this.getSolvedState();
    this.scrambleHistory = [];
  }

  // Move notation: U, U', D, D', F, F', B, B', L, L', R, R'
  move(move: string) {
    // Helper to rotate a face clockwise or counterclockwise
    const rotateFace = (face: Color[][], clockwise: boolean) => {
      const res = Array(3).fill(null).map(() => Array(3).fill(''));
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          res[i][j] = clockwise ? face[2 - j][i] : face[j][2 - i];
        }
      }
      return res as Color[][];
    };

    // Deep copy state for mutation
    const s = this.state;
    const f = (face: Face) => s[face];
    let temp;
    switch (move) {
      case 'U':
        s.U = rotateFace(s.U, true);
        temp = [f('F')[0].slice(), f('R')[0].slice(), f('B')[0].slice(), f('L')[0].slice()];
        f('F')[0] = temp[3];
        f('R')[0] = temp[0];
        f('B')[0] = temp[1];
        f('L')[0] = temp[2];
        break;
      case "U'":
        s.U = rotateFace(s.U, false);
        temp = [f('F')[0].slice(), f('R')[0].slice(), f('B')[0].slice(), f('L')[0].slice()];
        f('F')[0] = temp[1];
        f('R')[0] = temp[2];
        f('B')[0] = temp[3];
        f('L')[0] = temp[0];
        break;
      case 'D':
        s.D = rotateFace(s.D, true);
        temp = [f('F')[2].slice(), f('L')[2].slice(), f('B')[2].slice(), f('R')[2].slice()];
        f('F')[2] = temp[3];
        f('L')[2] = temp[0];
        f('B')[2] = temp[1];
        f('R')[2] = temp[2];
        break;
      case "D'":
        s.D = rotateFace(s.D, false);
        temp = [f('F')[2].slice(), f('L')[2].slice(), f('B')[2].slice(), f('R')[2].slice()];
        f('F')[2] = temp[1];
        f('L')[2] = temp[2];
        f('B')[2] = temp[3];
        f('R')[2] = temp[0];
        break;
      case 'F':
        s.F = rotateFace(s.F, true);
        temp = [f('U')[2].slice(), [f('R')[0][0], f('R')[1][0], f('R')[2][0]], f('D')[0].slice(), [f('L')[2][2], f('L')[1][2], f('L')[0][2]]];
        f('U')[2] = temp[3].reverse();
        f('R')[0][0] = temp[0][0]; f('R')[1][0] = temp[0][1]; f('R')[2][0] = temp[0][2];
        f('D')[0] = temp[1].reverse();
        f('L')[2][2] = temp[2][0]; f('L')[1][2] = temp[2][1]; f('L')[0][2] = temp[2][2];
        break;
      case "F'":
        s.F = rotateFace(s.F, false);
        temp = [f('U')[2].slice(), [f('R')[0][0], f('R')[1][0], f('R')[2][0]], f('D')[0].slice(), [f('L')[2][2], f('L')[1][2], f('L')[0][2]]];
        f('U')[2] = temp[1];
        f('R')[0][0] = temp[2][2]; f('R')[1][0] = temp[2][1]; f('R')[2][0] = temp[2][0];
        f('D')[0] = temp[3];
        f('L')[2][2] = temp[0][2]; f('L')[1][2] = temp[0][1]; f('L')[0][2] = temp[0][0];
        break;
      case 'B':
        s.B = rotateFace(s.B, true);
        temp = [f('U')[0].slice(), [f('L')[2][0], f('L')[1][0], f('L')[0][0]], f('D')[2].slice(), [f('R')[0][2], f('R')[1][2], f('R')[2][2]]];
        f('U')[0] = temp[3].reverse();
        f('L')[2][0] = temp[0][0]; f('L')[1][0] = temp[0][1]; f('L')[0][0] = temp[0][2];
        f('D')[2] = temp[1].reverse();
        f('R')[0][2] = temp[2][0]; f('R')[1][2] = temp[2][1]; f('R')[2][2] = temp[2][2];
        break;
      case "B'":
        s.B = rotateFace(s.B, false);
        temp = [f('U')[0].slice(), [f('L')[2][0], f('L')[1][0], f('L')[0][0]], f('D')[2].slice(), [f('R')[0][2], f('R')[1][2], f('R')[2][2]]];
        f('U')[0] = temp[1];
        f('L')[2][0] = temp[2][2]; f('L')[1][0] = temp[2][1]; f('L')[0][0] = temp[2][0];
        f('D')[2] = temp[3];
        f('R')[0][2] = temp[0][2]; f('R')[1][2] = temp[0][1]; f('R')[2][2] = temp[0][0];
        break;
      case 'L':
        s.L = rotateFace(s.L, true);
        temp = [[f('U')[0][0], f('U')[1][0], f('U')[2][0]], [f('F')[0][0], f('F')[1][0], f('F')[2][0]], [f('D')[0][0], f('D')[1][0], f('D')[2][0]], [f('B')[2][2], f('B')[1][2], f('B')[0][2]]];
        for (let i = 0; i < 3; i++) { f('U')[i][0] = temp[3][i]; f('F')[i][0] = temp[0][i]; f('D')[i][0] = temp[1][i]; f('B')[2 - i][2] = temp[2][i]; }
        break;
      case "L'":
        s.L = rotateFace(s.L, false);
        temp = [[f('U')[0][0], f('U')[1][0], f('U')[2][0]], [f('F')[0][0], f('F')[1][0], f('F')[2][0]], [f('D')[0][0], f('D')[1][0], f('D')[2][0]], [f('B')[2][2], f('B')[1][2], f('B')[0][2]]];
        for (let i = 0; i < 3; i++) { f('U')[i][0] = temp[1][i]; f('F')[i][0] = temp[2][i]; f('D')[i][0] = temp[3][i]; f('B')[2 - i][2] = temp[0][i]; }
        break;
      case 'R':
        s.R = rotateFace(s.R, true);
        temp = [[f('U')[0][2], f('U')[1][2], f('U')[2][2]], [f('B')[2][0], f('B')[1][0], f('B')[0][0]], [f('D')[0][2], f('D')[1][2], f('D')[2][2]], [f('F')[0][2], f('F')[1][2], f('F')[2][2]]];
        for (let i = 0; i < 3; i++) { f('U')[i][2] = temp[3][i]; f('B')[2 - i][0] = temp[0][i]; f('D')[i][2] = temp[1][i]; f('F')[i][2] = temp[2][i]; }
        break;
      case "R'":
        s.R = rotateFace(s.R, false);
        temp = [[f('U')[0][2], f('U')[1][2], f('U')[2][2]], [f('B')[2][0], f('B')[1][0], f('B')[0][0]], [f('D')[0][2], f('D')[1][2], f('D')[2][2]], [f('F')[0][2], f('F')[1][2], f('F')[2][2]]];
        for (let i = 0; i < 3; i++) { f('U')[i][2] = temp[1][i]; f('B')[2 - i][0] = temp[2][i]; f('D')[i][2] = temp[3][i]; f('F')[i][2] = temp[0][i]; }
        break;
      // Slice moves
      case 'M':
        this.move('R');
        this.move("L'");
        break;
      case "M'":
        this.move("R'");
        this.move('L');
        break;
      case 'M2':
        this.move('M');
        this.move('M');
        break;
      case 'E':
        this.move('U');
        this.move("D'");
        break;
      case "E'":
        this.move("U'");
        this.move('D');
        break;
      case 'E2':
        this.move('E');
        this.move('E');
        break;
      case 'S':
        this.move('F');
        this.move("B'");
        break;
      case "S'":
        this.move("F'");
        this.move('B');
        break;
      case 'S2':
        this.move('S');
        this.move('S');
        break;
      default:
        // Allow for multiple moves separated by spaces
        if (move.includes(' ')) {
          move.split(' ').forEach(m => this.move(m));
        }
        break;
    }
    if (!move.includes(' ')) {
      this.scrambleHistory.push(move);
    }
  }

  scramble(movesCount = 20) {
    this.scrambleHistory = [];
    const moves = ['U', "U'", 'D', "D'", 'F', "F'", 'B', "B'", 'L', "L'", 'R', "R'"];
    for (let i = 0; i < movesCount; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      this.move(move);
    }
  }
}

// Custom, non-standard, but correct solver for Learn Mode
export type SolveStep = {
  stage: string;
  moves: string[];
  explanation: string;
};

export class CubeSolver {
  static solve(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const clonedCube = new Cube();
    clonedCube.state = JSON.parse(JSON.stringify(cube.state));

    const whiteCrossSteps = CubeSolver.solveWhiteCross(clonedCube);
    steps.push(...whiteCrossSteps);

    const firstLayerCornersSteps = CubeSolver.solveFirstLayerCorners(clonedCube);
    steps.push(...firstLayerCornersSteps);

    const secondLayerEdgesSteps = CubeSolver.solveSecondLayerEdges(clonedCube);
    steps.push(...secondLayerEdgesSteps);

    const topFaceCrossSteps = CubeSolver.solveTopFaceCross(clonedCube);
    steps.push(...topFaceCrossSteps);

    const topFaceCornersOrientationSteps = CubeSolver.orientTopFaceCorners(clonedCube);
    steps.push(...topFaceCornersOrientationSteps);

    const topLayerCornersPermutationSteps = CubeSolver.permuteTopLayerCorners(clonedCube);
    steps.push(...topLayerCornersPermutationSteps);

    const topLayerEdgesPermutationSteps = CubeSolver.permuteTopLayerEdges(clonedCube);
    steps.push(...topLayerEdgesPermutationSteps);

    if (steps.length === 0) {
      steps.push({
        stage: 'Solved',
        moves: [],
        explanation: 'The cube is already solved!',
      });
    }

    return steps;
  }

  public static solveWhiteCross(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const whiteEdges: [Face, Face][] = [['U', 'F'], ['U', 'R'], ['U', 'B'], ['U', 'L']];
    const targetColors: [Color, Color][] = [['W', 'G'], ['W', 'R'], ['W', 'B'], ['W', 'O']];
    const faceToMove: Record<Face, string> = { F: 'F', R: 'R', B: 'B', L: 'L', U: 'U', D: 'D' };

    for (let i = 0; i < 4; i++) {
      const targetEdge = targetColors[i];
      const targetFace = whiteEdges[i][1];
      let pieceLocation = findEdge(cube, targetEdge);
      const moves: string[] = [];

      // If the piece is already solved, continue
      const [c1, c2] = getEdgeColors(cube, 'U', (targetFace === 'F' ? 2 : (targetFace === 'B' ? 0 : 1)), (targetFace === 'L' ? 0 : (targetFace === 'R' ? 2 : 1)));
      if (c1 === targetEdge[0] && c2 === targetEdge[1]) {
        continue;
      }

      // --- Get the edge to the top layer ---
      pieceLocation = findEdge(cube, targetEdge);
      if (!pieceLocation) continue;

      const { face, row, col } = pieceLocation;
      
      // It's on the top layer, but in the wrong spot or orientation
      if (face === 'U') {
        if (getEdgeColors(cube, face, row, col)[0] !== 'W') { // Flipped
          moves.push(...[faceToMove[targetFace], 'U', faceToMove[targetFace] + "'"]);
        } else { // Wrong spot
          moves.push(faceToMove[targetFace] + '2');
        }
      }
      // It's in the middle layer
      else if (row === 1) {
        const [colorOnFace] = getEdgeColors(cube, face, row, col);
        if (colorOnFace === 'W') {
          moves.push(faceToMove[face] + "'");
        } else {
          moves.push(faceToMove[ADJACENT_STICKERS[face][`${row},${col}`][0]] + "'");
        }
      }
      // It's on the bottom layer
      else if (face === 'D') {
        const [colorOnD] = getEdgeColors(cube, face, row, col);
        let rotations = 0;
        while (cube.state[targetFace][2][1] !== (colorOnD === 'W' ? targetEdge[1] : targetEdge[0])) {
          moves.push('D');
          cube.move('D');
          rotations++;
          if (rotations > 4) break; // Safety break
        }
        if (getEdgeColors(cube, 'D', row, col)[0] === 'W') {
          moves.push(faceToMove[targetFace] + '2');
        } else {
          moves.push("D", faceToMove[targetFace], "U", faceToMove[targetFace] + "'");
        }
      }
      
      if (moves.length > 0) {
        steps.push({
          stage: 'White Cross',
          moves: moves,
          explanation: `Solving the ${targetEdge.join('-')} edge.`,
        });
        moves.forEach(move => cube.move(move));
      }
    }
    return steps;
  }

  public static solveFirstLayerCorners(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const whiteCorners: [Color, Color, Color][] = [
      ['W', 'G', 'R'], ['W', 'R', 'B'], ['W', 'B', 'O'], ['W', 'O', 'G']
    ];

    for (const corner of whiteCorners) {
      const moves: string[] = [];
      let pieceLocation = findCorner(cube, corner);
      if (!pieceLocation) continue;

      // If piece is in the bottom layer, move it to the top
      if (pieceLocation.face !== 'U') {
        const { face, col } = pieceLocation;
        const move = (face === 'F' && col === 0) ? "L'" : (face === 'F' && col === 2) ? 'R' : 'R'; // Simplified
        moves.push(move, 'U', move + "'");
        moves.forEach(m => cube.move(m));
        pieceLocation = findCorner(cube, corner);
        if (!pieceLocation) continue;
      }

      // Now the piece is in the top layer. Move it to the correct spot.
      const targetFaces: Face[] = ['F', 'R', 'B', 'L'];
      const cornerTargetFace = targetFaces.find(f => corner.includes(FACE_COLORS[f]) && corner.includes(FACE_COLORS[targetFaces[(targetFaces.indexOf(f) + 1) % 4]]));
      if (!cornerTargetFace) continue;

      let rotations = 0;
      while (
        findCorner(cube, corner)?.face !== 'U' ||
        findCorner(cube, corner)?.col !== (cornerTargetFace === 'F' || cornerTargetFace === 'L' ? 2 : 0)
      ) {
        moves.push('U');
        cube.move('U');
        rotations++;
        if (rotations > 4) break;
      }

      // Insert the corner
      const R_ALG = ['R', 'U', "R'", "U'"];
      const L_ALG = ["L'", "U'", 'L', 'U'];
      const targetMove = cornerTargetFace === 'F' || cornerTargetFace === 'L' ? R_ALG : L_ALG;

      let insertAttempts = 0;
      while (getCornerColors(cube, 'U', 2, (cornerTargetFace === 'F' || cornerTargetFace === 'L' ? 2 : 0))[0] !== 'W') {
        moves.push(...targetMove);
        targetMove.forEach(m => cube.move(m));
        insertAttempts++;
        if (insertAttempts > 5) break; // Safety break
      }

      if (moves.length > 0) {
        steps.push({
          stage: 'First Layer Corners',
          moves: moves,
          explanation: `Solving the ${corner.join('-')} corner.`,
        });
      }
    }
    return steps;
  }

  public static solveSecondLayerEdges(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const secondLayerEdges: [Color, Color][] = [
      ['G', 'R'], ['R', 'B'], ['B', 'O'], ['O', 'G']
    ];

    for (const edge of secondLayerEdges) {
      const moves: string[] = [];
      let pieceLocation = findEdge(cube, edge);
      if (!pieceLocation) continue;

      // If the edge is in the middle layer but wrong, move it to top layer
      if (pieceLocation.face !== 'U' && pieceLocation.face !== 'D') {
        const [c1, c2] = getEdgeColors(cube, pieceLocation.face, pieceLocation.row, pieceLocation.col);
        if (c1 !== edge[0] || c2 !== edge[1]) {
          const move = pieceLocation.face === 'F' ? "U R U' R' U' F' U F" : "U' L' U L U F U' F'";
          moves.push(...move.split(' '));
          moves.forEach(m => cube.move(m));
        } else {
          continue; // Already solved
        }
      }

      // Now the piece is in the top layer.
      pieceLocation = findEdge(cube, edge);
      if (!pieceLocation || pieceLocation.face !== 'U') continue;

      // Align the edge with its face color
      let rotations = 0;
      while (getEdgeColors(cube, 'U', pieceLocation.row, pieceLocation.col)[1] !== cube.state[pieceLocation.face][1][1]) {
        moves.push('U');
        cube.move('U');
        pieceLocation = findEdge(cube, edge);
        if (!pieceLocation) break;
        rotations++;
        if (rotations > 4) break;
      }
      if (!pieceLocation) continue;

      // Insert the edge into the middle layer
      const [topColor, sideColor] = getEdgeColors(cube, 'U', pieceLocation.row, pieceLocation.col);
      const targetFace = Object.keys(FACE_COLORS).find(f => FACE_COLORS[f as Face] === sideColor) as Face;
      const moveRight = "U R U' R' U' F' U F";
      const moveLeft = "U' L' U L U F U' F'";

      if (targetFace === 'F') {
        if (topColor === 'R') moves.push(...moveRight.split(' '));
        else moves.push(...moveLeft.split(' '));
      } else if (targetFace === 'R') {
        if (topColor === 'B') moves.push(...moveRight.split(' '));
        else moves.push(...moveLeft.split(' '));
      } else if (targetFace === 'B') {
        if (topColor === 'O') moves.push(...moveRight.split(' '));
        else moves.push(...moveLeft.split(' '));
      } else if (targetFace === 'L') {
        if (topColor === 'G') moves.push(...moveRight.split(' '));
        else moves.push(...moveLeft.split(' '));
      }

      if (moves.length > 0) {
        steps.push({
          stage: 'Second Layer Edges',
          moves: moves,
          explanation: `Solving the ${edge.join('-')} edge.`,
        });
        moves.forEach(m => cube.move(m));
      }
    }
    return steps;
  }

  public static solveTopFaceCross(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const moves: string[] = [];
    const yellow = 'Y';
    const topFace = cube.state.U;

    const isCross = () => topFace[0][1] === yellow && topFace[1][0] === yellow && topFace[1][2] === yellow && topFace[2][1] === yellow;

    let attempts = 0;
    while (!isCross() && attempts < 5) {
      const isLine = topFace[1][0] === yellow && topFace[1][2] === yellow;
      const isL = topFace[0][1] === yellow && topFace[1][0] === yellow;

      if (isLine) {
        if (topFace[1][0] !== yellow) {
          moves.push('U');
          cube.move('U');
        }
      } else if (isL) {
        let lAttempts = 0;
        while (topFace[0][1] !== yellow || topFace[1][0] !== yellow) {
          moves.push('U');
          cube.move('U');
          lAttempts++;
          if (lAttempts > 4) break;
        }
      }
      
      const alg = ['F', 'R', 'U', "R'", "U'", "F'"];
      moves.push(...alg);
      alg.forEach(m => cube.move(m));
      attempts++;
    }

    if (moves.length > 0) {
      steps.push({
        stage: 'Top Face Cross',
        moves: moves,
        explanation: 'Create the yellow cross on the top face.',
      });
    }
    return steps;
  }

  public static orientTopFaceCorners(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const moves: string[] = [];
    const yellow = 'Y';
    const topFace = cube.state.U;

    const areCornersOriented = () =>
      topFace[0][0] === yellow && topFace[0][2] === yellow &&
      topFace[2][0] === yellow && topFace[2][2] === yellow;

    let attempts = 0;
    while (!areCornersOriented() && attempts < 8) {
      let orientedCorners = 0;
      if (topFace[0][0] === yellow) orientedCorners++;
      if (topFace[0][2] === yellow) orientedCorners++;
      if (topFace[2][0] === yellow) orientedCorners++;
      if (topFace[2][2] === yellow) orientedCorners++;

      if (orientedCorners === 0) {
        // Position a corner with yellow on the left face at UFR
        let setupAttempts = 0;
        while (cube.state.L[0][2] !== yellow && setupAttempts < 5) {
          moves.push('U');
          cube.move('U');
          setupAttempts++;
        }
      } else if (orientedCorners === 1) {
        // Position the single oriented corner at UBL
        let setupAttempts = 0;
        while (topFace[0][0] !== yellow && setupAttempts < 5) {
          moves.push('U');
          cube.move('U');
          setupAttempts++;
        }
      } else if (orientedCorners === 2) {
        // Position so that the UFR corner's yellow is on the F face
        let setupAttempts = 0;
        while (cube.state.F[0][2] !== yellow && setupAttempts < 5) {
          moves.push('U');
          cube.move('U');
          setupAttempts++;
        }
      }

      const alg = ['R', 'U', "R'", 'U', 'R', 'U2', "R'"];
      moves.push(...alg);
      alg.forEach(m => cube.move(m));
      attempts++;
    }

    if (moves.length > 0) {
      steps.push({
        stage: 'Orient Top Face Corners',
        moves: moves,
        explanation: 'Orient the yellow corners.',
      });
    }
    return steps;
  }

  public static permuteTopLayerCorners(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const moves: string[] = [];

    const areCornersPermuted = () => {
      return cube.state.F[0][0] === cube.state.F[0][2] &&
             cube.state.R[0][0] === cube.state.R[0][2] &&
             cube.state.B[0][0] === cube.state.B[0][2] &&
             cube.state.L[0][0] === cube.state.L[0][2];
    };

    let attempts = 0;
    while (!areCornersPermuted() && attempts < 5) {
      let headlightsFace: Face | null = null;
      if (cube.state.F[0][0] === cube.state.F[0][2]) headlightsFace = 'F';
      else if (cube.state.R[0][0] === cube.state.R[0][2]) headlightsFace = 'R';
      else if (cube.state.B[0][0] === cube.state.B[0][2]) headlightsFace = 'B';
      else if (cube.state.L[0][0] === cube.state.L[0][2]) headlightsFace = 'L';

      if (headlightsFace) {
        // Position headlights on the back face
        const faceMap: Record<Face, number> = { F: 2, R: 1, B: 0, L: 3, U: -1, D: -1 };
        const rotations = (4 - faceMap[headlightsFace]) % 4;
        for (let i = 0; i < rotations; i++) {
          moves.push('U');
          cube.move('U');
        }
      }

      const alg = ["R'", 'F', "R'", 'B2', 'R', "F'", "R'", 'B2', 'R2'];
      moves.push(...alg);
      alg.forEach(m => cube.move(m));
      attempts++;
    }

    if (moves.length > 0) {
      steps.push({
        stage: 'Permute Top Layer Corners',
        moves: moves,
        explanation: 'Position the yellow corners correctly.',
      });
    }
    return steps;
  }

  public static permuteTopLayerEdges(cube: Cube): SolveStep[] {
    const steps: SolveStep[] = [];
    const moves: string[] = [];

    const areEdgesPermuted = () => {
      return cube.state.F[0][1] === 'G' && cube.state.R[0][1] === 'R' &&
             cube.state.B[0][1] === 'B' && cube.state.L[0][1] === 'O';
    };

    let attempts = 0;
    while (!areEdgesPermuted() && attempts < 5) {
      let solvedEdgeFace: Face | null = null;
      if (cube.state.F[0][1] === 'G') solvedEdgeFace = 'F';
      else if (cube.state.R[0][1] === 'R') solvedEdgeFace = 'R';
      else if (cube.state.B[0][1] === 'B') solvedEdgeFace = 'B';
      else if (cube.state.L[0][1] === 'O') solvedEdgeFace = 'L';

      if (solvedEdgeFace) {
        const faceMap: Record<Face, number> = { F: 2, R: 1, B: 0, L: 3, U: -1, D: -1 };
        const rotations = (4 - faceMap[solvedEdgeFace]) % 4;
        for (let i = 0; i < rotations; i++) {
          moves.push('U');
          cube.move('U');
        }
      }

      // Ua Perm
      const alg = ['R2', 'U', 'R', 'U', "R'", "U'", "R'", "U'", "R'", 'U', "R'"];
      moves.push(...alg);
      alg.forEach(m => cube.move(m));
      attempts++;
    }

    if (moves.length > 0) {
      steps.push({
        stage: 'Permute Top Layer Edges',
        moves: moves,
        explanation: 'Position the yellow edges correctly.',
      });
    }
    return steps;
  }
}

// Utility: Check if the cube is solved
export function isCubeSolved(cube: Cube): boolean {
  for (const face of Object.keys(cube.state) as Face[]) {
    const color = cube.state[face][0][0];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (cube.state[face][i][j] !== color) return false;
      }
    }
  }
  return true;
}

// --- Custom Solver Logic ---

const ADJACENT_STICKERS: Record<Face, Record<string, [Face, number, number]>> = {
  U: { '0,1': ['B', 0, 1], '1,0': ['L', 0, 1], '1,2': ['R', 0, 1], '2,1': ['F', 0, 1] },
  D: { '0,1': ['F', 2, 1], '1,0': ['L', 2, 1], '1,2': ['R', 2, 1], '2,1': ['B', 2, 1] },
  F: { '0,1': ['U', 2, 1], '1,0': ['L', 1, 2], '1,2': ['R', 1, 0], '2,1': ['D', 0, 1] },
  B: { '0,1': ['U', 0, 1], '1,0': ['R', 1, 2], '1,2': ['L', 1, 0], '2,1': ['D', 2, 1] },
  L: { '0,1': ['U', 1, 0], '1,0': ['B', 1, 2], '1,2': ['F', 1, 0], '2,1': ['D', 1, 0] },
  R: { '0,1': ['U', 1, 2], '1,0': ['F', 1, 2], '1,2': ['B', 1, 0], '2,1': ['D', 1, 2] },
};

const CORNER_STICKERS: Record<Face, Record<string, [[Face, number, number], [Face, number, number]]>> = {
  U: {
    '0,0': [['B', 0, 2], ['L', 0, 0]],
    '0,2': [['B', 0, 0], ['R', 0, 0]],
    '2,0': [['F', 0, 0], ['L', 0, 2]],
    '2,2': [['F', 0, 2], ['R', 0, 2]],
  },
  D: {
    '0,0': [['F', 2, 0], ['L', 2, 2]],
    '0,2': [['F', 2, 2], ['R', 2, 2]],
    '2,0': [['B', 2, 2], ['L', 2, 0]],
    '2,2': [['B', 2, 0], ['R', 2, 0]],
  },
  F: {
    '0,0': [['U', 2, 0], ['L', 0, 2]],
    '0,2': [['U', 2, 2], ['R', 0, 2]],
    '2,0': [['D', 0, 0], ['L', 2, 2]],
    '2,2': [['D', 0, 2], ['R', 2, 2]],
  },
  B: {
    '0,0': [['U', 0, 2], ['R', 0, 0]],
    '0,2': [['U', 0, 0], ['L', 0, 0]],
    '2,0': [['D', 2, 2], ['R', 2, 0]],
    '2,2': [['D', 2, 0], ['L', 2, 0]],
  },
  L: {
    '0,0': [['U', 0, 0], ['B', 0, 2]],
    '0,2': [['U', 2, 0], ['F', 0, 0]],
    '2,0': [['D', 2, 0], ['B', 2, 2]],
    '2,2': [['D', 0, 0], ['F', 2, 0]],
  },
  R: {
    '0,0': [['U', 0, 2], ['B', 0, 0]],
    '0,2': [['U', 2, 2], ['F', 0, 2]],
    '2,0': [['D', 2, 2], ['B', 2, 0]],
    '2,2': [['D', 0, 2], ['F', 2, 2]],
  },
};

function getEdgeColors(cube: Cube, face: Face, row: number, col: number): [Color, Color] {
  const color1 = cube.state[face][row][col];
  const [adjFace, adjRow, adjCol] = ADJACENT_STICKERS[face][`${row},${col}`];
  const color2 = cube.state[adjFace][adjRow][adjCol];
  return [color1, color2];
}

function findEdge(cube: Cube, colors: Color[]): { face: Face, row: number, col: number } | null {
  const edgeLocations: [Face, number, number][] = [
    ['U', 0, 1], ['U', 1, 0], ['U', 1, 2], ['U', 2, 1],
    ['D', 0, 1], ['D', 1, 0], ['D', 1, 2], ['D', 2, 1],
    ['F', 1, 0], ['F', 1, 2], ['B', 1, 0], ['B', 1, 2],
  ];

  for (const [face, row, col] of edgeLocations) {
    const pieceColors = getEdgeColors(cube, face, row, col);
    if (
      (pieceColors[0] === colors[0] && pieceColors[1] === colors[1]) ||
      (pieceColors[0] === colors[1] && pieceColors[1] === colors[0])
    ) {
      return { face, row, col };
    }
  }
  return null;
}

function findCorner(cube: Cube, colors: Color[]): { face: Face, row: number, col: number } | null {
  const cornerLocations: [Face, number, number][] = [
    ['U', 0, 0], ['U', 0, 2], ['U', 2, 0], ['U', 2, 2],
    ['D', 0, 0], ['D', 0, 2], ['D', 2, 0], ['D', 2, 2],
  ];

  for (const [face, row, col] of cornerLocations) {
    const pieceColors = getCornerColors(cube, face, row, col);
    if (colors.every(c => pieceColors.includes(c))) {
      return { face, row, col };
    }
  }
  return null;
}

function getCornerColors(cube: Cube, face: Face, row: number, col: number): [Color, Color, Color] {
  const color1 = cube.state[face][row][col];
  const [[face2, row2, col2], [face3, row3, col3]] = CORNER_STICKERS[face][`${row},${col}`];
  const color2 = cube.state[face2][row2][col2];
  const color3 = cube.state[face3][row3][col3];
  return [color1, color2, color3];
}

// Utility: Test scramble and reverse
export function testScrambleAndReverse(): boolean {
  const cube = new Cube();
  cube.scramble();
  const scramble = [...cube.scrambleHistory];
  // Apply reverse moves
  for (let i = scramble.length - 1; i >= 0; i--) {
    let m = scramble[i];
    if (m.endsWith("'")) m = m.replace("'", '');
    else if (!m.endsWith('2')) m = m + "'";
    cube.move(m);
  }
  return isCubeSolved(cube);
}

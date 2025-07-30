import { Cube } from './Cube';

describe('Cube', () => {
  it('should initialize to solved state', () => {
    const cube = new Cube();
    const solved = cube.getSolvedState();
    expect(cube.state).toEqual(solved);
  });

  it('should reset to solved state', () => {
    const cube = new Cube();
    cube.move('U');
    cube.reset();
    expect(cube.state).toEqual(cube.getSolvedState());
  });

  it('should record scramble history', () => {
    const cube = new Cube();
    cube.move('U');
    expect(cube.scrambleHistory.length).toBeGreaterThan(0);
  });
});

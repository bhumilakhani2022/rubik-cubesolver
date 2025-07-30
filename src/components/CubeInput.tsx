import { useState } from 'react';
import Cube from 'cubejs';

Cube.initSolver();

type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
type Color = Face | 'X';

interface Facelets {
  [key: string]: Color[];
}

const faceOrder: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

const getDefaultState = (): Facelets => {
  return faceOrder.reduce((acc: Facelets, face) => {
    acc[face] = Array(9).fill(face);
    return acc;
  }, {});
};

const CubeInput = () => {
  const [facelets, setFacelets] = useState<Facelets>(getDefaultState());
  const [selectedColor, setSelectedColor] = useState<Face>('U');
  const [solution, setSolution] = useState('');
  const [error, setError] = useState('');

  const colorMap = {
    U: 'white',
    R: 'red',
    F: 'green',
    D: 'yellow',
    L: 'orange',
    B: 'blue',
  };

  const handleFaceletClick = (face: Face, index: number) => {
    const updated = { ...facelets };
    updated[face][index] = selectedColor;
    setFacelets(updated);
  };

  const getFaceletString = () => {
    return faceOrder.map(f => facelets[f].join('')).join('');
  };

  const solveCube = () => {
    const faceletStr = getFaceletString();
    const counts: { [key: string]: number } = [...faceletStr].reduce((acc: { [key: string]: number }, ch) => {
      acc[ch] = (acc[ch] || 0) + 1;
      return acc;
    }, {});
    const valid = ['U', 'R', 'F', 'D', 'L', 'B'].every(c => counts[c] === 9);

    if (faceletStr.length !== 54 || !valid) {
      setError('Each of U, R, F, D, L, B must appear 9 times.');
      setSolution('');
      return;
    }

    try {
      const cube = Cube.fromString(faceletStr);
      const result = cube.solve();
      setSolution(result);
      setError('');
    } catch (e) {
      if (e instanceof Error) {
        setError('Invalid cube configuration: ' + e.message);
      } else {
        setError('An unknown error occurred.');
      }
      setSolution('');
    }
  };

  const resetCube = () => {
    setFacelets(getDefaultState());
    setSolution('');
    setError('');
  };

  const clearCube = () => {
    const cleared = faceOrder.reduce((acc: Facelets, face) => {
      acc[face] = Array(9).fill('X');
      return acc;
    }, {});
    setFacelets(cleared as Facelets);
    setSolution('');
    setError('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Rubik's Cube Solver</h2>

      {/* Color Picker */}
      <div style={{ marginBottom: 20 }}>
        <label><strong>Select color:</strong></label>
        {faceOrder.map(f => (
          <button
            key={f}
            onClick={() => setSelectedColor(f)}
            style={{
              backgroundColor: colorMap[f],
              border: selectedColor === f ? '3px solid black' : '1px solid gray',
              margin: '0 5px',
              width: 30,
              height: 30,
              cursor: 'pointer',
            }}
            title={f}
          />
        ))}
      </div>

      {/* Cube Faces */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 20 }}>
        {faceOrder.map(face => (
          <div key={face}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}><strong>{face}</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gap: 4 }}>
              {facelets[face].map((color: Color, i: number) => (
                <div
                  key={i}
                  onClick={() => handleFaceletClick(face, i)}
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: colorMap[color as Face] || 'gray',
                    border: '1px solid #555',
                    cursor: 'pointer',
                  }}
                  title={`${face}${i}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ marginTop: 20 }}>
        <button onClick={solveCube} style={{ marginRight: 10 }}>Solve</button>
        <button onClick={resetCube} style={{ marginRight: 10 }}>Reset</button>
        <button onClick={clearCube}>Clear</button>
      </div>

      {/* Output */}
      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}
      {solution && <p style={{ marginTop: 20 }}><strong>Solution:</strong> {solution}</p>}
    </div>
  );
};

export default CubeInput;

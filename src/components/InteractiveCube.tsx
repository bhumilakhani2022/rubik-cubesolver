import React, { useState, useCallback } from 'react';
import { Cube } from '../Cube';
import type { Face } from '../Cube';
import { CubeView, Cube3DView } from './CubeView';

interface InteractiveCubeProps {
  cube: Cube;
  onCubeChange: () => void;
}

export const InteractiveCube: React.FC<InteractiveCubeProps> = ({ cube, onCubeChange }) => {
  const [selectedFace, setSelectedFace] = useState<Face | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleMove = useCallback((move: string) => {
    cube.move(move);
    if (isRecording) {
      setMoveHistory(prev => [...prev, move]);
    }
    onCubeChange();
  }, [cube, onCubeChange, isRecording]);

  const handleStickerClick = useCallback((face: Face, row: number, col: number) => {
    console.log(`Clicked ${face} face at position (${row}, ${col})`);
    setSelectedFace(face);
    
    // For now, just rotate the clicked face
    handleMove(face);
  }, [handleMove]);

  const undoLastMove = () => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      const undoMove = getUndoMove(lastMove);
      cube.move(undoMove);
      setMoveHistory(prev => prev.slice(0, -1));
      onCubeChange();
    }
  };

  const getUndoMove = (move: string): string => {
    if (move.endsWith("'")) {
      return move.slice(0, -1);
    } else if (move.endsWith('2')) {
      return move; // 180° moves are their own inverse
    } else {
      return move + "'";
    }
  };

  const clearHistory = () => {
    setMoveHistory([]);
  };

  const replayMoves = () => {
    cube.reset();
    moveHistory.forEach(move => {
      setTimeout(() => {
        cube.move(move);
        onCubeChange();
      }, 500);
    });
  };

  const quickMoves = [
    { label: 'R', move: 'R' },
    { label: "R'", move: "R'" },
    { label: 'U', move: 'U' },
    { label: "U'", move: "U'" },
    { label: 'F', move: 'F' },
    { label: "F'", move: "F'" },
    { label: 'L', move: 'L' },
    { label: "L'", move: "L'" },
    { label: 'D', move: 'D' },
    { label: "D'", move: "D'" },
    { label: 'B', move: 'B' },
    { label: "B'", move: "B'" },
  ];

  return (
    <div className="interactive-cube-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Interactive Cube</h3>
          <div className="flex gap-sm items-center">
            <button
              className={`btn btn-sm ${viewMode === '2d' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('2d')}
            >
              2D
            </button>
            <button
              className={`btn btn-sm ${viewMode === '3d' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('3d')}
            >
              3D
            </button>
            <button
              className={`btn btn-sm ${isRecording ? 'btn-accent' : 'btn-outline'}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? '⏹️ Stop Recording' : '⏺️ Record'}
            </button>
          </div>
        </div>

        {/* Cube Display */}
        <div className="cube-display" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {viewMode === '2d' ? (
            <CubeView 
              state={cube.state} 
              interactive={true}
              onStickerClick={handleStickerClick}
              size="large"
            />
          ) : (
            <Cube3DView state={cube.state} />
          )}
        </div>

        {/* Quick Move Buttons */}
        <div className="quick-moves" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>Quick Moves</h4>
          <div className="flex flex-wrap gap-sm">
            {quickMoves.map(({ label, move }) => (
              <button
                key={move}
                className="btn btn-outline btn-sm"
                onClick={() => handleMove(move)}
                style={{ minWidth: '40px' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Move History */}
        {moveHistory.length > 0 && (
          <div className="move-history">
            <div className="flex justify-between items-center mb-md">
              <h4 style={{ margin: 0 }}>Move History ({moveHistory.length})</h4>
              <div className="flex gap-sm">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={replayMoves}
                  disabled={moveHistory.length === 0}
                >
                  🔄 Replay
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={undoLastMove}
                  disabled={moveHistory.length === 0}
                >
                  ↶ Undo
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={clearHistory}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
            
            <div className="move-sequence" style={{
              background: 'var(--bg-secondary)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              wordBreak: 'break-all'
            }}>
              {moveHistory.join(' ')}
            </div>
          </div>
        )}

        {/* Selected Face Info */}
        {selectedFace && (
          <div className="selected-face-info" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="badge badge-info">
              Selected Face: {selectedFace}
            </div>
            <p className="text-sm text-muted" style={{ margin: 'var(--spacing-xs) 0 0 0' }}>
              Click on cube stickers to interact with faces
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Pattern Library Component
export const PatternLibrary: React.FC<{ cube: Cube; onApplyPattern: () => void }> = ({ 
  cube, 
  onApplyPattern 
}) => {
  const patterns = [
    {
      name: "Checkerboard",
      moves: ["M2", "E2", "S2"],
      description: "Creates a checkerboard pattern on all faces"
    },
    {
      name: "Cube in Cube",
      moves: ["F", "L", "F", "U'", "R", "U", "F2", "L2", "U'", "L'", "B", "D'", "B'", "L2", "U"],
      description: "Creates a cube pattern within the cube"
    },
    {
      name: "Flower Pattern",
      moves: ["R", "U", "R'", "F", "R", "F'", "U2", "R'", "U'", "R", "U", "R'"],
      description: "Creates flower-like patterns on faces"
    },
    {
      name: "Cross Pattern",
      moves: ["R2", "L'", "D", "F2", "R'", "D'", "R'", "L", "U'", "D", "R", "D", "B2", "R'", "U", "D2"],
      description: "Creates cross patterns on multiple faces"
    },
    {
      name: "Superflip",
      moves: ["R", "U", "R'", "F", "R", "F'", "U2", "R'", "U'", "R", "U", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"],
      description: "All edges flipped, corners solved - maximum scramble distance"
    }
  ];

  const applyPattern = (moves: string[]) => {
    cube.reset();
    moves.forEach(move => {
      cube.move(move);
    });
    onApplyPattern();
  };

  return (
    <div className="pattern-layout">
      <div className="pattern-list">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pattern Library</h3>
            <p className="card-subtitle">Apply interesting cube patterns</p>
          </div>
          <div className="pattern-grid">
            {patterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <h4>{pattern.name}</h4>
                <p className="text-sm text-muted">{pattern.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">{pattern.moves.length} moves</span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => applyPattern(pattern.moves)}
                  >
                    Apply Pattern
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pattern-preview">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Preview</h3>
          </div>
          <CubeView state={cube.state} size="large" />
        </div>
      </div>
    </div>
  );
};

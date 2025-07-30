import React, { useState, useRef, type MouseEvent } from 'react';
import type { CubeState, Face } from '../Cube';

const FACE_LABELS: Record<Face, string> = {
  U: 'Up', D: 'Down', F: 'Front', B: 'Back', L: 'Left', R: 'Right',
};

const COLOR_MAP: Record<string, string> = {
  W: '#ffffff', 
  Y: '#ffd600', 
  G: '#43a047', 
  B: '#1e88e5', 
  O: '#ff6f00', 
  R: '#e53935',
};

interface CubeViewProps {
  state: CubeState;
  interactive?: boolean;
  onStickerClick?: (face: Face, row: number, col: number) => void;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

export const CubeView: React.FC<CubeViewProps> = ({ 
  state, 
  interactive = false, 
  onStickerClick,
  size = 'medium',
  showLabels = true 
}) => {
  const sizeMap = {
    small: { sticker: 20, gap: 1 },
    medium: { sticker: 32, gap: 2 },
    large: { sticker: 40, gap: 3 }
  };

  const dimensions = sizeMap[size];

  const handleStickerClick = (face: Face, row: number, col: number) => {
    if (interactive && onStickerClick) {
      onStickerClick(face, row, col);
    }
  };

  return (
    <div className="cube-container fade-in">
      <div className="cube-grid">
        {Object.entries(state).map(([face, grid]) => (
          <div key={face} className="cube-face">
            {showLabels && (
              <div className="cube-face-label">
                {FACE_LABELS[face as Face]}
              </div>
            )}
            <div 
              className="cube-face-grid"
              style={{
                gridTemplateColumns: `repeat(3, ${dimensions.sticker}px)`,
                gap: `${dimensions.gap}px`
              }}
            >
              {grid.map((row, i) =>
                row.map((color, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`cube-sticker ${interactive ? 'interactive' : ''}`}
                    style={{ 
                      width: dimensions.sticker, 
                      height: dimensions.sticker, 
                      background: COLOR_MAP[color],
                      cursor: interactive ? 'pointer' : 'default'
                    }}
                    onClick={() => handleStickerClick(face as Face, i, j)}
                    title={interactive ? `${FACE_LABELS[face as Face]} (${i+1}, ${j+1})` : undefined}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced 3D Cube View Component
export const Cube3DView: React.FC<{ state: CubeState; initialRotation?: { x: number; y: number } }> = ({
  state,
  initialRotation = { x: -20, y: 45 },
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const cubeSize = 120;
  const faceSize = cubeSize - 4;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePosition.current.x;
    const deltaY = e.clientY - lastMousePosition.current.y;

    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <div
      className="cube-3d-container"
      style={{ perspective: '800px', margin: '2rem auto', cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="cube-3d"
        style={{
          width: cubeSize,
          height: cubeSize,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          margin: '0 auto',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Front Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `translateZ(${cubeSize/2}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.F.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Back Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `translateZ(-${cubeSize/2}px) rotateY(180deg)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.B.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Right Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `rotateY(90deg) translateZ(${cubeSize/2}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.R.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Left Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `rotateY(-90deg) translateZ(${cubeSize/2}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.L.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Top Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `rotateX(90deg) translateZ(${cubeSize/2}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.U.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>

        {/* Bottom Face */}
        <div 
          className="cube-3d-face"
          style={{
            position: 'absolute',
            width: faceSize,
            height: faceSize,
            transform: `rotateX(-90deg) translateZ(${cubeSize/2}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            padding: '2px',
            background: '#333'
          }}
        >
          {state.D.flat().map((color, index) => (
            <div
              key={index}
              style={{
                background: COLOR_MAP[color],
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

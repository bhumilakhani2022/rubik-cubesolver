import React, { useState, useEffect } from 'react';
import { Cube, CubeSolver } from '../Cube';
import type { SolveStep } from '../Cube';
import { CubeView } from './CubeView';
import { LLMService, TextToSpeechService } from '../services/llmService';
import type { MoveExplanation } from '../services/llmService';

interface LearnModeProps {
  cube: Cube;
}

export const LearnMode: React.FC<LearnModeProps> = ({ cube }) => {
  const [steps, setSteps] = useState<SolveStep[]>(() => CubeSolver.solve(cube));
  const [stepIdx, setStepIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(0);
  const [localCube, setLocalCube] = useState(() => {
    const c = new Cube();
    c.state = JSON.parse(JSON.stringify(cube.state));
    c.scrambleHistory = [...cube.scrambleHistory];
    return c;
  });
  const [llmExplanation, setLlmExplanation] = useState<MoveExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [stageOverview, setStageOverview] = useState<string>('');
  const [isLlmEnabled, setIsLlmEnabled] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showTips, setShowTips] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000);
  
  const llmService = LLMService;
  const ttsService = TextToSpeechService;

  useEffect(() => {
    setSteps(CubeSolver.solve(cube));
    setStepIdx(0);
    setMoveIdx(0);
    const c = new Cube();
    c.state = JSON.parse(JSON.stringify(cube.state));
    c.scrambleHistory = [...cube.scrambleHistory];
    setLocalCube(c);
    setIsLlmEnabled(llmService.isConfigured());
    setIsSpeechEnabled(ttsService.isSupported());
  }, [cube, llmService, ttsService]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isLastMove) {
      const timer = setTimeout(() => {
        handleNext();
      }, playbackSpeed);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, stepIdx, moveIdx, playbackSpeed]);

  // Generate LLM explanation when move changes
  useEffect(() => {
    if (isLlmEnabled && currentStep && currentStep.moves.length > 0) {
      generateMoveExplanation();
      generateStageOverviewIfNeeded();
    }
  }, [stepIdx, moveIdx, isLlmEnabled, difficulty]);

  const generateMoveExplanation = async () => {
    if (!currentStep || moveIdx >= currentStep.moves.length) return;
    
    setIsLoadingExplanation(true);
    try {
      const cubeStateDescription = describeCubeState(localCube);
      const previousMoves = getPreviousMoves();
      
      const explanation = await llmService.generateMoveExplanation(
        currentStep.moves[moveIdx],
        currentStep.stage,
        cubeStateDescription,
        moveIdx,
        currentStep.moves.length,
        previousMoves,
        difficulty
      );
      setLlmExplanation(explanation);
      
      // Auto-speak if TTS is enabled and not in auto-play mode
      if (isSpeechEnabled && !autoPlay) {
        await ttsService.speak(explanation.explanation);
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const generateStageOverviewIfNeeded = async () => {
    if (moveIdx === 0 && !stageOverview) {
      try {
        const overview = await llmService.generateStageOverview(currentStep.stage, currentStep.moves);
        setStageOverview(overview);
      } catch (error) {
        console.error('Failed to generate stage overview:', error);
      }
    }
  };

  const getPreviousMoves = (): string[] => {
    const allMoves: string[] = [];
    for (let i = 0; i < stepIdx; i++) {
      allMoves.push(...steps[i].moves);
    }
    allMoves.push(...currentStep.moves.slice(0, moveIdx));
    return allMoves;
  };

  const describeCubeState = (cube: Cube): string => {
    const faces = Object.keys(cube.state) as (keyof typeof cube.state)[];
    const description = faces.map(face => {
      const faceState = cube.state[face];
      const colors = faceState.flat();
      const centerColor = faceState[1][1];
      const solvedStickers = colors.filter(color => color === centerColor).length;
      
      return `${face} face: ${solvedStickers}/9 correct (center: ${centerColor})`;
    }).join(', ');
    
    return description;
  };

  const currentStep = steps[stepIdx];
  const isLastMove = stepIdx === steps.length - 1 && moveIdx === currentStep.moves.length - 1;
  const totalMoves = steps.reduce((sum, step) => sum + step.moves.length, 0);
  const currentMoveNumber = steps.slice(0, stepIdx).reduce((sum, step) => sum + step.moves.length, 0) + moveIdx + 1;
  const progress = Math.round((currentMoveNumber / totalMoves) * 100);

  const handleNext = () => {
    ttsService.stop();
    
    if (moveIdx < currentStep.moves.length - 1) {
      localCube.move(currentStep.moves[moveIdx]);
      setMoveIdx(moveIdx + 1);
    } else if (stepIdx < steps.length - 1) {
      localCube.move(currentStep.moves[moveIdx]);
      setStepIdx(stepIdx + 1);
      setMoveIdx(0);
      setStageOverview('');
    }
    setLocalCube(Object.assign(Object.create(Object.getPrototypeOf(localCube)), JSON.parse(JSON.stringify(localCube))));
  };

  const handlePrev = () => {
    ttsService.stop();
    setAutoPlay(false);
    
    const c = new Cube();
    c.state = JSON.parse(JSON.stringify(cube.state));
    c.scrambleHistory = [...cube.scrambleHistory];
    let targetStep = stepIdx;
    let targetMove = moveIdx - 1;
    
    if (targetMove < 0 && targetStep > 0) {
      targetStep--;
      targetMove = steps[targetStep].moves.length - 1;
    }
    
    // Replay moves up to target position
    for (let i = 0; i < targetStep; i++) {
      for (const move of steps[i].moves) {
        c.move(move);
      }
    }
    for (let j = 0; j <= targetMove; j++) {
      if (steps[targetStep] && steps[targetStep].moves[j]) {
        c.move(steps[targetStep].moves[j]);
      }
    }
    
    setStepIdx(targetStep);
    setMoveIdx(Math.max(0, targetMove));
    setLocalCube(c);
    setStageOverview('');
  };

  const handleSpeak = async () => {
    if (llmExplanation && isSpeechEnabled) {
      try {
        await ttsService.speak(llmExplanation.explanation);
      } catch (error) {
        console.error('Speech failed:', error);
      }
    }
  };

  const handleStopSpeech = () => {
    ttsService.stop();
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    if (autoPlay) {
      ttsService.stop();
    }
  };

  return (
    <div className="learn-mode-container">
      {/* Header with controls */}
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="card-title">Learn Mode</h2>
            <p className="card-subtitle">Step-by-step guided solving</p>
          </div>
          
          <div className="flex gap-sm items-center">
            {/* Difficulty selector */}
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="btn btn-outline btn-sm"
              style={{ appearance: 'none', paddingRight: '2rem' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Status indicators */}
            {!isLlmEnabled && (
              <div className="badge badge-warning">
                LLM Not Configured
              </div>
            )}
            {isLlmEnabled && (
              <div className="badge badge-success">
                AI Active
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center mb-sm">
            <span className="text-sm text-muted">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Stage Overview */}
      {stageOverview && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: 'var(--spacing-md)' }}>
            <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Stage Overview</h4>
            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--text-secondary)' }}>
              {stageOverview}
            </p>
          </div>
        </div>
      )}

      {/* Current Move Info */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="flex justify-between items-start mb-md">
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              {currentStep.stage} - Move {moveIdx + 1}/{currentStep.moves.length}
            </h3>
            <div className="flex items-center gap-md mt-sm">
              <div className="badge badge-info">
                {currentStep.moves[moveIdx]}
              </div>
              <span className="text-sm text-muted">
                Overall: {currentMoveNumber}/{totalMoves}
              </span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex gap-sm">
            <button
              className={`btn btn-sm ${autoPlay ? 'btn-accent' : 'btn-outline'}`}
              onClick={toggleAutoPlay}
              disabled={isLastMove}
            >
              {autoPlay ? '⏸️' : '▶️'}
            </button>
            
            {autoPlay && (
              <select 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="btn btn-outline btn-sm"
                style={{ appearance: 'none' }}
              >
                <option value={1000}>Fast</option>
                <option value={2000}>Normal</option>
                <option value={3000}>Slow</option>
              </select>
            )}
          </div>
        </div>

        {/* Basic Explanation */}
        <div className="mb-md">
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-primary)' }}>
            Basic Explanation
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {currentStep.explanation}
          </p>
        </div>

        {/* Enhanced AI Explanation */}
        {isLlmEnabled && (
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-md">
              <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                AI Explanation ({difficulty})
              </h4>
              <div className="flex gap-sm">
                {isSpeechEnabled && (
                  <>
                    <button
                      onClick={handleSpeak}
                      disabled={isLoadingExplanation || !llmExplanation}
                      className="btn btn-sm btn-secondary"
                    >
                      🔊
                    </button>
                    <button
                      onClick={handleStopSpeech}
                      className="btn btn-sm btn-outline"
                    >
                      🔇
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="btn btn-sm btn-ghost"
                >
                  {showTips ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            {isLoadingExplanation ? (
              <div className="flex items-center gap-sm">
                <div className="loading-spinner" />
                <span className="loading-text">Generating AI explanation...</span>
              </div>
            ) : llmExplanation ? (
              <div>
                <p style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text-primary)' }}>
                  {llmExplanation.explanation}
                </p>
                
                {showTips && llmExplanation.tips && llmExplanation.tips.length > 0 && (
                  <div className="mt-md">
                    <h5 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--accent-color)' }}>
                      💡 Tips
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                      {llmExplanation.tips.map((tip, index) => (
                        <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {showTips && llmExplanation.visualCues && llmExplanation.visualCues.length > 0 && (
                  <div className="mt-md">
                    <h5 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--secondary-color)' }}>
                      👀 Visual Cues
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                      {llmExplanation.visualCues.map((cue, index) => (
                        <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>{cue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="loading-text">AI explanation will appear here</p>
            )}
          </div>
        )}
      </div>

      {/* Cube Display */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <CubeView state={localCube.state} size="large" />
      </div>
      
      {/* Navigation Controls */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div className="flex gap-sm">
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0 && moveIdx === 0}
              className="btn btn-outline"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isLastMove}
              className={`btn ${isLastMove ? 'btn-outline' : 'btn-primary'}`}
            >
              {isLastMove ? '🎉 Complete!' : 'Next →'}
            </button>
          </div>
          
          <div className="text-sm text-muted">
            {isLastMove ? 'Cube solved! 🎉' : `${totalMoves - currentMoveNumber} moves remaining`}
          </div>
        </div>
      </div>
    </div>
  );
};

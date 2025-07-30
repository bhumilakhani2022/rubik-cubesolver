import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MoveExplanation {
  explanation: string;
  tips: string[];
  visualCues: string[];
}

let genAI: GoogleGenerativeAI | null = null;

try {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
}

class LLMServiceController {
  private static instance: LLMServiceController;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = !!genAI;
  }

  public static getInstance(): LLMServiceController {
    if (!LLMServiceController.instance) {
      LLMServiceController.instance = new LLMServiceController();
    }
    return LLMServiceController.instance;
  }

  public isConfigured(): boolean {
    return this.isEnabled;
  }

  public async generateMoveExplanation(
    move: string,
    stage: string,
    cubeState: string,
    moveIndex: number,
    totalMoves: number,
    previousMoves: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<MoveExplanation> {
    if (!this.isEnabled || !genAI) {
      return {
        explanation: 'LLM service not configured. Please add your Gemini API key to the .env file.',
        tips: [],
        visualCues: [],
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `
      You are an expert Rubik's Cube tutor. Your goal is to provide clear, concise, and helpful explanations for each move in a solution. The user is currently at the "${stage}" stage. The explanation should be tailored for a ${difficulty} audience.

      Cube State: ${cubeState}
      Current Stage: ${stage}
      Move to Explain: ${move}
      Move ${moveIndex + 1} of ${totalMoves} in this stage.
      Previous moves in this solution: ${previousMoves.join(', ')}

      Please provide an explanation for the move "${move}".
      - The explanation should be easy to understand for a ${difficulty}.
      - Provide a few helpful tips for this move or stage.
      - Provide a few visual cues to look for on the cube.

      Return the response as a JSON object with the following structure:
      {
        "explanation": "...",
        "tips": ["...", "..."],
        "visualCues": ["...", "..."]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text) as MoveExplanation;
    } catch (error) {
      console.error('Error generating move explanation:', error);
      return {
        explanation: 'Could not generate explanation. Please check your API key and network connection.',
        tips: [],
        visualCues: [],
      };
    }
  }

  public async generateStageOverview(stage: string, moves: string[]): Promise<string> {
    if (!this.isEnabled || !genAI) {
      return 'LLM service not configured.';
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `
      Please provide a brief, one-sentence overview of the "${stage}" stage of solving a Rubik's Cube.
      This stage involves the following moves: ${moves.join(', ')}.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating stage overview:', error);
      return 'Could not generate stage overview.';
    }
  }
}

class TextToSpeechServiceController {
  private static instance: TextToSpeechServiceController;
  private synth: SpeechSynthesis | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  public static getInstance(): TextToSpeechServiceController {
    if (!TextToSpeechServiceController.instance) {
      TextToSpeechServiceController.instance = new TextToSpeechServiceController();
    }
    return TextToSpeechServiceController.instance;
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public async speak(text: string): Promise<void> {
    if (!this.isSupported() || !this.synth) {
      return;
    }
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.isSupported() && this.synth) {
      this.synth.cancel();
    }
  }
}

export const LLMService = LLMServiceController.getInstance();
export const TextToSpeechService = TextToSpeechServiceController.getInstance();

import OpenAI from 'openai';

export interface MoveExplanation {
  explanation: string;
  tips: string[];
  visualCues: string[];
}

let openai: OpenAI | null = null;

try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
} catch (error) {
  console.error("Failed to initialize OpenAI:", error);
}

class LLMServiceController {
  private static instance: LLMServiceController;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = !!openai;
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
    if (!this.isEnabled || !openai) {
      return {
        explanation: 'LLM service not configured. Please add your OpenAI API key to the .env file.',
        tips: [],
        visualCues: [],
      };
    }

    const systemPrompt = `You are an expert Rubik's Cube tutor. Your goal is to provide clear, concise, and helpful explanations for each move in a solution. The user is currently at the "${stage}" stage. The explanation should be tailored for a ${difficulty} audience.`;

    const userPrompt = `
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
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in response');
      }
      return JSON.parse(content) as MoveExplanation;
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
    if (!this.isEnabled || !openai) {
      return 'LLM service not configured.';
    }

    const systemPrompt = 'You are a Rubik\'s Cube expert, skilled at providing high-level summaries of solving stages.';
    const userPrompt = `
      Please provide a brief, one-sentence overview of the "${stage}" stage of solving a Rubik's Cube.
      This stage involves the following moves: ${moves.join(', ')}.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      return response.choices[0].message.content || 'Could not generate stage overview.';
    } catch (error) {
      console.error('Error generating stage overview:', error);
      return 'Could not generate stage overview.';
    }
  }
}

class TextToSpeechServiceController {
  private static instance: TextToSpeechServiceController;
  private synth: SpeechSynthesis;

  private constructor() {
    this.synth = window.speechSynthesis;
  }

  public static getInstance(): TextToSpeechServiceController {
    if (!TextToSpeechServiceController.instance) {
      TextToSpeechServiceController.instance = new TextToSpeechServiceController();
    }
    return TextToSpeechServiceController.instance;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public async speak(text: string): Promise<void> {
    if (!this.isSupported()) {
      return;
    }
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.isSupported()) {
      this.synth.cancel();
    }
  }
}

export const LLMService = LLMServiceController.getInstance();
export const TextToSpeechService = TextToSpeechServiceController.getInstance();

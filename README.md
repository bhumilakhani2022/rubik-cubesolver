# Rubik's Cube Solver with AI Integration

A React-based 3D Rubik's Cube solver with AI-powered explanations and text-to-speech functionality.

## Features

- **3D Cube Visualization**: Interactive 3D representation of a Rubik's Cube
- **Custom Solving Algorithm**: Simplified layer-by-layer approach (not standard CFOP)
- **Learn Mode**: Step-by-step guided solving with explanations
- **AI-Powered Explanations**: GPT integration for natural language move explanations
- **Text-to-Speech**: Voice narration of move explanations
- **Interactive UI**: Clean, modern interface built with React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API (Required for AI Explanations)

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Basic Mode
- **Scramble**: Randomize the cube with 20 moves
- **Reset**: Return cube to solved state
- **Start Learn Mode**: Begin guided solving

### Learn Mode
- **AI Explanations**: When OpenAI API is configured, get detailed explanations for each move
- **Text-to-Speech**: Click "🔊 Speak" to hear explanations (browser support required)
- **Step Navigation**: Use Previous/Next buttons to navigate through solving steps
- **Progress Tracking**: Visual progress indicator shows completion percentage

## Architecture

### Core Components

- **`Cube.ts`**: Core cube logic, move implementation, and solver
- **`CubeView.tsx`**: 2D visualization of cube faces
- **`LearnMode.tsx`**: Interactive learning interface with AI integration
- **`llmService.ts`**: OpenAI integration and text-to-speech functionality

### Custom Solving Algorithm

The solver uses a simplified approach:
1. **Reverse Scramble Method**: For demonstration, reverses the scramble moves
2. **Layer-by-Layer Logic**: Foundation for more complex algorithms
3. **Modular Design**: Easy to extend with advanced solving methods

### AI Integration

- **Move Explanations**: GPT generates contextual explanations for each move
- **Stage Overviews**: AI provides summaries of what each solving stage accomplishes
- **Educational Focus**: Explanations are tailored for learning and understanding

## File Structure

```
src/
├── Cube.ts                 # Core cube logic and solver
├── App.tsx                 # Main application component
├── components/
│   ├── CubeView.tsx        # Cube visualization
│   └── LearnMode.tsx       # Interactive learning mode
└── services/
    └── llmService.ts       # AI and TTS integration
```

## Configuration Options

### Environment Variables

- `VITE_OPENAI_API_KEY`: OpenAI API key for AI explanations

### Features Toggle

The application automatically detects:
- **AI Availability**: Shows status based on API key configuration
- **TTS Support**: Enables speech controls if browser supports it

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Text-to-Speech**: Requires browser with Web Speech API support
- **Local Storage**: Uses browser storage for preferences

## Development

### Adding New Solving Algorithms

1. Extend the `CubeSolver` class in `Cube.ts`
2. Implement stage-based solving logic
3. Update `SolveStep` interface for new stages

### Customizing AI Explanations

1. Modify prompts in `llmService.ts`
2. Adjust explanation length and complexity
3. Add domain-specific terminology

### Extending UI

1. Add new components in `src/components/`
2. Integrate with existing cube state management
3. Follow the established styling patterns

## Troubleshooting

### Common Issues

1. **AI Explanations Not Working**
   - Check if `.env` file exists with valid OpenAI API key
   - Verify API key has sufficient credits
   - Check browser console for API errors

2. **Text-to-Speech Not Available**
   - Ensure browser supports Web Speech API
   - Check browser permissions for audio
   - Try different browsers if issues persist

3. **Installation Issues**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify network connectivity for package downloads

### Performance Tips

- **API Calls**: AI explanations are cached per move
- **Speech Synthesis**: Automatically stops previous speech when navigating
- **Memory Usage**: Cube states are efficiently managed with minimal copying

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- OpenAI for GPT API integration
- React and Vite for development framework
- Web Speech API for text-to-speech functionality

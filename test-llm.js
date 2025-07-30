require('dotenv').config();
const OpenAI = require('openai');

const testLLMIntegration = async () => {
  console.log('Testing LLM Integration...');

  const apiKey = process.env.VITE_OPENAI_API_KEY;
  console.log('API Key status:', apiKey ? 'Configured' : 'Not configured');

  if (!apiKey) {
    console.error('Error: VITE_OPENAI_API_KEY is not set in the .env file.');
    return;
  }

  const openai = new OpenAI({ apiKey });

  const testMove = "R";
  const testStage = "Test Stage";
  const testCubeState = "Mixed colors on all faces";

  console.log('\nTest Parameters:');
  console.log('- Move:', testMove);
  console.log('- Stage:', testStage);
  console.log('- Cube State:', testCubeState);

  try {
    console.log('\nAttempting to generate explanation from OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a Rubik\'s Cube expert.' },
        { role: 'user', content: `Explain the move "${testMove}" in the context of the "${testStage}" stage.` },
      ],
    });

    console.log('\n✅ OpenAI API call successful!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('\n❌ OpenAI API call failed:');
    console.error(error);
  }
};

testLLMIntegration();

import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '2mb' }));

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
const safety = 'Safety first: never give instructions that enable harm, illegal acts, dangerous electrical work, weapons, hazardous chemical mixing, medical diagnosis, or unsafe structural repairs. For high-risk problems, explain the risk and recommend a qualified adult or professional. Be honest about uncertainty.';

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) }));

app.post('/api/solve', async (req, res) => {
  const problem = String(req.body?.problem || '').trim();
  if (!problem) return res.status(400).json({ error: 'Tell me what you want help fixing first.' });
  if (problem.length > 5000) return res.status(413).json({ error: 'Please keep the problem under 5,000 characters.' });
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'AI is not connected yet. Add OPENAI_API_KEY in your hosting provider’s server-side environment settings, then redeploy.' });
  try {
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      instructions: 'You are Fix AI, a practical, friendly problem-solving assistant. Help the user understand a problem and find safe, realistic next steps. Start with a short summary, then numbered steps, then materials/tools if appropriate, and finish with a quick check. Ask a clarifying question if essential details are missing. Do not pretend to know local service availability. ' + safety,
      input: problem
    });
    res.json({ answer: response.output_text || 'I could not form a clear answer. Try describing the problem in more detail.' });
  } catch (e) {
    console.error('solve failed:', e?.status || e?.message || 'unknown');
    res.status(502).json({ error: e?.status === 429 ? 'The AI service has reached its current usage limit. Check API billing or try again later.' : 'The AI service could not complete this request. Please try again shortly.' });
  }
});

app.post('/api/visual-guide', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const mode = req.body?.mode === 'steps' ? 'steps' : 'concept';
  if (!prompt) return res.status(400).json({ error: 'Describe the idea or repair you want illustrated.' });
  if (prompt.length > 2000) return res.status(413).json({ error: 'Please keep the image description under 2,000 characters.' });
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'Image generation is not connected yet. Add OPENAI_API_KEY in your hosting provider’s server-side environment settings, then redeploy.' });
  const visualBrief = mode === 'steps'
    ? 'Create one clean, easy-to-read instructional infographic with 3 to 6 numbered panels in a logical sequence, simple illustrations, generous spacing, high contrast, and short labels only. Avoid tiny text. If the task is risky, illustrate safe prevention and when to call a professional instead of procedural repair steps.'
    : 'Create a polished, friendly concept illustration of the finished idea or safe repair result. Show the complete result clearly, with a simple uncluttered background and useful visual details. This is a concept image, not proof that the design is technically validated.';
  try {
    const result = await client.images.generate({
      model: 'gpt-image-1',
      prompt: visualBrief + '\nUser request: ' + prompt + '\n' + safety,
      size: '1024x1024',
      quality: 'low'
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image data returned');
    res.json({ image: 'data:image/png;base64,' + b64, mode });
  } catch (e) {
    console.error('image generation failed:', e?.status || e?.message || 'unknown');
    res.status(502).json({ error: e?.status === 429 ? 'Image generation has reached its current usage limit. Check API billing or try again later.' : 'Could not generate the image this time. Try a shorter description or try again later.' });
  }
});

app.use(express.static(path.resolve(__dirname, '../dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});
app.listen(PORT, () => console.log('Fix AI server listening on port ' + PORT));
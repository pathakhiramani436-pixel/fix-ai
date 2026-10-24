# Fix AI

A mobile-first AI problem solver with generated visual concepts and step-by-step image guides.

## Features
- Text-based problem solving with clear practical steps
- AI-generated visual concept images
- AI-generated step-by-step infographic images
- Responsive, colourful interface for mobile and desktop
- Recent activity during the current session
- Server-side API key handling and explicit setup errors
- Safety-first guidance for risky repair tasks

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Set `OPENAI_API_KEY` in your local environment (never commit the key).
4. Run `npm run dev` for the frontend preview. The API server must also run with `npm start`; for a simple combined production setup, run `npm run build` then `npm start`.
5. Open the local URL shown by Vite or the server.

## Deploy on Render
- Create a Node web service from this repository.
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add `OPENAI_API_KEY` in Render's Environment settings as a secret. Do not put it in frontend variables or source control.
- Choose a region close to your audience.
- Confirm `/api/health` reports `aiConfigured: true` and test both text solving and image generation.

## API routes
- `GET /api/health`
- `POST /api/solve` with JSON `{"problem":"..."}`
- `POST /api/visual-guide` with JSON `{"prompt":"...","mode":"concept"}` or mode `"steps"`

AI output can be inaccurate. Images are illustrative, not validated technical plans. For electrical, chemical, medical, structural, or other high-risk tasks, consult a qualified professional.

# AI-Assisted Text Classification API

A small web app and REST API that sends text to an AI model and classifies it as `Complaint`, `Query`, `Feedback`, or `Other`. It uses Node.js 18+ built-in HTTP and `fetch`, so there are no runtime package dependencies.

## Requirements

- Node.js 18 or newer
- An API key for an OpenAI-compatible chat completions service

## Setup

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`. The server loads `.env` at startup without overwriting variables already set in the shell.
2. Set `OPENAI_MODEL` if you want a different model. `OPENAI_BASE_URL` can point to another compatible service.
3. Start the API:

```bash
npm start
```

Open `http://localhost:3000` for the browser interface. Enter a message or choose an example, then select **Classify message**. The page displays the category, confidence, and AI response time.

The server listens on `http://localhost:3000` by default. You can also set or override the variables in your shell before startup. For example, in PowerShell:

```powershell
$env:OPENAI_API_KEY = "your_api_key"
$env:OPENAI_MODEL = "gpt-4o-mini"
npm start
```

## API

### `POST /api/classify`

Request:

```http
POST /api/classify HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"text":"I have been charged twice for my order."}
```

Example response:

```json
{
  "category": "Complaint",
  "confidence": 0.96,
  "confidenceEstimated": false,
  "responseTimeMs": 842
}
```

`confidence` is a number from 0 to 1. If the model omits it, the API returns a documented heuristic estimate of `0.70` and sets `confidenceEstimated` to `true`. `responseTimeMs` measures the AI provider call and is also written to the server log with a UTC timestamp.

Example with curl:

```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text":"Could you tell me when my package will arrive?"}'
```

### `GET /health`

Returns `{"status":"ok"}` for a basic availability check.

## Errors

- `400`: invalid JSON or missing/empty `text`
- `413`: request or text exceeds the size limit
- `503`: `OPENAI_API_KEY` is not configured
- `502`: AI provider failure or invalid model response
- `404`: unknown route

## Structure

```text
src/
  controllers/classificationController.js  # HTTP input validation and response mapping
  services/classificationService.js       # AI provider request and category normalization
  services/envService.js                  # Loads local .env values
  server.js                               # Routing and server startup
public/
  index.html                              # Browser interface
  styles.css                              # Responsive page styling
  app.js                                  # Form submission and result display
```

## How AI was used

The service sends the input as user content to a chat completions model. A short system prompt constrains the output to one of four categories and a JSON object containing `category` and `confidence`. Temperature is set to zero for more consistent classification. The prompt explicitly treats input text as data so text that resembles instructions does not change the classification rules. The service validates the model category, clamps confidence to the 0-1 range, and falls back to `Other` for an unexpected category.

## GitHub

This folder is ready to initialize as a Git repository and push to a GitHub repository. No repository URL was supplied, so it has not been published.


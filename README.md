# Gemini Text Classification API

A small web app and REST API that classifies text as `Complaint`, `Query`, `Feedback`, or `Other` using the Gemini API. It uses Node.js 18+ built-in HTTP and `fetch`, so there are no runtime package dependencies.

## Requirements

- Node.js 18 or newer
- A Gemini API key from Google AI Studio

## Setup

1. Copy `.env.example` to `.env` and place your API key in `GEMINI_API_KEY`. The server loads `.env` at startup without overwriting variables already set in the shell.
2. `GEMINI_MODEL` defaults to `gemini-flash-latest`.
3. Start the API:

```bash
npm start
```

Open `http://localhost:3000` for the browser interface. Enter a message or choose an example, then select **Classify message**. The page displays the category, confidence, and Gemini response time.

The API uses the Gemini `generateContent` endpoint and sends the key in the `X-Goog-Api-Key` header. Free-tier availability and quotas depend on Google AI Studio and the selected model. This app does not change billing settings, but requests may be billed if billing is enabled for the Google project. Keep the project on a free tier with no billing attached to avoid charges; when free quota is unavailable or exhausted, classification returns an error. Check Google's [Gemini API pricing and free-tier details](https://ai.google.dev/gemini-api/docs/pricing).

## Application Screenshots

### Empty state

![Signal text classification interface](screenshots/signal-home.png)

### Message entered

![Signal interface with a sample message](screenshots/signal-message-entered.png)

> Screenshots are stored in the `screenshots/` directory.

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

`confidence` is a number from 0 to 1. If Gemini omits it, the API returns a heuristic estimate of `0.70` and sets `confidenceEstimated` to `true`. `responseTimeMs` measures the Gemini API call and is also written to the server log with a UTC timestamp.

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
- `503`: `GEMINI_API_KEY` is not configured
- `502`: Gemini provider, model, quota, or response error
- `404`: unknown route

## Structure

```text
src/
  controllers/classificationController.js  # HTTP input validation and response mapping
  services/classificationService.js       # Gemini request and category normalization
  services/envService.js                  # Loads local .env values
  server.js                               # Routing and server startup
public/
  index.html                              # Browser interface
  styles.css                              # Responsive page styling
  app.js                                  # Form submission and result display
```

## How AI was used

The service sends the message with a concise classification instruction to Gemini and requests JSON output containing a category and confidence. The prompt treats the message as data rather than instructions. The service validates the category, clamps confidence to the 0-1 range, and maps an unexpected category to `Other`.

## GitHub

Source code: https://github.com/soumo210340/ai-text-classification-api

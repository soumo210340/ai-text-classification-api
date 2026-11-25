import { classifyText } from '../services/classificationService.js';

export async function handleClassification(req, res) {
  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    return sendJson(res, error.statusCode ?? 400, { error: error.message });
  }

  const text = body?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return sendJson(res, 400, { error: 'The "text" field must be a non-empty string.' });
  }
  if (text.length > 10_000) {
    return sendJson(res, 413, { error: 'Text must be 10,000 characters or fewer.' });
  }

  try {
    const result = await classifyText(text.trim());
    return sendJson(res, 200, result);
  } catch (error) {
    const status = error.statusCode ?? 502;
    return sendJson(res, status, { error: error.publicMessage ?? 'Classification failed.' });
  }
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20_000) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

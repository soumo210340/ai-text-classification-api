import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleClassification } from './controllers/classificationController.js';
import { loadEnvFile } from './services/envService.js';

loadEnvFile();

const port = Number(process.env.PORT || 3000);
const publicDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }
  if (req.method === 'POST' && req.url === '/api/classify') {
    return handleClassification(req, res);
  }
  if (req.method === 'GET') {
    const requestedPath = (req.url || '/').split('?')[0];
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
    const filePath = path.resolve(publicDirectory, relativePath);
    if (filePath.startsWith(`${publicDirectory}${path.sep}`) || filePath === path.join(publicDirectory, 'index.html')) {
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
        res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
        return createReadStream(filePath).pipe(res);
      }
    }
  }
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Route not found.' }));
});

server.listen(port, () => console.info(`Text classification API listening on http://localhost:${port}`));


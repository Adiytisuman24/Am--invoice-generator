import http from 'http';
import handler from './index.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    // The handler expects a Node req/res like in serverless platforms
    await handler(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ data: null, error: String(err.message || err) }));
  }
});

server.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}/api`);
});

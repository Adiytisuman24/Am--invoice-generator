// Accepts POSTed client-side error reports and logs them to server logs.
module.exports = async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => body += chunk);
    await new Promise(resolve => req.on('end', resolve));
    let payload = {};
    try { payload = JSON.parse(body || '{}'); } catch (e) { payload.raw = body; }
    console.error('[client-error]', JSON.stringify(payload));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('logs.cjs error', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false }));
  }
};

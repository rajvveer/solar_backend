// keepAlive.js
// Keeps Render backend awake by self-pinging every 10 minutes

const https = require('https');

const ROOT_URL = process.env.ROOT_URL || 'https://solar-backend.onrender.com/health';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function ping() {
  try {
    const req = https.get(ROOT_URL, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        console.log(`[keepAlive] Pinged ${ROOT_URL} - status ${res.statusCode}`);
      });
    });

    req.on('error', (err) => {
      console.warn('[keepAlive] Error:', err.message);
    });

    req.setTimeout(10000, () => req.abort());
  } catch (err) {
    console.warn('[keepAlive] Unexpected error:', err.message);
  }
}

// First ping immediately, then repeat
ping();
setInterval(ping, INTERVAL_MS);

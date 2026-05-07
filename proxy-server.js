// Run with: node proxy-server.js
const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'POST' && req.url === '/paynow') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: 'www.paynow.co.zw',
        path: '/interface/initiatetransaction',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => { res.writeHead(200); res.end(data); });
      });
      proxyReq.on('error', err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(3001, () => console.log('Paynow proxy running on http://localhost:3001'));

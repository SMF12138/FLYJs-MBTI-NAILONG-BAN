const http = require('http');
const fs = require('fs');
const path = '/var/www/mbti/.like-count';

// 初始化计数文件
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, '1000');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/like' && req.method === 'POST') {
    // 读取当前计数，+1，写回
    let count = parseInt(fs.readFileSync(path, 'utf8')) || 1000;
    count++;
    fs.writeFileSync(path, String(count));
    res.writeHead(200);
    res.end(JSON.stringify({ count }));
  } else if (req.url === '/api/like-count' && req.method === 'GET') {
    let count = parseInt(fs.readFileSync(path, 'utf8')) || 1000;
    res.writeHead(200);
    res.end(JSON.stringify({ count }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  }
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Like counter service running on http://127.0.0.1:3001');
});

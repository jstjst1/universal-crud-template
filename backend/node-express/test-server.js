const http = require('http');

console.log('Testing Node.js setup...');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test if we can create a simple server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Universal CRUD Template - Node.js is working!\n');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log('✅ Node.js setup is working correctly!');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server stopped');
    process.exit(0);
  });
});

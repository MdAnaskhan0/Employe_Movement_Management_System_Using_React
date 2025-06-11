const http = require('http');
const app = require('./app');
const socketService = require('./services/socketService');

const port = 5137;
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
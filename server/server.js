require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketService = require('./services/socketService');

const port = process.env.PORT;
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(port, '209.74.67.89', () => {
  console.log(`Server is running on http://209.74.67.89:${port}`);
});
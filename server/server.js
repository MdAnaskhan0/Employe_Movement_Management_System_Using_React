const http = require('http');
const app = require('./app');
const initSocket = require('./socketServer');

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server and socket running on port ${PORT}`);
});
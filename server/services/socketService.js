const { Server } = require('socket.io');
const db = require('./db'); // Your DB config file

const init = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'https://employe-movement-management-system.vercel.app',
        'https://employe-movement-management-system-sigma.vercel.app',
        'https://employe-movement-management-system-using.onrender.com'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
    });

    socket.on('sendMessage', (data) => {
      const { team_id, sender_name, message } = data;
      db.query(
        'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
        [team_id, sender_name, message],
        (err, result) => {
          if (!err) {
            const newMessage = {
              id: result.insertId,
              team_id,
              sender_name,
              message,
              created_at: new Date()
            };
            io.to(`team_${team_id}`).emit('receiveMessage', newMessage);
          } else {
            console.error('DB Error:', err);
          }
        }
      );
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = init;
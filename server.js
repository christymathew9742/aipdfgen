const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

require('./scheduler/cleanup');

const PORT = process.env.PORT || 5002;

// Create HTTP server manually
const server = http.createServer(app);

// Initialize Socket.IO server
const allowedOrigins = process.env.ALLOWED_SOKET_SERVER?.split(',').map(origin => origin.trim());

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Socket.IO CORS: ' + origin));
      }
    },
    methods: ['GET', 'POST']
  }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('join', (uploadedFileId) => {
        console.log(`Client ${socket.id} joined room: ${uploadedFileId}`);
        socket.join(uploadedFileId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('io', io);

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});









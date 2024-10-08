const { Server } = require('socket.io');

let io;
const allowedOrigins = [    
    "http://localhost:5173",
    process.env.FRONTEND_URL
];
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);
        
        socket.on('task-updated', (data) => {
            console.log("something is get updated")
            io.emit('update-task-list', data);
        });

        socket.on('new-task', (data) => {
            io.emit('add-new-task', data);
        });

        socket.on('new-comment', (data) => {
            io.emit('add-new-comment', data);
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected');
        });
        socket.on('task-deleted', ({ id, status }) => {
            io.emit('delete-task', { id, status });
          });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    initSocket,
    getIO
};
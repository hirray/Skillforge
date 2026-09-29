import app from './app';
import { config } from './config';
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  // verify token placeholder
  next();
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('project:join', (projectId) => {
    socket.join(\`project_\${projectId}\`);
  });
  socket.on('message:new', (data) => {
    io.to(\`project_\${data.projectId}\`).emit('message:new', data);
  });
});

server.listen(config.PORT, () => {
  console.log(\`API listening on port \${config.PORT}\`);
});

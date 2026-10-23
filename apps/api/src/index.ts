import app from './app';
import { config } from './config';
import http from 'http';
import { initSocketServer } from './core/socket';

const server = http.createServer(app);
initSocketServer(server);

server.listen(config.PORT, () => {
  console.log(`API listening on port ${config.PORT}`);
});

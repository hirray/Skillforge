import app from './app';
import { config } from './config';
import http from 'http';
import { initSocketServer } from './core/socket';
import { recoverResumeJobs } from './modules/resumes/real';
import { initNotificationConsumer } from './modules/notifications/consumer';

const server = http.createServer(app);
initSocketServer(server);
initNotificationConsumer();

server.listen(config.PORT, () => {
  console.log(`API listening on port ${config.PORT}`);
  if (config.RESUMES_SOURCE === 'real') void recoverResumeJobs().catch(() => console.error('Could not recover pending resume jobs.'));
});

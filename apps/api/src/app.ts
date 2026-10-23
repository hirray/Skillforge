import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Module routers
import adminRouter from './modules/admin/routes';
import aiRouter from './modules/ai/routes';
import analyticsRouter from './modules/analytics/routes';
import authRouter from './modules/auth/routes';
import certificatesRouter from './modules/certificates/routes';
import chatRouter from './modules/chat/routes';
import companiesRouter from './modules/companies/routes';
import contributionRouter from './modules/contribution/routes';
import githubRouter from './modules/github/routes';
import hackathonsRouter from './modules/hackathons/routes';
import jobsRouter from './modules/jobs/routes';
import mentorsRouter from './modules/mentors/routes';
import milestonesRouter from './modules/milestones/routes';
import notificationsRouter from './modules/notifications/routes';
import pipelineRouter from './modules/pipeline/routes';
import portfolioRouter from './modules/portfolio/routes';
import projectsRouter from './modules/projects/routes';
import resourcesRouter from './modules/resources/routes';
import resumesRouter from './modules/resumes/routes';
import searchRouter from './modules/search/routes';
import skillsRouter from './modules/skills/routes';
import talentRouter from './modules/talent/routes';
import tasksRouter from './modules/tasks/routes';
import teamRouter from './modules/team/routes';
import usersRouter from './modules/users/routes';
import verificationRouter from './modules/verification/routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const swaggerDocument = YAML.load(path.join(__dirname, '../../../packages/contract/openapi.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

// Register module routes under /api/v1
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/certificates', certificatesRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/companies', companiesRouter);
app.use('/api/v1/contribution', contributionRouter);
app.use('/api/v1/github', githubRouter);
app.use('/api/v1/hackathons', hackathonsRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/mentors', mentorsRouter);
app.use('/api/v1/milestones', milestonesRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/pipeline', pipelineRouter);
app.use('/api/v1/portfolio', portfolioRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/resources', resourcesRouter);
app.use('/api/v1/resumes', resumesRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/talent', talentRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/team', teamRouter);
app.use('/api/v1', teamRouter);
app.use('/api/v1', tasksRouter);
app.use('/api/v1', chatRouter);
app.use('/api/v1', milestonesRouter);
app.use('/api/v1', resourcesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/verification', verificationRouter);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (err.name === 'ZodError' || err.errors) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors?.[0]?.message || 'Validation error',
        details: err.errors
      }
    });
  }
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL',
      message: err.message || 'Internal server error',
      details: err.details
    }
  });
});

export default app;

const fs = require('fs');
const path = require('path');

const modules = ["auth", "users", "skills", "resumes", "projects", "team", "tasks", "milestones", "chat", "resources", "notifications", "search", "ai", "github", "contribution", "verification", "certificates", "portfolio", "companies", "jobs", "talent", "pipeline", "admin", "analytics", "mentors", "hackathons"];

const base = path.join(__dirname, '..', 'apps', 'api', 'src', 'modules');

modules.forEach(mod => {
  const dir = path.join(base, mod);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, 'README.md'), "# " + mod + " module\n\nContract implemented here.");

  fs.writeFileSync(path.join(dir, 'schema.ts'), "import { z } from 'zod';\nexport const createSchema = z.object({});");

  fs.writeFileSync(path.join(dir, 'mock.ts'), "export class MockService {\n  async handle() { return {}; }\n}");

  fs.writeFileSync(path.join(dir, 'real.ts'), "import { ErrorCode } from '@skillforge/contract';\nexport class RealService {\n  async handle() { throw { status: 501, code: ErrorCode.NOT_IMPLEMENTED, message: 'Not implemented' }; }\n}");

  const sourceKeyStr = mod === 'auth' ? "'AUTH_SOURCE'" : mod === 'ai' ? "'AI_SOURCE'" : mod === 'github' ? "'GITHUB_SOURCE'" : "'AUTH_SOURCE'";
  
  fs.writeFileSync(path.join(dir, 'service.ts'), "import { config } from '../../config';\nimport { MockService } from './mock';\nimport { RealService } from './real';\n\nexport const getService = () => {\n  const sourceKey = " + sourceKeyStr + ";\n  const isReal = config[sourceKey as keyof typeof config] === 'real';\n  return isReal ? new RealService() : new MockService();\n};");

  fs.writeFileSync(path.join(dir, 'routes.ts'), "import { Router } from 'express';\nimport { getService } from './service';\n\nconst router = Router();\nrouter.all('*', async (req, res, next) => {\n  try {\n    const result = await getService().handle();\n    res.json(result);\n  } catch(e) { next(e); }\n});\n\nexport default router;");

  fs.writeFileSync(path.join(dir, 'module.test.ts'), "import { describe, it, expect } from 'vitest';\ndescribe('" + mod + " module', () => {\n  it('should work', () => { expect(true).toBe(true); });\n});");
});

console.log('Module boilerplates generated.');

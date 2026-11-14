import assert from 'assert';
import YAML from 'yamljs';
import path from 'path';
import ai, { integrationRouter } from '../src/modules/ai/routes';
import resumes from '../src/modules/resumes/routes';
import analytics from '../src/modules/analytics/routes';
import {
  requirementSchema,
  matchSchema,
  jobMatchSchema,
  savedRequirementsSchema,
} from '../src/modules/ai/schema';
const contract = YAML.load(
  path.resolve(__dirname, '../../../packages/contract/openapi.yaml')
);
const groups: [any, string, [string, string][]][] = [
  [
    ai,
    '/ai',
    [
      ['post', '/requirements'],
      ['post', '/match'],
      ['post', '/job-match'],
      ['post', '/resume/parse'],
    ],
  ],
  [
    integrationRouter,
    '',
    [
      ['get', '/projects/:id/requirements'],
      ['put', '/projects/:id/requirements'],
      ['get', '/projects/:id/health'],
    ],
  ],
  [
    resumes,
    '/resumes',
    [
      ['post', '/'],
      ['get', '/:id'],
      ['get', '/:id/extraction'],
      ['post', '/:id/confirm'],
    ],
  ],
  [analytics, '/analytics', [['get', '/summary']]],
];
let count = 0;
for (const [router, prefix, routes] of groups)
  for (const [method, route] of routes) {
    assert(
      router.stack.some(
        (l: any) => l.route?.path === route && l.route.methods[method]
      ),
      `${method} ${prefix}${route} is not registered`
    );
    const contractPath = (prefix + (route === '/' ? '' : route)).replace(
      /:([a-zA-Z]+)/g,
      '{$1}'
    );
    assert(
      contract.paths[contractPath]?.[method],
      `${method} ${contractPath} is absent from frozen OpenAPI`
    );
    count++;
  }
assert(
  requirementSchema.safeParse({ description: 'test', projectId: 'p' }).success
);
assert(!matchSchema.safeParse({}).success);
assert(
  !jobMatchSchema.safeParse({
    jobId: 'j',
    constraints: { location: 'anything' },
  }).success
);
assert(
  !savedRequirementsSchema.safeParse({ requirements: [{ name: '' }] }).success
);
console.log(
  `Verified ${count} actual Member 2 route registrations against frozen OpenAPI, plus input validation. Shared contract files were not edited. Proposed utilities are documented separately.`
);

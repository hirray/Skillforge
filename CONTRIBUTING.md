# CONTRIBUTING

## Branch Naming
- Use \`member1/feature-name\`

## Submitting PRs
- Create small frequent PRs.
- Never push directly to main.
- How to add an endpoint:
  1. Add to \`openapi.yaml\`.
  2. Implement mock in \`mock.ts\`.
  3. Swap to real implementation in \`real.ts\` later.

## Testing
- Run contract tests with \`npm test\`.

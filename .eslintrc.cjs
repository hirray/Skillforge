module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  env: { es2022: true, node: true, browser: true },
  ignorePatterns: ['node_modules', 'dist', '.venv'],
  rules: { 'no-unreachable': 'error', 'no-constant-condition': ['error', { checkLoops: false }], 'no-duplicate-case': 'error' },
};

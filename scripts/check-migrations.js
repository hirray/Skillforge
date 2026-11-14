const { execFileSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');
const python = path.join(
  root,
  'services/ai/.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
);
execFileSync(python, [path.join(root, 'scripts/check-member2-migrations.py')], {
  cwd: root,
  stdio: 'inherit',
});

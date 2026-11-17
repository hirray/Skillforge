// Additive setup: preserves the database and all existing module flags.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: true });
const ai = path.join(root, 'services/ai');
const python = path.join(
  ai,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
);
if (!fs.existsSync(python)) {
  try {
    run('python3', ['-m', 'venv', path.join(ai, '.venv')]);
  } catch {
    run('python', ['-m', 'venv', path.join(ai, '.venv')]);
  }
}
run(python, ['-m', 'pip', 'install', '-r', path.join(ai, 'requirements.txt')]);
if (!fs.existsSync(path.join(root, '.env')))
  fs.copyFileSync(path.join(root, '.env.example'), path.join(root, '.env'));
if (!fs.existsSync(path.join(root, 'apps/api/.env')))
  fs.copyFileSync(path.join(root, '.env'), path.join(root, 'apps/api/.env'));
const local = path.join(root, '.env.member2.local');
if (!fs.existsSync(local))
  fs.copyFileSync(path.join(root, '.env.member2.example'), local);
// Prisma 5 requires the SQLite file to exist on some macOS installations.
const dbFile = path.join(root, 'apps/api/prisma/dev.db');
if (!fs.existsSync(dbFile)) fs.closeSync(fs.openSync(dbFile, 'a'));
run('npx', ['prisma', 'generate', '--schema', 'apps/api/prisma/schema.prisma']);
run('npx', [
  'prisma',
  'db',
  'push',
  '--schema',
  'apps/api/prisma/schema.prisma',
  '--skip-generate',
]);
run('npm', ['run', 'seed']);
run('npm', ['run', 'seed:member2']);
run(python, ['scripts/generate_fixtures.py'], ai);
console.log(
  'Member 2 setup complete. No database reset was performed. Run npm run dev.'
);

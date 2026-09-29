const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const aiDir = path.join(__dirname, '..', 'services', 'ai');
const pytestCmd = os.platform() === 'win32'
    ? path.join(aiDir, '.venv', 'Scripts', 'pytest')
    : path.join(aiDir, '.venv', 'bin', 'pytest');

console.log('Running AI service tests...');
execSync(`"${pytestCmd}"`, { 
  cwd: aiDir, 
  stdio: 'inherit',
  env: { ...process.env, PYTHONPATH: aiDir }
});

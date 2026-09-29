const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const aiDir = path.join(__dirname, '..', 'services', 'ai');
const uvicornCmd = os.platform() === 'win32'
    ? path.join(aiDir, '.venv', 'Scripts', 'uvicorn')
    : path.join(aiDir, '.venv', 'bin', 'uvicorn');

console.log('Starting AI service...');
execSync(`"${uvicornCmd}" app.main:app --reload --port 8000`, { cwd: aiDir, stdio: 'inherit' });

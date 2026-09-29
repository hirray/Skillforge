const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.join(__dirname, '..');
const aiDir = path.join(rootDir, 'services', 'ai');

// 1. Create .env from .env.example
const envExample = path.join(rootDir, '.env.example');
const envFile = path.join(rootDir, '.env');
if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log('Created .env from .env.example');
}

// Copy .env to apps/api so Prisma finds it easily
const apiEnvFile = path.join(rootDir, 'apps', 'api', '.env');
if (fs.existsSync(envFile) && !fs.existsSync(apiEnvFile)) {
    fs.copyFileSync(envFile, apiEnvFile);
}

// 2. Python venv setup
const venvDir = path.join(aiDir, '.venv');
if (!fs.existsSync(venvDir)) {
    console.log('Creating Python virtual environment...');
    try {
        execSync(`python -m venv "${venvDir}"`, { stdio: 'inherit' });
    } catch(e) {
        execSync(`python3 -m venv "${venvDir}"`, { stdio: 'inherit' });
    }
}

console.log('Installing Python dependencies...');
const pipCmd = os.platform() === 'win32' 
    ? path.join(venvDir, 'Scripts', 'pip')
    : path.join(venvDir, 'bin', 'pip');

// Create dummy requirements.txt if not exist to prevent error
const reqFile = path.join(aiDir, 'requirements.txt');
if (!fs.existsSync(reqFile)) {
    fs.writeFileSync(reqFile, 'fastapi\nuvicorn\npydantic\npytest\n');
}

execSync(`"${pipCmd}" install -r "${reqFile}"`, { stdio: 'inherit' });

// 3. Prisma generate & migrate
console.log('Setting up database...');
try {
  execSync('npm run db:reset -w apps/api', { stdio: 'inherit' });
} catch(e) {
  console.log('db:reset skipped for now until prisma is configured');
}
console.log('Setup complete!');

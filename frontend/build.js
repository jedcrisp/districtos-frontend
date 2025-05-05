const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a log file
const logFile = path.join(__dirname, 'build.log');
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
};

log('Starting build process...');

try {
  // Install dependencies
  log('Installing dependencies...');
  execSync('npm install --force', { stdio: 'inherit' });

  // Get the path to the vite binary
  const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');
  log(`Vite path: ${vitePath}`);

  // Check if vite exists
  if (!fs.existsSync(vitePath)) {
    log('ERROR: Vite binary not found!');
    log('Contents of node_modules/.bin:');
    const binContents = fs.readdirSync(path.join(__dirname, 'node_modules', '.bin'));
    log(binContents.join('\n'));
    process.exit(1);
  }

  // Run the build
  log('Running build...');
  execSync(`${vitePath} build`, { stdio: 'inherit' });

  log('Build completed successfully!');
} catch (error) {
  log(`ERROR: ${error.message}`);
  log('Stack trace:');
  log(error.stack);
  process.exit(1);
} 
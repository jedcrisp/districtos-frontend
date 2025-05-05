const { execSync } = require('child_process');
const path = require('path');

console.log('Starting build process...');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install --force', { stdio: 'inherit' });

// Get the path to the vite binary
const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');
console.log('Vite path:', vitePath);

// Run the build
console.log('Running build...');
execSync(`${vitePath} build`, { stdio: 'inherit' });

console.log('Build completed successfully!'); 
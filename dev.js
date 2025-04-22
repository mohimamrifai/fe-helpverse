// Simple Node.js script to add CORS headers when running a development server
// To use this, run: node dev.js

const { exec } = require('child_process');
const process = require('process');

console.log('🚀 Starting development server with CORS headers enabled...');

// Set environment variables for development
process.env.NODE_ENV = 'development';

// Run the Vite dev server with CORS headers enabled
const viteProcess = exec('pnpm run dev', { 
  env: {
    ...process.env,
    VITE_ENABLE_CORS: 'true'
  }
});

viteProcess.stdout.on('data', (data) => {
  console.log(data);
});

viteProcess.stderr.on('data', (data) => {
  console.error(data);
});

viteProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
}); 
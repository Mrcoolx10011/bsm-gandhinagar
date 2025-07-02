const { spawn } = require('child_process');
const os = require('os');

// Determine if we're on Windows for appropriate command formatting
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Starting development environment...');
console.log('📡 Step 1: Starting API Server (Vercel dev) on port 3000');

// Start the API server first
const apiServer = spawn(npmCmd, ['run', 'dev:api'], { 
  stdio: 'pipe',
  shell: true
});

// Give a little time for the API server to start before launching Vite
setTimeout(() => {
  console.log('🌐 Step 2: Starting Vite dev server on port 5173');
  
  // Start the Vite server
  const viteServer = spawn(npmCmd, ['run', 'dev:vite'], { 
    stdio: 'pipe',
    shell: true
  });

  // Pipe Vite server output to main process
  viteServer.stdout.on('data', (data) => {
    console.log(`[VITE]: ${data.toString().trim()}`);
  });

  viteServer.stderr.on('data', (data) => {
    console.error(`[VITE ERROR]: ${data.toString().trim()}`);
  });

  viteServer.on('close', (code) => {
    console.log(`Vite server process exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  });

}, 5000); // Wait 5 seconds before starting Vite

// Pipe API server output to main process
apiServer.stdout.on('data', (data) => {
  console.log(`[API]: ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR]: ${data.toString().trim()}`);
});

apiServer.on('close', (code) => {
  console.log(`API server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  apiServer.kill();
  process.exit(0);
});

#!/usr/bin/env node

/**
 * Development Server Startup Script
 * Starts both Vercel dev server (API) and Vite dev server (Frontend)
 */

import { spawn } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Starting BSM Development Environment...');
console.log('=======================================\n');

// Function to kill existing processes on the ports
async function killExistingProcesses() {
  if (isWindows) {
    try {
      // Kill any existing node processes
      spawn('taskkill', ['/F', '/IM', 'node.exe'], { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      // Ignore errors if no processes are running
    }
  }
}

// Start API server (Vercel dev)
function startApiServer() {
  return new Promise((resolve, reject) => {
    console.log('📡 Starting API Server (Vercel dev) on port 3000...');
    
    const apiServer = spawn(npmCmd, ['run', 'dev:api'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let apiReady = false;

    apiServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[API] ${output.trim()}`);
      
      // Check if API server is ready
      if (output.includes('Ready!') || output.includes('localhost:3000') || output.includes('3000')) {
        if (!apiReady) {
          apiReady = true;
          console.log('✅ API Server is ready!\n');
          resolve(apiServer);
        }
      }
    });

    apiServer.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[API ERROR] ${error.trim()}`);
      
      // Still resolve if it's just warnings
      if (error.includes('Ready!') || error.includes('localhost:3000')) {
        if (!apiReady) {
          apiReady = true;
          console.log('✅ API Server is ready!\n');
          resolve(apiServer);
        }
      }
    });

    apiServer.on('error', (error) => {
      console.error('❌ Failed to start API server:', error);
      reject(error);
    });

    // Timeout fallback
    setTimeout(() => {
      if (!apiReady) {
        console.log('⏰ API Server timeout - proceeding anyway...\n');
        resolve(apiServer);
      }
    }, 10000); // 10 second timeout
  });
}

// Start Vite dev server
function startViteServer() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Starting Vite Dev Server on port 5173...');
    
    const viteServer = spawn(npmCmd, ['run', 'dev:vite'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let viteReady = false;

    viteServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[VITE] ${output.trim()}`);
      
      // Check if Vite server is ready
      if (output.includes('Local:') || output.includes('localhost:5173') || output.includes('5173')) {
        if (!viteReady) {
          viteReady = true;
          console.log('✅ Vite Server is ready!\n');
          resolve(viteServer);
        }
      }
    });

    viteServer.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[VITE ERROR] ${error.trim()}`);
    });

    viteServer.on('error', (error) => {
      console.error('❌ Failed to start Vite server:', error);
      reject(error);
    });

    // Timeout fallback
    setTimeout(() => {
      if (!viteReady) {
        console.log('⏰ Vite Server timeout - proceeding anyway...\n');
        resolve(viteServer);
      }
    }, 15000); // 15 second timeout
  });
}

// Main function
async function startDevelopment() {
  try {
    // Kill existing processes first
    await killExistingProcesses();
    
    // Start API server first
    const apiServer = await startApiServer();
    
    // Wait a bit for API server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start Vite server
    const viteServer = await startViteServer();
    
    console.log('🎉 Development environment is ready!');
    console.log('=====================================');
    console.log('📡 API Server: http://localhost:3000');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔧 Admin Panel: http://localhost:5173/admin');
    console.log('\n💡 Press Ctrl+C to stop all servers\n');

    // Handle process termination
    const cleanup = () => {
      console.log('\n🛑 Shutting down servers...');
      if (apiServer && !apiServer.killed) {
        apiServer.kill('SIGTERM');
      }
      if (viteServer && !viteServer.killed) {
        viteServer.kill('SIGTERM');
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    // Keep the process running
    apiServer.on('close', (code) => {
      console.log(`API server exited with code ${code}`);
      cleanup();
    });

    viteServer.on('close', (code) => {
      console.log(`Vite server exited with code ${code}`);
      cleanup();
    });

  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
}

// Start the development environment
startDevelopment();

#!/usr/bin/env node

/**
 * Comprehensive Development Server Startup Script
 * Starts both API (Vercel) and Frontend (Vite) servers reliably
 */

import { spawn } from 'child_process';
import { platform } from 'os';
import { writeFileSync } from 'fs';

const isWindows = platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 BSM Development Environment - Starting All Services...');
console.log('=========================================================\n');

// Kill existing processes first
async function killExistingProcesses() {
  console.log('🔄 Cleaning up existing processes...');
  
  if (isWindows) {
    try {
      // Kill all node processes
      const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
        stdio: 'ignore',
        shell: true 
      });
      
      await new Promise(resolve => {
        killProcess.on('close', () => resolve());
        setTimeout(resolve, 3000); // Timeout after 3 seconds
      });
      
      console.log('✅ Existing processes cleaned up\n');
      
      // Wait a bit for ports to be freed
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('⚠️  No existing processes to clean\n');
    }
  }
}

// Start API Server
function startApiServer() {
  return new Promise((resolve) => {
    console.log('📡 Starting API Server (Vercel) on port 3000...');
    
    const apiServer = spawn(npmCmd, ['run', 'dev:api'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
      detached: false
    });

    let apiReady = false;
    let outputBuffer = '';

    apiServer.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      console.log(`[API] ${output.trim()}`);
      
      // Check for various ready indicators
      if (!apiReady && (
        output.includes('Ready!') || 
        output.includes('localhost:3000') || 
        output.includes('Local:') ||
        output.includes('Available at')
      )) {
        apiReady = true;
        console.log('✅ API Server is ready!\n');
        resolve(apiServer);
      }
    });

    apiServer.stderr.on('data', (data) => {
      const error = data.toString();
      console.log(`[API] ${error.trim()}`);
      
      // Sometimes ready message comes through stderr
      if (!apiReady && (
        error.includes('Ready!') || 
        error.includes('localhost:3000') ||
        error.includes('Local:')
      )) {
        apiReady = true;
        console.log('✅ API Server is ready!\n');
        resolve(apiServer);
      }
    });

    apiServer.on('error', (error) => {
      console.error('❌ API Server error:', error);
      resolve(null);
    });

    // Fallback timeout - assume it's ready after 15 seconds
    setTimeout(() => {
      if (!apiReady) {
        console.log('⏰ API Server timeout - assuming ready...\n');
        resolve(apiServer);
      }
    }, 15000);
  });
}

// Start Vite Server
function startViteServer() {
  return new Promise((resolve) => {
    console.log('🌐 Starting Vite Dev Server on port 5173...');
    
    const viteServer = spawn(npmCmd, ['run', 'dev:vite'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
      detached: false
    });

    let viteReady = false;

    viteServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[VITE] ${output.trim()}`);
      
      if (!viteReady && (
        output.includes('Local:') || 
        output.includes('localhost:5173') ||
        output.includes('ready in')
      )) {
        viteReady = true;
        console.log('✅ Vite Server is ready!\n');
        resolve(viteServer);
      }
    });

    viteServer.stderr.on('data', (data) => {
      const error = data.toString();
      console.log(`[VITE] ${error.trim()}`);
    });

    viteServer.on('error', (error) => {
      console.error('❌ Vite Server error:', error);
      resolve(null);
    });

    // Fallback timeout
    setTimeout(() => {
      if (!viteReady) {
        console.log('⏰ Vite Server timeout - assuming ready...\n');
        resolve(viteServer);
      }
    }, 10000);
  });
}

// Test servers after startup
async function testServers() {
  console.log('🔍 Testing server connectivity...\n');
  
  // Test API
  try {
    const response = await fetch('http://localhost:3000/api/hello');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Server responding:', data.message);
    } else {
      console.log('⚠️  API Server returned:', response.status);
    }
  } catch (error) {
    console.log('❌ API Server test failed:', error.message);
  }
  
  // Test Frontend (just check if it's serving)
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ Frontend Server responding');
    } else {
      console.log('⚠️  Frontend Server returned:', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend Server test failed:', error.message);
  }
}

// Write process info
function writeProcessInfo(apiProcess, viteProcess) {
  const info = {
    timestamp: new Date().toISOString(),
    api: {
      pid: apiProcess?.pid || 'unknown',
      status: apiProcess ? 'running' : 'failed'
    },
    vite: {
      pid: viteProcess?.pid || 'unknown', 
      status: viteProcess ? 'running' : 'failed'
    }
  };
  
  writeFileSync('.dev-processes.json', JSON.stringify(info, null, 2));
  console.log('📝 Process info written to .dev-processes.json');
}

// Main execution
async function main() {
  try {
    // Step 1: Clean up
    await killExistingProcesses();
    
    // Step 2: Start API Server
    const apiServer = await startApiServer();
    
    // Step 3: Start Vite Server  
    const viteServer = await startViteServer();
    
    // Step 4: Write process info
    writeProcessInfo(apiServer, viteServer);
    
    // Step 5: Test connectivity
    setTimeout(async () => {
      await testServers();
      
      console.log('\n🎉 Development Environment Ready!');
      console.log('=====================================');
      console.log('📱 Frontend: http://localhost:5173');
      console.log('🔧 Admin Panel: http://localhost:5173/admin');
      console.log('📡 API: http://localhost:3000/api');
      console.log('📝 Logs: Check terminal output above');
      console.log('\n👨‍💻 Happy coding!\n');
    }, 3000);
    
    // Keep the script running
    process.on('SIGINT', () => {
      console.log('\n🔴 Shutting down servers...');
      if (apiServer) apiServer.kill();
      if (viteServer) viteServer.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
}

main();

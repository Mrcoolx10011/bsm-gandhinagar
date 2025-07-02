@echo off
echo 🚀 Starting BSM Website Development Environment...

echo.
echo 📡 Step 1: Starting Vercel dev server on port 3000...
start "Vercel API Server" cmd /k "vercel dev --yes"

timeout /t 10 /nobreak > nul

echo.
echo 🌐 Step 2: Starting Vite dev server on port 5173...
start "Vite Dev Server" cmd /k "npm run dev:vite"

echo.
echo ✅ Both servers are starting up!
echo 📡 API Server: http://localhost:3000
echo 🌐 Frontend: http://localhost:5173
echo.
echo Press any key to open the application in browser...
pause > nul

start http://localhost:5173

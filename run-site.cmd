@echo off
setlocal
title Atelier Nocturne Server

set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "VITE_CLI=%CD%\node_modules\vite\bin\vite.js"

if exist "%CODEX_NODE%" if exist "%VITE_CLI%" (
  "%CODEX_NODE%" "%VITE_CLI%" --host 127.0.0.1 --port 3000
  goto finished
)

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is required.
  echo Install the LTS version from https://nodejs.org/
  echo Then run this launcher again.
  echo.
  goto finished
)

if not exist "node_modules" call npm install
if errorlevel 1 goto finished
call npm run dev

:finished
echo.
echo The server stopped or could not start.
echo This window will remain open so you can read the error.
pause
endlocal

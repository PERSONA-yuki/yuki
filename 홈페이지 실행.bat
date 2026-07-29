@echo off
chcp 65001 >nul
title Atelier Nocturne
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [실행 실패] Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해주세요.
  echo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 홈페이지를 처음 실행하기 위한 준비 중입니다...
  call npm install
  if errorlevel 1 (
    echo.
    echo 필요한 파일을 설치하지 못했습니다.
    pause
    exit /b 1
  )
)

echo.
echo 홈페이지를 여는 중입니다...
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"
call npm run dev

echo.
echo 홈페이지가 종료되었습니다.
pause

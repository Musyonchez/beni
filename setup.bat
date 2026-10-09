@echo off
rem One-time setup (slow): Node.js, npm dependencies, .env.local. Run once after cloning.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*

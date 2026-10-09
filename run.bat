@echo off
rem Everyday launcher (fast): fresh demo data, starts the app, opens the browser.
rem Runs one-time setup automatically if it hasn't been done yet.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*

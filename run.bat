@echo off
rem Double-click launcher: runs setup.ps1 without needing to change PowerShell's execution policy.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*

# FarmLink Dev Starter
# Kills ports 5000 and 8081 if in use, then launches backend and frontend in separate windows.

function Kill-Port($port) {
    $found = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Sort-Object -Unique

    foreach ($p in $found) {
        if ($p -match '^\d+$' -and $p -ne '0') {
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            Write-Host "Killed PID $p on port $port" -ForegroundColor Yellow
        }
    }
}

Write-Host "Freeing ports..." -ForegroundColor Cyan
Kill-Port 5000
Kill-Port 3000
Start-Sleep -Seconds 1

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Starting backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting frontend (Next.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers launched in separate windows." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000/api" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White

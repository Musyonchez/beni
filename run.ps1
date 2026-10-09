<#
  EVERYDAY launcher for Peer Tutoring & Study Group Matcher. Starts in seconds:
  frees the port, resets to fresh demo data, starts the app, opens the browser.

  Needs setup.bat to have been run once. If it wasn't (or node_modules is
  missing/broken), this runs setup.ps1 for you automatically.

  Every run starts from a clean slate: the database is wiped and refilled with
  demo data, so previous sessions leave nothing behind. Use -Keep to skip that.

  Usage:  ./run.ps1 [-Keep] [-Production] [-NoBrowser] [-Port 3000]
#>
param(
  [switch]$Keep,        # keep the existing database instead of resetting to demo data
  [switch]$Production,  # build + `next start` instead of `next dev`
  [switch]$NoBrowser,   # don't open the browser automatically
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; Read-Host "Press Enter to close"; exit 1 }

try {
  # 1. Make sure one-time setup has happened ---------------------------------
  $ready = (Get-Command node -ErrorAction SilentlyContinue) -and
           (Test-Path 'node_modules/next/dist/pages/_error.js') -and
           (Test-Path '.env.local')
  if (-not $ready) {
    Step "First run (or broken install) - running one-time setup"
    & "$PSScriptRoot\setup.ps1" -NoPause
    if ($LASTEXITCODE -ne 0) { exit 1 }
  }
  $envFile = '.env.local'

  # 2. Free the port ---------------------------------------------------------
  # Whatever is listening on the port is stopped so this app can take it over
  # (an old server would also keep the DB in memory and overwrite a reset).
  Step "Freeing port $Port"
  $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($procId in ($listeners | Select-Object -ExpandProperty OwningProcess -Unique)) {
    if ($procId -le 4) { Fail "Port $Port is held by a Windows system process (PID $procId). Use -Port to pick another port." }
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    Write-Host "    Stopping $($p.ProcessName) (PID $procId) that was using port $Port"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
  for ($i = 0; $i -lt 10 -and (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue); $i++) {
    Start-Sleep -Milliseconds 500
  }
  if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    Fail "Couldn't free port $Port (try running as Administrator, or use -Port to pick another port)."
  }
  Ok "Port $Port is free"

  # 3. Fresh demo data -------------------------------------------------------
  # The JSON-file store in /data is created automatically on first run.
  if (-not $Keep) {
    Step "Resetting to fresh demo data"
    node scripts/seed.mjs --force
    if ($LASTEXITCODE -ne 0) { Fail "Seeding failed." }
    # Login page lists the demo accounts only when this flag is set.
    if (-not (Select-String -Path $envFile -Pattern '^SHOW_DEMO_ACCOUNTS=' -Quiet)) {
      Add-Content -Path $envFile -Value 'SHOW_DEMO_ACCOUNTS=true' -Encoding ascii
    }
  }

  # 4. Build (production only) -----------------------------------------------
  if ($Production) {
    Step "Building for production"
    npm run build
    if ($LASTEXITCODE -ne 0) { Fail "Build failed." }
  }

  # 5. Launch ----------------------------------------------------------------
  $url = "http://localhost:$Port"
  Step "Starting the app at $url  (Ctrl+C to stop)"

  if (-not $NoBrowser) {
    # Open the browser once the server is answering.
    Start-Job -ArgumentList $url -ScriptBlock {
      param($u)
      for ($i = 0; $i -lt 90; $i++) {
        try { Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 2 | Out-Null; Start-Process $u; return } catch { Start-Sleep -Seconds 1 }
      }
    } | Out-Null
  }

  if ($Production) { npm run start -- -p $Port } else { npm run dev -- -p $Port }
}
catch {
  Fail $_.Exception.Message
}

<#
  One-click setup & run for Peer Tutoring & Study Group Matcher.
  Run from a fresh `git clone`:  right-click > Run with PowerShell
  (or double-click run.bat, which bypasses the execution policy for you).

  Every run starts from a clean slate: the database is wiped and refilled with
  demo data, so previous sessions leave nothing behind. Use -Keep to skip that.

  Usage:  ./setup.ps1 [-Keep] [-Production] [-NoStart] [-NoBrowser] [-Port 3000]
#>
param(
  [switch]$Keep,        # keep the existing database instead of resetting to demo data
  [switch]$Production,  # build + `next start` instead of `next dev`
  [switch]$NoStart,     # install/configure only, don't launch the server
  [switch]$NoBrowser,   # don't open the browser automatically
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$MinNodeMajor = 20   # Next.js 16 needs Node >= 20.9

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; Read-Host "Press Enter to close"; exit 1 }

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Get-NodeMajor {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return 0 }
  $v = (& node --version) -replace '^v', ''
  return [int]($v.Split('.')[0])
}

try {
  # 1. Node.js ---------------------------------------------------------------
  Step "Checking Node.js (need v$MinNodeMajor or newer)"
  if ((Get-NodeMajor) -lt $MinNodeMajor) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
      Fail "Node.js v$MinNodeMajor+ is missing and winget isn't available. Install the LTS from https://nodejs.org and run this again."
    }
    Write-Host "    Node.js not found or too old - installing LTS via winget..."
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    Refresh-Path
    if ((Get-NodeMajor) -lt $MinNodeMajor) {
      Fail "Node.js was installed but isn't visible yet. Close this window, open a new one, and run the script again."
    }
  }
  Ok "Node $(node --version), npm $(npm --version)"

  # 2. Dependencies ----------------------------------------------------------
  Step "Installing dependencies"
  # An interrupted install can leave node_modules half-written (missing files
  # inside next/). Detect that and start clean instead of failing at runtime.
  if ((Test-Path 'node_modules') -and -not (Test-Path 'node_modules/next/dist/pages/_error.js')) {
    Write-Host "    node_modules looks incomplete - removing it for a clean install"
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    if (Test-Path 'node_modules') { Fail "Couldn't delete node_modules (a file is locked). Close VS Code/terminals using this folder, then run again." }
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  }
  # `npm ci` wipes node_modules first, which fails on Windows if any file is
  # locked (e.g. a running dev server). Only use it for a clean first install.
  if ((Test-Path 'package-lock.json') -and -not (Test-Path 'node_modules')) { npm ci } else { npm install }
  if ($LASTEXITCODE -ne 0) {
    Fail "Dependency install failed. If you saw EPERM, a file is locked: close other terminals/editors running this app (stop any 'next dev'), pause antivirus for this folder, then run again."
  }
  Ok "Dependencies installed"

  # 3. Environment file ------------------------------------------------------
  Step "Configuring environment"
  $envFile = '.env.local'
  if (Test-Path $envFile) {
    Ok "$envFile already exists - leaving it alone"
  } else {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    Set-Content -Path $envFile -Value "SESSION_SECRET=$secret" -Encoding ascii
    Ok "Created $envFile with a freshly generated SESSION_SECRET"
  }

  # Free the port ---------------------------------------------------------------
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

  if ($NoStart) { Ok "Setup complete."; exit 0 }

  # 4. Build (production only) ----------------------------------------------
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

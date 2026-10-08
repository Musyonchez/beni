<#
  One-click setup & run for Peer Tutoring & Study Group Matcher.
  Run from a fresh `git clone`:  right-click > Run with PowerShell
  (or double-click run.bat, which bypasses the execution policy for you).

  Usage:  ./setup.ps1 [-Production] [-NoStart] [-NoBrowser] [-Port 3000]
#>
param(
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

  # The JSON-file store in /data is created automatically on first run.

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

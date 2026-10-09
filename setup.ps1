<#
  ONE-TIME setup for Peer Tutoring & Study Group Matcher: Node.js, npm
  dependencies and the .env.local file. Slow the first time (a few minutes).

  Run it once after `git clone` (double-click setup.bat), and again only when
  package.json changes. For everyday use, double-click run.bat instead - it
  skips all of this and starts in seconds.

  Usage:  ./setup.ps1 [-NoPause]
#>
param(
  [switch]$NoPause  # don't wait for Enter at the end (used when run.ps1 calls this)
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$MinNodeMajor = 20   # Next.js 16 needs Node >= 20.9

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; Read-Host "Press Enter to close"; exit 1 }

function Update-SessionPath {
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
    Update-SessionPath
    if ((Get-NodeMajor) -lt $MinNodeMajor) {
      Fail "Node.js was installed but isn't visible yet. Close this window, open a new one, and run the script again."
    }
  }
  Ok "Node $(node --version), npm $(npm --version)"

  # 2. Dependencies ----------------------------------------------------------
  Step "Installing dependencies (this is the slow part)"
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

  Write-Host "`nSetup complete. From now on just double-click run.bat." -ForegroundColor Green
  if (-not $NoPause) { Read-Host "Press Enter to close" }
}
catch {
  Fail $_.Exception.Message
}

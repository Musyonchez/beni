# FarmLink Setup Script
# Run once after cloning the repo. Installs all dependencies and creates env files from templates.

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "    $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host "    $msg" -ForegroundColor Yellow
}

# ── Check Node.js ────────────────────────────────────────────────────────────
Write-Step "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion found"
} catch {
    Write-Host "ERROR: Node.js is not installed. Download from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# ── Backend deps ─────────────────────────────────────────────────────────────
Write-Step "Installing backend dependencies..."
Push-Location $backend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend npm install failed." -ForegroundColor Red
    exit 1
}
Write-Success "Backend dependencies installed."
Pop-Location

# ── Backend .env ─────────────────────────────────────────────────────────────
$envFile = Join-Path $backend ".env"
if (Test-Path $envFile) {
    Write-Warn ".env already exists, skipping creation."
} else {
    Write-Step "Creating backend .env file..."
    @"
PORT=5000
MONGO_URI=
JWT_SECRET=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=174379
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Success ".env created at project/system/backend/.env"
    Write-Warn "ACTION REQUIRED: Fill in MONGO_URI and JWT_SECRET before starting."
}

# ── Frontend deps ─────────────────────────────────────────────────────────────
Write-Step "Installing frontend dependencies..."
Push-Location $frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend npm install failed." -ForegroundColor Red
    exit 1
}
Write-Success "Frontend dependencies installed."
Pop-Location

# ── Frontend .env.local ───────────────────────────────────────────────────────
$envLocal = Join-Path $frontend ".env.local"
if (Test-Path $envLocal) {
    Write-Warn ".env.local already exists, skipping creation."
} else {
    Write-Step "Creating frontend .env.local..."
    @"
NEXT_PUBLIC_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath $envLocal -Encoding utf8
    Write-Success ".env.local created at project/system/frontend/.env.local"
    Write-Warn "If accessing from another device on the same network, update NEXT_PUBLIC_API_URL to use your LAN IP."
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Fill in project\system\backend\.env (MONGO_URI, JWT_SECRET)" -ForegroundColor White
Write-Host "  2. Run .\dev-start.ps1 to start both servers" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""

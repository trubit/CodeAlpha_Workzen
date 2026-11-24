# ==============================================================================
# WORKZEN — Phase 2: Foundation & Infrastructure Visual Generator
# Renders 8 High-Resolution 1920x1080 Foundation & Pipeline Diagrams
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-2"
$protoDir = Join-Path $baseDir "prototypes"
$diagDir = Join-Path $baseDir "diagrams"

if (!(Test-Path $protoDir)) { New-Item -ItemType Directory -Force -Path $protoDir | Out-Null }
if (!(Test-Path $diagDir)) { New-Item -ItemType Directory -Force -Path $diagDir | Out-Null }

function Create-RoundedRectangle($x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [float]($radius * 2)
    $path.AddArc([float]$x, [float]$y, $d, $d, 180, 90)
    $path.AddArc([float]($x + $w - $d), [float]$y, $d, $d, 270, 90)
    $path.AddArc([float]($x + $w - $d), [float]($y + $h - $d), $d, $d, 0, 90)
    $path.AddArc([float]$x, [float]($y + $h - $d), $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

# Master Palette (Linear Dark Slate + Emerald/Indigo Accents)
$cDarkBg      = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
$cCardBg      = [System.Drawing.ColorTranslator]::FromHtml("#12131A")
$cCardInner   = [System.Drawing.ColorTranslator]::FromHtml("#171822")
$cBorder      = [System.Drawing.ColorTranslator]::FromHtml("#252736")
$cBorderLight = [System.Drawing.ColorTranslator]::FromHtml("#363A4D")
$cIndigo      = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cPurple      = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$cEmerald     = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cRose        = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cAmber       = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cSky         = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cTextWhite   = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cTextMuted   = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cTextDim     = [System.Drawing.ColorTranslator]::FromHtml("#64748B")

$bDarkBg    = New-Object System.Drawing.SolidBrush($cDarkBg)
$bCardBg    = New-Object System.Drawing.SolidBrush($cCardBg)
$bCardInner = New-Object System.Drawing.SolidBrush($cCardInner)
$bIndigo    = New-Object System.Drawing.SolidBrush($cIndigo)
$bPurple    = New-Object System.Drawing.SolidBrush($cPurple)
$bEmerald   = New-Object System.Drawing.SolidBrush($cEmerald)
$bRose      = New-Object System.Drawing.SolidBrush($cRose)
$bAmber     = New-Object System.Drawing.SolidBrush($cAmber)
$bSky       = New-Object System.Drawing.SolidBrush($cSky)
$bTextWhite = New-Object System.Drawing.SolidBrush($cTextWhite)
$bTextMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim   = New-Object System.Drawing.SolidBrush($cTextDim)

$pBorder      = New-Object System.Drawing.Pen($cBorder, 1)
$pBorderLight = New-Object System.Drawing.Pen($cBorderLight, 1.5)

$fontHero  = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Render-Header($g, $title, $subtitle, $tag) {
    $pt1 = New-Object System.Drawing.PointF(0, 0)
    $pt2 = New-Object System.Drawing.PointF(1920, 0)
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $cCardBg, $cDarkBg)
    $g.FillRectangle($grad, 0, 0, 1920, 90)
    $g.DrawLine($pBorder, 0, 90, 1920, 90)
    
    $logoRect = Create-RoundedRectangle 40 24 42 42 10
    $g.FillPath($bEmerald, $logoRect)
    $g.DrawString("W", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), $bTextWhite, 50, 28)
    
    $g.DrawString("WORKZEN FOUNDATION", $fontH1, $bTextWhite, 96, 24)
    $g.DrawString("Phase 2 Infrastructure Blueprint", $fontBadge, $bEmerald, 98, 50)
    
    $g.DrawString($title, $fontHero, $bTextWhite, 480, 20)
    $g.DrawString($subtitle, $fontBody, $bTextMuted, 482, 54)
    
    $badgeRect = Create-RoundedRectangle 1680 30 200 32 8
    $g.FillPath($bCardInner, $badgeRect)
    $g.DrawPath($pBorderLight, $badgeRect)
    $g.DrawString($tag, $fontBadge, $bIndigo, 1700, 38)
}

function Save-Both($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $diagDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

# 1. Monorepo Structure
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g1 "01. Unified Monorepo Repository Structure" "Clean single-root directory layout separating client, server, shared and docs" "REPO TOPOLOGY"

$folders = @(
    @{ Name="src/client/"; Desc="React 18 + Vite frontend SPA. Contains components, pages, store, hooks, API client, and theme tokens." },
    @{ Name="src/server/"; Desc="Node.js + Express backend. Contains controllers, middlewares, models, services, routes, and socket handlers." },
    @{ Name="src/shared/"; Desc="Cross-boundary isomorphic code: TypeScript types, interfaces, Zod validation schemas, and constants." },
    @{ Name="docs/"; Desc="Architecture blueprints, design system specifications, API references, and visual prototype pictures." },
    @{ Name="tests/"; Desc="Comprehensive automated test suites for authentication, organization, tenancy, and API endpoints." },
    @{ Name="scripts/"; Desc="Automation tooling, visual prototype renderers, and database migration utilities." }
)
$y = 150
foreach ($f in $folders) {
    $fRect = Create-RoundedRectangle 60 $y 1800 120 10
    $g1.FillPath($bCardBg, $fRect)
    $g1.DrawPath($pBorder, $fRect)
    $g1.DrawString($f.Name, $fontH1, $bEmerald, 90, ($y + 25))
    $g1.DrawString($f.Desc, $fontBody, $bTextMuted, 90, ($y + 65))
    $y += 140
}
Save-Both $bmp1 "found-01-monorepo-structure.png"
$bmp1.Dispose()

# 2. Application Tiers
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g2 "02. Frontend & Backend Application Tiers" "Runtime execution separation between browser client and Node server processes" "APPLICATION TIERS"

$tiers2 = @(
    @{ Title="Client Execution Tier (Port 3070)"; Desc="Browser execution environment. Vite development server with HMR. Fast refresh, client-side caching, and optimistic UI updates." },
    @{ Title="Server Execution Tier (Port 5050)"; Desc="Node.js 18+ runtime with tsx/TypeScript execution. Express middleware stack, security wrappers, and database pool connections." },
    @{ Title="Dev Orchestration Pipeline"; Desc="Concurrent execution via npm run dev:all. Runs both Vite and Node server concurrently with unified logging output." }
)
$y = 170
foreach ($t in $tiers2) {
    $tRect = Create-RoundedRectangle 60 $y 1800 230 12
    $g2.FillPath($bCardBg, $tRect)
    $g2.DrawPath($pBorder, $tRect)
    $g2.DrawString($t.Title, $fontHero, $bIndigo, 90, ($y + 35))
    $g2.DrawString($t.Desc, $fontBody, $bTextMuted, 90, ($y + 110))
    $y += 270
}
Save-Both $bmp2 "found-02-app-tiers-shared.png"
$bmp2.Dispose()

# 3. Shared Code Architecture
$bmp3 = New-Object System.Drawing.Bitmap(1920, 1080)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g3 "03. Shared Code & Schema Validation" "Zero-duplication isomorphic contracts between client forms and server endpoints" "SHARED SCHEMAS"

$sharedItems = @(
    @{ File="src/shared/types/index.ts"; Text="Single source of truth for User, Organisation, Workspace, Task, and Session TypeScript interfaces." },
    @{ File="src/shared/validation/auth.ts"; Text="Zod validation rules for registration, login, OTP codes, password reset, and password complexity." },
    @{ File="src/shared/validation/organization.ts"; Text="Zod validation rules for organization creation, updates, branding settings, and ownership transfer." },
    @{ File="src/shared/constants/index.ts"; Text="System-wide enumeration values: Roles (Owner, Admin, Member), Task Statuses, and View Keys." }
)
$y = 150
foreach ($si in $sharedItems) {
    $siRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g3.FillPath($bCardBg, $siRect)
    $g3.DrawPath($pBorder, $siRect)
    $g3.DrawString($si.File, $fontH1, $bSky, 90, ($y + 30))
    $g3.DrawString($si.Text, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 205
}
Save-Both $bmp3 "found-03-shared-validation.png"
$bmp3.Dispose()

# 4. Environment Configuration
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g4 "04. Environment Configuration & Secrets" "Deterministic .env configuration, secret isolation, and runtime variable validation" "ENV CONFIG"

$envs = @(
    @{ Var="NODE_ENV"; Val="development / production / test"; Desc="Defines runtime execution mode, error verbosity, and stack trace exposure." },
    @{ Var="PORT & CLIENT_URL"; Val="5050 / http://localhost:3070"; Desc="Standardized non-conflicting local development and production network ports." },
    @{ Var="MONGODB_URI"; Val="mongodb://127.0.0.1:27017/workzen"; Desc="Primary persistence connection string with connection pooling options." },
    @{ Var="JWT_SECRET & REFRESH"; Val="Cryptographically random 64+ char strings"; Desc="HMAC-SHA256 signature keys for access and refresh token authentication." }
)
$y = 150
foreach ($e in $envs) {
    $eRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g4.FillPath($bCardBg, $eRect)
    $g4.DrawPath($pBorder, $eRect)
    $g4.DrawString("$($e.Var) = $($e.Val)", $fontCode, $bEmerald, 90, ($y + 30))
    $g4.DrawString($e.Desc, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 205
}
Save-Both $bmp4 "found-04-env-configuration.png"
$bmp4.Dispose()

# 5. Database Connection Workflow
$bmp5 = New-Object System.Drawing.Bitmap(1920, 1080)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g5 "05. Database Connection & Health Workflow" "Mongoose connection pool, auto-reconnect logic, index synchronization & ping probes" "DB WORKFLOW"

$dbSteps = @(
    "1. Server Boot: Express loads config and invokes connectDatabase() helper",
    "2. Mongoose Pool: Configured with maxPoolSize=10, minPoolSize=2, serverSelectionTimeoutMS=5000",
    "3. Event Handlers: Listening to 'connected', 'error', 'disconnected', 'reconnected'",
    "4. Index Synchronization: Automatic build of unique compound indexes on Organization & User collections",
    "5. Health Endpoint: /api/v1/health executes ping probe and returns database connection state"
)
$y = 160
foreach ($ds in $dbSteps) {
    $dRect = Create-RoundedRectangle 60 $y 1800 130 10
    $g5.FillPath($bCardBg, $dRect)
    $g5.DrawPath($pBorder, $dRect)
    $g5.DrawString($ds, $fontH2, $bTextWhite, 90, ($y + 40))
    $y += 160
}
Save-Both $bmp5 "found-05-database-workflow.png"
$bmp5.Dispose()

# 6. Dev & Build Workflow
$bmp6 = New-Object System.Drawing.Bitmap(1920, 1080)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g6 "06. Full-Stack Development & Build Pipeline" "TypeScript compilation, Vite asset bundling, and dual dev-server orchestration" "BUILD PIPELINE"

$buildSteps = @(
    @{ Command="npm run dev:all"; Desc="Starts Vite dev server on port 3070 and Express tsx backend on port 5050 in parallel." },
    @{ Command="npm run typecheck"; Desc="Executes tsc --noEmit to verify complete end-to-end type safety across client and server." },
    @{ Command="npm run build"; Desc="Runs Vite build to produce optimized client bundle in dist/client, compiles server to dist/server." },
    @{ Command="npm test"; Desc="Executes automated Node test runner across all unit, integration, and security test suites." }
)
$y = 160
foreach ($b in $buildSteps) {
    $bRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g6.FillPath($bCardBg, $bRect)
    $g6.DrawPath($pBorder, $bRect)
    $g6.DrawString($b.Command, $fontHero, $bIndigo, 90, ($y + 30))
    $g6.DrawString($b.Desc, $fontBody, $bTextMuted, 90, ($y + 85))
    $y += 205
}
Save-Both $bmp6 "found-06-dev-build-pipeline.png"
$bmp6.Dispose()

# 7. CI/CD Pipeline
$bmp7 = New-Object System.Drawing.Bitmap(1920, 1080)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g7 "07. CI/CD Pipeline & Automated Verification" "Automated linting, type-checking, test execution, containerization & deployment" "CI/CD PIPELINE"

$stagesCi = @("Commit & Push", "Lint & Formatting Check", "TypeScript Strict Verification", "Full Test Suite (35+ Tests)", "Docker Container Build", "Staging Deployment", "Production Release")
$x = 60
for ($i = 0; $i -lt 7; $i++) {
    $cRect = Create-RoundedRectangle $x 300 230 400 12
    $g7.FillPath($bCardBg, $cRect)
    $g7.DrawPath($pBorder, $cRect)
    
    $g7.DrawString("Stage $($i + 1)", $fontBadge, $bEmerald, ($x + 20), 330)
    $g7.DrawString($stagesCi[$i], $fontH2, $bTextWhite, ($x + 20), 370)
    $g7.DrawString("Automated Gate", $fontBody, $bTextMuted, ($x + 20), 420)
    $x += 255
}
Save-Both $bmp7 "found-07-cicd-pipeline.png"
$bmp7.Dispose()

# 8. Deployment Architecture
$bmp8 = New-Object System.Drawing.Bitmap(1920, 1080)
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g8 "08. Production Deployment Architecture" "High-availability multi-region cluster with CDN caching and load-balanced containers" "PRODUCTION DEPLOY"

$depLayers = @(
    @{ Layer="Edge / DNS Layer"; Desc="Cloudflare Global Anycast Network, DDoS Shield, SSL Termination, and Edge Page Caching." },
    @{ Layer="Application Cluster"; Desc="Load-balanced Node.js container fleet (Docker/ECS/Kubernetes) with automatic zero-downtime rolling updates." },
    @{ Layer="Database Cluster"; Desc="MongoDB Atlas Dedicated Multi-AZ Replica Set with automated failover and continuous point-in-time backups." },
    @{ Layer="Monitoring & Observability"; Desc="Prometheus metrics, Grafana telemetry dashboards, and Datadog APM tracing for enterprise SLA guarantees." }
)
$y = 160
foreach ($dl in $depLayers) {
    $dRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g8.FillPath($bCardBg, $dRect)
    $g8.DrawPath($pBorder, $dRect)
    $g8.DrawString($dl.Layer, $fontH1, $bSky, 90, ($y + 30))
    $g8.DrawString($dl.Desc, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 205
}
Save-Both $bmp8 "found-08-production-deployment.png"
$bmp8.Dispose()

Write-Output "Phase 2: All 8 foundation diagrams successfully rendered."


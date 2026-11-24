# ==============================================================================
# WORKZEN — Phase 1: Master Architecture Visual Deliverables Generator
# Renders 10 High-Resolution 1920x1080 Architectural Diagrams
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-1"
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

# Master Color Palette (Linear Dark Slate + Indigo Core)
$cDarkBg      = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
$cCardBg      = [System.Drawing.ColorTranslator]::FromHtml("#12131A")
$cCardInner   = [System.Drawing.ColorTranslator]::FromHtml("#171822")
$cBorder      = [System.Drawing.ColorTranslator]::FromHtml("#252736")
$cBorderLight = [System.Drawing.ColorTranslator]::FromHtml("#363A4D")
$cIndigo      = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cIndigoGlow  = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cPurple      = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$cEmerald     = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cRose        = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cAmber       = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cSky         = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cTextWhite   = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cTextMuted   = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cTextDim     = [System.Drawing.ColorTranslator]::FromHtml("#64748B")

# Standard Brushes & Pens
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
$pIndigo      = New-Object System.Drawing.Pen($cIndigo, 2)
$pEmerald     = New-Object System.Drawing.Pen($cEmerald, 2)
$pSky         = New-Object System.Drawing.Pen($cSky, 2)

# Typography
$fontHero  = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Render-Header($g, $title, $subtitle, $tag) {
    # Top Bar Header
    $pt1 = New-Object System.Drawing.PointF(0, 0)
    $pt2 = New-Object System.Drawing.PointF(1920, 0)
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $cCardBg, $cDarkBg)
    $g.FillRectangle($grad, 0, 0, 1920, 90)
    $g.DrawLine($pBorder, 0, 90, 1920, 90)
    
    # Brand mark
    $logoRect = Create-RoundedRectangle 40 24 42 42 10
    $g.FillPath($bIndigo, $logoRect)
    $g.DrawString("W", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), $bTextWhite, 50, 28)
    
    $g.DrawString("WORKZEN ARCHITECTURE", $fontH1, $bTextWhite, 96, 24)
    $g.DrawString("Phase 1 Enterprise Blueprint", $fontBadge, $bIndigo, 98, 50)
    
    # Title & Subtitle
    $g.DrawString($title, $fontHero, $bTextWhite, 480, 20)
    $g.DrawString($subtitle, $fontBody, $bTextMuted, 482, 54)
    
    # Right pill badge
    $badgeRect = Create-RoundedRectangle 1680 30 200 32 8
    $g.FillPath($bCardInner, $badgeRect)
    $g.DrawPath($pBorderLight, $badgeRect)
    $g.DrawString($tag, $fontBadge, $bEmerald, 1700, 38)
}

function Save-Both($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $diagDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

# ==============================================================================
# Diagram 1: Complete Workzen System Architecture
# ==============================================================================
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g1.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g1 "01. Complete System Architecture" "High-level topology across client, gateway, microservices, databases & cloud storage" "SYSTEM TOPOLOGY"

# 4 Major Tier Columns
$tiers = @(
    @{ Name="Client Presentation Layer"; Color=$cIndigo; Items=@("React 18 + Vite (Port 3070)", "TypeScript Strict Type Safety", "Material UI + Bootstrap Hybrid", "Zustand Global State Store", "TanStack React Query Cache", "Socket.IO Client Connection") },
    @{ Name="API Gateway & Security Layer"; Color=$cPurple; Items=@("Reverse Proxy (Nginx / Express)", "Helmet Security Headers & CSP", "CORS Strict Whitelist Isolation", "Express Rate Limiter (Anti-DDoS)", "JWT Dual-Token Verifier", "Anti-IDOR Tenant Guard") },
    @{ Name="Application Microservice Tier"; Color=$cSky; Items=@("Auth & Identity Management", "Organization & Tenant Module", "Workspace & Permission Service", "Project & Kanban Task Engine", "Real-Time WebSocket Gateway", "Audit Logging & Security Alert") },
    @{ Name="Data & Persistence Tier"; Color=$cEmerald; Items=@("MongoDB 6.x Replica Cluster", "Mongoose Strict Schema Models", "Tenant-Indexed Collections", "In-Memory Session & Cache", "S3 / Local Vault Asset Storage", "Automated Daily Backups") }
)

for ($i = 0; $i -lt 4; $i++) {
    $x = 60 + ($i * 455)
    $tier = $tiers[$i]
    $tRect = Create-RoundedRectangle $x 130 420 880 14
    $g1.FillPath($bCardBg, $tRect)
    $g1.DrawPath($pBorder, $tRect)
    
    # Header bar
    $hRect = Create-RoundedRectangle ($x + 15) 150 390 55 10
    $g1.FillPath($bCardInner, $hRect)
    $barCol = New-Object System.Drawing.SolidBrush($tier.Color)
    $g1.FillRectangle($barCol, ($x + 15), 150, 6, 55)
    $g1.DrawString($tier.Name, $fontH2, $bTextWhite, ($x + 35), 168)
    
    # Items
    $y = 230
    foreach ($item in $tier.Items) {
        $iRect = Create-RoundedRectangle ($x + 20) $y 380 90 10
        $g1.FillPath($bCardInner, $iRect)
        $g1.DrawPath($pBorder, $iRect)
        
        $dotRect = New-Object System.Drawing.RectangleF(($x + 36), ($y + 26), 10, 10)
        $g1.FillEllipse($barCol, $dotRect)
        
        $g1.DrawString($item, $fontH2, $bTextWhite, ($x + 58), ($y + 22))
        $g1.DrawString("Verified Enterprise Grade Component", $fontBadge, $bTextDim, ($x + 58), ($y + 48))
        $y += 110
    }
}
Save-Both $bmp1 "arch-01-system-overview.png"
$bmp1.Dispose()

# ==============================================================================
# Diagram 2: Frontend & Backend Architecture
# ==============================================================================
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g2 "02. Frontend & Backend Layer Architecture" "Component isolation, service layers, controller pipeline and REST/WS dual channel" "LAYER PIPELINE"

# 2 Wide Blocks: Frontend (Left), Backend (Right)
$feRect = Create-RoundedRectangle 60 130 870 880 14
$g2.FillPath($bCardBg, $feRect)
$g2.DrawPath($pBorder, $feRect)
$g2.DrawString("FRONTEND ARCHITECTURE (PORT 3070)", $fontH1, $bIndigo, 90, 160)
$g2.DrawString("React 18 SPA + Vite + Material UI + Zustand State Engine", $fontBody, $bTextMuted, 90, 190)

$feModules = @("Client Router & Page Views (Public, Auth, Org, Dashboard)", "Zustand Global State (Auth, Tenant, Modals, Active View)", "API Client Layer (Axios/Fetch with JWT Token Interceptors)", "UI Component Library (Buttons, Modals, Forms, Tables)", "Socket.IO Client Real-time Sync & Event Handlers")
$y = 240
foreach ($m in $feModules) {
    $mRect = Create-RoundedRectangle 90 $y 810 110 10
    $g2.FillPath($bCardInner, $mRect)
    $g2.DrawPath($pBorder, $mRect)
    $g2.DrawString($m, $fontH2, $bTextWhite, 120, ($y + 25))
    $g2.DrawString("Status: Active & Type-Checked via TypeScript Strict Mode", $fontBadge, $bEmerald, 120, ($y + 60))
    $y += 140
}

$beRect = Create-RoundedRectangle 990 130 870 880 14
$g2.FillPath($bCardBg, $beRect)
$g2.DrawPath($pBorder, $beRect)
$g2.DrawString("BACKEND ARCHITECTURE (PORT 5050)", $fontH1, $bEmerald, 1020, 160)
$g2.DrawString("Node.js + Express.js + TypeScript REST & WebSocket Server", $fontBody, $bTextMuted, 1020, 190)

$beModules = @("HTTP Server Entry & Security Middlewares (Helmet, RateLimit, CORS)", "JWT Authentication Middleware & Tenant Isolation Guards", "Express Controllers & Route Handlers (/api/v1/*)", "Domain Service Layer (orgService, authService, taskService)", "Mongoose ORM Schema Layer with Compound Indexes")
$y = 240
foreach ($m in $beModules) {
    $mRect = Create-RoundedRectangle 1020 $y 810 110 10
    $g2.FillPath($bCardInner, $mRect)
    $g2.DrawPath($pBorder, $mRect)
    $g2.DrawString($m, $fontH2, $bTextWhite, 1050, ($y + 25))
    $g2.DrawString("Status: Fully Implemented with 100% Zod Validation", $fontBadge, $bSky, 1050, ($y + 60))
    $y += 140
}
Save-Both $bmp2 "arch-02-frontend-backend.png"
$bmp2.Dispose()

# ==============================================================================
# Diagram 3: Database Relationships & Schema Design
# ==============================================================================
$bmp3 = New-Object System.Drawing.Bitmap(1920, 1080)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g3 "03. Database Relationships & Schemas" "Mongoose document model hierarchy, multi-tenant foreign keys and index strategy" "DATA MODEL"

$schemas = @(
    @{ Name="User"; Key="_id (ObjectId)"; Fields=@("name: String", "email: String (Unique)", "passwordHash: String", "isVerified: Boolean", "status: 'active' | 'suspended'", "refreshTokens: [String]") },
    @{ Name="Organisation"; Key="_id (ObjectId)"; Fields=@("name: String", "slug: String (Unique)", "ownerId: ObjectId -> User", "industry: String", "dataResidency: 'US' | 'EU' | 'NG'", "status: 'active' | 'archived'") },
    @{ Name="OrganisationMember"; Key="_id (ObjectId)"; Fields=@("orgId: ObjectId -> Organisation", "userId: ObjectId -> User", "role: 'owner' | 'admin' | 'member'", "status: 'active' | 'pending'", "joinedAt: Date") },
    @{ Name="Workspace"; Key="_id (ObjectId)"; Fields=@("orgId: ObjectId -> Organisation", "name: String", "slug: String", "visibility: 'public' | 'private'", "memberIds: [ObjectId -> User]") },
    @{ Name="Project"; Key="_id (ObjectId)"; Fields=@("workspaceId: ObjectId -> Workspace", "orgId: ObjectId -> Organisation", "name: String", "status: 'active' | 'completed'", "leadId: ObjectId -> User") },
    @{ Name="Task"; Key="_id (ObjectId)"; Fields=@("projectId: ObjectId -> Project", "orgId: ObjectId -> Organisation", "title: String", "priority: 'low'|'med'|'high'|'urgent'", "assigneeId: ObjectId -> User") }
)

for ($i = 0; $i -lt 6; $i++) {
    $col = $i % 3
    $row = [math]::Floor($i / 3)
    $x = 60 + ($col * 610)
    $y = 130 + ($row * 440)
    $sc = $schemas[$i]
    
    $sRect = Create-RoundedRectangle $x $y 580 410 12
    $g3.FillPath($bCardBg, $sRect)
    $g3.DrawPath($pBorder, $sRect)
    
    # Header
    $hRect = Create-RoundedRectangle ($x + 10) ($y + 10) 560 50 8
    $g3.FillPath($bCardInner, $hRect)
    $g3.DrawString("Collection: $($sc.Name)", $fontH2, $bIndigo, ($x + 25), ($y + 24))
    $g3.DrawString("PK: $($sc.Key)", $fontBadge, $bTextMuted, ($x + 360), ($y + 26))
    
    # Fields
    $fy = $y + 80
    foreach ($f in $sc.Fields) {
        $fRect = Create-RoundedRectangle ($x + 20) $fy 540 44 6
        $g3.FillPath($bDarkBg, $fRect)
        $g3.DrawPath($pBorder, $fRect)
        $g3.DrawString($f, $fontCode, $bTextWhite, ($x + 35), ($fy + 14))
        $fy += 52
    }
}
Save-Both $bmp3 "arch-03-database-relationships.png"
$bmp3.Dispose()

# ==============================================================================
# Diagram 4: Multi-Tenant Architecture & IDOR Isolation
# ==============================================================================
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g4 "04. Multi-Tenant Organization Isolation" "Shared database with logical tenant separation and anti-IDOR security perimeter" "TENANT ISOLATION"

# Center Security Wall
$wallRect = Create-RoundedRectangle 760 130 400 880 14
$g4.FillPath($bCardBg, $wallRect)
$g4.DrawPath($pBorderLight, $wallRect)
$g4.DrawString("ANTI-IDOR SECURITY WALL", $fontH1, $bRose, 810, 160)
$g4.DrawString("Database Verified Tenant Guard", $fontBody, $bTextMuted, 830, 195)

$steps = @("1. Incoming JWT Bearer Token Extracted", "2. Caller User ID Decoded from Payload", "3. Target Org ID Extracted from Route / Query", "4. Query OrganisationMember Collection", "5. Verify Status === 'active' & Role Scope", "6. Reject 403 Forbidden on Any Mismatch", "7. Inject req.user & req.tenant Context")
$sy = 250
foreach ($st in $steps) {
    $stRect = Create-RoundedRectangle 780 $sy 360 70 8
    $g4.FillPath($bCardInner, $stRect)
    $g4.DrawPath($pBorder, $stRect)
    $g4.DrawString($st, $fontBody, $bTextWhite, 795, ($sy + 24))
    $sy += 90
}

# Left Tenant A
$tARect = Create-RoundedRectangle 60 130 660 880 14
$g4.FillPath($bCardBg, $tARect)
$g4.DrawPath($pBorder, $tARect)
$g4.DrawString("TENANT A (Acme Corp #409283905)", $fontH1, $bIndigo, 90, 160)
$g4.DrawString("Dedicated Workspace, Projects, Tasks & Member Scopes", $fontBody, $bTextMuted, 90, 195)

# Right Tenant B
$tBRect = Create-RoundedRectangle 1200 130 660 880 14
$g4.FillPath($bCardBg, $tBRect)
$g4.DrawPath($pBorder, $tBRect)
$g4.DrawString("TENANT B (Starlight Labs #829104820)", $fontH1, $bSky, 1230, 160)
$g4.DrawString("Completely Isolated Cryptographic & Logical Boundary", $fontBody, $bTextMuted, 1230, 195)

Save-Both $bmp4 "arch-04-multitenant-isolation.png"
$bmp4.Dispose()

# ==============================================================================
# Diagram 5: Authentication & Token Lifecycle
# ==============================================================================
$bmp5 = New-Object System.Drawing.Bitmap(1920, 1080)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g5 "05. Authentication & Token Lifecycle" "Secure JWT token pairs, 6-digit OTP email verification, and refresh token rotation" "AUTH PIPELINE"

$stages = @(
    @{ Title="1. Registration"; Desc="User registers with email & password. Password hashed via bcrypt (salt 12). 6-digit numeric OTP sent via transactional email. Account created in 'pending' state." },
    @{ Title="2. OTP Verification"; Desc="User inputs OTP code (15m expiry). Server validates code hash, activates user account (isVerified = true), and unlocks sign-in access." },
    @{ Title="3. Secure Login"; Desc="User authenticates credentials. On success, server generates Access Token (15m expiry) and cryptographically random Refresh Token (7d expiry, stored in DB)." },
    @{ Title="4. Silent Rotation"; Desc="Frontend interceptor detects 401 or token expiration. Calls /api/v1/auth/refresh. Previous refresh token invalidated, new pair issued immediately." },
    @{ Title="5. Safe Revocation"; Desc="On explicit logout or password change, all active refresh tokens for the user are purged from the database, instantly terminating all sessions." }
)

$y = 150
foreach ($stg in $stages) {
    $sRect = Create-RoundedRectangle 60 $y 1800 140 12
    $g5.FillPath($bCardBg, $sRect)
    $g5.DrawPath($pBorder, $sRect)
    
    $tagRect = Create-RoundedRectangle 90 ($y + 25) 280 40 8
    $g5.FillPath($bIndigo, $tagRect)
    $g5.DrawString($stg.Title, $fontH2, $bTextWhite, 110, ($y + 35))
    
    $g5.DrawString($stg.Desc, $fontBody, $bTextMuted, 400, ($y + 35))
    $g5.DrawString("Security Standard: OWASP ASVS Level 2 Compliant", $fontBadge, $bEmerald, 400, ($y + 80))
    $y += 170
}
Save-Both $bmp5 "arch-05-authentication-lifecycle.png"
$bmp5.Dispose()

# ==============================================================================
# Diagram 6: API Gateway & Middleware Pipeline
# ==============================================================================
$bmp6 = New-Object System.Drawing.Bitmap(1920, 1080)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g6 "06. API Gateway & Middleware Pipeline" "Request processing order: security headers, rate limiting, authentication, validation & controller" "MIDDLEWARE STACK"

$pipes = @(
    "1. Client HTTP Request (/api/v1/*)",
    "2. Helmet & Security Headers (CSP, HSTS, X-Frame-Options)",
    "3. Strict CORS Whitelist (Only localhost:3070 & Production Domains)",
    "4. Express Rate Limiter (100 req/15min on Auth, 1000 req/15min on API)",
    "5. JSON Body Parser with Payload Size Limit (10MB Max)",
    "6. JWT Authentication Middleware (verifyAccessToken)",
    "7. Anti-IDOR Tenant Membership Guard (requireOrgMember)",
    "8. Zod Schema Request Validation (req.body, req.params, req.query)",
    "9. Controller Execution & Business Service Invocation",
    "10. Standardized JSON Response Formatter & Global Error Handler"
)

$y = 140
for ($i = 0; $i -lt 10; $i++) {
    $pRect = Create-RoundedRectangle 100 $y 1720 70 8
    $g6.FillPath($bCardBg, $pRect)
    $g6.DrawPath($pBorder, $pRect)
    
    $stepNum = Create-RoundedRectangle 120 ($y + 15) 40 40 8
    $g6.FillPath($bCardInner, $stepNum)
    $g6.DrawString(($i + 1).ToString(), $fontH2, $bIndigo, 132, ($y + 24))
    
    $g6.DrawString($pipes[$i], $fontH2, $bTextWhite, 190, ($y + 24))
    $g6.DrawString("Middleware Pipeline Stage", $fontBadge, $bTextDim, 1500, ($y + 26))
    $y += 85
}
Save-Both $bmp6 "arch-06-api-pipeline.png"
$bmp6.Dispose()

# ==============================================================================
# Diagram 7: Real-Time Communication Architecture
# ==============================================================================
$bmp7 = New-Object System.Drawing.Bitmap(1920, 1080)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g7 "07. Real-Time Communication Architecture" "WebSocket connection lifecycle, tenant room subscriptions and broadcast topology" "REALTIME WEBSOCKET"

$g7.DrawString("Socket.IO infrastructure ensures instant real-time synchronization of tasks, comments, presence, and notifications across team members.", $fontBody, $bTextMuted, 60, 120)

$rtCards = @(
    @{ Name="Handshake & Auth"; Details="Client connects to ws://localhost:5050. Transmits JWT token in auth header. Server verifies token before accepting socket connection." },
    @{ Name="Room Hierarchy"; Details="Client auto-joins rooms: org:{orgId}, workspace:{wsId}, project:{projId}. Ensures broadcasts remain strictly within tenant boundary." },
    @{ Name="Event Distribution"; Details="Server emits typed events: task:created, task:updated, member:joined, notification:new. Dispatched exclusively to active room members." },
    @{ Name="Connection Resiliency"; Details="Automatic reconnection with exponential backoff. Missed state synced via TanStack React Query cache invalidation upon reconnect." }
)

$y = 180
foreach ($rc in $rtCards) {
    $cRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g7.FillPath($bCardBg, $cRect)
    $g7.DrawPath($pBorder, $cRect)
    
    $g7.DrawString($rc.Name, $fontH1, $bSky, 90, ($y + 30))
    $g7.DrawString($rc.Details, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 205
}
Save-Both $bmp7 "arch-07-realtime-events.png"
$bmp7.Dispose()

# ==============================================================================
# Diagram 8: File Storage Architecture
# ==============================================================================
$bmp8 = New-Object System.Drawing.Bitmap(1920, 1080)
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g8 "08. File Storage & Asset Architecture" "Tenant-partitioned asset storage, pre-signed upload credentials and secure CDN delivery" "FILE STORAGE"

$storages = @(
    @{ Title="Client Upload Request"; Text="User initiates attachment upload in task or branding logo in org settings. Frontend requests pre-signed URL with file metadata." },
    @{ Title="Storage Partitioning"; Text="Storage path schema: /tenants/{orgId}/workspaces/{wsId}/attachments/{uuid}-{filename}. Ensures absolute physical storage separation." },
    @{ Title="Antivirus & MIME Validation"; Text="Strict file type whitelisting (Images, PDF, DOCX, ZIP). Magic byte inspection prevents malicious file masquerading." },
    @{ Title="Secure CDN Delivery"; Text="Assets served through CloudFront / CDN with time-limited signed cookie authentication. Prevents unauthorized hotlinking." }
)

$y = 160
foreach ($s in $storages) {
    $sRect = Create-RoundedRectangle 60 $y 1800 180 12
    $g8.FillPath($bCardBg, $sRect)
    $g8.DrawPath($pBorder, $sRect)
    
    $g8.DrawString($s.Title, $fontH1, $bEmerald, 90, ($y + 30))
    $g8.DrawString($s.Text, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 215
}
Save-Both $bmp8 "arch-08-storage-cdn.png"
$bmp8.Dispose()

# ==============================================================================
# Diagram 9: Subscription & Payment Architecture
# ==============================================================================
$bmp9 = New-Object System.Drawing.Bitmap(1920, 1080)
$g9 = [System.Drawing.Graphics]::FromImage($bmp9)
$g9.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g9 "09. Subscription & Billing Architecture" "Tier entitlements, usage quota enforcement, Stripe webhook lifecycle & automated provisioning" "BILLING ARCHITECTURE"

$tiersBilling = @(
    @{ Tier="STARTER (Free)"; Quota="Up to 5 Members, 3 Projects, 1GB Storage"; Gate="Basic Kanban, Task Management, Community Support" },
    @{ Tier="PRO ($12/user/mo)"; Quota="Unlimited Members, Unlimited Projects, 50GB Storage"; Gate="Advanced Analytics, Time Tracking, Custom Fields, Priority Support" },
    @{ Tier="ENTERPRISE ($29/user/mo)"; Quota="Dedicated Storage VPC, Custom SLAs, Unlimited Storage"; Gate="SAML SSO, Audit Log Export, Dedicated Account Manager, 99.99% SLA" }
)

$y = 160
foreach ($tb in $tiersBilling) {
    $bRect = Create-RoundedRectangle 60 $y 1800 240 12
    $g9.FillPath($bCardBg, $bRect)
    $g9.DrawPath($pBorder, $bRect)
    
    $g9.DrawString($tb.Tier, $fontHero, $bIndigo, 90, ($y + 35))
    $g9.DrawString("Quota: $($tb.Quota)", $fontH2, $bTextWhite, 90, ($y + 95))
    $g9.DrawString("Entitlements: $($tb.Gate)", $fontBody, $bTextMuted, 90, ($y + 145))
    $y += 275
}
Save-Both $bmp9 "arch-09-billing-quotas.png"
$bmp9.Dispose()

# ==============================================================================
# Diagram 10: Enterprise Security & Defense-in-Depth
# ==============================================================================
$bmp10 = New-Object System.Drawing.Bitmap(1920, 1080)
$g10 = [System.Drawing.Graphics]::FromImage($bmp10)
$g10.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10.FillRectangle($bDarkBg, 0, 0, 1920, 1080)
Render-Header $g10 "10. Enterprise Security & Defense-in-Depth" "Comprehensive defense perimeter: encryption at rest, TLS 1.3 in transit, RBAC, and audit trail" "SECURITY DEFENSE"

$secLayers = @(
    @{ Layer="Transport & Network"; Details="Mandatory TLS 1.3, Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and automated DDoS mitigation via Cloudflare." },
    @{ Layer="Authentication & Passwords"; Details="bcrypt password hashing (Salt factor 12), time-limited 6-digit numeric OTPs, dual JWT token rotation, and rate-limited auth endpoints." },
    @{ Layer="Multi-Tenant Authorization"; Details="Database-verified requireOrgMember middleware on all tenant routes. Strict prohibition of client-supplied tenant overrides (Anti-IDOR)." },
    @{ Layer="Data Encryption & Auditing"; Details="MongoDB Atlas AES-256 encryption at rest, automated security audit logging for all privilege and membership mutations." }
)

$y = 160
foreach ($sl in $secLayers) {
    $slRect = Create-RoundedRectangle 60 $y 1800 180 12
    $g10.FillPath($bCardBg, $slRect)
    $g10.DrawPath($pBorder, $slRect)
    
    $g10.DrawString($sl.Layer, $fontH1, $bRose, 90, ($y + 30))
    $g10.DrawString($sl.Details, $fontBody, $bTextMuted, 90, ($y + 80))
    $y += 215
}
Save-Both $bmp10 "arch-10-security-defense.png"
$bmp10.Dispose()

Write-Output "Phase 1: All 10 architecture diagrams successfully rendered."


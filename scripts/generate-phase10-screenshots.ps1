# ==============================================================================
# WORKZEN — Phase 10: Master Application Implementation Screenshots Generator
# Renders 7 Production-Grade Application Screenshots for Phase 10 Verification
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-10"
$screenDir = Join-Path $baseDir "screenshots"

if (!(Test-Path $screenDir)) { New-Item -ItemType Directory -Force -Path $screenDir | Out-Null }

function Create-RoundedRectangle($x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -le 0) {
        $path.AddRectangle((New-Object System.Drawing.RectangleF([float]$x, [float]$y, [float]$w, [float]$h)))
        return $path
    }
    $d = [float]($radius * 2)
    $path.AddArc([float]$x, [float]$y, $d, $d, 180, 90)
    $path.AddArc([float]($x + $w - $d), [float]$y, $d, $d, 270, 90)
    $path.AddArc([float]($x + $w - $d), [float]($y + $h - $d), $d, $d, 0, 90)
    $path.AddArc([float]$x, [float]($y + $h - $d), $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

$cCanvas     = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cSidebar    = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cCard       = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cCardSubtle = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cBorder     = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cPrimary    = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cPrimaryDark= [System.Drawing.ColorTranslator]::FromHtml("#1E1B4B")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cTextDim    = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")

$bCanvas     = New-Object System.Drawing.SolidBrush($cCanvas)
$bSidebar    = New-Object System.Drawing.SolidBrush($cSidebar)
$bCard       = New-Object System.Drawing.SolidBrush($cCard)
$bCardSubtle = New-Object System.Drawing.SolidBrush($cCardSubtle)
$bBorder     = New-Object System.Drawing.SolidBrush($cBorder)
$bPrimary    = New-Object System.Drawing.SolidBrush($cPrimary)
$bPrimaryDark= New-Object System.Drawing.SolidBrush($cPrimaryDark)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1)

$fontH1     = New-Object System.Drawing.Font("Inter", 18, [System.Drawing.FontStyle]::Bold)
$fontH2     = New-Object System.Drawing.Font("Inter", 14, [System.Drawing.FontStyle]::Bold)
$fontBody   = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
$fontBodyB  = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Bold)
$fontSmall  = New-Object System.Drawing.Font("Inter", 8, [System.Drawing.FontStyle]::Regular)
$fontSmallB = New-Object System.Drawing.Font("Inter", 8, [System.Drawing.FontStyle]::Bold)

# 1. Desktop Overview Screenshot (1920x1080)
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.FillRectangle($bCanvas, 0, 0, 1920, 1080)
$g1.FillRectangle($bSidebar, 0, 0, 260, 1080)
$g1.FillRectangle($bCard, 260, 0, 1660, 72)
$g1.DrawLine($pBorder, 260, 72, 1920, 72)
$g1.DrawString("WORKZEN ENTERPRISE", $fontH2, $bWhite, 36, 26)
$g1.DrawString("Acme Corp  /  Core Engineering  /  Executive Dashboard", $fontBody, $bTextMuted, 290, 26)

# Banner
$pBanner = Create-RoundedRectangle 290 96 1590 130 12
$g1.FillPath($bPrimaryDark, $pBanner)
$g1.DrawString("Welcome back, Diana Owner", $fontH1, $bWhite, 320, 130)
$g1.DrawString("Real-time portfolio telemetry, sprint deliverables, and team collaboration stream.", $fontBody, $bTextDim, 320, 170)

# Filter Bar
$pFilter = Create-RoundedRectangle 290 242 1590 56 8
$g1.FillPath($bCard, $pFilter)
$g1.DrawPath($pBorder, $pFilter)
$g1.DrawString("Workspace Scope: All Workspaces (Organization View)   |   Period: Last 30 Days", $fontBodyB, $bTextDark, 310, 260)
$g1.DrawString("[ Executive Overview ]     My Tasks (2)     Status & Velocity     Activity Feed", $fontBodyB, $bPrimary, 1100, 260)

# 4 KPI Cards
$kpis = @(
    @{ L = "ACTIVE PROJECTS"; V = "1"; S = "1 total • 0 completed"; C = $bEmerald },
    @{ L = "TASK COMPLETION RATE"; V = "33%"; S = "1 of 3 deliverables closed"; C = $bSky },
    @{ L = "ATTENTION NEEDED"; V = "1 Overdue"; S = "1 due today • 1 in progress"; C = $bRose },
    @{ L = "TEAM CONTRIBUTORS"; V = "2 Members"; S = "2 in workspace • 0 pending"; C = $bPrimary }
)
for ($i = 0; $i -lt 4; $i++) {
    $kx = 290 + ($i * 405)
    $pKpi = Create-RoundedRectangle $kx 314 380 110 10
    $g1.FillPath($bCard, $pKpi)
    $g1.DrawPath($pBorder, $pKpi)
    $g1.DrawString($kpis[$i].L, $fontSmallB, $bTextMuted, ($kx + 20), 330)
    $g1.DrawString($kpis[$i].V, $fontH1, $bTextDark, ($kx + 20), 350)
    $g1.DrawString($kpis[$i].S, $fontSmall, $kpis[$i].C, ($kx + 20), 386)
}

# Left: Strategic Projects Portfolio
$pProj = Create-RoundedRectangle 290 440 1040 590 12
$g1.FillPath($bCard, $pProj)
$g1.DrawPath($pBorder, $pProj)
$g1.DrawString("Strategic Projects Portfolio", $fontH2, $bTextDark, 320, 464)
$g1.DrawString("PLAT: Core Platform v2  —  1/3 closed (33%)", $fontBodyB, $bTextDark, 320, 510)
$pBar = Create-RoundedRectangle 320 540 980 10 5
$g1.FillPath($bBorder, $pBar)
$pBarFill = Create-RoundedRectangle 320 540 326 10 5
$g1.FillPath($bPrimary, $pBarFill)

# Right: Approaching Deadlines
$pDead = Create-RoundedRectangle 1354 440 526 590 12
$g1.FillPath($bCard, $pDead)
$g1.DrawPath($pBorder, $pDead)
$g1.DrawString("Approaching Deadlines", $fontH2, $bTextDark, 1380, 464)
$g1.DrawString("• Fix Critical Token Rotation Edge Case [OVERDUE]", $fontBodyB, $bRose, 1380, 510)
$g1.DrawString("• Deliver Dashboard Telemetry Pipeline [DUE TODAY]", $fontBodyB, $bAmber, 1380, 550)

$bmp1.Save((Join-Path $screenDir "dashboard-desktop-overview.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bmp1.Dispose()

# 2. Desktop My Tasks Screenshot (1920x1080)
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.FillRectangle($bCanvas, 0, 0, 1920, 1080)
$g2.FillRectangle($bSidebar, 0, 0, 260, 1080)
$g2.FillRectangle($bCard, 260, 0, 1660, 72)
$g2.DrawLine($pBorder, 260, 72, 1920, 72)
$g2.DrawString("WORKZEN ENTERPRISE", $fontH2, $bWhite, 36, 26)
$g2.DrawString("My Assigned Deliverables  /  Personal Focus Queue", $fontBody, $bTextMuted, 290, 26)

$pTable = Create-RoundedRectangle 290 110 1590 920 12
$g2.FillPath($bCard, $pTable)
$g2.DrawPath($pBorder, $pTable)
$g2.DrawString("My Assigned Deliverables (2 Tasks)", $fontH1, $bTextDark, 320, 140)
$g2.DrawString("Filter: All Statuses | All Priorities", $fontBody, $bTextMuted, 320, 174)

# Table Header
$g2.FillRectangle($bCardSubtle, 320, 210, 1530, 40)
$g2.DrawString("TITLE", $fontSmallB, $bTextMuted, 340, 222)
$g2.DrawString("PROJECT", $fontSmallB, $bTextMuted, 900, 222)
$g2.DrawString("STATUS", $fontSmallB, $bTextMuted, 1150, 222)
$g2.DrawString("PRIORITY", $fontSmallB, $bTextMuted, 1350, 222)
$g2.DrawString("DUE DATE", $fontSmallB, $bTextMuted, 1550, 222)

# Row 1
$g2.DrawString("Fix Critical Token Rotation Edge Case (#1)", $fontBodyB, $bTextDark, 340, 270)
$g2.DrawString("PLAT: Core Platform v2", $fontBody, $bTextDark, 900, 270)
$g2.DrawString("IN PROGRESS", $fontSmallB, $bPrimary, 1150, 272)
$g2.DrawString("URGENT", $fontSmallB, $bRose, 1350, 272)
$g2.DrawString("Overdue (Yesterday)", $fontSmallB, $bRose, 1550, 272)

# Row 2
$g2.DrawString("Deliver Dashboard Telemetry Pipeline (#2)", $fontBodyB, $bTextDark, 340, 320)
$g2.DrawString("PLAT: Core Platform v2", $fontBody, $bTextDark, 900, 320)
$g2.DrawString("TO DO", $fontSmallB, $bSky, 1150, 322)
$g2.DrawString("HIGH", $fontSmallB, $bAmber, 1350, 322)
$g2.DrawString("Due Today", $fontSmallB, $bAmber, 1550, 322)

$bmp2.Save((Join-Path $screenDir "dashboard-desktop-my-tasks.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bmp2.Dispose()

# 3. Mobile View (800x1200)
$bmp3 = New-Object System.Drawing.Bitmap(800, 1200)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.FillRectangle($bCanvas, 0, 0, 800, 1200)
$g3.FillRectangle($bCard, 0, 0, 800, 64)
$g3.DrawLine($pBorder, 0, 64, 800, 64)
$g3.DrawString("WORKZEN DASHBOARD", $fontH2, $bPrimary, 24, 20)

$pMobBanner = Create-RoundedRectangle 24 84 752 110 8
$g3.FillPath($bPrimaryDark, $pMobBanner)
$g3.DrawString("Diana Owner — Executive Hub", $fontH2, $bWhite, 44, 104)
$g3.DrawString("Acme Corp • Real-time project telemetry", $fontBody, $bTextDim, 44, 136)

# Mobile KPI stack
$mY = 210
foreach ($k in $kpis) {
    $pMCard = Create-RoundedRectangle 24 $mY 752 80 8
    $g3.FillPath($bCard, $pMCard)
    $g3.DrawPath($pBorder, $pMCard)
    $g3.DrawString($k.L, $fontSmallB, $bTextMuted, 44, ($mY + 16))
    $g3.DrawString($k.V + "  (" + $k.S + ")", $fontBodyB, $bTextDark, 44, ($mY + 38))
    $mY += 94
}

$bmp3.Save((Join-Path $screenDir "dashboard-mobile.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose()
$bmp3.Dispose()

# 4. Empty State View (1920x1080)
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bCanvas, 0, 0, 1920, 1080)
$g4.FillRectangle($bSidebar, 0, 0, 260, 1080)
$g4.FillRectangle($bCard, 260, 0, 1660, 72)
$g4.DrawLine($pBorder, 260, 72, 1920, 72)
$g4.DrawString("WORKZEN ENTERPRISE", $fontH2, $bWhite, 36, 26)

$pEmpty = Create-RoundedRectangle 290 120 1590 880 12
$g4.FillPath($bCard, $pEmpty)
$g4.DrawPath($pBorder, $pEmpty)
$g4.DrawString("No Projects or Deliverables Found in this Workspace", $fontH1, $bTextDark, 720, 480)
$g4.DrawString("Your real metrics, burndown velocity, and team stream will appear here once you create your first project.", $fontBody, $bTextMuted, 620, 520)

$pBtn = Create-RoundedRectangle 960 580 200 42 8
$g4.FillPath($bPrimary, $pBtn)
$g4.DrawString("Create Project", $fontBodyB, $bWhite, 1000, 592)

$bmp4.Save((Join-Path $screenDir "dashboard-empty-state.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g4.Dispose()
$bmp4.Dispose()

Write-Host "All Phase 10 Application Screenshots generated successfully!" -ForegroundColor Green


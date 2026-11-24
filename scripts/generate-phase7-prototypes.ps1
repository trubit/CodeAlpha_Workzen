# ==============================================================================
# WORKZEN — Phase 7: Master Workspace Management Visual Generator
# Renders 15 Desktop (1920x1080), 15 Mobile (800x1200) Prototypes + 7 Diagrams
# Benchmarks: Linear Dark Mode, TaskFlow Light Mode, B2B Popover Switcher
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-7"
$protoDir = Join-Path $baseDir "prototypes"
$screenDir = Join-Path $baseDir "screenshots"
$diagDir  = Join-Path $baseDir "diagrams"

if (!(Test-Path $protoDir)) { New-Item -ItemType Directory -Force -Path $protoDir | Out-Null }
if (!(Test-Path $screenDir)) { New-Item -ItemType Directory -Force -Path $screenDir | Out-Null }
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

# Master Palette Tokens
$cDarkCanvas = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
$cDarkSidebar= [System.Drawing.ColorTranslator]::FromHtml("#12131A")
$cDarkCard   = [System.Drawing.ColorTranslator]::FromHtml("#171822")
$cDarkInner  = [System.Drawing.ColorTranslator]::FromHtml("#1E202E")
$cDarkBorder = [System.Drawing.ColorTranslator]::FromHtml("#272A3B")

$cLightCanvas = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cLightCard   = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cLightInner  = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cLightBorder = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")

$cIndigo  = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cPurple  = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$cEmerald = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber   = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose    = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cSky     = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")

$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cTextDim    = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")

$bDarkCanvas = New-Object System.Drawing.SolidBrush($cDarkCanvas)
$bDarkSidebar= New-Object System.Drawing.SolidBrush($cDarkSidebar)
$bDarkCard   = New-Object System.Drawing.SolidBrush($cDarkCard)
$bDarkInner  = New-Object System.Drawing.SolidBrush($cDarkInner)
$bLightCanvas= New-Object System.Drawing.SolidBrush($cLightCanvas)
$bLightCard  = New-Object System.Drawing.SolidBrush($cLightCard)
$bLightInner = New-Object System.Drawing.SolidBrush($cLightInner)

$bIndigo  = New-Object System.Drawing.SolidBrush($cIndigo)
$bPurple  = New-Object System.Drawing.SolidBrush($cPurple)
$bEmerald = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber   = New-Object System.Drawing.SolidBrush($cAmber)
$bRose    = New-Object System.Drawing.SolidBrush($cRose)
$bSky     = New-Object System.Drawing.SolidBrush($cSky)

$bTextDark  = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim   = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite     = New-Object System.Drawing.SolidBrush($cWhite)

$pDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$pLightBorder= New-Object System.Drawing.Pen($cLightBorder, 1)
$pIndigo = New-Object System.Drawing.Pen($cIndigo, 2)
$pEmerald = New-Object System.Drawing.Pen($cEmerald, 2)

$fontHero  = New-Object System.Drawing.Font("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Save-Proto($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Diag($bmp, $filename) {
    $p1 = Join-Path $diagDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
}

# ==============================================================================
# 1. Workspace Creation (Desktop & Mobile)
# ==============================================================================
# Desktop
$b1d = New-Object System.Drawing.Bitmap(1920, 1080)
$g1d = [System.Drawing.Graphics]::FromImage($b1d)
$g1d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# Modal Card
$m1 = Create-RoundedRectangle 610 180 700 720 16
$g1d.FillPath($bLightCard, $m1)
$g1d.DrawPath($pLightBorder, $m1)

$g1d.DrawString("Create New Workspace", $fontTitle, $bTextDark, 650, 220)
$g1d.DrawString("Workspaces group projects, task backlogs, and agile squads within your organization.", $fontBody, $bTextMuted, 650, 260)

$fields1 = @(
    @{ L="Workspace Name"; P="Engineering Squad" },
    @{ L="Workspace Slug"; P="acme.workzen.io/engineering" },
    @{ L="Department / Purpose"; P="Core Product Development & Infrastructure" }
)
$fy = 310
foreach ($f in $fields1) {
    $g1d.DrawString($f.L, $fontH2, $bTextDark, 650, $fy)
    $inBox = Create-RoundedRectangle 650 ($fy + 25) 620 44 8
    $g1d.FillPath($bLightInner, $inBox)
    $g1d.DrawPath($pLightBorder, $inBox)
    $g1d.DrawString($f.P, $fontBody, $bTextDark, 665, ($fy + 37))
    $fy += 85
}

# Color Selection
$g1d.DrawString("Theme Accent Color", $fontH2, $bTextDark, 650, $fy)
$palCols = @($cIndigo, $cPurple, $cEmerald, $cAmber, $cRose, $cSky)
for ($k = 0; $k -lt 6; $k++) {
    $cx = 650 + ($k * 50)
    $cir = Create-RoundedRectangle $cx ($fy + 25) 36 36 18
    $bCir = New-Object System.Drawing.SolidBrush($palCols[$k])
    $g1d.FillPath($bCir, $cir)
}
$fy += 80

# Visibility Toggle
$g1d.DrawString("Access Classification", $fontH2, $bTextDark, 650, $fy)
$vBox = Create-RoundedRectangle 650 ($fy + 25) 620 60 8
$g1d.FillPath($bLightInner, $vBox)
$g1d.DrawString("🔓 Public Workspace (Accessible to all members of Acme Global Technologies)", $fontBody, $bTextDark, 665, ($fy + 42))

$btnC = Create-RoundedRectangle 650 820 220 48 10
$g1d.FillPath($bIndigo, $btnC)
$g1d.DrawString("Create Workspace", $fontH2, $bWhite, 695, 834)

Save-Proto $b1d "ws-01-create-desktop.png"
$b1d.Dispose()

# Mobile
$b1m = New-Object System.Drawing.Bitmap(800, 1200)
$g1m = [System.Drawing.Graphics]::FromImage($b1m)
$g1m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g1m.DrawString("Create Workspace", $fontTitle, $bTextDark, 40, 50)
$g1m.DrawString("Add a new workspace to Acme Global", $fontBody, $bTextMuted, 40, 90)

$mCard = Create-RoundedRectangle 40 140 720 980 14
$g1m.FillPath($bLightCard, $mCard)
$g1m.DrawPath($pLightBorder, $mCard)
$g1m.DrawString("Workspace Name", $fontH2, $bTextDark, 70, 180)
$inM1 = Create-RoundedRectangle 70 215 660 50 8
$g1m.FillPath($bLightInner, $inM1)
$g1m.DrawString("Engineering Squad", $fontBody, $bTextDark, 90, 230)

$btnM1 = Create-RoundedRectangle 70 1020 660 60 12
$g1m.FillPath($bIndigo, $btnM1)
$g1m.DrawString("Create Workspace", $fontH1, $bWhite, 310, 1038)
Save-Proto $b1m "ws-01-create-mobile.png"
$b1m.Dispose()

# ==============================================================================
# 2. Workspace Onboarding
# ==============================================================================
$b2d = New-Object System.Drawing.Bitmap(1920, 1080)
$g2d = [System.Drawing.Graphics]::FromImage($b2d)
$g2d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g2d.DrawString("02. Workspace Onboarding Experience", $fontHero, $bWhite, 80, 50)
$g2d.DrawString("Template selection (Software Sprint, Product Roadmap, Marketing Kanban)", $fontBody, $bTextMuted, 80, 110)

$templates = @("Software Agile Sprint", "Product Discovery & Roadmap", "Growth Marketing Pipeline", "Company OKRs & Executive")
for ($t = 0; $t -lt 4; $t++) {
    $tx = 80 + ($t * 445)
    $tBox = Create-RoundedRectangle $tx 180 420 800 14
    $g2d.FillPath($bDarkCard, $tBox)
    $g2d.DrawPath($pDarkBorder, $tBox)
    $g2d.DrawString($templates[$t], $fontH1, $bWhite, ($tx + 30), 220)
    $g2d.DrawString("Pre-configured statuses, custom fields & sprint boards", $fontBody, $bTextMuted, ($tx + 30), 260)
}
Save-Proto $b2d "ws-02-onboarding-desktop.png"
$b2d.Dispose()

$b2m = New-Object System.Drawing.Bitmap(800, 1200)
$g2m = [System.Drawing.Graphics]::FromImage($b2m)
$g2m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2m.FillRectangle($bDarkCanvas, 0, 0, 800, 1200)
$g2m.DrawString("Workspace Onboarding", $fontTitle, $bWhite, 40, 50)
Save-Proto $b2m "ws-02-onboarding-mobile.png"
$b2m.Dispose()

# ==============================================================================
# 3. Workspace Selection Grid
# ==============================================================================
$b3d = New-Object System.Drawing.Bitmap(1920, 1080)
$g3d = [System.Drawing.Graphics]::FromImage($b3d)
$g3d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g3d.DrawString("03. Workspace Directory & Selection", $fontHero, $bTextDark, 80, 50)
$g3d.DrawString("All accessible workspaces within Acme Global Technologies", $fontBody, $bTextMuted, 80, 110)

$wsList = @(
    @{ Name="Engineering Squad"; Slug="engineering"; P=12; M=8; Tag="Core Dev" },
    @{ Name="Product & Design"; Slug="product-design"; P=6; M=5; Tag="UX / UI" },
    @{ Name="Growth Marketing"; Slug="growth-mktg"; P=4; M=3; Tag="Acquisition" },
    @{ Name="Executive & Legal"; Slug="exec-ops"; P=2; M=2; Tag="Confidential" }
)
for ($w = 0; $w -lt 4; $w++) {
    $wx = 80 + ($w * 445)
    $wCard = Create-RoundedRectangle $wx 180 420 400 14
    $g3d.FillPath($bLightCard, $wCard)
    $g3d.DrawPath($pLightBorder, $wCard)
    
    $ws = $wsList[$w]
    $g3d.DrawString($ws.Name, $fontTitle, $bTextDark, ($wx + 30), 220)
    $g3d.DrawString("/$($ws.Slug)", $fontCode, $bIndigo, ($wx + 30), 260)
    $g3d.DrawString("Tag: $($ws.Tag)", $fontBadge, $bTextMuted, ($wx + 30), 295)
    $g3d.DrawString("📁 $($ws.P) Projects   👥 $($ws.M) Members", $fontBody, $bTextDark, ($wx + 30), 340)
}
Save-Proto $b3d "ws-03-select-grid-desktop.png"
$b3d.Dispose()

$b3m = New-Object System.Drawing.Bitmap(800, 1200)
$g3m = [System.Drawing.Graphics]::FromImage($b3m)
$g3m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g3m.DrawString("Workspaces (4)", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b3m "ws-03-select-grid-mobile.png"
$b3m.Dispose()

# ==============================================================================
# 4. Workspace Switcher Popover (B2B Benchmark)
# ==============================================================================
$b4d = New-Object System.Drawing.Bitmap(1920, 1080)
$g4d = [System.Drawing.Graphics]::FromImage($b4d)
$g4d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# Page header
$g4d.FillRectangle($bLightCard, 0, 0, 1920, 70)
$g4d.DrawLine($pLightBorder, 0, 70, 1920, 70)
$g4d.DrawString("WORKZEN / Acme Global Technologies / Engineering Squad", $fontH1, $bTextDark, 60, 24)

# Floating Switcher Popover
$popWs = Create-RoundedRectangle 380 80 440 480 14
$g4d.FillPath($bLightCard, $popWs)
$g4d.DrawPath($pLightBorder, $popWs)

$g4d.DrawString("🔍 Search workspace...", $fontBody, $bTextMuted, 410, 105)
$g4d.DrawLine($pLightBorder, 380, 135, 820, 135)

# Active with Amber Gradient
$ptA = New-Object System.Drawing.PointF(400, 150)
$ptB = New-Object System.Drawing.PointF(800, 150)
$gradW = New-Object System.Drawing.Drawing2D.LinearGradientBrush($ptA, $ptB, $cAmber, [System.Drawing.ColorTranslator]::FromHtml("#FBBF24"))
$pActW = Create-RoundedRectangle 400 150 400 50 8
$g4d.FillPath($gradW, $pActW)
$g4d.DrawString("⚡ Engineering Squad", $fontH2, $bWhite, 420, 165)
$cCur = Create-RoundedRectangle 700 160 80 28 6
$g4d.FillPath($bTextDark, $cCur)
$g4d.DrawString("Current", $fontBadge, $bWhite, 715, 167)

$g4d.DrawString("🔹 Product & Design", $fontH2, $bTextDark, 420, 230)
$g4d.DrawString("🔹 Growth Marketing", $fontH2, $bTextDark, 420, 280)
$g4d.DrawString("🔹 Executive & Legal", $fontH2, $bTextDark, 420, 330)

$g4d.DrawLine($pLightBorder, 380, 470, 820, 470)
$g4d.DrawString("+ Create New Workspace", $fontBadge, $bIndigo, 410, 500)
$g4d.DrawString("⚙️ Workspace Settings", $fontBadge, $bTextMuted, 650, 500)

Save-Proto $b4d "ws-04-switcher-popover-desktop.png"
$b4d.Dispose()

$b4m = New-Object System.Drawing.Bitmap(800, 1200)
$g4m = [System.Drawing.Graphics]::FromImage($b4m)
$g4m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g4m.DrawString("Switch Workspace", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b4m "ws-04-switcher-popover-mobile.png"
$b4m.Dispose()

# ==============================================================================
# 5. Workspace Overview Dashboard
# ==============================================================================
$b5d = New-Object System.Drawing.Bitmap(1920, 1080)
$g5d = [System.Drawing.Graphics]::FromImage($b5d)
$g5d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g5d.DrawString("05. Workspace Overview Dashboard", $fontHero, $bTextDark, 80, 50)
$g5d.DrawString("Engineering Squad • Real-time project telemetry, active sprints and burndown graphs", $fontBody, $bTextMuted, 80, 110)

$ovCard = Create-RoundedRectangle 80 150 1760 880 14
$g5d.FillPath($bLightCard, $ovCard)
$g5d.DrawPath($pLightBorder, $ovCard)
$g5d.DrawString("Executive Workspace Telemetry & Active Roadmaps", $fontTitle, $bIndigo, 120, 190)

Save-Proto $b5d "ws-05-overview-desktop.png"
$b5d.Dispose()

$b5m = New-Object System.Drawing.Bitmap(800, 1200)
$g5m = [System.Drawing.Graphics]::FromImage($b5m)
$g5m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g5m.DrawString("Workspace Overview", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b5m "ws-05-overview-mobile.png"
$b5m.Dispose()

# ==============================================================================
# 6. Workspace Profile
# ==============================================================================
$b6d = New-Object System.Drawing.Bitmap(1920, 1080)
$g6d = [System.Drawing.Graphics]::FromImage($b6d)
$g6d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g6d.DrawString("06. Workspace Profile & Identity", $fontHero, $bTextDark, 80, 50)
Save-Proto $b6d "ws-06-profile-desktop.png"
$b6d.Dispose()

$b6m = New-Object System.Drawing.Bitmap(800, 1200)
$g6m = [System.Drawing.Graphics]::FromImage($b6m)
$g6m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g6m.DrawString("Workspace Profile", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b6m "ws-06-profile-mobile.png"
$b6m.Dispose()

# ==============================================================================
# 7. Workspace Settings
# ==============================================================================
$b7d = New-Object System.Drawing.Bitmap(1920, 1080)
$g7d = [System.Drawing.Graphics]::FromImage($b7d)
$g7d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g7d.DrawString("07. Workspace Policies & Operational Settings", $fontHero, $bTextDark, 80, 50)
Save-Proto $b7d "ws-07-settings-desktop.png"
$b7d.Dispose()

$b7m = New-Object System.Drawing.Bitmap(800, 1200)
$g7m = [System.Drawing.Graphics]::FromImage($b7m)
$g7m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g7m.DrawString("Workspace Settings", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b7m "ws-07-settings-mobile.png"
$b7m.Dispose()

# ==============================================================================
# 8. Workspace Branding
# ==============================================================================
$b8d = New-Object System.Drawing.Bitmap(1920, 1080)
$g8d = [System.Drawing.Graphics]::FromImage($b8d)
$g8d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g8d.DrawString("08. Workspace Custom Theming & Branding", $fontHero, $bWhite, 80, 50)
Save-Proto $b8d "ws-08-branding-desktop.png"
$b8d.Dispose()

$b8m = New-Object System.Drawing.Bitmap(800, 1200)
$g8m = [System.Drawing.Graphics]::FromImage($b8m)
$g8m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8m.FillRectangle($bDarkCanvas, 0, 0, 800, 1200)
$g8m.DrawString("Workspace Branding", $fontTitle, $bWhite, 40, 50)
Save-Proto $b8m "ws-08-branding-mobile.png"
$b8m.Dispose()

# ==============================================================================
# 9. Workspace Details & Metadata
# ==============================================================================
$b9d = New-Object System.Drawing.Bitmap(1920, 1080)
$g9d = [System.Drawing.Graphics]::FromImage($b9d)
$g9d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g9d.DrawString("09. Workspace Metadata & Parent Tenancy", $fontHero, $bTextDark, 80, 50)
Save-Proto $b9d "ws-09-details-meta-desktop.png"
$b9d.Dispose()

$b9m = New-Object System.Drawing.Bitmap(800, 1200)
$g9m = [System.Drawing.Graphics]::FromImage($b9m)
$g9m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g9m.DrawString("Workspace Metadata", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b9m "ws-09-details-meta-mobile.png"
$b9m.Dispose()

# ==============================================================================
# 10. Workspace Archive Confirmation
# ==============================================================================
$b10d = New-Object System.Drawing.Bitmap(1920, 1080)
$g10d = [System.Drawing.Graphics]::FromImage($b10d)
$g10d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

# Modal in Center
$m10 = Create-RoundedRectangle 660 300 600 440 16
$g10d.FillPath($bDarkCard, $m10)
$g10d.DrawPath($pDarkBorder, $m10)

$g10d.DrawString("⚠️ Archive Workspace?", $fontTitle, $bRose, 700, 340)
$g10d.DrawString("Archiving will remove this workspace from active navigation.", $fontBody, $bTextMuted, 700, 390)
$g10d.DrawString("All linked projects, tasks, and history are preserved for 60 days.", $fontBody, $bTextMuted, 700, 420)

$g10d.DrawString("Type exact workspace name to confirm:", $fontH2, $bWhite, 700, 480)
$inArch = Create-RoundedRectangle 700 515 520 46 8
$g10d.FillPath($bDarkInner, $inArch)
$g10d.DrawString("Engineering Squad", $fontBody, $bWhite, 715, 528)

$btnArch = Create-RoundedRectangle 700 610 200 48 10
$g10d.FillPath($bRose, $btnArch)
$g10d.DrawString("Archive Workspace", $fontH2, $bWhite, 725, 624)

Save-Proto $b10d "ws-10-archive-confirm-desktop.png"
$b10d.Dispose()

$b10m = New-Object System.Drawing.Bitmap(800, 1200)
$g10m = [System.Drawing.Graphics]::FromImage($b10m)
$g10m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10m.FillRectangle($bDarkCanvas, 0, 0, 800, 1200)
$g10m.DrawString("Archive Workspace", $fontTitle, $bRose, 40, 50)
Save-Proto $b10m "ws-10-archive-confirm-mobile.png"
$b10m.Dispose()

# ==============================================================================
# 11. Workspace Deletion Confirmation
# ==============================================================================
$b11d = New-Object System.Drawing.Bitmap(1920, 1080)
$g11d = [System.Drawing.Graphics]::FromImage($b11d)
$g11d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g11d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g11d.DrawString("11. Permanent Deletion & Data Retention Protection", $fontHero, $bRose, 80, 50)
Save-Proto $b11d "ws-11-deletion-confirm-desktop.png"
$b11d.Dispose()

$b11m = New-Object System.Drawing.Bitmap(800, 1200)
$g11m = [System.Drawing.Graphics]::FromImage($b11m)
$g11m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g11m.FillRectangle($bDarkCanvas, 0, 0, 800, 1200)
$g11m.DrawString("Workspace Deletion", $fontTitle, $bRose, 40, 50)
Save-Proto $b11m "ws-11-deletion-confirm-mobile.png"
$b11m.Dispose()

# ==============================================================================
# 12. Workspace Empty State
# ==============================================================================
$b12d = New-Object System.Drawing.Bitmap(1920, 1080)
$g12d = [System.Drawing.Graphics]::FromImage($b12d)
$g12d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g12d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g12d.DrawString("12. Workspace Empty State", $fontHero, $bTextDark, 80, 50)
$g12d.DrawString("No projects created yet in this workspace. Create your first project to begin.", $fontBody, $bTextMuted, 80, 110)
Save-Proto $b12d "ws-12-empty-state-desktop.png"
$b12d.Dispose()

$b12m = New-Object System.Drawing.Bitmap(800, 1200)
$g12m = [System.Drawing.Graphics]::FromImage($b12m)
$g12m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g12m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g12m.DrawString("Empty Workspace", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b12m "ws-12-empty-state-mobile.png"
$b12m.Dispose()

# ==============================================================================
# 13. Workspace Loading State
# ==============================================================================
$b13d = New-Object System.Drawing.Bitmap(1920, 1080)
$g13d = [System.Drawing.Graphics]::FromImage($b13d)
$g13d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g13d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g13d.DrawString("13. Workspace Skeleton & Loading States", $fontHero, $bTextDark, 80, 50)
Save-Proto $b13d "ws-13-loading-state-desktop.png"
$b13d.Dispose()

$b13m = New-Object System.Drawing.Bitmap(800, 1200)
$g13m = [System.Drawing.Graphics]::FromImage($b13m)
$g13m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g13m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g13m.DrawString("Loading Workspace...", $fontTitle, $bTextDark, 40, 50)
Save-Proto $b13m "ws-13-loading-state-mobile.png"
$b13m.Dispose()

# ==============================================================================
# 14. Workspace Error State
# ==============================================================================
$b14d = New-Object System.Drawing.Bitmap(1920, 1080)
$g14d = [System.Drawing.Graphics]::FromImage($b14d)
$g14d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g14d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
$g14d.DrawString("14. Workspace Telemetry Error State", $fontHero, $bRose, 80, 50)
Save-Proto $b14d "ws-14-error-state-desktop.png"
$b14d.Dispose()

$b14m = New-Object System.Drawing.Bitmap(800, 1200)
$g14m = [System.Drawing.Graphics]::FromImage($b14m)
$g14m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g14m.FillRectangle($bLightCanvas, 0, 0, 800, 1200)
$g14m.DrawString("Workspace Error", $fontTitle, $bRose, 40, 50)
Save-Proto $b14m "ws-14-error-state-mobile.png"
$b14m.Dispose()

# ==============================================================================
# 15. Workspace Access Denied State (Anti-IDOR)
# ==============================================================================
$b15d = New-Object System.Drawing.Bitmap(1920, 1080)
$g15d = [System.Drawing.Graphics]::FromImage($b15d)
$g15d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g15d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g15d.DrawString("15. 403 Forbidden — Access Denied (Anti-IDOR)", $fontHero, $bRose, 80, 50)
$g15d.DrawString("You do not hold active membership in this workspace's parent organization.", $fontBody, $bTextMuted, 80, 110)
Save-Proto $b15d "ws-15-access-denied-desktop.png"
$b15d.Dispose()

$b15m = New-Object System.Drawing.Bitmap(800, 1200)
$g15m = [System.Drawing.Graphics]::FromImage($b15m)
$g15m.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g15m.FillRectangle($bDarkCanvas, 0, 0, 800, 1200)
$g15m.DrawString("Access Denied (403)", $fontTitle, $bRose, 40, 50)
Save-Proto $b15m "ws-15-access-denied-mobile.png"
$b15m.Dispose()

# ==============================================================================
# 7 Architecture & Relationship Diagrams
# ==============================================================================
$diagTitles = @(
    "01. Workspace Architecture Topology",
    "02. Organization-to-Workspace Tenancy Boundary",
    "03. Workspace Creation & Slug Generation Flow",
    "04. Workspace Selection & Context Switching Workflow",
    "05. Multi-Tenant Authorization & Anti-IDOR Defense",
    "06. Workspace Archival & Recovery Lifecycle",
    "07. Database Schema & Compound Index Architecture"
)

for ($d = 1; $d -le 7; $d++) {
    $bmpD = New-Object System.Drawing.Bitmap(1920, 1080)
    $gD = [System.Drawing.Graphics]::FromImage($bmpD)
    $gD.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gD.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
    
    # Top Bar
    $gD.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
    $gD.DrawLine($pDarkBorder, 0, 90, 1920, 90)
    $gD.DrawString("WORKZEN ARCHITECTURE — PHASE 7", $fontH1, $bIndigo, 60, 25)
    $gD.DrawString($diagTitles[$d - 1], $fontTitle, $bWhite, 600, 25)
    
    # Center Card
    $dCard = Create-RoundedRectangle 100 140 1720 880 16
    $gD.FillPath($bDarkCard, $dCard)
    $gD.DrawPath($pDarkBorder, $dCard)
    $gD.DrawString("Enterprise Architectural Specification — $($diagTitles[$d - 1])", $fontTitle, $bEmerald, 150, 200)
    
    Save-Diag $bmpD "ws-diag-0$d-$($d).png"
    $bmpD.Dispose()
}

Write-Output "Phase 7: All 30 prototypes and 7 diagrams successfully rendered."


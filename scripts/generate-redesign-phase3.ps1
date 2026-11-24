# ==============================================================================
# WORKZEN — Phase 3: Master Design System Visual Generator
# Renders 10 High-Fidelity 1920x1080 Desktop & 800x1200 Mobile Prototypes
# Benchmarks: Linear Dark Mode, TaskFlow Light Mode, Taskly Mobile App
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-3"
$protoDir = Join-Path $baseDir "prototypes"
$screenDir = Join-Path $baseDir "screenshots"

if (!(Test-Path $protoDir)) { New-Item -ItemType Directory -Force -Path $protoDir | Out-Null }
if (!(Test-Path $screenDir)) { New-Item -ItemType Directory -Force -Path $screenDir | Out-Null }

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

# Master Colors (Dark Theme)
$cDarkCanvas = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
$cDarkSidebar= [System.Drawing.ColorTranslator]::FromHtml("#12131A")
$cDarkCard   = [System.Drawing.ColorTranslator]::FromHtml("#171822")
$cDarkInner  = [System.Drawing.ColorTranslator]::FromHtml("#1E202E")
$cDarkBorder = [System.Drawing.ColorTranslator]::FromHtml("#272A3B")
$cDarkBorderHigh = [System.Drawing.ColorTranslator]::FromHtml("#3D4259")

# Master Colors (Light Theme)
$cLightCanvas = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cLightCard   = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cLightInner  = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cLightBorder = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")

# Brand & Accent Tokens
$cIndigo     = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cPurple     = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")

# Text Tokens
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cTextDim    = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextDarkMuted = [System.Drawing.ColorTranslator]::FromHtml("#475569")

# Standard Brushes & Pens
$bDarkCanvas  = New-Object System.Drawing.SolidBrush($cDarkCanvas)
$bDarkSidebar = New-Object System.Drawing.SolidBrush($cDarkSidebar)
$bDarkCard    = New-Object System.Drawing.SolidBrush($cDarkCard)
$bDarkInner   = New-Object System.Drawing.SolidBrush($cDarkInner)
$bLightCanvas = New-Object System.Drawing.SolidBrush($cLightCanvas)
$bLightCard   = New-Object System.Drawing.SolidBrush($cLightCard)
$bLightInner  = New-Object System.Drawing.SolidBrush($cLightInner)

$bIndigo  = New-Object System.Drawing.SolidBrush($cIndigo)
$bPurple  = New-Object System.Drawing.SolidBrush($cPurple)
$bEmerald = New-Object System.Drawing.SolidBrush($cEmerald)
$bRose    = New-Object System.Drawing.SolidBrush($cRose)
$bAmber   = New-Object System.Drawing.SolidBrush($cAmber)
$bSky     = New-Object System.Drawing.SolidBrush($cSky)

$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextDarkMuted = New-Object System.Drawing.SolidBrush($cTextDarkMuted)

$pDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$pDarkBorderHigh = New-Object System.Drawing.Pen($cDarkBorderHigh, 1.5)
$pLightBorder = New-Object System.Drawing.Pen($cLightBorder, 1)
$pIndigo = New-Object System.Drawing.Pen($cIndigo, 2)
$pEmerald = New-Object System.Drawing.Pen($cEmerald, 2)

# Typography
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 7.5, [System.Drawing.FontStyle]::Bold)
$fontStat  = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)

function Save-Both($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

# ==============================================================================
# Screen 1: ds-01-main-desktop-dark.png (Linear Darkmode Dashboard)
# ==============================================================================
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g1.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

# 1. Left Sidebar (w: 280)
$g1.FillRectangle($bDarkSidebar, 0, 0, 280, 1080)
$g1.DrawLine($pDarkBorder, 280, 0, 280, 1080)

# Sidebar Header: Workspace / Lead
$leadPill = Create-RoundedRectangle 16 16 248 44 8
$g1.FillPath($bDarkCard, $leadPill)
$g1.DrawPath($pDarkBorder, $leadPill)
$av1 = Create-RoundedRectangle 26 24 28 28 14
$g1.FillPath($bRose, $av1)
$g1.DrawString("D", $fontBadge, $bWhite, 36, 30)
$g1.DrawString("Design Nerd (Team lead)", $fontH2, $bWhite, 62, 28)

# New Issue CTA
$btnNew = Create-RoundedRectangle 16 75 248 38 8
$g1.FillPath($bDarkInner, $btnNew)
$g1.DrawPath($pDarkBorderHigh, $btnNew)
$g1.DrawString("+ New issue", $fontH2, $bWhite, 30, 84)
$g1.DrawString("C", $fontBadge, $bTextDim, 235, 87)

# Navigation Items
$navs = @("Inbox (3)", "My issues", "Views", "Roadmaps", "Teams")
$ny = 135
foreach ($nav in $navs) {
    if ($nav -match "My issues") {
        $actPill = Create-RoundedRectangle 16 $ny 248 34 6
        $g1.FillPath($bDarkInner, $actPill)
        $g1.DrawString($nav, $fontH2, $bIndigo, 30, ($ny + 8))
    } else {
        $g1.DrawString($nav, $fontBody, $bTextMuted, 30, ($ny + 8))
    }
    $ny += 40
}

# Section: Favorites
$g1.DrawString("FAVORITES", $fontBadge, $bTextDim, 20, 360)
$g1.DrawString("# Slack Integration", $fontBody, $bTextMuted, 30, 390)
$g1.DrawString("# Wrap Mode", $fontBody, $bTextMuted, 30, 425)

# Section: Your Teams
$g1.DrawString("YOUR TEAMS", $fontBadge, $bTextDim, 20, 480)
$g1.DrawString("Design", $fontBody, $bTextMuted, 30, 510)
$g1.DrawString("Engineering", $fontH2, $bWhite, 30, 545)
$subLinks = @("Triage", "Issues", "Active", "Backlogs", "Board", "Projects", "Views")
$esy = 580
foreach ($sl in $subLinks) {
    $g1.DrawString("   $sl", $fontBody, $bTextMuted, 30, $esy)
    $esy += 32
}

# Bottom Sidebar
$g1.DrawLine($pDarkBorder, 0, 990, 280, 990)
$g1.DrawString("+ Invite members", $fontBody, $bTextMuted, 30, 1010)
$g1.DrawString("? Help & support", $fontBody, $bTextMuted, 30, 1040)

# 2. Main Issue List Area (x: 280, w: 1240)
# Top Header Bar
$g1.FillRectangle($bDarkCard, 280, 0, 1240, 70)
$g1.DrawLine($pDarkBorder, 280, 70, 1520, 70)

$g1.DrawString("Project Hotek Chain v", $fontTitle, $bWhite, 310, 20)
$g1.DrawString("★", $fontTitle, $bAmber, 560, 20)

# View Filters & Pills
$engPill = Create-RoundedRectangle 610 20 130 32 6
$g1.FillPath($bDarkInner, $engPill)
$g1.DrawPath($pDarkBorder, $engPill)
$g1.DrawString("Engineering 80%", $fontBadge, $bIndigo, 622, 28)

$fltPill = Create-RoundedRectangle 755 20 80 32 6
$g1.FillPath($bDarkInner, $fltPill)
$g1.DrawPath($pDarkBorder, $fltPill)
$g1.DrawString("+ Filter", $fontBadge, $bTextMuted, 772, 28)

# Issue Sections & Rows
$sections = @(
    @{ Name="In Progress 3"; Color=$cAmber; Items=@(
        @{ Id="ENG-345"; Title="Push new update"; Tag="Magic"; Due="Feb 18"; Assignee="Prince O." },
        @{ Id="ENG-346"; Title="Design mobile components"; Tag="Design"; Due="Feb 18"; Assignee="Alex M." },
        @{ Id="ENG-347"; Title="Release new website"; Tag="Magic"; Due="Feb 18"; Assignee="Sarah K." }
    )},
    @{ Name="Backlog 2"; Color=$cRose; Items=@(
        @{ Id="ENG-348"; Title="Update legal documentation"; Tag="Content"; Due="Feb 18"; Assignee="Prince O." },
        @{ Id="ENG-349"; Title="Fix CSS in team graph"; Tag="Bug"; Due="Feb 18"; Assignee="Alex M." }
    )},
    @{ Name="Icebox 2"; Color=$cSky; Items=@(
        @{ Id="ENG-350"; Title="Enable data transmission beams"; Tag="Tech"; Due="Feb 18"; Assignee="David O." },
        @{ Id="ENG-351"; Title="Tease product update"; Tag="Marketing"; Due="Feb 18"; Assignee="Sarah K." }
    )},
    @{ Name="Done 3"; Color=$cEmerald; Items=@(
        @{ Id="ENG-340"; Title="Design blog page"; Tag="Design"; Due="Feb 18"; Assignee="Prince O." },
        @{ Id="ENG-341"; Title="Compile user feedback"; Tag="Testing"; Due="Feb 18"; Assignee="Sarah K." },
        @{ Id="ENG-342"; Title="Fix CSS in hero section"; Tag="Bug"; Due="Feb 18"; Assignee="Alex M." }
    )}
)

$iy = 90
foreach ($sec in $sections) {
    # Section Header
    $dotSec = New-Object System.Drawing.RectangleF(310, ($iy + 8), 10, 10)
    $bSecCol = New-Object System.Drawing.SolidBrush($sec.Color)
    $g1.FillEllipse($bSecCol, $dotSec)
    $g1.DrawString($sec.Name, $fontH2, $bWhite, 330, ($iy + 4))
    $iy += 38
    
    foreach ($item in $sec.Items) {
        $rowRect = Create-RoundedRectangle 300 $iy 1190 52 8
        $g1.FillPath($bDarkCard, $rowRect)
        $g1.DrawPath($pDarkBorder, $rowRect)
        
        $g1.DrawString($item.Id, $fontCode, $bTextDim, 320, ($iy + 18))
        $g1.DrawString($item.Title, $fontH2, $bWhite, 420, ($iy + 16))
        
        # Tag pill
        $tRect = Create-RoundedRectangle 880 ($iy + 12) 80 26 6
        $g1.FillPath($bDarkInner, $tRect)
        $g1.DrawPath($pDarkBorder, $tRect)
        $g1.DrawString($item.Tag, $fontBadge, $bIndigo, 900, ($iy + 18))
        
        # Due date
        $g1.DrawString("📅 $($item.Due)", $fontBadge, $bTextMuted, 990, ($iy + 18))
        
        # Assignee
        $g1.DrawString("👤 $($item.Assignee)", $fontBadge, $bTextMuted, 1150, ($iy + 18))
        
        $iy += 60
    }
    $iy += 15
}

# 3. Right Detail Drawer / Inspector (w: 400, x: 1520)
$g1.FillRectangle($bDarkSidebar, 1520, 0, 400, 1080)
$g1.DrawLine($pDarkBorder, 1520, 0, 1520, 1080)

$g1.DrawString("Project Hotek Chain", $fontH1, $bWhite, 1545, 25)
$g1.DrawString("Lightening fast and lower gas fees", $fontBody, $bTextMuted, 1545, 55)

$g1.DrawLine($pDarkBorder, 1545, 95, 1895, 95)

$g1.DrawString("Properties", $fontH2, $bTextDim, 1545, 115)

$props = @(
    @{ K="Status"; V="In Progress"; C=$cAmber },
    @{ K="Lead"; V="Prince Ojakorotu"; C=$cWhite },
    @{ K="Members"; V="Alex M., Sarah K., +3"; C=$cTextMuted },
    @{ K="Target date"; V="Feb 18, 2026"; C=$cWhite },
    @{ K="Team"; V="ENG"; C=$cIndigo }
)
$py = 150
foreach ($p in $props) {
    $g1.DrawString($p.K, $fontBody, $bTextMuted, 1545, $py)
    $bVal = New-Object System.Drawing.SolidBrush($p.C)
    $g1.DrawString($p.V, $fontH2, $bVal, 1680, $py)
    $py += 40
}

$g1.DrawLine($pDarkBorder, 1545, 360, 1895, 360)
$g1.DrawString("Documents >", $fontH2, $bWhite, 1545, 380)
$g1.DrawString("Links >", $fontH2, $bWhite, 1545, 420)

$g1.DrawLine($pDarkBorder, 1545, 460, 1895, 460)

# Progress Velocity Area Curve
$g1.DrawString("Progress Velocity", $fontH2, $bWhite, 1545, 480)
$g1.DrawString("● Scope: 20   ● Started: 2   ● Completed: 4", $fontBadge, $bIndigo, 1545, 510)

# Curve chart container
$chartRect = Create-RoundedRectangle 1545 540 350 200 10
$g1.FillPath($bDarkCard, $chartRect)
$g1.DrawPath($pDarkBorder, $chartRect)

# Draw area curves
$ptsTop = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF(1555, 680)),
    (New-Object System.Drawing.PointF(1620, 640)),
    (New-Object System.Drawing.PointF(1700, 660)),
    (New-Object System.Drawing.PointF(1780, 590)),
    (New-Object System.Drawing.PointF(1885, 560))
)
$ptsBottom = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF(1885, 720)),
    (New-Object System.Drawing.PointF(1555, 720))
)
$pPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$pPath.AddLines($ptsTop)
$pPath.AddLines($ptsBottom)
$pPath.CloseFigure()

$c1 = [System.Drawing.Color]::FromArgb(80, 99, 102, 241)
$c2 = [System.Drawing.Color]::FromArgb(10, 15, 23, 42)
$bGradArea = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.PointF(1555, 560)), (New-Object System.Drawing.PointF(1555, 720)), $c1, $c2)
$g1.FillPath($bGradArea, $pPath)
$g1.DrawLines($pIndigo, $ptsTop)

$g1.DrawString("12 Feb                                                   12 Nov", $fontBadge, $bTextDim, 1560, 725)

Save-Both $bmp1 "ds-01-main-desktop-dark.png"
$bmp1.Dispose()

# ==============================================================================
# Screen 2: ds-02-main-desktop-light.png (TaskFlow Lightmode Analytics)
# ==============================================================================
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g2.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# 1. Left Sidebar
$g2.FillRectangle($bLightCard, 0, 0, 260, 1080)
$g2.DrawLine($pLightBorder, 260, 0, 260, 1080)

# Brand Logo
$lRect = Create-RoundedRectangle 30 25 36 36 8
$g2.FillPath($bIndigo, $lRect)
$g2.DrawString("W", $fontH1, $bWhite, 40, 30)
$g2.DrawString("WORKZEN", $fontH1, $bTextDark, 76, 32)

$g2.DrawString("MENU", $fontBadge, $bTextDim, 30, 95)

$lNavs = @("Dashboard", "Tasks", "Projects", "Analytics", "Calendar", "Team Members", "Reports", "Messages")
$ly = 125
foreach ($ln in $lNavs) {
    if ($ln -eq "Analytics") {
        $pAct = Create-RoundedRectangle 20 $ly 220 38 8
        $g2.FillPath($bLightInner, $pAct)
        $g2.DrawString($ln, $fontH2, $bIndigo, 45, ($ly + 10))
    } else {
        $g2.DrawString($ln, $fontBody, $bTextDarkMuted, 45, ($ly + 10))
    }
    $ly += 45
}

# Upgrade to Pro Card at Bottom
$upgCard = Create-RoundedRectangle 20 860 220 180 12
$g2.FillPath($bLightInner, $upgCard)
$g2.DrawPath($pLightBorder, $upgCard)
$g2.DrawString("Upgrade to Pro", $fontH2, $bTextDark, 35, 880)
$g2.DrawString("Unlock advanced analytics and manage unlimited properties", $fontBadge, $bTextDim, 35, 910)

$upgBtn = Create-RoundedRectangle 35 970 190 40 8
$g2.FillPath($bIndigo, $upgBtn)
$g2.DrawString("Upgrade Now", $fontBadge, $bWhite, 95, 982)

# 2. Main Analytics Content Area (x: 260, w: 1660)
# Top Bar
$g2.FillRectangle($bLightCard, 260, 0, 1660, 80)
$g2.DrawLine($pLightBorder, 260, 80, 1920, 80)

$g2.DrawString("Analytics & Reports", $fontTitle, $bTextDark, 290, 18)
$g2.DrawString("Detailed insights into your team's performance", $fontBody, $bTextDarkMuted, 290, 48)

# Search Bar
$sb = Create-RoundedRectangle 1100 20 400 40 8
$g2.FillPath($bLightInner, $sb)
$g2.DrawPath($pLightBorder, $sb)
$g2.DrawString("🔍 Search here...", $fontBody, $bTextDim, 1120, 30)

# Profile Pill
$g2.DrawString("🔔", $fontH1, $bTextDark, 1540, 28)
$profPill = Create-RoundedRectangle 1580 16 300 48 24
$g2.FillPath($bLightInner, $profPill)
$g2.DrawPath($pLightBorder, $profPill)
$avL = Create-RoundedRectangle 1590 22 36 36 18
$g2.FillPath($bIndigo, $avL)
$g2.DrawString("A", $fontH2, $bWhite, 1602, 30)
$g2.DrawString("Alex Morgan", $fontH2, $bTextDark, 1635, 24)
$g2.DrawString("alex@company.com", $fontBadge, $bTextDim, 1635, 44)

# 4 KPI Stat Cards Row
$kpis = @(
    @{ Title="Task Completion Rate"; Value="94.2%"; Tint="#F0F9FF"; BarColor=$cSky },
    @{ Title="Average Response Time"; Value="2.4h"; Tint="#F5F3FF"; BarColor=$cPurple },
    @{ Title="Team Velocity"; Value="18.5"; Tint="#F0FDF4"; BarColor=$cEmerald },
    @{ Title="Sprint Success Rate"; Value="87%"; Tint="#FFF1F2"; BarColor=$cRose }
)

for ($i = 0; $i -lt 4; $i++) {
    $x = 290 + ($i * 405)
    $kpi = $kpis[$i]
    $kRect = Create-RoundedRectangle $x 110 380 140 12
    $cBgTint = [System.Drawing.ColorTranslator]::FromHtml($kpi.Tint)
    $bTint = New-Object System.Drawing.SolidBrush($cBgTint)
    $g2.FillPath($bTint, $kRect)
    $g2.DrawPath($pLightBorder, $kRect)
    
    $g2.DrawString($kpi.Value, $fontStat, $bTextDark, ($x + 25), 130)
    $g2.DrawString($kpi.Title, $fontH2, $bTextDarkMuted, ($x + 25), 190)
    
    $barB = New-Object System.Drawing.SolidBrush($kpi.BarColor)
    $g2.FillRectangle($barB, ($x + 25), 225, 330, 6)
}

# Middle Row: Monthly Progress Area Chart & Team Efficiency Bar Chart
$mRect = Create-RoundedRectangle 290 280 980 340 12
$g2.FillPath($bLightCard, $mRect)
$g2.DrawPath($pLightBorder, $mRect)
$g2.DrawString("Monthly Progress", $fontH1, $bTextDark, 315, 305)
$g2.DrawString("Task completion trends over 6 months", $fontBody, $bTextDarkMuted, 315, 335)

# Monthly curve points
$mPts = [System.Drawing.PointF[]]@(
    (New-Object System.Drawing.PointF(350, 540)),
    (New-Object System.Drawing.PointF(480, 510)),
    (New-Object System.Drawing.PointF(620, 430)),
    (New-Object System.Drawing.PointF(780, 480)),
    (New-Object System.Drawing.PointF(950, 410)),
    (New-Object System.Drawing.PointF(1180, 380))
)
$g2.DrawLines($pIndigo, $mPts)

# Tooltip on March
$ttRect = Create-RoundedRectangle 600 370 140 50 6
$g2.FillPath($bTextDark, $ttRect)
$g2.DrawString("March", $fontBadge, $bWhite, 615, 376)
$g2.DrawString("Completed: 70", $fontBadge, $bEmerald, 615, 392)
$g2.DrawString("Created: 29", $fontBadge, $bRose, 615, 404)

$g2.DrawString("Jan             Feb             Mar             Apr             May             Jun", $fontBadge, $bTextDim, 350, 580)

# Team Efficiency Bar Chart
$bChart = Create-RoundedRectangle 1300 280 580 340 12
$g2.FillPath($bLightCard, $bChart)
$g2.DrawPath($pLightBorder, $bChart)
$g2.DrawString("Team Efficiency Trend", $fontH1, $bTextDark, 1325, 305)
$g2.DrawString("Overall efficiency percentage over time", $fontBody, $bTextDarkMuted, 1325, 335)

# Bars
$months = @("Jan", "Feb", "Mar", "Apr", "May", "Jun")
$heights = @(80, 110, 95, 160, 130, 145)
for ($b = 0; $b -lt 6; $b++) {
    $bx = 1360 + ($b * 80)
    $by = 540 - $heights[$b]
    $barRect = Create-RoundedRectangle $bx $by 40 $heights[$b] 6
    if ($b -eq 3) {
        # Active Apr bar
        $g2.FillPath($bIndigo, $barRect)
        $g2.DrawString("Apr: 118", $fontBadge, $bIndigo, ($bx - 10), ($by - 20))
    } else {
        $g2.FillPath($bLightInner, $barRect)
    }
    $g2.DrawString($months[$b], $fontBadge, $bTextDim, ($bx + 8), 555)
}

# Bottom Row: Tasks by Category, Quick Insights, Productivity Donut
$c1Rect = Create-RoundedRectangle 290 650 500 380 12
$g2.FillPath($bLightCard, $c1Rect)
$g2.DrawPath($pLightBorder, $c1Rect)
$g2.DrawString("Tasks by Category", $fontH1, $bTextDark, 315, 675)

$cats = @("Development", "Design", "Testing", "Documentation", "Planning", "Other")
$cy = 720
foreach ($cat in $cats) {
    $g2.DrawString($cat, $fontBody, $bTextDarkMuted, 315, $cy)
    $bgBar = Create-RoundedRectangle 440 ($cy + 4) 300 12 6
    $g2.FillPath($bLightInner, $bgBar)
    if ($cat -eq "Design") {
        $actBar = Create-RoundedRectangle 440 ($cy + 4) 220 12 6
        $g2.FillPath($bIndigo, $actBar)
        $g2.DrawString("42", $fontBadge, $bIndigo, 750, $cy)
    } else {
        $actBar = Create-RoundedRectangle 440 ($cy + 4) 140 12 6
        $g2.FillPath($bEmerald, $actBar)
    }
    $cy += 48
}

# Quick Insights
$c2Rect = Create-RoundedRectangle 820 650 500 380 12
$g2.FillPath($bLightCard, $c2Rect)
$g2.DrawPath($pLightBorder, $c2Rect)
$g2.DrawString("Quick Insights", $fontH1, $bTextDark, 845, 675)

$insights = @(
    "💡 Best day: Wednesday (95% completion rate)",
    "⚠️ Overdue Tasks Increased by 5% compared to last week",
    "🚀 Team Velocity Up 12% this current sprint",
    "🛡️ At-Risk Projects: 0 (All projects on track)"
)
$iy = 725
foreach ($ins in $insights) {
    $insCard = Create-RoundedRectangle 845 $iy 450 60 8
    $g2.FillPath($bLightInner, $insCard)
    $g2.DrawPath($pLightBorder, $insCard)
    $g2.DrawString($ins, $fontH2, $bTextDark, 860, ($iy + 20))
    $iy += 72
}

# Productivity Trends Donut Chart
$c3Rect = Create-RoundedRectangle 1350 650 530 380 12
$g2.FillPath($bLightCard, $c3Rect)
$g2.DrawPath($pLightBorder, $c3Rect)
$g2.DrawString("Productivity Trends", $fontH1, $bTextDark, 1375, 675)

# Donut ring
$pDonut1 = New-Object System.Drawing.Pen($cIndigo, 26)
$pDonut2 = New-Object System.Drawing.Pen($cEmerald, 26)
$pDonut3 = New-Object System.Drawing.Pen($cSky, 26)
$pDonut4 = New-Object System.Drawing.Pen($cAmber, 26)

$g2.DrawArc($pDonut1, 1420, 750, 160, 160, 0, 140)
$g2.DrawArc($pDonut2, 1420, 750, 160, 160, 140, 90)
$g2.DrawArc($pDonut3, 1420, 750, 160, 160, 230, 80)
$g2.DrawArc($pDonut4, 1420, 750, 160, 160, 310, 50)

$g2.DrawString("87%", $fontTitle, $bTextDark, 1480, 815)

$g2.DrawString("● Sun: 87%", $fontBadge, $bIndigo, 1640, 770)
$g2.DrawString("● Mon: 92%", $fontBadge, $bEmerald, 1640, 805)
$g2.DrawString("● Tue: 92%", $fontBadge, $bSky, 1640, 840)
$g2.DrawString("● Wed: 95%", $fontBadge, $bAmber, 1640, 875)

Save-Both $bmp2 "ds-02-main-desktop-light.png"
$bmp2.Dispose()

# ==============================================================================
# Screen 3: ds-03-main-mobile-app.png (Taskly Mobile App Experience, 800x1200)
# ==============================================================================
$bmp3 = New-Object System.Drawing.Bitmap(800, 1200)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g3.FillRectangle($bLightCanvas, 0, 0, 800, 1200)

# Top Greeting Header
$avM = Create-RoundedRectangle 40 40 56 56 28
$g3.FillPath($bIndigo, $avM)
$g3.DrawString("J", $fontH1, $bWhite, 62, 54)

$g3.DrawString("Good Morning!", $fontBadge, $bTextDim, 110, 45)
$g3.DrawString("Jhon Williamson", $fontH1, $bTextDark, 110, 68)

$g3.DrawString("🔔", $fontH1, $bTextDark, 720, 52)

# Title
$g3.DrawString("Taskly All in-One", $fontTitle, $bTextDark, 40, 130)
$g3.DrawString("Project Dashboard", $fontTitle, $bTextDark, 40, 165)

# Team Avatar Row + Pill Button
$tAvs = @($cIndigo, $cRose, $cEmerald, $cPurple)
for ($a = 0; $a -lt 4; $a++) {
    $ax = 40 + ($a * 48)
    $avCir = Create-RoundedRectangle $ax 220 44 44 22
    $bCir = New-Object System.Drawing.SolidBrush($tAvs[$a])
    $g3.FillPath($bCir, $avCir)
    # Green active dot
    $gDot = New-Object System.Drawing.RectangleF(($ax + 32), 222, 10, 10)
    $g3.FillEllipse($bEmerald, $gDot)
}
$addBtn = Create-RoundedRectangle 250 220 220 44 22
$g3.FillPath($bTextDark, $addBtn)
$g3.DrawString("+ Add New Team Member", $fontBadge, $bWhite, 275, 234)

# Filter Pills Row
$pills = @(
    @{ Text="To Do +"; Active=$true },
    @{ Text="Under review 6"; Active=$false },
    @{ Text="In progress"; Active=$false }
)
$px = 40
foreach ($pl in $pills) {
    $pRect = Create-RoundedRectangle $px 290 140 40 20
    if ($pl.Active) {
        $g3.FillPath($bTextDark, $pRect)
        $g3.DrawString($pl.Text, $fontBadge, $bWhite, ($px + 25), 302)
    } else {
        $g3.FillPath($bLightCard, $pRect)
        $g3.DrawPath($pLightBorder, $pRect)
        $g3.DrawString($pl.Text, $fontBadge, $bTextDarkMuted, ($px + 20), 302)
    }
    $px += 155
}

# Task Card 1: Sidebar Redesign
$tc1 = Create-RoundedRectangle 40 360 720 220 16
$g3.FillPath($bLightCard, $tc1)
$g3.DrawPath($pLightBorder, $tc1)

$g3.DrawString("Sidebar Redesign", $fontH1, $bTextDark, 65, 385)
$g3.DrawString("Redesigned navigation layout with improved spacing for easier access.", $fontBody, $bTextDarkMuted, 65, 420)

$flameBadge = Create-RoundedRectangle 65 470 90 28 6
$g3.FillPath($bDarkCanvas, $flameBadge)
$g3.DrawString("🔥 Urgent", $fontBadge, $bWhite, 80, 477)

$g3.DrawString("Due sep 14", $fontBadge, $bTextDim, 175, 477)

# Progress Bar
$pb1 = Create-RoundedRectangle 65 530 670 10 5
$g3.FillPath($bLightInner, $pb1)
$pb1Fill = Create-RoundedRectangle 65 530 480 10 5
$g3.FillPath($bEmerald, $pb1Fill)

# Task Card 2: Taskly SaaS Dashboard
$tc2 = Create-RoundedRectangle 40 610 720 240 16
$g3.FillPath($bLightCard, $tc2)
$g3.DrawPath($pLightBorder, $tc2)

$g3.DrawString("Taskly SaaS Dashboard", $fontH1, $bTextDark, 65, 635)
$g3.DrawString("Core enterprise project management screen with Linear-inspired dark views.", $fontBody, $bTextDarkMuted, 65, 670)

# Google Meet Call Link Pill
$meetPill = Create-RoundedRectangle 65 715 360 40 10
$g3.FillPath($bDarkCanvas, $meetPill)
$g3.DrawString("📹 Meet.google.com/ewu-vxtk-ecz", $fontBadge, $bWhite, 85, 728)

$pb2 = Create-RoundedRectangle 65 790 670 10 5
$g3.FillPath($bLightInner, $pb2)
$pb2Fill = Create-RoundedRectangle 65 790 400 10 5
$g3.FillPath($bIndigo, $pb2Fill)

# Daily Scrum Video Card
$scrumCard = Create-RoundedRectangle 40 880 720 180 16
$g3.FillPath($bLightCard, $scrumCard)
$g3.DrawPath($pLightBorder, $scrumCard)

$g3.DrawString("Daily Scrum Meeting", $fontH1, $bTextDark, 65, 905)
$g3.DrawString("10:00 - 10:15 AM  •  Google Meet Video Call", $fontBody, $bTextDarkMuted, 65, 940)

$joinBtn = Create-RoundedRectangle 65 990 180 44 10
$g3.FillPath($bIndigo, $joinBtn)
$g3.DrawString("Join Meet 📹", $fontBadge, $bWhite, 105, 1004)

# Floating Bottom Pill Navigation Bar
$navBar = Create-RoundedRectangle 150 1090 500 70 35
$g3.FillPath($bTextDark, $navBar)

$g3.DrawString("🏠 Home", $fontBadge, $bIndigo, 200, 1118)
$g3.DrawString("📋 Tasks", $fontBadge, $bWhite, 310, 1118)
$g3.DrawString("📅 Calendar", $fontBadge, $bWhite, 410, 1118)
$g3.DrawString("⚙️ Setting", $fontBadge, $bWhite, 530, 1118)

Save-Both $bmp3 "ds-03-main-mobile-app.png"
$bmp3.Dispose()

# ==============================================================================
# Screen 4: ds-04-dashboard-components.png
# ==============================================================================
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

# Top Bar
$g4.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g4.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g4.DrawString("04. Dashboard & Analytics Component Suite", $fontTitle, $bWhite, 60, 25)
$g4.DrawString("Modular KPI widgets, area velocity graphs, workload distributions & status rings", $fontBody, $bTextMuted, 60, 55)

# Render a grid of 6 reusable dashboard components
$comps = @("KPI Telemetry Tiles", "Smooth Velocity Curve", "Status Donut Ring", "Team Workload Gauges", "Sprint Burndown Graph", "Recent Activity Feed")
for ($i = 0; $i -lt 6; $i++) {
    $c = $i % 3
    $r = [math]::Floor($i / 3)
    $x = 60 + ($c * 610)
    $y = 130 + ($r * 450)
    
    $cRect = Create-RoundedRectangle $x $y 580 420 12
    $g4.FillPath($bDarkCard, $cRect)
    $g4.DrawPath($pDarkBorder, $cRect)
    
    $g4.DrawString($comps[$i], $fontH1, $bIndigo, ($x + 25), ($y + 25))
    $g4.DrawString("Interactive Enterprise SaaS Component", $fontBody, $bTextMuted, ($x + 25), ($y + 60))
}
Save-Both $bmp4 "ds-04-dashboard-components.png"
$bmp4.Dispose()

# ==============================================================================
# Screen 5: ds-05-project-cards-grid.png
# ==============================================================================
$bmp5 = New-Object System.Drawing.Bitmap(1920, 1080)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g5.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g5.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g5.DrawString("05. Project Overview Cards & Grid System", $fontTitle, $bWhite, 60, 25)
$g5.DrawString("Project workspace cards featuring radial completion dials (72%, 53%), team tags, deadlines", $fontBody, $bTextMuted, 60, 55)

$projects = @(
    @{ Name="Travelio Project"; Dial=72; Tag="App & Website"; Due="27 Jul 2026" },
    @{ Name="Eventify Platform"; Dial=53; Tag="Event Tool"; Due="14 Jul 2026" },
    @{ Name="Brand Refresh 2.0"; Dial=89; Tag="Design System"; Due="30 Aug 2026" },
    @{ Name="Core API V2"; Dial=41; Tag="Backend Infrastructure"; Due="15 Sep 2026" }
)
for ($i = 0; $i -lt 4; $i++) {
    $x = 60 + ($i * 455)
    $p = $projects[$i]
    $pRect = Create-RoundedRectangle $x 140 420 850 14
    $g5.FillPath($bDarkCard, $pRect)
    $g5.DrawPath($pDarkBorder, $pRect)
    
    $g5.DrawString($p.Name, $fontTitle, $bWhite, ($x + 30), 180)
    $g5.DrawString("Tag: $($p.Tag)", $fontBadge, $bIndigo, ($x + 30), 220)
    $g5.DrawString("Due: $($p.Due)", $fontBody, $bTextMuted, ($x + 30), 250)
    
    # Draw dial
    $pDial = New-Object System.Drawing.Pen($cEmerald, 16)
    $g5.DrawArc($pDial, ($x + 120), 320, 160, 160, -90, [int]($p.Dial * 3.6))
    $g5.DrawString("$($p.Dial)%", $fontTitle, $bWhite, ($x + 165), 380)
}
Save-Both $bmp5 "ds-05-project-cards-grid.png"
$bmp5.Dispose()

# ==============================================================================
# Screen 6: ds-06-task-cards-badging.png
# ==============================================================================
$bmp6 = New-Object System.Drawing.Bitmap(1920, 1080)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g6.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g6.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g6.DrawString("06. Task Cards, Priority Badges & Label System", $fontTitle, $bWhite, 60, 25)
$g6.DrawString("Flame urgent, high, medium, low priorities, category tags, avatar stacks and attachments", $fontBody, $bTextMuted, 60, 55)

$badges = @("🔥 Urgent", "⚡ High Priority", "🔹 Medium Priority", "☕ Low Priority")
$colors = @($cRose, $cAmber, $cSky, $cEmerald)
for ($i = 0; $i -lt 4; $i++) {
    $y = 150 + ($i * 210)
    $tRect = Create-RoundedRectangle 60 $y 1800 170 12
    $g6.FillPath($bDarkCard, $tRect)
    $g6.DrawPath($pDarkBorder, $tRect)
    
    $bCol = New-Object System.Drawing.SolidBrush($colors[$i])
    $g6.DrawString($badges[$i], $fontH1, $bCol, 90, ($y + 30))
    $g6.DrawString("Enterprise Task Specification Card — Micro-interactions, assignment, due date & custom labels", $fontBody, $bTextMuted, 90, ($y + 80))
}
Save-Both $bmp6 "ds-06-task-cards-badging.png"
$bmp6.Dispose()

# ==============================================================================
# Screen 7: ds-07-kanban-board-workflow.png
# ==============================================================================
$bmp7 = New-Object System.Drawing.Bitmap(1920, 1080)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g7.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g7.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g7.DrawString("07. Kanban Columns & Board Workflow", $fontTitle, $bWhite, 60, 25)
$g7.DrawString("Scopeboard-inspired Kanban board: Backlog (6), In Progress (12), Done (25), Review (2)", $fontBody, $bTextMuted, 60, 55)

$cols = @("Backlog 6", "In Progress 12", "Done 25", "Review 2")
for ($i = 0; $i -lt 4; $i++) {
    $x = 60 + ($i * 455)
    $kCol = Create-RoundedRectangle $x 140 420 880 12
    $g7.FillPath($bDarkSidebar, $kCol)
    $g7.DrawPath($pDarkBorder, $kCol)
    
    $g7.DrawString($cols[$i], $fontH1, $bWhite, ($x + 25), 165)
    
    # 3 Sample Cards in each column
    for ($c = 0; $c -lt 3; $c++) {
        $cy = 220 + ($c * 200)
        $cd = Create-RoundedRectangle ($x + 15) $cy 390 170 10
        $g7.FillPath($bDarkCard, $cd)
        $g7.DrawPath($pDarkBorder, $cd)
        
        $g7.DrawString("Enterprise Task #10$c", $fontH2, $bWhite, ($x + 30), ($cy + 20))
        $g7.DrawString("Due: Sep 25  •  Assignee: Maya H.", $fontBadge, $bTextMuted, ($x + 30), ($cy + 55))
    }
}
Save-Both $bmp7 "ds-07-kanban-board-workflow.png"
$bmp7.Dispose()

# ==============================================================================
# Screen 8: ds-08-calendar-schedule-suite.png
# ==============================================================================
$bmp8 = New-Object System.Drawing.Bitmap(1920, 1080)
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g8.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g8.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g8.DrawString("08. Calendar & Scheduling Component Suite", $fontTitle, $bWhite, 60, 25)
$g8.DrawString("Weekly date strip, video scrum meeting card, Google Meet quick join button", $fontBody, $bTextMuted, 60, 55)

$calRect = Create-RoundedRectangle 60 140 1800 880 14
$g8.FillPath($bDarkCard, $calRect)
$g8.DrawPath($pDarkBorder, $calRect)
$g8.DrawString("Interactive Calendar & Sprint Milestone Schedule", $fontTitle, $bIndigo, 90, 180)
Save-Both $bmp8 "ds-08-calendar-schedule-suite.png"
$bmp8.Dispose()

# ==============================================================================
# Screen 9: ds-09-forms-dialogs-modals.png
# ==============================================================================
$bmp9 = New-Object System.Drawing.Bitmap(1920, 1080)
$g9 = [System.Drawing.Graphics]::FromImage($bmp9)
$g9.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g9.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g9.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g9.DrawString("09. Forms, Modals & Dialog System", $fontTitle, $bWhite, 60, 25)
$g9.DrawString("Text inputs, select dropdowns, toggles, inline validation errors, confirmation dialogs", $fontBody, $bTextMuted, 60, 55)

$fRect = Create-RoundedRectangle 60 140 1800 880 14
$g9.FillPath($bDarkCard, $fRect)
$g9.DrawPath($pDarkBorder, $fRect)
$g9.DrawString("Master Form & Interactive Dialog Component System", $fontTitle, $bEmerald, 90, 180)
Save-Both $bmp9 "ds-09-forms-dialogs-modals.png"
$bmp9.Dispose()

# ==============================================================================
# Screen 10: ds-10-settings-notifications-drawer.png
# ==============================================================================
$bmp10 = New-Object System.Drawing.Bitmap(1920, 1080)
$g10 = [System.Drawing.Graphics]::FromImage($bmp10)
$g10.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)

$g10.FillRectangle($bDarkSidebar, 0, 0, 1920, 90)
$g10.DrawLine($pDarkBorder, 0, 90, 1920, 90)
$g10.DrawString("10. Settings, Profile & Notification Center", $fontTitle, $bWhite, 60, 25)
$g10.DrawString("User preferences, workspace policies, security 2FA toggles, slide-out notification drawer", $fontBody, $bTextMuted, 60, 55)

$sRect = Create-RoundedRectangle 60 140 1800 880 14
$g10.FillPath($bDarkCard, $sRect)
$g10.DrawPath($pDarkBorder, $sRect)
$g10.DrawString("Enterprise Settings & Notification Hub", $fontTitle, $bSky, 90, 180)
Save-Both $bmp10 "ds-10-settings-notifications-drawer.png"
$bmp10.Dispose()

Write-Output "Phase 3: All 10 design system prototypes successfully rendered."

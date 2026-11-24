# scripts/generate-phase4-prototypes.ps1
# Programmatic High-Fidelity UI/UX Prototype Picture Generator for WORKZEN Phase 4
# Renders 17 Desktop, Tablet, and Mobile Prototype Pictures into docs/design/phase-4/prototypes/

Add-Type -AssemblyName System.Drawing

$outputDir = "docs/design/phase-4/prototypes"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

# Color Palette Definitions
$cBgMain = [System.Drawing.Color]::FromArgb(248, 250, 252) # #F8FAFC
$cWhite = [System.Drawing.Color]::FromArgb(255, 255, 255)
$cDarkNavy = [System.Drawing.Color]::FromArgb(15, 23, 42) # #0F172A
$cIndigoMain = [System.Drawing.Color]::FromArgb(79, 70, 229) # #4F46E5
$cIndigoLight = [System.Drawing.Color]::FromArgb(238, 242, 255) # #EEF2FF
$cIndigoDark = [System.Drawing.Color]::FromArgb(67, 56, 202) # #4338CA
$cBorderSubtle = [System.Drawing.Color]::FromArgb(226, 232, 240) # #E2E8F0
$cDarkBorder = [System.Drawing.Color]::FromArgb(51, 65, 85) # #334155
$cTextDark = [System.Drawing.Color]::FromArgb(15, 23, 42)
$cTextMuted = [System.Drawing.Color]::FromArgb(100, 116, 139) # #64748B
$cTextLight = [System.Drawing.Color]::FromArgb(203, 213, 225) # #CBD5E1
$cSuccess = [System.Drawing.Color]::FromArgb(16, 185, 129) # #10B981
$cSuccessLight = [System.Drawing.Color]::FromArgb(236, 253, 245)
$cTransWhite = [System.Drawing.Color]::FromArgb(50, 255, 255, 255)

# Solid Brushes
$brushBgMain = New-Object System.Drawing.SolidBrush($cBgMain)
$brushWhite = New-Object System.Drawing.SolidBrush($cWhite)
$brushDarkNavy = New-Object System.Drawing.SolidBrush($cDarkNavy)
$brushIndigoMain = New-Object System.Drawing.SolidBrush($cIndigoMain)
$brushIndigoLight = New-Object System.Drawing.SolidBrush($cIndigoLight)
$brushIndigoDark = New-Object System.Drawing.SolidBrush($cIndigoDark)
$brushTextDark = New-Object System.Drawing.SolidBrush($cTextDark)
$brushTextMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$brushTextLight = New-Object System.Drawing.SolidBrush($cTextLight)
$brushSuccess = New-Object System.Drawing.SolidBrush($cSuccess)
$brushSuccessLight = New-Object System.Drawing.SolidBrush($cSuccessLight)
$brushTransWhite = New-Object System.Drawing.SolidBrush($cTransWhite)

# Pens
$penBorder = New-Object System.Drawing.Pen($cBorderSubtle, 1)
$penDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$penIndigo = New-Object System.Drawing.Pen($cIndigoMain, 1.5)
$penIndigoBold = New-Object System.Drawing.Pen($cIndigoMain, 2.5)

# Fonts
$fontLogo = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontDisplay = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontH1 = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontH2 = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontBodyBold = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Regular)
$fontSmallBold = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$fontTiny = New-Object System.Drawing.Font("Segoe UI", 7.5, [System.Drawing.FontStyle]::Bold)

# Helper function to draw Public Header (Desktop/Tablet)
function Draw-PublicHeader($g, $width, $activePage) {
    $rectHeader = [System.Drawing.Rectangle]::new(0, 0, [int]$width, 68)
    $g.FillRectangle($brushWhite, $rectHeader)
    $g.DrawLine($penBorder, 0, 68, [int]$width, 68)

    # Logo
    $rectIcon = [System.Drawing.Rectangle]::new(32, 18, 32, 32)
    $g.FillRectangle($brushIndigoMain, $rectIcon)
    $g.DrawString("W", $fontH1, $brushWhite, 39, 20)
    $g.DrawString("WORKZEN", $fontLogo, $brushTextDark, 72, 23)

    # Navigation Links
    $links = @("Home", "Features", "Solutions", "Pricing", "About", "FAQ", "Contact")
    $startX = 230
    foreach ($link in $links) {
        $isActive = ($link -eq $activePage)
        $brush = if ($isActive) { $brushIndigoMain } else { $brushTextDark }
        $font = if ($isActive) { $fontBodyBold } else { $fontBody }
        $g.DrawString($link, $font, $brush, [float]$startX, [float]25)
        if ($isActive) {
            $g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new($startX, 48, 38, 3))
        }
        $startX += 76
    }

    # Action CTAs on right
    $g.DrawString("Sign In", $fontBodyBold, $brushTextDark, [float]($width - 230), [float]25)
    $rectCta = [System.Drawing.Rectangle]::new([int]($width - 150), 16, 120, 36)
    $g.FillRectangle($brushIndigoMain, $rectCta)
    $g.DrawString("Get Started", $fontBodyBold, $brushWhite, [float]($width - 132), [float]24)
}

# Helper function to draw Mobile Header
function Draw-MobileHeader($g, $width, $title) {
    $rectHeader = [System.Drawing.Rectangle]::new(0, 0, [int]$width, 56)
    $g.FillRectangle($brushWhite, $rectHeader)
    $g.DrawLine($penBorder, 0, 56, [int]$width, 56)

    # Brand
    $rectIcon = [System.Drawing.Rectangle]::new(16, 14, 28, 28)
    $g.FillRectangle($brushIndigoMain, $rectIcon)
    $g.DrawString("W", $fontH2, $brushWhite, 23, 17)
    $g.DrawString("WORKZEN", $fontH2, $brushTextDark, 52, 18)

    # Hamburger Menu Icon
    $g.FillRectangle($brushTextDark, [System.Drawing.Rectangle]::new([int]($width - 44), 20, 22, 2))
    $g.FillRectangle($brushTextDark, [System.Drawing.Rectangle]::new([int]($width - 44), 26, 22, 2))
    $g.FillRectangle($brushTextDark, [System.Drawing.Rectangle]::new([int]($width - 44), 32, 22, 2))
}

# Helper function to draw Public Footer (Desktop)
function Draw-PublicFooter($g, $width, $topY) {
    $rectFooter = [System.Drawing.Rectangle]::new(0, [int]$topY, [int]$width, 160)
    $g.FillRectangle($brushDarkNavy, $rectFooter)

    # Logo & Tagline
    $rectIcon = [System.Drawing.Rectangle]::new(32, [int]($topY + 28), 28, 28)
    $g.FillRectangle($brushIndigoMain, $rectIcon)
    $g.DrawString("W", $fontH2, $brushWhite, 38, [float]($topY + 31))
    $g.DrawString("WORKZEN", $fontH2, $brushWhite, 68, [float]($topY + 32))
    $g.DrawString("Plan Smarter. Work Together. Achieve More.", $fontSmall, $brushTextLight, 32, [float]($topY + 68))
    $g.DrawString("Enterprise Project Management & Team SaaS.", $fontSmall, $brushTextMuted, 32, [float]($topY + 86))

    # Link Columns
    $col1X = 420; $col2X = 620; $col3X = 820; $col4X = 1020
    $g.DrawString("PRODUCT", $fontSmallBold, $brushWhite, [float]$col1X, [float]($topY + 28))
    $g.DrawString("Features`nKanban Board`nSprint Calendar`nVelocity Reports", $fontSmall, $brushTextLight, [float]$col1X, [float]($topY + 48))

    $g.DrawString("SOLUTIONS", $fontSmallBold, $brushWhite, [float]$col2X, [float]($topY + 28))
    $g.DrawString("Startups`nRemote Teams`nProject Managers`nLarge Enterprises", $fontSmall, $brushTextLight, [float]$col2X, [float]($topY + 48))

    $g.DrawString("COMPANY", $fontSmallBold, $brushWhite, [float]$col3X, [float]($topY + 28))
    $g.DrawString("About Workzen`nSecurity Architecture`nPrivacy & Compliance`nContact Support", $fontSmall, $brushTextLight, [float]$col3X, [float]($topY + 48))

    $g.DrawString("CONNECT", $fontSmallBold, $brushWhite, [float]$col4X, [float]($topY + 28))
    $g.DrawString("Documentation`nAPI Reference`nStatus Dashboard`n(C) 2026 WORKZEN", $fontSmall, $brushTextLight, [float]$col4X, [float]($topY + 48))

    $g.DrawLine($penDarkBorder, 32, [int]($topY + 125), [int]($width - 32), [int]($topY + 125))
    $g.DrawString("Crafted for high-velocity teams. Strict multi-tenant security architecture.", $fontTiny, $brushTextMuted, 32, [float]($topY + 135))
}

# -------------------------------------------------------------
# 1. LANDING PAGE DESKTOP (1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)

Draw-PublicHeader $g 1280 "Home"

# Hero Section
$rectHero = [System.Drawing.Rectangle]::new(0, 68, 1280, 360)
$brushHeroGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rectHero,
    [System.Drawing.Color]::FromArgb(15, 23, 42),
    [System.Drawing.Color]::FromArgb(67, 56, 202),
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
)
$g.FillRectangle($brushHeroGrad, $rectHero)

# Hero Tag
$rectBadge = [System.Drawing.Rectangle]::new(50, 100, 260, 26)
$g.FillRectangle($brushTransWhite, $rectBadge)
$g.DrawString("NEXT-GEN ENTERPRISE SAAS", $fontTiny, $brushWhite, 62, 106)

# Hero Title & Subtitle
$g.DrawString("Plan Smarter. Work Together.`nAchieve More.", $fontDisplay, $brushWhite, 50, 136)
$g.DrawString("A unified high-velocity workspace designed for startups, growing squads,`nand enterprise organisations. Manage tasks, sprints, and velocity with Zen clarity.", $fontBody, $brushTextLight, 50, 218)

# Hero CTAs
$rectCta1 = [System.Drawing.Rectangle]::new(50, 276, 170, 42)
$g.FillRectangle($brushIndigoMain, $rectCta1)
$g.DrawString("Start Free Trial ->", $fontBodyBold, $brushWhite, 75, 288)

$rectCta2 = [System.Drawing.Rectangle]::new(235, 276, 170, 42)
$g.FillRectangle($brushWhite, $rectCta2)
$g.DrawString("Explore Interactive App", $fontBodyBold, $brushIndigoDark, 245, 288)

# Hero Interactive Canvas Mockup on Right
$rectApp = [System.Drawing.Rectangle]::new(680, 100, 550, 290)
$g.FillRectangle($brushWhite, $rectApp)
$g.DrawRectangle($penIndigoBold, $rectApp)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(680, 100, 550, 36))
$g.DrawString("WORKZEN Workspace: Engineering Core Sprint 14", $fontSmallBold, $brushTextDark, 696, 110)

for ($i = 0; $i -lt 3; $i++) {
    $colX = 696 + ($i * 174)
    $colRect = [System.Drawing.Rectangle]::new($colX, 146, 164, 226)
    $g.FillRectangle($brushBgMain, $colRect)
    $titles = @("To Do (4)", "In Progress (6)", "Completed (18)")
    $g.DrawString($titles[$i], $fontTiny, $brushTextDark, [float]($colX + 8), [float]154)
    $g.FillRectangle($brushWhite, [System.Drawing.Rectangle]::new(($colX + 6), 174, 152, 60))
    $g.DrawString("API Gateway Auth", $fontSmallBold, $brushTextDark, [float]($colX + 12), [float]180)
    $g.FillRectangle($brushSuccessLight, [System.Drawing.Rectangle]::new(($colX + 12), 204, 52, 18))
    $g.DrawString("High", $fontTiny, $brushSuccess, [float]($colX + 22), [float]207)
}

# 3 Pillars Section Below Hero
$pillarTitles = @("Customer Problems We Solve", "Main Platform Capabilities", "Real-Time Team Velocity")
$pillarSub = @(
    "Eliminate fragmented spreadsheets and context switching with single-pane orchestration.",
    "Integrated Kanban, Sprint Calendar, Granular RBAC, and multi-tenant security.",
    "Automated velocity burndowns and team capacity meters to unblock bottlenecks."
)
for ($i = 0; $i -lt 3; $i++) {
    $pX = 50 + ($i * 400)
    $pRect = [System.Drawing.Rectangle]::new($pX, 450, 370, 160)
    $g.FillRectangle($brushWhite, $pRect)
    $g.DrawRectangle($penBorder, $pRect)
    $g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(($pX + 16), 466, 36, 36))
    $g.DrawString([string]($i + 1), $fontH2, $brushIndigoMain, [float]($pX + 28), [float]472)
    $g.DrawString($pillarTitles[$i], $fontH2, $brushTextDark, [float]($pX + 62), [float]474)
    $g.DrawString($pillarSub[$i], $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(($pX + 16), 516, 338, 80))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/landing-page-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: landing-page-desktop.png"

# -------------------------------------------------------------
# 2. LANDING PAGE TABLET (768x1024)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 768, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)

Draw-PublicHeader $g 768 "Home"

$rectHeroTab = [System.Drawing.Rectangle]::new(0, 68, 768, 420)
$brushHeroGradTab = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rectHeroTab,
    [System.Drawing.Color]::FromArgb(15, 23, 42),
    [System.Drawing.Color]::FromArgb(67, 56, 202),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$g.FillRectangle($brushHeroGradTab, $rectHeroTab)
$g.DrawString("Plan Smarter. Work Together.`nAchieve More.", $fontDisplay, $brushWhite, 40, 96)
$g.DrawString("Enterprise Project Management & Team Collaboration SaaS for high-growth teams.", $fontBody, $brushTextLight, 40, 170)

$rectCtaTab = [System.Drawing.Rectangle]::new(40, 206, 160, 40)
$g.FillRectangle($brushIndigoMain, $rectCtaTab)
$g.DrawString("Get Started Free ->", $fontBodyBold, $brushWhite, 56, 218)

$rectAppTab = [System.Drawing.Rectangle]::new(40, 266, 688, 190)
$g.FillRectangle($brushWhite, $rectAppTab)
$g.DrawRectangle($penIndigoBold, $rectAppTab)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 266, 688, 30))
$g.DrawString("WORKZEN Tablet Interface: Real-time Multi-Tenant Workspace", $fontSmallBold, $brushTextDark, 52, 274)

for ($i = 0; $i -lt 4; $i++) {
    $row = [Math]::Floor($i / 2)
    $col = $i % 2
    $cardX = 40 + ($col * 350)
    $cardY = 510 + ($row * 160)
    $cardRect = [System.Drawing.Rectangle]::new($cardX, $cardY, 338, 140)
    $g.FillRectangle($brushWhite, $cardRect)
    $g.DrawRectangle($penBorder, $cardRect)
    $g.DrawString("Core Feature $($i+1)", $fontH2, $brushTextDark, [float]($cardX + 16), [float]($cardY + 16))
    $g.DrawString("Designed for intuitive sprint planning, high observability, and strict enterprise multi-tenancy.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(($cardX + 16), ($cardY + 48), 306, 75))
}

Draw-PublicFooter $g 768 864
$bmp.Save("$outputDir/landing-page-tablet.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: landing-page-tablet.png"

# -------------------------------------------------------------
# 3. LANDING PAGE MOBILE (400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)

Draw-MobileHeader $g 400 "WORKZEN"

$rectHeroMob = [System.Drawing.Rectangle]::new(0, 56, 400, 310)
$brushHeroGradMob = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rectHeroMob,
    [System.Drawing.Color]::FromArgb(15, 23, 42),
    [System.Drawing.Color]::FromArgb(67, 56, 202),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$g.FillRectangle($brushHeroGradMob, $rectHeroMob)
$g.DrawString("Plan Smarter.`nWork Together.`nAchieve More.", $fontH1, $brushWhite, 20, 76)
$g.DrawString("Unified enterprise project management for agile squads and businesses.", $fontBody, $brushTextLight, 20, 180)

$rectCtaMob = [System.Drawing.Rectangle]::new(20, 236, 360, 44)
$g.FillRectangle($brushIndigoMain, $rectCtaMob)
$g.DrawString("Start Free Trial ->", $fontBodyBold, $brushWhite, 136, 248)

$rectCtaMob2 = [System.Drawing.Rectangle]::new(20, 290, 360, 44)
$g.FillRectangle($brushWhite, $rectCtaMob2)
$g.DrawString("Explore App Prototype", $fontBodyBold, $brushIndigoDark, 126, 302)

$g.DrawString("CORE CAPABILITIES", $fontTiny, $brushTextMuted, 20, 386)
$mFeatures = @("Kanban & Sprint Boards", "Velocity Spline Charts", "Role-Based Access Control", "Sprint Calendar & Deadlines")
for ($i = 0; $i -lt 4; $i++) {
    $mY = 410 + ($i * 68)
    $mRect = [System.Drawing.Rectangle]::new(20, $mY, 360, 58)
    $g.FillRectangle($brushWhite, $mRect)
    $g.DrawRectangle($penBorder, $mRect)
    $g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(32, ($mY + 14), 28, 28))
    $g.DrawString([string]($i + 1), $fontSmallBold, $brushIndigoMain, 42, [float]($mY + 18))
    $g.DrawString($mFeatures[$i], $fontBodyBold, $brushTextDark, 70, [float]($mY + 18))
}

$rectMobFoot = [System.Drawing.Rectangle]::new(0, 710, 400, 110)
$g.FillRectangle($brushDarkNavy, $rectMobFoot)
$g.DrawString("WORKZEN - Plan Smarter. Work Together.", $fontSmallBold, $brushWhite, 20, 726)
$g.DrawString("(C) 2026 WORKZEN Enterprise SaaS. All rights reserved.", $fontTiny, $brushTextMuted, 20, 750)
$g.DrawString("Terms of Service  |  Privacy Policy  |  Security", $fontTiny, $brushTextLight, 20, 770)

$bmp.Save("$outputDir/landing-page-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: landing-page-mobile.png"

# -------------------------------------------------------------
# 4. FEATURES PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "Features"

$g.DrawString("ENTERPRISE CAPABILITIES", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("Comprehensive Tools Built for Modern Product Teams", $fontDisplay, $brushTextDark, 50, 108)
$g.DrawString("Explore the 12 core platform modules engineered for focus, high velocity, and scalable governance.", $fontBody, $brushTextMuted, 50, 150)

$featureGroups = @(
    "1. Project Management", "2. Task Management", "3. Kanban Boards", "4. Team Collaboration",
    "5. Workspace Hub", "6. Calendar & Sprints", "7. Notification Centre", "8. Reports & Analytics",
    "9. Workflow Automations", "10. File Storage (Cloudinary)", "11. Time Tracking", "12. Enterprise RBAC & Audit"
)
for ($i = 0; $i -lt 12; $i++) {
    $row = [Math]::Floor($i / 4)
    $col = $i % 4
    $fX = 50 + ($col * 295)
    $fY = 186 + ($row * 136)
    $fRect = [System.Drawing.Rectangle]::new($fX, $fY, 280, 120)
    $g.FillRectangle($brushWhite, $fRect)
    $g.DrawRectangle($penBorder, $fRect)
    $g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(($fX + 12), ($fY + 12), 24, 24))
    $g.DrawString("*", $fontH2, $brushIndigoMain, [float]($fX + 19), [float]($fY + 14))
    $g.DrawString($featureGroups[$i], $fontSmallBold, $brushTextDark, [float]($fX + 42), [float]($fY + 16))
    $g.DrawString("Enterprise-grade architecture with role-based policies, webhooks, and subtask trees.", $fontSmall, $brushTextMuted, [System.Drawing.RectangleF]::new(($fX + 12), ($fY + 46), 256, 60))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/features-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: features-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "Features"
$g.DrawString("Features & Modules", $fontH1, $brushTextDark, 20, 72)
$g.DrawString("12 capabilities engineered for team velocity.", $fontSmall, $brushTextMuted, 20, 102)
for ($i = 0; $i -lt 6; $i++) {
    $fY = 126 + ($i * 88)
    $fRect = [System.Drawing.Rectangle]::new(20, $fY, 360, 76)
    $g.FillRectangle($brushWhite, $fRect)
    $g.DrawRectangle($penBorder, $fRect)
    $g.DrawString($featureGroups[$i], $fontBodyBold, $brushTextDark, 32, [float]($fY + 12))
    $g.DrawString("Designed for speed, low cognitive load, and zero clutter.", $fontSmall, $brushTextMuted, 32, [float]($fY + 36))
}
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/features-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: features-mobile.png"

# -------------------------------------------------------------
# 5. SOLUTIONS PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "Solutions"

$g.DrawString("TAILORED WORKSPACES", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("Solutions Designed for Every Stage of Growth", $fontDisplay, $brushTextDark, 50, 108)

$solTiers = @(
    "Startups & Early Teams", "Small & Growing Businesses", "Remote & Hybrid Squads",
    "Technical Project Managers", "Large Organisations", "Global Enterprise"
)
$solDesc = @(
    "Move fast from idea to MVP with zero configuration overhead and intuitive Kanban boards.",
    "Centralize company goals, client projects, and cross-functional task dependencies.",
    "Async-first collaboration with real-time updates, sprint calendar views, and activity feeds.",
    "Granular priority tags, subtask checklists, estimate tracking, and sprint burn-up metrics.",
    "Multi-workspace architecture with unified company tenant billing and department isolation.",
    "Bank-grade JWT authentication, strict RBAC, automated security audit logs, and 99.9% uptime."
)
for ($i = 0; $i -lt 6; $i++) {
    $row = [Math]::Floor($i / 3)
    $col = $i % 3
    $sX = 50 + ($col * 395)
    $sY = 176 + ($row * 210)
    $sRect = [System.Drawing.Rectangle]::new($sX, $sY, 375, 190)
    $g.FillRectangle($brushWhite, $sRect)
    $g.DrawRectangle($penBorder, $sRect)
    $g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(($sX + 20), ($sY + 20), 40, 40))
    $g.DrawString([string]($i + 1), $fontH1, $brushIndigoMain, [float]($sX + 32), [float]($sY + 24))
    $g.DrawString($solTiers[$i], $fontH2, $brushTextDark, [float]($sX + 72), [float]($sY + 26))
    $g.DrawString($solDesc[$i], $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(($sX + 20), ($sY + 76), 335, 90))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/solutions-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: solutions-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "Solutions"
$g.DrawString("Solutions for Your Team", $fontH1, $brushTextDark, 20, 72)
for ($i = 0; $i -lt 4; $i++) {
    $sY = 116 + ($i * 130)
    $sRect = [System.Drawing.Rectangle]::new(20, $sY, 360, 118)
    $g.FillRectangle($brushWhite, $sRect)
    $g.DrawRectangle($penBorder, $sRect)
    $g.DrawString($solTiers[$i], $fontBodyBold, $brushTextDark, 32, [float]($sY + 16))
    $g.DrawString($solDesc[$i], $fontSmall, $brushTextMuted, [System.Drawing.RectangleF]::new(32, ($sY + 44), 336, 60))
}
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/solutions-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: solutions-mobile.png"

# -------------------------------------------------------------
# 6. PRICING PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "Pricing"

$g.DrawString("TRANSPARENT VALUE", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("Simple, Predictable Plans That Scale With You", $fontDisplay, $brushTextDark, 50, 108)

$plans = @("Starter", "Professional", "Enterprise")
$prices = @("Free", "$12 / seat", "Custom")
for ($i = 0; $i -lt 3; $i++) {
    $pX = 120 + ($i * 360)
    $pRect = [System.Drawing.Rectangle]::new($pX, 170, 320, 430)
    $isFeatured = ($i -eq 1)
    $g.FillRectangle($brushWhite, $pRect)
    if ($isFeatured) {
        $g.DrawRectangle($penIndigoBold, $pRect)
        $g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new($pX, 170, 320, 26))
        $g.DrawString("RECOMMENDED FOR GROWING TEAMS", $fontTiny, $brushWhite, [float]($pX + 60), [float]175)
    } else {
        $g.DrawRectangle($penBorder, $pRect)
    }

    $topOffset = if ($isFeatured) { 210 } else { 190 }
    $g.DrawString($plans[$i], $fontH1, $brushTextDark, [float]($pX + 24), [float]$topOffset)
    $g.DrawString($prices[$i], $fontDisplay, $brushIndigoMain, [float]($pX + 24), [float]($topOffset + 32))
    $g.DrawString("Billed annually or monthly. Cancel anytime.", $fontSmall, $brushTextMuted, [float]($pX + 24), [float]($topOffset + 76))

    $pFeatures = @("Unlimited Kanban cards", "Up to 5 squad members", "Sprint calendar integration", "Velocity analytics", "Cloudinary asset uploads")
    for ($f = 0; $f -lt 5; $f++) {
        $g.FillRectangle($brushSuccess, [System.Drawing.Rectangle]::new(($pX + 24), ($topOffset + 116 + ($f * 26)), 6, 6))
        $g.DrawString($pFeatures[$f], $fontSmall, $brushTextDark, [float]($pX + 38), [float]($topOffset + 110 + ($f * 26)))
    }

    $btnRect = [System.Drawing.Rectangle]::new(($pX + 24), ($pRect.Bottom - 60), 272, 40)
    $btnBrush = if ($isFeatured) { $brushIndigoMain } else { $brushWhite }
    $g.FillRectangle($btnBrush, $btnRect)
    if (-not $isFeatured) { $g.DrawRectangle($penIndigo, $btnRect) }
    $btnTextBrush = if ($isFeatured) { $brushWhite } else { $brushIndigoMain }
    $g.DrawString("Select $($plans[$i]) ->", $fontBodyBold, $btnTextBrush, [float]($pX + 90), [float]($pRect.Bottom - 50))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/pricing-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: pricing-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "Pricing"
$g.DrawString("Predictable Plans", $fontH1, $brushTextDark, 20, 72)
for ($i = 0; $i -lt 2; $i++) {
    $pY = 116 + ($i * 260)
    $pRect = [System.Drawing.Rectangle]::new(20, $pY, 360, 240)
    $g.FillRectangle($brushWhite, $pRect)
    $g.DrawRectangle($penBorder, $pRect)
    $g.DrawString($plans[$i], $fontH2, $brushTextDark, 36, [float]($pY + 16))
    $g.DrawString($prices[$i], $fontH1, $brushIndigoMain, 36, [float]($pY + 44))
    $g.DrawString("Includes unlimited projects, kanban cards, and team velocity metrics.", $fontSmall, $brushTextMuted, [System.Drawing.RectangleF]::new(36, ($pY + 80), 320, 50))
    $btnRect = [System.Drawing.Rectangle]::new(36, ($pY + 170), 328, 42)
    $g.FillRectangle($brushIndigoMain, $btnRect)
    $g.DrawString("Choose $($plans[$i])", $fontBodyBold, $brushWhite, 140, [float]($pY + 182))
}
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/pricing-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: pricing-mobile.png"

# -------------------------------------------------------------
# 7. ABOUT PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "About"

$g.DrawString("OUR MISSION & VISION", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("Empowering Teams to Achieve Decisive Clarity", $fontDisplay, $brushTextDark, 50, 108)

$rectMission = [System.Drawing.Rectangle]::new(50, 160, 1180, 140)
$g.FillRectangle($brushWhite, $rectMission)
$g.DrawRectangle($penBorder, $rectMission)
$g.DrawString("Why Workzen Exists", $fontH2, $brushIndigoMain, 74, 180)
$g.DrawString("Modern engineering and business squads are inundated by disjointed tools, notification fatigue, and noisy interfaces. Workzen was conceived to bring 'Zen' tranquility to high-velocity 'Work'. We engineer unified workspaces that give individuals, managers, and enterprise directors effortless control over their delivery pipelines.", $fontBody, $brushTextDark, [System.Drawing.RectangleF]::new(74, 214, 1130, 70))

$values = @("1. Clarity over Noise", "2. Deterministic Security", "3. Speed & Ergonomics", "4. Customer-Obsessed Simplicity")
$valDesc = @(
    "Every UI margin, button state, and metric card is calibrated to minimize cognitive overhead.",
    "Bank-grade JWT lifecycles, encrypted secrets, and complete multi-tenant tenant isolation.",
    "Keyboard shortcuts, responsive layouts, and zero-latency feedback states across all devices.",
    "We build genuine solutions for real team problems without unnecessary complexity."
)
for ($i = 0; $i -lt 4; $i++) {
    $vX = 50 + ($i * 295)
    $vRect = [System.Drawing.Rectangle]::new($vX, 330, 280, 180)
    $g.FillRectangle($brushWhite, $vRect)
    $g.DrawRectangle($penBorder, $vRect)
    $g.DrawString($values[$i], $fontH2, $brushTextDark, [float]($vX + 16), [float]346)
    $g.DrawString($valDesc[$i], $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(($vX + 16), 384, 248, 110))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/about-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: about-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "About"
$g.DrawString("About WORKZEN", $fontH1, $brushTextDark, 20, 72)
$g.DrawString("Fusing Zen tranquility with enterprise velocity.", $fontSmall, $brushTextMuted, 20, 102)
for ($i = 0; $i -lt 4; $i++) {
    $vY = 126 + ($i * 124)
    $vRect = [System.Drawing.Rectangle]::new(20, $vY, 360, 112)
    $g.FillRectangle($brushWhite, $vRect)
    $g.DrawRectangle($penBorder, $vRect)
    $g.DrawString($values[$i], $fontBodyBold, $brushTextDark, 32, [float]($vY + 14))
    $g.DrawString($valDesc[$i], $fontSmall, $brushTextMuted, [System.Drawing.RectangleF]::new(32, ($vY + 40), 336, 60))
}
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/about-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: about-mobile.png"

# -------------------------------------------------------------
# 8. CONTACT PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "Contact"

$g.DrawString("GET IN TOUCH", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("We'd Love to Hear From Your Team", $fontDisplay, $brushTextDark, 50, 108)

$rectLeft = [System.Drawing.Rectangle]::new(50, 160, 440, 440)
$g.FillRectangle($brushWhite, $rectLeft)
$g.DrawRectangle($penBorder, $rectLeft)
$g.DrawString("Reach Our Enterprise Team", $fontH1, $brushTextDark, 74, 184)
$g.DrawString("Have questions about multi-tenant deployment, security audits, custom team plans, or migration from Jira/ClickUp? Our engineering architects are standing by.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(74, 220, 390, 80))

$contacts = @("Direct Email: contact@workzen.io", "Security Office: security@workzen.io", "Enterprise Support: Available 24/7", "Headquarters: Remote-First Global Team")
for ($c = 0; $c -lt 4; $c++) {
    $g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(74, (310 + ($c * 42)), 20, 20))
    $g.DrawString(">", $fontSmallBold, $brushIndigoMain, 80, [float](312 + ($c * 42)))
    $g.DrawString($contacts[$c], $fontSmallBold, $brushTextDark, 104, [float](312 + ($c * 42)))
}

$rectForm = [System.Drawing.Rectangle]::new(520, 160, 710, 440)
$g.FillRectangle($brushWhite, $rectForm)
$g.DrawRectangle($penBorder, $rectForm)
$g.DrawString("Send an Inquiry", $fontH1, $brushTextDark, 544, 184)

$labels = @("Full Name", "Work Email", "Inquiry Subject", "Message")
for ($f = 0; $f -lt 4; $f++) {
    $fY = 224 + ($f * 64)
    $g.DrawString($labels[$f], $fontSmallBold, $brushTextDark, 544, [float]$fY)
    $inputH = if ($f -eq 3) { 60 } else { 34 }
    $inputRect = [System.Drawing.Rectangle]::new(544, ($fY + 18), 660, $inputH)
    $g.FillRectangle($brushBgMain, $inputRect)
    $g.DrawRectangle($penBorder, $inputRect)
}
$btnSend = [System.Drawing.Rectangle]::new(544, 526, 200, 42)
$g.FillRectangle($brushIndigoMain, $btnSend)
$g.DrawString("Send Message ->", $fontBodyBold, $brushWhite, 592, 538)

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/contact-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: contact-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "Contact"
$g.DrawString("Contact WORKZEN", $fontH1, $brushTextDark, 20, 72)
$rectMobForm = [System.Drawing.Rectangle]::new(20, 110, 360, 480)
$g.FillRectangle($brushWhite, $rectMobForm)
$g.DrawRectangle($penBorder, $rectMobForm)
for ($f = 0; $f -lt 4; $f++) {
    $fY = 126 + ($f * 84)
    $g.DrawString($labels[$f], $fontSmallBold, $brushTextDark, 36, [float]$fY)
    $inputH = if ($f -eq 3) { 70 } else { 38 }
    $inputRect = [System.Drawing.Rectangle]::new(36, ($fY + 20), 328, $inputH)
    $g.FillRectangle($brushBgMain, $inputRect)
    $g.DrawRectangle($penBorder, $inputRect)
}
$btnMobSend = [System.Drawing.Rectangle]::new(36, 510, 328, 44)
$g.FillRectangle($brushIndigoMain, $btnMobSend)
$g.DrawString("Send Message ->", $fontBodyBold, $brushWhite, 140, 522)
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/contact-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: contact-mobile.png"

# -------------------------------------------------------------
# 9. FAQ PAGE (Desktop 1280x800 & Mobile 400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-PublicHeader $g 1280 "FAQ"

$g.DrawString("QUESTIONS & ANSWERS", $fontTiny, $brushIndigoMain, 50, 90)
$g.DrawString("Frequently Asked Questions", $fontDisplay, $brushTextDark, 50, 108)

$faqs = @(
    "How does Workzen's multi-tenant architecture protect our workspace data?",
    "Can we migrate our existing projects from Jira, Asana, or ClickUp?",
    "Does Workzen support granular Role-Based Access Control (RBAC)?",
    "What payment methods are supported for enterprise subscriptions?",
    "Is real-time Socket.IO synchronization available across all team members?",
    "Can we integrate custom webhooks and REST API endpoints?"
)
for ($i = 0; $i -lt 6; $i++) {
    $qY = 160 + ($i * 74)
    $qRect = [System.Drawing.Rectangle]::new(50, $qY, 1180, 62)
    $g.FillRectangle($brushWhite, $qRect)
    $g.DrawRectangle($penBorder, $qRect)
    $g.DrawString($faqs[$i], $fontH2, $brushTextDark, 72, [float]($qY + 18))
    $g.DrawString("+", $fontH1, $brushIndigoMain, 1200, [float]($qY + 16))
}

Draw-PublicFooter $g 1280 640
$bmp.Save("$outputDir/faq-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: faq-desktop.png"

$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-MobileHeader $g 400 "FAQ"
$g.DrawString("FAQ & Help", $fontH1, $brushTextDark, 20, 72)
for ($i = 0; $i -lt 5; $i++) {
    $qY = 110 + ($i * 96)
    $qRect = [System.Drawing.Rectangle]::new(20, $qY, 360, 82)
    $g.FillRectangle($brushWhite, $qRect)
    $g.DrawRectangle($penBorder, $qRect)
    $g.DrawString($faqs[$i], $fontSmallBold, $brushTextDark, [System.Drawing.RectangleF]::new(32, ($qY + 14), 300, 56))
    $g.DrawString("+", $fontH2, $brushIndigoMain, 345, [float]($qY + 28))
}
Draw-PublicFooter $g 400 680
$bmp.Save("$outputDir/faq-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: faq-mobile.png"

# -------------------------------------------------------------
# 10. NAVIGATION MOBILE DRAWER STATE (400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(100, 0, 0, 0))

$rectDrawer = [System.Drawing.Rectangle]::new(0, 0, 320, 820)
$g.FillRectangle($brushWhite, $rectDrawer)

$rectIcon = [System.Drawing.Rectangle]::new(20, 20, 32, 32)
$g.FillRectangle($brushIndigoMain, $rectIcon)
$g.DrawString("W", $fontH1, $brushWhite, 27, 22)
$g.DrawString("WORKZEN", $fontLogo, $brushTextDark, 60, 24)
$g.DrawLine($penBorder, 0, 70, 320, 70)

$drawerLinks = @("Home", "Features", "Solutions", "Pricing", "About", "FAQ", "Contact")
for ($i = 0; $i -lt 7; $i++) {
    $dY = 88 + ($i * 48)
    $g.DrawString($drawerLinks[$i], $fontBodyBold, $brushTextDark, 24, [float]$dY)
    $g.DrawLine($penBorder, 24, [int]($dY + 36), 296, [int]($dY + 36))
}

$rectBtn1 = [System.Drawing.Rectangle]::new(20, 680, 280, 44)
$g.FillRectangle($brushBgMain, $rectBtn1)
$g.DrawRectangle($penBorder, $rectBtn1)
$g.DrawString("Sign In", $fontBodyBold, $brushTextDark, 134, 692)

$rectBtn2 = [System.Drawing.Rectangle]::new(20, 736, 280, 44)
$g.FillRectangle($brushIndigoMain, $rectBtn2)
$g.DrawString("Start Free Trial ->", $fontBodyBold, $brushWhite, 100, 748)

$bmp.Save("$outputDir/navigation-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: navigation-mobile.png"

# -------------------------------------------------------------
# 11. FOOTER DESKTOP COMPONENT STATE (1280x400)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 400
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cDarkNavy)

Draw-PublicFooter $g 1280 40

$bmp.Save("$outputDir/footer-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: footer-desktop.png"

Write-Host "All Phase 4 Prototype Pictures successfully generated in $outputDir!"

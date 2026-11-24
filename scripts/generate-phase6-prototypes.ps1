# scripts/generate-phase6-prototypes.ps1
# WORKZEN — Phase 6 High-Fidelity UI/UX Prototype Picture Generator
# Inspired directly by user-provided Dribbble benchmarks:
# 1. Onboarding / Creation split layout with isometric SaaS illustration (Mixpanel / Sassy inspiration)
# 2. Workspace / Organization Selector floating popover with search & active badge (B2B Web App inspiration)
# 3. Organization Overview & Details with metric bars & status toggles (Call Center SaaS inspiration)
# 4. Mobile & Tablet responsive list cards with filter bar (Zuper mobile app inspiration)

Add-Type -AssemblyName System.Drawing

$outputDir = "c:\Users\USER\OneDrive\Desktop\workzen\docs\design\phase-6\prototypes"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Design Tokens (Workzen Brand)
$cPrimary = [System.Drawing.Color]::FromArgb(79, 70, 229)         # #4F46E5 Indigo
$cPrimaryDark = [System.Drawing.Color]::FromArgb(67, 56, 202)     # #4338CA
$cPrimaryLight = [System.Drawing.Color]::FromArgb(238, 242, 255)   # #EEF2FF
$cAccentLime = [System.Drawing.Color]::FromArgb(204, 251, 93)      # #CCFB5D Accent pill
$cAccentLimeBorder = [System.Drawing.Color]::FromArgb(163, 230, 53)
$cDark = [System.Drawing.Color]::FromArgb(15, 23, 42)            # #0F172A Slate 900
$cTextMuted = [System.Drawing.Color]::FromArgb(100, 116, 139)     # #64748B Slate 500
$cBg = [System.Drawing.Color]::FromArgb(248, 250, 252)           # #F8FAFC Light Bg
$cBgPaleGreen = [System.Drawing.Color]::FromArgb(244, 248, 244)   # Mixpanel style subtle bg
$cWhite = [System.Drawing.Color]::White
$cBorder = [System.Drawing.Color]::FromArgb(226, 232, 240)        # #E2E8F0 Border
$cSuccess = [System.Drawing.Color]::FromArgb(16, 185, 129)       # #10B981 Emerald
$cDanger = [System.Drawing.Color]::FromArgb(239, 68, 68)         # #EF4444 Rose
$cWarning = [System.Drawing.Color]::FromArgb(245, 158, 11)       # #F59E0B Amber
$cGrayPill = [System.Drawing.Color]::FromArgb(241, 245, 249)

# Pens & Brushes
$brushBg = New-Object System.Drawing.SolidBrush($cBg)
$brushBgPale = New-Object System.Drawing.SolidBrush($cBgPaleGreen)
$brushWhite = New-Object System.Drawing.SolidBrush($cWhite)
$brushPrimary = New-Object System.Drawing.SolidBrush($cPrimary)
$brushPrimaryLight = New-Object System.Drawing.SolidBrush($cPrimaryLight)
$brushDark = New-Object System.Drawing.SolidBrush($cDark)
$brushMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$brushBorder = New-Object System.Drawing.SolidBrush($cBorder)
$brushDanger = New-Object System.Drawing.SolidBrush($cDanger)
$brushSuccess = New-Object System.Drawing.SolidBrush($cSuccess)
$brushWarning = New-Object System.Drawing.SolidBrush($cWarning)
$brushLime = New-Object System.Drawing.SolidBrush($cAccentLime)
$brushGrayPill = New-Object System.Drawing.SolidBrush($cGrayPill)

$penBorder = New-Object System.Drawing.Pen($cBorder, 1)
$penBorderThick = New-Object System.Drawing.Pen($cBorder, 2)
$penPrimary = New-Object System.Drawing.Pen($cPrimary, 2)
$penDanger = New-Object System.Drawing.Pen($cDanger, 1.5)
$penLime = New-Object System.Drawing.Pen($cAccentLimeBorder, 1.5)

# Fonts
$fontHero = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontBodyBold = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Regular)
$fontBrand = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)

function Draw-BaseShell($g, $w, $h, $activeTab, $isMobile) {
    $g.FillRectangle($brushBg, 0, 0, $w, $h)
    
    if (-not $isMobile) {
        # Sidebar
        $sidebarW = 240
        $g.FillRectangle($brushWhite, 0, 0, $sidebarW, $h)
        $g.DrawLine($penBorder, $sidebarW, 0, $sidebarW, $h)

        # Brand Logo
        $g.FillEllipse($brushPrimary, 24, 20, 28, 28)
        $g.DrawString("W", $fontBrand, $brushWhite, 31, 23)
        $g.DrawString("WORKZEN", $fontBrand, $brushDark, 60, 23)

        # Active Org Card in Sidebar (B2B Workspace Selector Inspiration)
        $g.FillRectangle($brushPrimaryLight, 16, 68, 208, 48)
        $g.DrawRectangle($penPrimary, 16, 68, 208, 48)
        $g.FillRectangle($brushPrimary, 26, 76, 32, 32)
        $g.DrawString("A", $fontBodyBold, $brushWhite, 37, 82)
        $g.DrawString("Acme Global Inc.", $fontBodyBold, $brushDark, 66, 75)
        $g.DrawString("Enterprise &bull; Owner", $fontSmall, $brushSuccess, 66, 93)

        # Sidebar Nav Items
        $navItems = @("Overview", "Workspaces", "Projects", "Members", "Settings")
        $y = 140
        foreach ($item in $navItems) {
            if ($item -eq $activeTab) {
                $g.FillRectangle($brushPrimaryLight, 16, $y, 208, 36)
                $g.DrawString($item, $fontBodyBold, $brushPrimary, 36, $y + 8)
            } else {
                $g.DrawString($item, $fontBody, $brushMuted, 36, $y + 8)
            }
            $y += 44
        }

        # Top Header Bar
        $headerH = 64
        $headerW = $w - $sidebarW
        $g.FillRectangle($brushWhite, $sidebarW, 0, $headerW, $headerH)
        $g.DrawLine($penBorder, $sidebarW, $headerH, $w, $headerH)
        $g.DrawString("Organizations", $fontSubtitle, $brushDark, $sidebarW + 28, 20)

        # Top Search Bar
        $g.FillRectangle($brushBg, $sidebarW + 180, 16, 260, 32)
        $g.DrawRectangle($penBorder, $sidebarW + 180, 16, 260, 32)
        $g.DrawString("🔍  Search organizations, workspaces...", $fontSmall, $brushMuted, $sidebarW + 192, 23)

        # Header Right Controls (Selector Trigger & User)
        $g.FillRectangle($brushBg, $w - 240, 14, 150, 36)
        $g.DrawRectangle($penBorder, $w - 240, 14, 150, 36)
        $g.DrawString("Acme Global Inc. ▼", $fontSmall, $brushDark, $w - 225, 23)

        $g.FillEllipse($brushPrimary, $w - 60, 16, 32, 32)
        $g.DrawString("AC", $fontSmall, $brushWhite, $w - 53, 23)
    } else {
        # Mobile Top Bar (Zuper App Reference Style)
        $g.FillRectangle($brushWhite, 0, 0, $w, 56)
        $g.DrawLine($penBorder, 0, 56, $w, 56)
        $g.DrawString("≡", $fontTitle, $brushDark, 16, 14)
        $g.DrawString("Organizations (5) ▼", $fontSubtitle, $brushDark, 52, 16)
        $g.DrawString("🔍", $fontSubtitle, $brushDark, $w - 74, 16)
        $g.DrawString("⚙", $fontSubtitle, $brushDark, $w - 38, 16)
    }
}

# ==============================================================================
# 1. Organization Onboarding & Creation (Mixpanel / Sassy Reference Split Screen)
# ==============================================================================
$bmp = New-Object System.Drawing.Bitmap(1280, 800)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillRectangle($brushBgPale, 0, 0, 1280, 800)

# Brand Header
$g.FillEllipse($brushPrimary, 80, 48, 28, 28)
$g.DrawString("W", $fontSubtitle, $brushWhite, 87, 51)
$g.DrawString("WORKZEN", $fontSubtitle, $brushDark, 116, 52)

# Left Side: Creation Form
$formX = 80; $formY = 130
$g.DrawString("Create your Organization", $fontHero, $brushDark, $formX, $formY)
$g.DrawString("This is where your team can work, manage projects and collaborate in strict isolation.", $fontBody, $brushMuted, $formX, $formY + 45)

# Input: Organization Name
$g.DrawString("Organization Name", $fontBodyBold, $brushDark, $formX, $formY + 95)
$g.FillRectangle($brushWhite, $formX, $formY + 120, 480, 44)
$g.DrawRectangle($penBorder, $formX, $formY + 120, 480, 44)
$g.DrawString("Acme Global Technologies", $fontBody, $brushDark, $formX + 16, $formY + 132)

# Input: Unique Slug
$g.DrawString("Workspace Slug", $fontBodyBold, $brushDark, $formX, $formY + 180)
$g.FillRectangle($brushWhite, $formX, $formY + 205, 480, 44)
$g.DrawRectangle($penBorder, $formX, $formY + 205, 480, 44)
$g.DrawString("workzen.io/org/acme-global-tech", $fontBody, $brushPrimary, $formX + 16, $formY + 217)

# Input: Data Centre / Region (Reference Style: Nigeria / United States / Europe pills)
$g.DrawString("Data Centre Residency ⓘ", $fontBodyBold, $brushDark, $formX, $formY + 265)
$g.FillRectangle($brushLime, $formX, $formY + 290, 150, 42)
$g.DrawRectangle($penLime, $formX, $formY + 290, 150, 42)
$g.DrawString("🇳🇬 Nigeria", $fontBodyBold, $brushDark, $formX + 35, $formY + 301)

$g.FillRectangle($brushWhite, $formX + 165, $formY + 290, 150, 42)
$g.DrawRectangle($penBorder, $formX + 165, $formY + 290, 150, 42)
$g.DrawString("🇺🇸 United States", $fontBody, $brushDark, $formX + 185, $formY + 301)

$g.FillRectangle($brushWhite, $formX + 330, $formY + 290, 150, 42)
$g.DrawRectangle($penBorder, $formX + 330, $formY + 290, 150, 42)
$g.DrawString("🇪🇺 Europe (EU)", $fontBody, $brushDark, $formX + 355, $formY + 301)

# Checkbox: Anyone with domain
$g.DrawRectangle($penBorder, $formX, $formY + 355, 18, 18)
$g.DrawString("✓", $fontBodyBold, $brushPrimary, $formX + 2, $formY + 355)
$g.DrawString("Anyone with your email domain (@acme.com) can automatically request to join", $fontSmall, $brushDark, $formX + 28, $formY + 356)

# Buttons: Back and Continue
$g.FillRectangle($brushWhite, $formX, $formY + 410, 140, 44)
$g.DrawRectangle($penBorder, $formX, $formY + 410, 140, 44)
$g.DrawString("Back", $fontBodyBold, $brushDark, $formX + 50, $formY + 422)

$g.FillRectangle($brushLime, $formX + 160, $formY + 410, 200, 44)
$g.DrawRectangle($penLime, $formX + 160, $formY + 410, 200, 44)
$g.DrawString("Continue & Set Up →", $fontBodyBold, $brushDark, $formX + 195, $formY + 422)

# Right Side: Stylized Isometric Cloud & SaaS Collaboration Graphic (Matching Reference)
$rightX = 720; $rightY = 160
$g.FillEllipse($brushPrimaryLight, $rightX + 60, $rightY + 60, 360, 360)

# Central Isometric Canvas Platform
$p1 = New-Object System.Drawing.PointF(($rightX + 240), ($rightY + 60))
$p2 = New-Object System.Drawing.PointF(($rightX + 420), ($rightY + 160))
$p3 = New-Object System.Drawing.PointF(($rightX + 240), ($rightY + 260))
$p4 = New-Object System.Drawing.PointF(($rightX + 60), ($rightY + 160))
[System.Drawing.PointF[]]$ptsTop = @($p1, $p2, $p3, $p4)
$g.FillPolygon($brushWhite, $ptsTop)
$g.DrawPolygon($penBorderThick, $ptsTop)

# Floating Isometric Elements (VR / AI / Charts)
$g.FillRectangle($brushDark, $rightX + 200, $rightY + 100, 80, 50)
$g.DrawString("WORKZEN", $fontSmall, $brushWhite, $rightX + 210, $rightY + 115)

$g.FillRectangle($brushLime, $rightX + 110, $rightY + 200, 70, 70)
$g.DrawString("AI Core", $fontSmall, $brushDark, $rightX + 120, $rightY + 225)

$g.FillRectangle($brushPrimary, $rightX + 300, $rightY + 190, 80, 60)
$g.DrawString("Tasks & Sync", $fontSmall, $brushWhite, $rightX + 310, $rightY + 210)

$g.DrawString("Plan Smarter. Work Together. Achieve More.", $fontSubtitle, $brushPrimary, $rightX + 80, $rightY + 460)

$bmp.Save("$outputDir\org-onboarding-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$outputDir\org-create-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Mobile Onboarding
$bmp = New-Object System.Drawing.Bitmap(400, 820)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillRectangle($brushBgPale, 0, 0, 400, 820)

$g.FillEllipse($brushPrimary, 24, 24, 28, 28)
$g.DrawString("W", $fontSubtitle, $brushWhite, 31, 27)
$g.DrawString("WORKZEN", $fontSubtitle, $brushDark, 60, 28)

$g.DrawString("Create Organization", $fontSubtitle, $brushDark, 24, 80)
$g.DrawString("Where your team collaborates in isolation", $fontSmall, $brushMuted, 24, 106)

$g.DrawString("Organization Name", $fontBodyBold, $brushDark, 24, 140)
$g.FillRectangle($brushWhite, 24, 165, 352, 40)
$g.DrawRectangle($penBorder, 24, 165, 352, 40)
$g.DrawString("Acme Global Tech", $fontBody, $brushDark, 36, 175)

$g.DrawString("Data Centre", $fontBodyBold, $brushDark, 24, 220)
$g.FillRectangle($brushLime, 24, 245, 110, 36)
$g.DrawRectangle($penLime, 24, 245, 110, 36)
$g.DrawString("🇳🇬 Nigeria", $fontSmall, $brushDark, 38, 254)

$g.FillRectangle($brushWhite, 144, 245, 110, 36)
$g.DrawRectangle($penBorder, 144, 245, 110, 36)
$g.DrawString("🇺🇸 US", $fontSmall, $brushDark, 178, 254)

$g.FillRectangle($brushWhite, 264, 245, 110, 36)
$g.DrawRectangle($penBorder, 264, 245, 110, 36)
$g.DrawString("🇪🇺 EU", $fontSmall, $brushDark, 300, 254)

$g.FillRectangle($brushLime, 24, 320, 352, 44)
$g.DrawString("Continue →", $fontBodyBold, $brushDark, 160, 332)

$bmp.Save("$outputDir\org-onboarding-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$outputDir\org-create-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Tablet Creation Screen
$bmp = New-Object System.Drawing.Bitmap(768, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.FillRectangle($brushBgPale, 0, 0, 768, 1024)

$g.FillEllipse($brushPrimary, 40, 36, 28, 28)
$g.DrawString("W", $fontSubtitle, $brushWhite, 47, 39)
$g.DrawString("WORKZEN", $fontSubtitle, $brushDark, 76, 40)

$g.DrawString("Create your Organization", $fontHero, $brushDark, 40, 100)
$g.DrawString("Unified team collaboration workspace with strict data tenancy.", $fontBody, $brushMuted, 40, 145)

$g.DrawString("Organization Name", $fontBodyBold, $brushDark, 40, 195)
$g.FillRectangle($brushWhite, 40, 220, 688, 44)
$g.DrawRectangle($penBorder, 40, 220, 688, 44)
$g.DrawString("Acme Global Technologies", $fontBody, $brushDark, 56, 232)

$g.DrawString("Data Centre Residency", $fontBodyBold, $brushDark, 40, 290)
$g.FillRectangle($brushLime, 40, 315, 200, 42)
$g.DrawRectangle($penLime, 40, 315, 200, 42)
$g.DrawString("🇳🇬 Nigeria", $fontBodyBold, $brushDark, 100, 326)

$g.FillRectangle($brushWhite, 260, 315, 200, 42)
$g.DrawRectangle($penBorder, 260, 315, 200, 42)
$g.DrawString("🇺🇸 United States", $fontBody, $brushDark, 305, 326)

$g.FillRectangle($brushWhite, 480, 315, 200, 42)
$g.DrawRectangle($penBorder, 480, 315, 200, 42)
$g.DrawString("🇪🇺 Europe (EU)", $fontBody, $brushDark, 535, 326)

$g.FillRectangle($brushLime, 40, 400, 688, 48)
$g.DrawRectangle($penLime, 40, 400, 688, 48)
$g.DrawString("Continue & Set Up Workspace →", $fontBodyBold, $brushDark, 260, 414)

$bmp.Save("$outputDir\org-create-tablet.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ==============================================================================
# 2. Organization Selection / Switcher (B2B Workspace Selector Inspiration)
# ==============================================================================
$bmp = New-Object System.Drawing.Bitmap(1280, 800)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Draw-BaseShell $g 1280 800 "Overview" $false

# Popover Card (matching B2B reference: Search bar, active orange/yellow or indigo glow, "Current" badge)
$popX = 480; $popY = 70; $popW = 380; $popH = 460
$g.FillRectangle($brushWhite, $popX, $popY, $popW, $popH)
$g.DrawRectangle($penBorderThick, $popX, $popY, $popW, $popH)

# Popover Search Bar
$g.FillRectangle($brushBg, $popX + 16, $popY + 16, $popW - 32, 38)
$g.DrawRectangle($penBorder, $popX + 16, $popY + 16, $popW - 32, 38)
$g.DrawString("🔍  Search for an organization", $fontSmall, $brushMuted, $popX + 32, $popY + 26)

# List Items
$workspaces = @(
    @("Developer Testing", "D", $false, "Owner"),
    @("Acme Global Inc.", "M", $true, "Current"),
    @("Alex's Personal Space", "A", $false, "Member"),
    @("Sales Demo Workspace", "S", $false, "Admin"),
    @("Speakeasy Beta Testing", "B", $false, "Guest")
)
$wy = $popY + 70
foreach ($ws in $workspaces) {
    if ($ws[2]) {
        # Active Workspace with vibrant highlight and "Current" pill
        $ptA = New-Object System.Drawing.PointF(($popX + 16), $wy)
        $ptB = New-Object System.Drawing.PointF(($popX + $popW - 16), ($wy + 48))
        $colA = [System.Drawing.Color]::FromArgb(254, 240, 138)
        $colB = [System.Drawing.Color]::FromArgb(250, 204, 21)
        $brushActivePill = New-Object System.Drawing.Drawing2D.LinearGradientBrush($ptA, $ptB, $colA, $colB)
        $g.FillRectangle($brushActivePill, $popX + 16, $wy, $popW - 32, 52)
        $g.DrawRectangle($penLime, $popX + 16, $wy, $popW - 32, 52)

        # Icon box
        $g.FillRectangle($brushWhite, $popX + 26, $wy + 10, 32, 32)
        $g.DrawRectangle($penBorder, $popX + 26, $wy + 10, 32, 32)
        $g.DrawString($ws[1], $fontBodyBold, $brushDark, $popX + 36, $wy + 16)

        $g.DrawString($ws[0], $fontBodyBold, $brushDark, $popX + 68, $wy + 16)

        # Current Pill
        $g.FillRectangle($brushDark, $popX + $popW - 90, $wy + 14, 60, 24)
        $g.DrawString("Current", $fontSmall, $brushWhite, $popX + $popW - 82, $wy + 18)
    } else {
        $g.FillRectangle($brushWhite, $popX + 16, $wy, $popW - 32, 48)

        # Icon box
        $g.FillRectangle($brushGrayPill, $popX + 26, $wy + 8, 32, 32)
        $g.DrawRectangle($penBorder, $popX + 26, $wy + 8, 32, 32)
        $g.DrawString($ws[1], $fontBodyBold, $brushDark, $popX + 36, $wy + 14)

        $g.DrawString($ws[0], $fontBody, $brushDark, $popX + 68, $wy + 15)
        $g.DrawString($ws[3], $fontSmall, $brushMuted, $popX + $popW - 75, $wy + 16)
    }
    $wy += 58
}

# Popover Bottom Actions
$g.DrawLine($penBorder, $popX, $popY + $popH - 50, $popX + $popW, $popY + $popH - 50)
$g.DrawString("+ Create New Organization", $fontBodyBold, $brushPrimary, $popX + 20, $popY + $popH - 35)
$g.DrawString("Organization Settings", $fontBodyBold, $brushDark, $popX + 220, $popY + $popH - 35)

$bmp.Save("$outputDir\org-select-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Mobile Selector (Zuper App Reference Style)
$bmp = New-Object System.Drawing.Bitmap(400, 820)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Draw-BaseShell $g 400 820 "" $true

# Mobile Filter/Sort Banner
$g.FillRectangle($brushBg, 16, 70, 368, 44)
$g.DrawRectangle($penBorder, 16, 70, 368, 44)
$g.DrawString("🔍 Filter by name or status...", $fontSmall, $brushMuted, 30, 84)
$g.DrawString("Sort: Name ▼", $fontSmall, $brushDark, 290, 84)

# Mobile Organization Cards (Zuper Style: Avatar box, Name, Email, Member count, Address/Timezone, Active status)
$mOrgs = @(
    @("Acme Global Inc.", "acme@workzen.io", "12 Members", "New York, USA", "Active", $true),
    @("RIO Enterprises", "admin@rio.com", "5 Members", "Dallas, USA", "Active", $false),
    @("South Cravica", "scar@rez.com", "1 Member", "Ljubljana, EU", "Inactive", $false),
    @("Sparkle Cleaning", "sparkle@sample.com", "11 Members", "London, UK", "Active", $false)
)
$mcy = 130
foreach ($mo in $mOrgs) {
    $g.FillRectangle($brushWhite, 16, $mcy, 368, 100)
    $g.DrawRectangle($penBorder, 16, $mcy, 368, 100)

    # Org Icon
    $g.FillRectangle($brushPrimaryLight, 28, $mcy + 16, 44, 44)
    $g.DrawRectangle($penPrimary, 28, $mcy + 16, 44, 44)
    $g.DrawString("🏢", $fontSubtitle, $brushPrimary, 38, $mcy + 24)

    # Name & Email
    $g.DrawString($mo[0], $fontBodyBold, $brushDark, 82, $mcy + 14)
    $g.DrawString($mo[1], $fontSmall, $brushMuted, 82, $mcy + 34)

    # Details: Members & Location
    $g.DrawString("👥 " + $mo[2], $fontSmall, $brushDark, 82, $mcy + 58)
    $g.DrawString("📍 " + $mo[3], $fontSmall, $brushMuted, 180, $mcy + 58)

    # Status Pill
    if ($mo[4] -eq "Active") {
        $g.FillRectangle($brushPrimaryLight, 300, $mcy + 14, 68, 22)
        $g.DrawString("Active", $fontSmall, $brushSuccess, 316, $mcy + 18)
    } else {
        $g.FillRectangle($brushBg, 300, $mcy + 14, 68, 22)
        $g.DrawString("Inactive", $fontSmall, $brushMuted, 310, $mcy + 18)
    }
    $mcy += 114
}

$bmp.Save("$outputDir\org-select-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ==============================================================================
# 3. Organization Overview & Dashboard (Call Center SaaS Reference Inspiration)
# ==============================================================================
$bmp = New-Object System.Drawing.Bitmap(1280, 800)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Draw-BaseShell $g 1280 800 "Overview" $false

# Top Header Title
$g.DrawString("← Organization Overview", $fontTitle, $brushDark, 270, 80)
$g.DrawString("View and edit organizational settings and multi-tenant telemetry", $fontSmall, $brushMuted, 270, 112)

# Left Column: Overview Summary Card (Matching Reem Hospital Reference)
$leftW = 320; $leftH = 480
$g.FillRectangle($brushWhite, 270, 140, $leftW, $leftH)
$g.DrawRectangle($penBorder, 270, 140, $leftW, $leftH)

# Org Circle Icon
$g.FillEllipse($brushPrimaryLight, 290, 160, 54, 54)
$g.DrawEllipse($penPrimary, 290, 160, 54, 54)
$g.DrawString("🏢", $fontTitle, $brushPrimary, 302, 170)

# Active Pill
$g.FillRectangle($brushPrimaryLight, 500, 165, 70, 24)
$g.DrawString("● Active", $fontSmall, $brushSuccess, 510, 170)

# Name & ID
$g.DrawString("Acme Global Inc.", $fontTitle, $brushDark, 290, 226)
$g.DrawString("Organization ID: #409283985", $fontSmall, $brushMuted, 290, 256)

# Key Value Rows
$g.DrawString("Created at:", $fontSmall, $brushMuted, 290, 290)
$g.DrawString("12 Nov, 2026", $fontBodyBold, $brushDark, 480, 290)

$g.DrawString("Latest Activity:", $fontSmall, $brushMuted, 290, 320)
$g.DrawString("Today, 11:30 am", $fontBodyBold, $brushDark, 460, 320)

# Quota / Usage Progress Bars
$g.DrawString("Storage Quota (20%):", $fontSmall, $brushMuted, 290, 360)
$g.FillRectangle($brushBg, 290, 380, 270, 8)
$g.FillRectangle($brushSuccess, 290, 380, 54, 8)

$g.DrawString("API Seats (45%):", $fontSmall, $brushMuted, 290, 400)
$g.FillRectangle($brushBg, 290, 420, 270, 8)
$g.FillRectangle($brushPrimary, 290, 420, 120, 8)

$g.DrawString("Deployment Type:", $fontSmall, $brushMuted, 290, 450)
$g.DrawString("Private Multi-Tenant VPC", $fontBodyBold, $brushPrimary, 410, 450)

# Right Column: Organization Details Form Card (Matching Reference)
$rightW = 630; $rightH = 340
$g.FillRectangle($brushWhite, 610, 140, $rightW, $rightH)
$g.DrawRectangle($penBorder, 610, 140, $rightW, $rightH)
$g.DrawString("Organization Details", $fontSubtitle, $brushDark, 630, 160)

# Name Field
$g.DrawString("Organization Name", $fontSmall, $brushMuted, 630, 195)
$g.FillRectangle($brushBg, 630, 215, 590, 36)
$g.DrawRectangle($penBorder, 630, 215, 590, 36)
$g.DrawString("Acme Global Inc.", $fontBody, $brushDark, 642, 223)

# Description Field
$g.DrawString("Organization Description", $fontSmall, $brushMuted, 630, 265)
$g.FillRectangle($brushBg, 630, 285, 590, 100)
$g.DrawRectangle($penBorder, 630, 285, 590, 100)
$g.DrawString("Unified autonomous enterprise collaboration workspace for global teams.", $fontBody, $brushDark, 642, 295)

# Save Changes Button (Purple / Indigo)
$g.FillRectangle($brushPrimary, 1090, 410, 130, 38)
$g.DrawString("Save Changes", $fontBodyBold, $brushWhite, 1115, 420)

# Bottom Full-Width Card: Enable/Disable Organization Toggle Switch
$g.FillRectangle($brushWhite, 610, 500, $rightW, 70)
$g.DrawRectangle($penBorder, 610, 500, $rightW, 70)
$g.DrawString("Enable/Disable Organization", $fontBodyBold, $brushDark, 630, 514)
$g.DrawString("All active processes and workflows associated with the organization will be halted or resumed immediately", $fontSmall, $brushMuted, 630, 536)
# Switch toggle
$g.FillRectangle($brushPrimary, 1160, 520, 44, 22)
$g.FillEllipse($brushWhite, 1182, 522, 18, 18)

# Bottom Full-Width Card: Delete Organization (Red Danger Card)
$g.FillRectangle($brushWhite, 610, 590, $rightW, 80)
$g.DrawRectangle($penBorder, 610, 590, $rightW, 80)
$g.DrawString("Delete Organization", $fontBodyBold, $brushDark, 630, 606)
$g.DrawString("In case of the deletion of organization, the organization will be safely archived.", $fontSmall, $brushMuted, 630, 630)
# Delete button
$g.FillRectangle($brushDanger, 1080, 610, 140, 36)
$g.DrawString("Delete Organization", $fontBodyBold, $brushWhite, 1095, 620)

$bmp.Save("$outputDir\org-dashboard-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$outputDir\org-settings-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Mobile Dashboard (Matching Zuper / Call Center Mobile)
$bmp = New-Object System.Drawing.Bitmap(400, 820)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Draw-BaseShell $g 400 820 "" $true

# Mobile Org Header Card
$g.FillRectangle($brushWhite, 16, 70, 368, 170)
$g.DrawRectangle($penBorder, 16, 70, 368, 170)
$g.FillEllipse($brushPrimaryLight, 28, 85, 48, 48)
$g.DrawString("🏢", $fontTitle, $brushPrimary, 38, 95)
$g.DrawString("Acme Global Inc.", $fontSubtitle, $brushDark, 88, 85)
$g.DrawString("Tenant: #409283985", $fontSmall, $brushMuted, 88, 110)
$g.DrawString("● Active &bull; Enterprise VPC", $fontSmall, $brushSuccess, 88, 130)

$g.DrawString("Storage Usage (20%)", $fontSmall, $brushMuted, 28, 165)
$g.FillRectangle($brushBg, 28, 185, 344, 8)
$g.FillRectangle($brushSuccess, 28, 185, 68, 8)

$g.DrawString("Organization Details", $fontSubtitle, $brushDark, 16, 260)
$g.FillRectangle($brushWhite, 16, 290, 368, 200)
$g.DrawRectangle($penBorder, 16, 290, 368, 200)

$g.DrawString("Name", $fontSmall, $brushMuted, 28, 305)
$g.FillRectangle($brushBg, 28, 325, 344, 34)
$g.DrawString("Acme Global Inc.", $fontBody, $brushDark, 38, 332)

$g.DrawString("Description", $fontSmall, $brushMuted, 28, 370)
$g.FillRectangle($brushBg, 28, 390, 344, 44)
$g.DrawString("Enterprise workspace", $fontBody, $brushDark, 38, 400)

$g.FillRectangle($brushPrimary, 28, 445, 344, 36)
$g.DrawString("Save Changes", $fontBodyBold, $brushWhite, 150, 454)

# Mobile Delete Card
$g.FillRectangle($brushWhite, 16, 510, 368, 110)
$g.DrawRectangle($penBorder, 16, 510, 368, 110)
$g.DrawString("Delete Organization", $fontBodyBold, $brushDark, 28, 525)
$g.DrawString("Tenant will be safely archived", $fontSmall, $brushMuted, 28, 546)
$g.FillRectangle($brushDanger, 28, 570, 344, 36)
$g.DrawString("Delete Organization", $fontBodyBold, $brushWhite, 130, 580)

$bmp.Save("$outputDir\org-dashboard-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$outputDir\org-settings-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Successfully generated all updated Phase 6 prototypes with Dribbble reference parity!"

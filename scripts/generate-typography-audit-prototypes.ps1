# ==============================================================================
# WORKZEN — Complete Typography & Professional Copywriting Visual Generator
# Renders 7 Desktop (1920x1080) and 7 Mobile (800x1200) Prototypes & Screenshots
# Typography: Pure Inter System Hierarchy, Natural International SaaS Language
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\typography-copy-audit"
$protoDir = Join-Path $baseDir "prototypes"
$screenDir = Join-Path $baseDir "screenshots"
$specDir = Join-Path $baseDir "design-specifications"

if (!(Test-Path $protoDir)) { New-Item -ItemType Directory -Force -Path $protoDir | Out-Null }
if (!(Test-Path $screenDir)) { New-Item -ItemType Directory -Force -Path $screenDir | Out-Null }
if (!(Test-Path $specDir)) { New-Item -ItemType Directory -Force -Path $specDir | Out-Null }

function Create-RoundedRectangle($x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -le 0) {
        $rect = New-Object System.Drawing.RectangleF([float]$x, [float]$y, [float]$w, [float]$h)
        $path.AddRectangle($rect)
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

# Color Definitions
$cSlate50  = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cSlate100 = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cSlate200 = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cSlate300 = [System.Drawing.ColorTranslator]::FromHtml("#CBD5E1")
$cSlate400 = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cSlate500 = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cSlate600 = [System.Drawing.ColorTranslator]::FromHtml("#475569")
$cSlate700 = [System.Drawing.ColorTranslator]::FromHtml("#334155")
$cSlate800 = [System.Drawing.ColorTranslator]::FromHtml("#1E293B")
$cSlate900 = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")

$cWhite    = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cPrimary  = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cIndigo   = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cEmerald  = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber    = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose     = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cSky      = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")

# Brushes & Pens
$bSlate50  = New-Object System.Drawing.SolidBrush($cSlate50)
$bSlate100 = New-Object System.Drawing.SolidBrush($cSlate100)
$bSlate200 = New-Object System.Drawing.SolidBrush($cSlate200)
$bSlate300 = New-Object System.Drawing.SolidBrush($cSlate300)
$bSlate400 = New-Object System.Drawing.SolidBrush($cSlate400)
$bSlate500 = New-Object System.Drawing.SolidBrush($cSlate500)
$bSlate600 = New-Object System.Drawing.SolidBrush($cSlate600)
$bSlate700 = New-Object System.Drawing.SolidBrush($cSlate700)
$bSlate800 = New-Object System.Drawing.SolidBrush($cSlate800)
$bSlate900 = New-Object System.Drawing.SolidBrush($cSlate900)
$bWhite    = New-Object System.Drawing.SolidBrush($cWhite)
$bPrimary  = New-Object System.Drawing.SolidBrush($cPrimary)
$bEmerald  = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber    = New-Object System.Drawing.SolidBrush($cAmber)
$bRose     = New-Object System.Drawing.SolidBrush($cRose)

$pBorder   = New-Object System.Drawing.Pen($cSlate200, 1)
$pPrimary  = New-Object System.Drawing.Pen($cPrimary, 2)
$pEmerald  = New-Object System.Drawing.Pen($cEmerald, 1)

# Fonts (Inter Primary with Arial / Segoe UI Fallback)
$fDisplay  = New-Object System.Drawing.Font("Segoe UI", 32, [System.Drawing.FontStyle]::Bold)
$fPageH    = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fSecH     = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fCardH    = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fBody     = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$fBodyBold = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fSmall    = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold= New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$fMono     = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)

function Save-Dual($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

Write-Host "Rendering WORKZEN Typography & Copy Audit Visual Prototypes..." -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Typography System & Hierarchy Spec (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cSlate50)

# Header
$path = Create-RoundedRectangle 60 40 1800 120 16
$g.FillPath($bSlate900, $path)
$g.DrawString("WORKZEN TYPOGRAPHY HIERARCHY — INTER SAAS DESIGN SYSTEM", $fSmallBold, $bEmerald, 90, 65)
$g.DrawString("Primary Font: Inter (Variable 300..800) • System Fallback: -apple-system, BlinkMacSystemFont, Segoe UI", $fPageH, $bWhite, 90, 85)

# 2-column cards
# Left: Type Scale Specs
$path = Create-RoundedRectangle 60 190 880 830 16
$g.FillPath($bWhite, $path)
$g.DrawPath($pBorder, $path)

$g.DrawString("STANDARDIZED TYPOGRAPHIC SCALE", $fSecH, $bSlate900, 90, 220)
$g.DrawString("Strict scale applied across public marketing and enterprise views.", $fSmall, $bSlate500, 90, 250)

$typeLevels = @(
    @{ Name="Display Heading (.wz-display-heading)"; Spec="36px - 48px / 700 Bold / -0.03em"; Sample="Plan Smarter. Work Together." },
    @{ Name="Page Heading (.wz-page-heading)"; Spec="24px (1.5rem) / 700 Bold / -0.02em"; Sample="Executive Dashboard Overview" },
    @{ Name="Section Heading (.wz-section-heading)"; Spec="20px (1.25rem) / 600 SemiBold / -0.015em"; Sample="Team Members & Active Directory" },
    @{ Name="Card Heading (.wz-card-heading)"; Spec="16.8px (1.05rem) / 600 SemiBold / -0.01em"; Sample="Sprint Burndown & Milestone Progress" },
    @{ Name="Body Text (.wz-body)"; Spec="14.8px (0.925rem) / 400 Regular / 1.55 Line Height"; Sample="Streamline cross-functional team deliverables with real-time clarity." },
    @{ Name="Table Cell & UI Labels (.wz-label)"; Spec="13px (0.8125rem) / 600 SemiBold / +0.01em"; Sample="ORGANIZATION ROLE: ADMINISTRATOR" },
    @{ Name="Captions & Metadata (.wz-caption)"; Spec="12px (0.75rem) / 500 Medium / 1.4 Line Height"; Sample="Encrypted connection • Enterprise access management" }
)

$y = 290
foreach ($lvl in $typeLevels) {
    $g.DrawString($lvl.Name, $fSmallBold, $bPrimary, 90, $y)
    $g.DrawString($lvl.Spec, $fSmall, $bSlate500, 500, $y)
    $g.DrawString($lvl.Sample, $fCardH, $bSlate800, 90, ($y + 22))
    $g.DrawLine($pBorder, 90, ($y + 65), 900, ($y + 65))
    $y += 75
}

# Right: Product Copywriting Principles & Approved Terminology
$path = Create-RoundedRectangle 980 190 880 830 16
$g.FillPath($bWhite, $path)
$g.DrawPath($pBorder, $path)

$g.DrawString("CENTRALIZED TERMINOLOGY & BRAND VOICE", $fSecH, $bSlate900, 1010, 220)
$g.DrawString("Natural international business English with zero developer jargon.", $fSmall, $bSlate500, 1010, 250)

$terms = @(
    @{ Concept="Company Tenant"; Approved="Organization"; Banned="Tenant, Realm, Instance" },
    @{ Concept="Department Partition"; Approved="Workspace"; Banned="Silo, Bucket, Sandbox" },
    @{ Concept="Account User"; Approved="Team Member"; Banned="User record, Resource, Seat" },
    @{ Concept="Work Container"; Approved="Project"; Banned="Epic, Initiative, Workstream" },
    @{ Concept="Work Item"; Approved="Task & Subtask"; Banned="Ticket, Issue, Job" },
    @{ Concept="Security Rules"; Approved="Role & Permission"; Banned="RBAC policy, Privilege" },
    @{ Concept="Asset Storage"; Approved="Secure File Storage"; Banned="Cloudinary bucket, S3 dump" },
    @{ Concept="Real-Time Sync"; Approved="Real-Time Collaboration"; Banned="Socket.IO gateway" },
    @{ Concept="Data Boundary"; Approved="Dedicated Data Isolation"; Banned="Bank-grade JWT, IDOR-safe" }
)

$y = 290
$g.DrawString("CONCEPT", $fSmallBold, $bSlate500, 1010, $y)
$g.DrawString("APPROVED TERM", $fSmallBold, $bEmerald, 1220, $y)
$g.DrawString("PROHIBITED JARGON", $fSmallBold, $bRose, 1490, $y)
$y += 30

foreach ($t in $terms) {
    $g.DrawString($t.Concept, $fSmall, $bSlate700, 1010, $y)
    $g.DrawString($t.Approved, $fSmallBold, $bSlate900, 1220, $y)
    $g.DrawString($t.Banned, $fSmall, $bSlate500, 1490, $y)
    $g.DrawLine($pBorder, 1010, ($y + 35), 1820, ($y + 35))
    $y += 45
}

$g.Dispose()
Save-Dual $bmp "audit-01-typography-system-spec-desktop.png"

# Mobile
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cSlate50)

$path = Create-RoundedRectangle 30 30 740 100 12
$gM.FillPath($bSlate900, $path)
$gM.DrawString("WORKZEN TYPOGRAPHY SPEC", $fSmallBold, $bEmerald, 50, 48)
$gM.DrawString("Inter SaaS Font Hierarchy & Terms", $fSecH, $bWhite, 50, 72)

$path = Create-RoundedRectangle 30 150 740 980 12
$gM.FillPath($bWhite, $path)
$gM.DrawPath($pBorder, $path)

$gM.DrawString("TYPOGRAPHY HIERARCHY (MOBILE)", $fCardH, $bSlate900, 50, 175)
$yM = 220
foreach ($lvl in $typeLevels[0..4]) {
    $gM.DrawString($lvl.Name, $fSmallBold, $bPrimary, 50, $yM)
    $gM.DrawString($lvl.Spec, $fSmall, $bSlate500, 50, ($yM + 20))
    $gM.DrawString($lvl.Sample, $fBodyBold, $bSlate800, 50, ($yM + 40))
    $gM.DrawLine($pBorder, 50, ($yM + 75), 730, ($yM + 75))
    $yM += 90
}

$gM.DrawString("APPROVED TERMINOLOGY", $fCardH, $bSlate900, 50, $yM)
$yM += 35
foreach ($t in $terms[0..4]) {
    $gM.DrawString("$($t.Concept): ", $fSmall, $bSlate500, 50, $yM)
    $gM.DrawString($t.Approved, $fSmallBold, $bEmerald, 220, $yM)
    $yM += 30
}

$gM.Dispose()
Save-Dual $bmpM "audit-01-typography-system-spec-mobile.png"

# ------------------------------------------------------------------------------
# 2. Landing Page Hero (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cSlate900)

# Navbar
$path = Create-RoundedRectangle 60 30 1800 70 12
$g.FillPath($bWhite, $path)
$g.DrawString("WORKZEN", $fSecH, $bSlate900, 90, 52)
$navLinks = @("Features", "Solutions", "Pricing", "About", "FAQ", "Contact")
$nx = 300
foreach ($nl in $navLinks) {
    $g.DrawString($nl, $fBody, $bSlate700, $nx, 55)
    $nx += 120
}
$g.DrawString("Sign In", $fBodyBold, $bSlate700, 1550, 55)
$pathBtn = Create-RoundedRectangle 1650 43 180 44 8
$g.FillPath($bPrimary, $pathBtn)
$g.DrawString("Get Started Free", $fSmallBold, $bWhite, 1680, 56)

# Hero Headline
$g.DrawString("ENTERPRISE PROJECT MANAGEMENT & TEAM COLLABORATION", $fSmallBold, $bEmerald, 90, 160)
$g.DrawString("Simplify Your Workflow.`nAmplify Your Impact.", $fDisplay, $bWhite, 90, 200)

$pDesc = "Plan Smarter. Work Together. Achieve More. The high-performance workspace designed for modern teams.`nOrchestrate projects with decisive precision, track velocity with Zen clarity, and collaborate with enterprise trust."
$g.DrawString($pDesc, $fBody, $bSlate300, 90, 340)

# CTA Buttons
$pathCta1 = Create-RoundedRectangle 90 430 220 54 8
$g.FillPath($bPrimary, $pathCta1)
$g.DrawString("Start Free Trial", $fBodyBold, $bWhite, 130, 447)

$pathCta2 = Create-RoundedRectangle 330 430 240 54 8
$g.DrawPath($pBorder, $pathCta2)
$g.DrawString("Explore Interactive App", $fBodyBold, $bWhite, 360, 447)

# Trust Badges
$g.DrawString("✔ Enterprise Data Security   •   ✔ Real-Time Collaboration   •   ✔ Dedicated Team Workspaces", $fSmall, $bSlate400, 90, 520)

# Interactive Board Preview Window
$pathWin = Create-RoundedRectangle 980 160 880 780 16
$g.FillPath($bWhite, $pathWin)
$g.DrawPath($pBorder, $pathWin)

# Window Title Bar
$g.FillEllipse($bRose, 1010, 185, 12, 12)
$g.FillEllipse($bAmber, 1030, 185, 12, 12)
$g.FillEllipse($bEmerald, 1050, 185, 12, 12)
$g.DrawString("WORKZEN • Core Engineering Sprint", $fSmallBold, $bSlate700, 1080, 182)

# Kanban Preview Columns
$colTitles = @("To Do (3)", "In Progress (2)", "Done (8)")
$cx = 1010
foreach ($ct in $colTitles) {
    $pathCol = Create-RoundedRectangle $cx 220 260 680 10
    $g.FillPath($bSlate50, $pathCol)
    $g.DrawString($ct, $fCardH, $bSlate800, ($cx + 15), 235)
    
    # Task card inside
    $pathCard = Create-RoundedRectangle ($cx + 10) 270 240 90 8
    $g.FillPath($bWhite, $pathCard)
    $g.DrawPath($pBorder, $pathCard)
    $g.DrawString("Customer Authentication Flow", $fSmallBold, $bSlate800, ($cx + 20), 285)
    $g.DrawString("High Priority • 2 Subtasks", $fSmall, $bSlate500, ($cx + 20), 310)
    
    $cx += 280
}

$g.Dispose()
Save-Dual $bmp "audit-02-landing-page-hero-desktop.png"

# Mobile Landing Hero
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cSlate900)

$gM.DrawString("WORKZEN", $fSecH, $bWhite, 40, 40)
$gM.DrawString("ENTERPRISE PLATFORM", $fSmallBold, $bEmerald, 40, 120)
$gM.DrawString("Simplify Your Workflow.`nAmplify Your Impact.", $fPageH, $bWhite, 40, 150)
$gM.DrawString("Plan Smarter. Work Together. Achieve More.", $fBody, $bSlate300, 40, 240)

$pathCtaM = Create-RoundedRectangle 40 300 720 54 8
$gM.FillPath($bPrimary, $pathCtaM)
$gM.DrawString("Start Free Trial", $fBodyBold, $bWhite, 320, 316)

$pathCardM = Create-RoundedRectangle 40 400 720 720 12
$gM.FillPath($bWhite, $pathCardM)
$gM.DrawString("Active Sprint Kanban", $fSecH, $bSlate900, 70, 430)
$gM.DrawString("Real-time synchronized across teams", $fSmall, $bSlate500, 70, 465)

$gM.Dispose()
Save-Dual $bmpM "audit-02-landing-page-hero-mobile.png"

# ------------------------------------------------------------------------------
# 3. Auth Sign In Page (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cWhite)

# Left brand panel (Dark Indigo)
$pathLeft = Create-RoundedRectangle 60 40 850 1000 16
$g.FillPath($bSlate900, $pathLeft)
$g.DrawString("WORKZEN", $fSecH, $bWhite, 100, 80)
$g.DrawString("Welcome back to your workspace.", $fDisplay, $bWhite, 100, 220)
$g.DrawString("Streamline projects, track deliverables, and maintain continuous alignment with enterprise security.", $fBody, $bSlate300, 100, 360)

$checkItems = @(
    "Dedicated organization data boundaries and role permissions",
    "Real-time synchronization across distributed teams",
    "Sprint velocity tracking and interactive Kanban boards",
    "Resilient cloud infrastructure with reliable availability"
)
$y = 440
foreach ($ci in $checkItems) {
    $g.DrawString("✔ $ci", $fBody, $bEmerald, 100, $y)
    $y += 45
}
$g.DrawString("Authenticated session encryption • Enterprise role-based access", $fSmall, $bSlate400, 100, 960)

# Right Form Panel
$g.DrawString("Sign In to Workzen", $fDisplay, $bSlate900, 1020, 220)
$g.DrawString("New to Workzen? Create an account", $fBody, $bSlate500, 1020, 280)

# Form Fields
$g.DrawString("Corporate Email", $fSmallBold, $bSlate700, 1020, 340)
$pathInput1 = Create-RoundedRectangle 1020 370 700 52 8
$g.FillPath($bWhite, $pathInput1)
$g.DrawPath($pBorder, $pathInput1)
$g.DrawString("alex.morgan@company.com", $fBody, $bSlate800, 1040, 385)

$g.DrawString("Password", $fSmallBold, $bSlate700, 1020, 450)
$pathInput2 = Create-RoundedRectangle 1020 480 700 52 8
$g.FillPath($bWhite, $pathInput2)
$g.DrawPath($pBorder, $pathInput2)
$g.DrawString("••••••••••••", $fBody, $bSlate800, 1040, 495)

$pathBtn = Create-RoundedRectangle 1020 570 700 54 8
$g.FillPath($bPrimary, $pathBtn)
$g.DrawString("Sign In", $fBodyBold, $bWhite, 1340, 587)

$g.DrawString("Encrypted connection • Enterprise access management", $fSmall, $bSlate400, 1180, 660)

$g.Dispose()
Save-Dual $bmp "audit-03-auth-login-desktop.png"

# Mobile Sign In
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cWhite)

$gM.DrawString("WORKZEN", $fSecH, $bSlate900, 50, 50)
$gM.DrawString("Sign In to Workzen", $fDisplay, $bSlate900, 50, 120)
$gM.DrawString("New to Workzen? Create an account", $fBody, $bSlate500, 50, 180)

$pathInputM1 = Create-RoundedRectangle 50 250 700 54 8
$gM.DrawPath($pBorder, $pathInputM1)
$gM.DrawString("alex.morgan@company.com", $fBody, $bSlate800, 70, 267)

$pathInputM2 = Create-RoundedRectangle 50 340 700 54 8
$gM.DrawPath($pBorder, $pathInputM2)
$gM.DrawString("••••••••••••", $fBody, $bSlate800, 70, 357)

$pathBtnM = Create-RoundedRectangle 50 430 700 56 8
$gM.FillPath($bPrimary, $pathBtnM)
$gM.DrawString("Sign In", $fBodyBold, $bWhite, 360, 448)

$gM.DrawString("Encrypted connection • Enterprise access management", $fSmall, $bSlate500, 200, 520)

$gM.Dispose()
Save-Dual $bmpM "audit-03-auth-login-mobile.png"

# ------------------------------------------------------------------------------
# 4. Auth Sign Up / Register (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cWhite)

$pathLeft = Create-RoundedRectangle 60 40 850 1000 16
$g.FillPath($bSlate900, $pathLeft)
$g.DrawString("WORKZEN", $fSecH, $bWhite, 100, 80)
$g.DrawString("Start your workflow journey.", $fDisplay, $bWhite, 100, 220)
$g.DrawString("Create your organization workspace in seconds. No credit card required.", $fBody, $bSlate300, 100, 300)

$checkReg = @(
    "Comprehensive project management and Kanban views",
    "Collaborative team workspaces and real-time updates",
    "Role-based permissions and secure access control",
    "Modern, responsive interface on desktop, tablet, and mobile"
)
$y = 380
foreach ($cr in $checkReg) {
    $g.DrawString("✔ $cr", $fBody, $bEmerald, 100, $y)
    $y += 45
}
$g.DrawString("Dedicated organization boundary • Encrypted sessions • Multi-tenant privacy", $fSmall, $bSlate400, 100, 960)

# Right Register Form
$g.DrawString("Create an account", $fDisplay, $bSlate900, 1020, 160)
$g.DrawString("Already registered? Sign In", $fBody, $bSlate500, 1020, 220)

$formFields = @("Full Name", "Corporate Email", "Organization Name", "Password")
$y = 270
foreach ($ff in $formFields) {
    $g.DrawString($ff, $fSmallBold, $bSlate700, 1020, $y)
    $pathF = Create-RoundedRectangle 1020 ($y + 25) 700 50 8
    $g.DrawPath($pBorder, $pathF)
    $y += 95
}

$pathBtn = Create-RoundedRectangle 1020 670 700 54 8
$g.FillPath($bPrimary, $pathBtn)
$g.DrawString("Create Account", $fBodyBold, $bWhite, 1310, 687)
$g.DrawString("Encrypted connection • Enterprise data privacy", $fSmall, $bSlate400, 1220, 750)

$g.Dispose()
Save-Dual $bmp "audit-04-auth-register-desktop.png"

# Mobile Sign Up
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cWhite)

$gM.DrawString("WORKZEN", $fSecH, $bSlate900, 50, 50)
$gM.DrawString("Create an account", $fPageH, $bSlate900, 50, 100)
$gM.DrawString("Already registered? Sign In", $fSmall, $bSlate500, 50, 140)

$y = 190
foreach ($ff in $formFields) {
    $gM.DrawString($ff, $fSmallBold, $bSlate700, 50, $y)
    $pathF = Create-RoundedRectangle 50 ($y + 25) 700 50 8
    $gM.DrawPath($pBorder, $pathF)
    $y += 95
}
$pathBtnM = Create-RoundedRectangle 50 600 700 54 8
$gM.FillPath($bPrimary, $pathBtnM)
$gM.DrawString("Create Account", $fBodyBold, $bWhite, 320, 617)

$gM.Dispose()
Save-Dual $bmpM "audit-04-auth-register-mobile.png"

# ------------------------------------------------------------------------------
# 5. Team Management Hub (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cSlate50)

# Sidebar
$pathSide = Create-RoundedRectangle 0 0 280 1080 0
$g.FillPath($bWhite, $pathSide)
$g.DrawLine($pBorder, 280, 0, 280, 1080)
$g.DrawString("WORKZEN", $fSecH, $bSlate900, 30, 40)
$g.DrawString("Enterprise SaaS", $fSmall, $bSlate500, 30, 70)

$sideItems = @("Executive Dashboard", "Organization Hub", "Organization Settings", "Organization Members", "Roles & Permissions", "Workspace Overview", "Kanban Board", "Task Details", "Team Management", "Reports & Analytics")
$y = 130
foreach ($si in $sideItems) {
    $isActive = ($si -eq "Team Management")
    if ($isActive) {
        $pathAct = Create-RoundedRectangle 20 ($y - 5) 240 40 8
        $g.FillPath($bPrimary, $pathAct)
        $g.DrawString($si, $fSmallBold, $bWhite, 35, $y + 5)
    } else {
        $g.DrawString($si, $fSmall, $bSlate700, 35, $y + 5)
    }
    $y += 45
}

# Main Content Area
$g.DrawString("Team Management Hub", $fDisplay, $bSlate900, 330, 40)
$g.DrawString("Manage team members, multi-workspace assignments, and invitation lifecycles.", $fBody, $bSlate500, 330, 95)

$pathInviteBtn = Create-RoundedRectangle 1660 45 200 48 8
$g.FillPath($bPrimary, $pathInviteBtn)
$g.DrawString("+ Invite Member", $fSmallBold, $bWhite, 1700, 60)

# 4 Stat Cards
$statCards = @(
    @{ Label="ACTIVE MEMBERS"; Value="12"; Note="Active organization access" },
    @{ Label="PENDING INVITATIONS"; Value="3"; Note="Invitations valid for 7 days" },
    @{ Label="WORKSPACES AVAILABLE"; Value="6"; Note="Dedicated team workspaces" },
    @{ Label="SEAT ALLOCATION"; Value="12 / 50"; Note="24% organization capacity" }
)
$x = 330
foreach ($sc in $statCards) {
    $pathCard = Create-RoundedRectangle $x 150 360 120 12
    $g.FillPath($bWhite, $pathCard)
    $g.DrawPath($pBorder, $pathCard)
    
    $g.DrawString($sc.Label, $fSmallBold, $bSlate500, ($x + 20), 170)
    $g.DrawString($sc.Value, $fPageH, $bSlate900, ($x + 20), 195)
    $g.DrawString($sc.Note, $fSmall, $bSlate500, ($x + 20), 235)
    
    $x += 385
}

# Directory Table Card
$pathTable = Create-RoundedRectangle 330 300 1530 720 16
$g.FillPath($bWhite, $pathTable)
$g.DrawPath($pBorder, $pathTable)

$g.DrawString("Team Member Directory (12 Members)", $fSecH, $bSlate900, 360, 330)

# Table Header
$g.DrawLine($pBorder, 330, 380, 1860, 380)
$g.DrawString("MEMBER NAME", $fSmallBold, $bSlate500, 360, 395)
$g.DrawString("EMAIL ADDRESS", $fSmallBold, $bSlate500, 660, 395)
$g.DrawString("ORGANIZATION ROLE", $fSmallBold, $bSlate500, 1000, 395)
$g.DrawString("WORKSPACE ACCESS", $fSmallBold, $bSlate500, 1300, 395)
$g.DrawString("STATUS", $fSmallBold, $bSlate500, 1600, 395)
$g.DrawString("ACTIONS", $fSmallBold, $bSlate500, 1750, 395)
$g.DrawLine($pBorder, 330, 425, 1860, 425)

# Sample Rows
$sampleMembers = @(
    @{ Name="Alex Morgan (You)"; Email="alex@workzen.io"; Role="Owner"; WS="All 6 Workspaces"; Status="Active" },
    @{ Name="Elena Rostova"; Email="elena@workzen.io"; Role="Admin"; WS="Engineering, Product"; Status="Active" },
    @{ Name="Marcus Vance"; Email="marcus@workzen.io"; Role="Manager"; WS="Design System"; Status="Active" },
    @{ Name="Devon Chen"; Email="devon@workzen.io"; Role="Member"; WS="Frontend Core"; Status="Active" },
    @{ Name="Sarah Jenkins"; Email="sarah@workzen.io"; Role="Viewer"; WS="General"; Status="Suspended" }
)
$y = 445
foreach ($m in $sampleMembers) {
    $g.DrawString($m.Name, $fBodyBold, $bSlate800, 360, $y)
    $g.DrawString($m.Email, $fBody, $bSlate600, 660, $y)
    $g.DrawString($m.Role, $fSmallBold, $bPrimary, 1000, $y)
    $g.DrawString($m.WS, $fBody, $bSlate700, 1300, $y)
    $statusColor = if ($m.Status -eq "Active") { $bEmerald } else { $bRose }
    $g.DrawString($m.Status, $fSmallBold, $statusColor, 1600, $y)
    $g.DrawString("Manage ▾", $fSmallBold, $bSlate500, 1750, $y)
    
    $g.DrawLine($pBorder, 330, ($y + 40), 1860, ($y + 40))
    $y += 55
}

$g.Dispose()
Save-Dual $bmp "audit-05-team-management-desktop.png"

# Mobile Team Management
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cSlate50)

$pathMTop = Create-RoundedRectangle 30 30 740 100 12
$gM.FillPath($bWhite, $pathMTop)
$gM.DrawString("Team Management Hub", $fSecH, $bSlate900, 50, 50)
$gM.DrawString("12 Active Members • 3 Pending Invitations", $fSmall, $bSlate500, 50, 85)

$yM = 150
foreach ($m in $sampleMembers[0..3]) {
    $pathMCard = Create-RoundedRectangle 30 $yM 740 130 12
    $gM.FillPath($bWhite, $pathMCard)
    $gM.DrawPath($pBorder, $pathMCard)
    
    $gM.DrawString($m.Name, $fCardH, $bSlate900, 50, ($yM + 20))
    $gM.DrawString($m.Email, $fSmall, $bSlate500, 50, ($yM + 50))
    $gM.DrawString("Role: $($m.Role) • $($m.WS)", $fSmallBold, $bPrimary, 50, ($yM + 80))
    
    $yM += 150
}

$gM.Dispose()
Save-Dual $bmpM "audit-05-team-management-mobile.png"

# ------------------------------------------------------------------------------
# 6. Roles & Permissions Management (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cSlate50)

# Header
$pathTop = Create-RoundedRectangle 60 40 1800 120 16
$g.FillPath($bWhite, $pathTop)
$g.DrawPath($pBorder, $pathTop)

$g.DrawString("Roles & Permissions Management", $fDisplay, $bSlate900, 90, 60)
$g.DrawString("ACCESS GOVERNANCE", $fSmallBold, $bPrimary, 800, 75)
$g.DrawString("Define granular action permissions, enforce delegation boundaries, and govern access for your organization.", $fBody, $bSlate500, 90, 115)

# Role Cards Grid
$roles = @(
    @{ Name="Owner"; Desc="Full authority across all organization settings, billing, and membership"; Members="1 Active Owner"; System="System Role" },
    @{ Name="Admin"; Desc="Can manage members, assign roles, configure workspaces, and inspect logs"; Members="2 Administrators"; System="System Role" },
    @{ Name="Manager"; Desc="Can orchestrate projects, manage workspace assignments, and invite members"; Members="3 Managers"; System="System Role" },
    @{ Name="Member"; Desc="Standard team contributor with full task editing and project collaboration"; Members="6 Members"; System="System Role" }
)
$x = 60
foreach ($r in $roles) {
    $pathR = Create-RoundedRectangle $x 190 425 240 16
    $g.FillPath($bWhite, $pathR)
    $g.DrawPath($pBorder, $pathR)
    
    $g.DrawString($r.Name, $fSecH, $bSlate900, ($x + 25), 215)
    $g.DrawString($r.System, $fSmallBold, $bSlate500, ($x + 300), 220)
    $g.DrawString($r.Desc, $fSmall, $bSlate600, ($x + 25), 260)
    $g.DrawString($r.Members, $fSmallBold, $bPrimary, ($x + 25), 380)
    
    $x += 455
}

# Audit Trail Panel
$pathAudit = Create-RoundedRectangle 60 460 1800 560 16
$g.FillPath($bWhite, $pathAudit)
$g.DrawPath($pBorder, $pathAudit)

$g.DrawString("Role & Permission Audit Trail", $fSecH, $bSlate900, 90, 490)
$g.DrawString("Immutable record of role definitions, updates, member delegations, and access changes.", $fSmall, $bSlate500, 90, 525)

$auditEvents = @(
    @{ Action="member:role_updated"; Actor="alex@workzen.io"; Target="elena@workzen.io (Promoted to Admin)"; Time="2 hours ago" },
    @{ Action="invitation:sent"; Actor="alex@workzen.io"; Target="marcus@workzen.io (Invited as Manager)"; Time="4 hours ago" },
    @{ Action="workspace:access_granted"; Actor="elena@workzen.io"; Target="devon@workzen.io (Frontend Core)"; Time="1 day ago" }
)
$y = 570
foreach ($ae in $auditEvents) {
    $g.DrawString($ae.Action, $fMono, $bPrimary, 90, $y)
    $g.DrawString($ae.Actor, $fSmall, $bSlate600, 360, $y)
    $g.DrawString($ae.Target, $fSmallBold, $bSlate800, 600, $y)
    $g.DrawString($ae.Time, $fSmall, $bSlate400, 1600, $y)
    $g.DrawLine($pBorder, 90, ($y + 35), 1800, ($y + 35))
    $y += 50
}

$g.Dispose()
Save-Dual $bmp "audit-06-roles-permissions-desktop.png"

# Mobile Roles & Permissions
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cSlate50)

$pathMTop = Create-RoundedRectangle 30 30 740 100 12
$gM.FillPath($bWhite, $pathMTop)
$gM.DrawString("Roles & Permissions", $fSecH, $bSlate900, 50, 50)
$gM.DrawString("Access Governance & Audit", $fSmall, $bSlate500, 50, 85)

$yM = 150
foreach ($r in $roles) {
    $pathMCard = Create-RoundedRectangle 30 $yM 740 120 12
    $gM.FillPath($bWhite, $pathMCard)
    $gM.DrawPath($pBorder, $pathMCard)
    
    $gM.DrawString($r.Name, $fCardH, $bSlate900, 50, ($yM + 20))
    $gM.DrawString($r.Desc, $fSmall, $bSlate600, 50, ($yM + 50))
    $gM.DrawString($r.Members, $fSmallBold, $bPrimary, 50, ($yM + 85))
    
    $yM += 140
}

$gM.Dispose()
Save-Dual $bmpM "audit-06-roles-permissions-mobile.png"

# ------------------------------------------------------------------------------
# 7. Executive Dashboard Overview (Desktop & Mobile)
# ------------------------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cSlate50)

# Header Banner
$pathTop = Create-RoundedRectangle 60 40 1800 120 16
$g.FillPath($bSlate900, $pathTop)
$g.DrawString("ENTERPRISE EXECUTIVE HUB • GLOBAL", $fSmallBold, $bEmerald, 90, 65)
$g.DrawString("Acme Enterprise Executive Hub", $fDisplay, $bWhite, 90, 90)

# Metric Cards
$execMetrics = @(
    @{ Title="Active Projects"; Stat="14"; Sub="Sprint 14 in progress" },
    @{ Title="Completion Velocity"; Stat="88%"; Sub="Task deliverables on schedule" },
    @{ Title="Data Privacy & Security"; Stat="Protected"; Sub="Dedicated organization boundary" },
    @{ Title="Team Capacity"; Stat="12 Seats"; Sub="All active members verified" }
)
$x = 60
foreach ($em in $execMetrics) {
    $pathM = Create-RoundedRectangle $x 190 425 140 16
    $g.FillPath($bWhite, $pathM)
    $g.DrawPath($pBorder, $pathM)
    
    $g.DrawString($em.Title, $fSmallBold, $bSlate500, ($x + 25), 215)
    $g.DrawString($em.Stat, $fDisplay, $bSlate900, ($x + 25), 240)
    $g.DrawString($em.Sub, $fSmall, $bSlate500, ($x + 25), 295)
    
    $x += 455
}

# Burndown & Milestone Chart Preview
$pathChart = Create-RoundedRectangle 60 360 1180 660 16
$g.FillPath($bWhite, $pathChart)
$g.DrawPath($pBorder, $pathChart)
$g.DrawString("Sprint Burndown Velocity & Progress", $fSecH, $bSlate900, 90, 390)
$g.DrawString("Continuous real-time calculation based on completed tasks across all workspaces.", $fSmall, $bSlate500, 90, 425)

# Security Status Card
$pathSec = Create-RoundedRectangle 1270 360 590 660 16
$g.FillPath($bWhite, $pathSec)
$g.DrawPath($pBorder, $pathSec)
$g.DrawString("Security & Compliance Status", $fSecH, $bSlate900, 1300, 390)

$secItems = @(
    @{ Item="Data Protection Status"; Status="Verified Active" },
    @{ Item="Multi-Tenant Isolation"; Status="Enforced" },
    @{ Item="Session Encryption"; Status="Active" },
    @{ Item="Audit Log Trail"; Status="Retaining 365 Days" }
)
$y = 450
foreach ($si in $secItems) {
    $g.DrawString($si.Item, $fBodyBold, $bSlate800, 1300, $y)
    $g.DrawString($si.Status, $fSmallBold, $bEmerald, 1650, $y)
    $g.DrawLine($pBorder, 1300, ($y + 35), 1810, ($y + 35))
    $y += 50
}

$g.Dispose()
Save-Dual $bmp "audit-07-executive-dashboard-desktop.png"

# Mobile Executive Dashboard
$bmpM = New-Object System.Drawing.Bitmap(800, 1200)
$gM = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gM.Clear($cSlate50)

$pathMTop = Create-RoundedRectangle 30 30 740 100 12
$gM.FillPath($bSlate900, $pathMTop)
$gM.DrawString("EXECUTIVE DASHBOARD", $fSmallBold, $bEmerald, 50, 48)
$gM.DrawString("Acme Enterprise Hub", $fSecH, $bWhite, 50, 72)

$yM = 150
foreach ($em in $execMetrics) {
    $pathMCard = Create-RoundedRectangle 30 $yM 740 120 12
    $gM.FillPath($bWhite, $pathMCard)
    $gM.DrawPath($pBorder, $pathMCard)
    
    $gM.DrawString($em.Title, $fSmallBold, $bSlate500, 50, ($yM + 20))
    $gM.DrawString($em.Stat, $fPageH, $bSlate900, 50, ($yM + 45))
    $gM.DrawString($em.Sub, $fSmall, $bSlate500, 50, ($yM + 85))
    
    $yM += 140
}

$gM.Dispose()
Save-Dual $bmpM "audit-07-executive-dashboard-mobile.png"

Write-Host "Generated all 7 Desktop + 7 Mobile Prototypes and Screenshots in docs/design/typography-copy-audit/!" -ForegroundColor Green

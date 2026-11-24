# ==============================================================================
# WORKZEN — Enterprise SaaS Design System Screenshot Generator
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\docs\design\screenshots"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

function Create-RoundedRectangle($x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

$cIndigo = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cIndigoLight = [System.Drawing.ColorTranslator]::FromHtml("#EEF2FF")
$cDark = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cSlate50 = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cSlate100 = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cBorder = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cTextSec = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cSuccess = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cWarning = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cDanger = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cWhite = [System.Drawing.Color]::White

$brushWhite = New-Object System.Drawing.SolidBrush($cWhite)
$brushDark = New-Object System.Drawing.SolidBrush($cDark)
$brushIndigo = New-Object System.Drawing.SolidBrush($cIndigo)
$brushMuted = New-Object System.Drawing.SolidBrush($cTextSec)
$brushSuccess = New-Object System.Drawing.SolidBrush($cSuccess)
$brushWarning = New-Object System.Drawing.SolidBrush($cWarning)
$brushDanger = New-Object System.Drawing.SolidBrush($cDanger)
$penBorder = New-Object System.Drawing.Pen($cBorder, 1)

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
$fontH2 = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 7, [System.Drawing.FontStyle]::Bold)

# ------------------------------------------------------------------------------
# 1. Desktop Renderer Helper
# ------------------------------------------------------------------------------
function Render-DesktopScreen($filename, $screenTitle, $category, $drawContentAction) {
    $bmp = New-Object System.Drawing.Bitmap(1280, 800)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $g.Clear($cSlate50)

    # Sidebar
    $g.FillRectangle($brushWhite, 0, 0, 250, 800)
    $g.DrawLine($penBorder, 250, 0, 250, 800)

    # Brand in Sidebar
    $logoPath = Create-RoundedRectangle 24 22 32 32 8
    $g.FillPath($brushIndigo, $logoPath)
    $fontLogo = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("W", $fontLogo, $brushWhite, 31, 26)
    $g.DrawString("WORKZEN", $fontLogo, $brushDark, 66, 24)
    $g.DrawString("Enterprise SaaS", $fontSmall, $brushMuted, 68, 42)

    # Nav items
    $navY = 90
    $navItems = @("Executive Dashboard", "Organisation Hub", "Workspace Overview", "Project Portfolio", "Kanban Board", "Task Deep Dive", "Team Directory", "Sprint Calendar", "Reports & Velocity", "Notification Centre", "Settings & Security")
    foreach ($item in $navItems) {
        $isActive = ($item -like "*$category*" -or ($navY -eq 90 -and $category -eq "Executive"))
        if ($isActive) {
            $navPath = Create-RoundedRectangle 16 $navY 218 36 6
            $g.FillPath((New-Object System.Drawing.SolidBrush($cIndigoLight)), $navPath)
            $g.DrawString($item, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushIndigo, 36, ($navY + 8))
        } else {
            $g.DrawString($item, $fontBody, $brushMuted, 36, ($navY + 8))
        }
        $navY += 42
    }

    # Top Header
    $g.FillRectangle($brushWhite, 250, 0, 1030, 64)
    $g.DrawLine($penBorder, 250, 64, 1280, 64)

    $g.DrawString("Workzen / Acme Global Enterprises / Engineering", $fontSmall, $brushMuted, 275, 14)
    $g.DrawString($screenTitle, $fontH2, $brushDark, 275, 30)

    # Search bar & user avatar
    $searchPath = Create-RoundedRectangle 850 16 220 32 16
    $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $searchPath)
    $g.DrawString("Search anything... (Ctrl+K)", $fontSmall, $brushMuted, 870, 24)

    $userAvatar = Create-RoundedRectangle 1210 16 32 32 16
    $g.FillPath($brushIndigo, $userAvatar)
    $g.DrawString("AC", $fontBadge, $brushWhite, 1218, 24)

    # Content Area
    & $drawContentAction $g 275 85 980 690

    # Save
    $fullPath = Join-Path $outputDir $filename
    $bmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created Desktop Screen: $filename"
}

# ------------------------------------------------------------------------------
# 2. Mobile Renderer Helper
# ------------------------------------------------------------------------------
function Render-MobileScreen($filename, $screenTitle, $drawContentAction) {
    $bmp = New-Object System.Drawing.Bitmap(400, 820)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $g.Clear($cSlate50)

    # Status Bar
    $g.DrawString("9:41", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, 24, 10)
    $g.DrawString("5G  100%", $fontSmall, $brushMuted, 330, 10)

    # Mobile Header
    $g.FillRectangle($brushWhite, 0, 36, 400, 56)
    $g.DrawLine($penBorder, 0, 92, 400, 92)

    $logoPath = Create-RoundedRectangle 18 46 34 34 8
    $g.FillPath($brushIndigo, $logoPath)
    $g.DrawString("W", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), $brushWhite, 26, 51)
    $g.DrawString($screenTitle, (New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)), $brushDark, 62, 54)

    # Content Area
    & $drawContentAction $g 18 106 364 640

    # Mobile Bottom Bar
    $g.FillRectangle($brushWhite, 0, 756, 400, 64)
    $g.DrawLine($penBorder, 0, 756, 400, 756)

    $g.DrawString("Home", $fontBadge, $brushIndigo, 36, 792)
    $g.DrawString("Board", $fontBadge, $brushMuted, 114, 792)
    $plusBtn = Create-RoundedRectangle 175 740 50 50 25
    $g.FillPath($brushIndigo, $plusBtn)
    $g.DrawString("+", (New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)), $brushWhite, 191, 746)
    $g.DrawString("Reports", $fontBadge, $brushMuted, 260, 792)
    $g.DrawString("Team", $fontBadge, $brushMuted, 336, 792)

    $fullPath = Join-Path $outputDir $filename
    $bmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created Mobile Screen: $filename"
}

# ------------------------------------------------------------------------------
# 1. Landing Page
# ------------------------------------------------------------------------------
Render-DesktopScreen "landing-page-desktop.png" "Workzen Official Website" "Public" {
    param($g, $x, $y, $w, $h)
    $rect = [System.Drawing.Rectangle]::new([int]$x, [int]$y, [int]$w, [int]260)
    $heroGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml("#1E1B4B")), ([System.Drawing.ColorTranslator]::FromHtml("#4338CA")), 45
    $heroPath = Create-RoundedRectangle $x $y $w 260 14
    $g.FillPath($heroGrad, $heroPath)

    $g.DrawString("WORKZEN ENTERPRISE SAAS 1.0", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#A5B4FC"))), ($x + 40), ($y + 35))
    $g.DrawString("Plan Smarter. Work Together.", (New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($x + 40), ($y + 60))
    $g.DrawString("Achieve More.", (New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))), ($x + 40), ($y + 100))
    $g.DrawString("The unified enterprise project management platform designed for modern scaling organizations.", (New-Object System.Drawing.Font("Segoe UI", 11)), (New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#E0E7FF"))), ($x + 40), ($y + 150))

    $btnCta = Create-RoundedRectangle ($x + 40) ($y + 195) 190 42 8
    $g.FillPath($brushIndigo, $btnCta)
    $g.DrawString("Start 14-Day Free Trial", (New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($x + 60), ($y + 206))

    # Feature Cards
    $cardW = ($w - 30) / 3
    $featTitles = @("Real-time Kanban & Sprints", "Multi-Tenant Isolation", "Global Stripe & Paystack")
    for ($i = 0; $i -lt 3; $i++) {
        $cx = $x + ($i * ($cardW + 15))
        $cy = $y + 285
        $cPath = Create-RoundedRectangle $cx $cy $cardW 200 10
        $g.FillPath($brushWhite, $cPath)
        $g.DrawPath($penBorder, $cPath)
        $g.DrawString($featTitles[$i], (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), $brushDark, ($cx + 20), ($cy + 25))
        $g.DrawString("Enterprise-ready architecture with verified tenant boundary isolation and instant synchronization.", $fontBody, $brushMuted, ($cx + 20), ($cy + 60))
    }
}

Render-MobileScreen "landing-page-mobile.png" "Workzen SaaS" {
    param($g, $x, $y, $w, $h)
    $rect = [System.Drawing.Rectangle]::new([int]$x, [int]$y, [int]$w, [int]200)
    $heroGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml("#1E1B4B")), ([System.Drawing.ColorTranslator]::FromHtml("#4338CA")), 45
    $heroPath = Create-RoundedRectangle $x $y $w 200 12
    $g.FillPath($heroGrad, $heroPath)

    $g.DrawString("Plan Smarter.", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($x + 20), ($y + 30))
    $g.DrawString("Work Together.", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#38BDF8"))), ($x + 20), ($y + 60))
    $g.DrawString("Unified enterprise project workspace.", (New-Object System.Drawing.Font("Segoe UI", 9)), (New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#E0E7FF"))), ($x + 20), ($y + 95))

    $btn = Create-RoundedRectangle ($x + 20) ($y + 135) 160 38 6
    $g.FillPath($brushIndigo, $btn)
    $g.DrawString("Start Free Trial", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($x + 45), ($y + 146))

    $cPath = Create-RoundedRectangle $x ($y + 220) $w 120 10
    $g.FillPath($brushWhite, $cPath)
    $g.DrawPath($penBorder, $cPath)
    $g.DrawString("Real-time Sprints", $fontH2, $brushDark, ($x + 16), ($y + 236))
    $g.DrawString("Bi-directional Socket.IO updates across all team boards.", $fontBody, $brushMuted, ($x + 16), ($y + 265))
}

# 2. Login Page
Render-DesktopScreen "login-desktop.png" "Sign In Portal" "Auth" {
    param($g, $x, $y, $w, $h)
    $boxW = 460
    $boxH = 480
    $bx = $x + (($w - $boxW) / 2)
    $by = $y + 40
    $boxPath = Create-RoundedRectangle $bx $by $boxW $boxH 12
    $g.FillPath($brushWhite, $boxPath)
    $g.DrawPath($penBorder, $boxPath)

    $g.DrawString("Sign In to Workzen", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), $brushDark, ($bx + 40), ($by + 40))
    $g.DrawString("Enter your corporate credentials to access tenant workspace", $fontBody, $brushMuted, ($bx + 40), ($by + 72))

    $g.DrawString("Corporate Email", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($bx + 40), ($by + 120))
    $f1 = Create-RoundedRectangle ($bx + 40) ($by + 142) 380 40 6
    $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $f1)
    $g.DrawPath($penBorder, $f1)
    $g.DrawString("alex.chen@workzen.io", $fontBody, $brushDark, ($bx + 52), ($by + 152))

    $g.DrawString("Password", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($bx + 40), ($by + 200))
    $f2 = Create-RoundedRectangle ($bx + 40) ($by + 222) 380 40 6
    $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $f2)
    $g.DrawPath($penBorder, $f2)
    $g.DrawString("••••••••••••••••", $fontBody, $brushDark, ($bx + 52), ($by + 232))

    $btn = Create-RoundedRectangle ($bx + 40) ($by + 290) 380 44 8
    $g.FillPath($brushIndigo, $btn)
    $g.DrawString("Continue to Verification (OTP)", (New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($bx + 120), ($by + 302))

    $otpBox = Create-RoundedRectangle ($bx + 40) ($by + 360) 380 70 8
    $g.FillPath((New-Object System.Drawing.SolidBrush($cIndigoLight)), $otpBox)
    $g.DrawString("Two-Factor Authentication Active", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($bx + 55), ($by + 375))
    $g.DrawString("Protected by 6-digit cryptographic email OTP code", $fontSmall, $brushMuted, ($bx + 55), ($by + 395))
}

Render-MobileScreen "login-mobile.png" "Sign In" {
    param($g, $x, $y, $w, $h)
    $boxPath = Create-RoundedRectangle $x $y $w 420 10
    $g.FillPath($brushWhite, $boxPath)
    $g.DrawPath($penBorder, $boxPath)

    $g.DrawString("Sign In", (New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)), $brushDark, ($x + 20), ($y + 25))
    $g.DrawString("Email", $fontSmall, $brushMuted, ($x + 20), ($y + 60))
    $f1 = Create-RoundedRectangle ($x + 20) ($y + 78) ($w - 40) 38 6
    $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $f1)
    $g.DrawString("alex.chen@workzen.io", $fontSmall, $brushDark, ($x + 30), ($y + 88))

    $g.DrawString("Password", $fontSmall, $brushMuted, ($x + 20), ($y + 130))
    $f2 = Create-RoundedRectangle ($x + 20) ($y + 148) ($w - 40) 38 6
    $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $f2)
    $g.DrawString("••••••••••", $fontSmall, $brushDark, ($x + 30), ($y + 158))

    $btn = Create-RoundedRectangle ($x + 20) ($y + 210) ($w - 40) 42 6
    $g.FillPath($brushIndigo, $btn)
    $g.DrawString("Sign In to Workzen", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($x + 100), ($y + 222))
}

# 3. Registration Page
Render-DesktopScreen "registration-desktop.png" "Register New Organisation" "Auth" {
    param($g, $x, $y, $w, $h)
    $boxW = 540
    $boxH = 520
    $bx = $x + (($w - $boxW) / 2)
    $by = $y + 20
    $boxPath = Create-RoundedRectangle $bx $by $boxW $boxH 12
    $g.FillPath($brushWhite, $boxPath)
    $g.DrawPath($penBorder, $boxPath)

    $g.DrawString("Create Your Workzen Tenant", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), $brushDark, ($bx + 40), ($by + 35))
    $g.DrawString("14-Day Enterprise Trial with isolated database and unlimited workspaces", $fontBody, $brushMuted, ($bx + 40), ($by + 65))

    $fields = @("First Name", "Last Name", "Corporate Email Address", "Password", "Organisation Name (e.g. Acme Corp)", "Initial Workspace Name")
    $fy = $by + 110
    foreach ($f in $fields) {
        $g.DrawString($f, $fontSmall, $brushMuted, ($bx + 40), $fy)
        $fBox = Create-RoundedRectangle ($bx + 40) ($fy + 18) 460 34 6
        $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $fBox)
        $g.DrawPath($penBorder, $fBox)
        $fy += 60
    }

    $btn = Create-RoundedRectangle ($bx + 40) ($by + 475) 460 40 8
    $g.FillPath($brushIndigo, $btn)
    $g.DrawString("Provision Tenant & Start Free Trial", (New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)), $brushWhite, ($bx + 140), ($by + 485))
}

Render-MobileScreen "registration-mobile.png" "Register" {
    param($g, $x, $y, $w, $h)
    $boxPath = Create-RoundedRectangle $x $y $w 480 10
    $g.FillPath($brushWhite, $boxPath)
    $g.DrawPath($penBorder, $boxPath)
    $g.DrawString("Get Started Free", $fontH2, $brushDark, ($x + 16), ($y + 20))
    $g.DrawString("Organisation Setup", $fontSmall, $brushMuted, ($x + 16), ($y + 44))

    $fields = @("Work Email", "Password", "Organisation Name", "Workspace")
    $fy = $y + 70
    foreach ($f in $fields) {
        $g.DrawString($f, $fontSmall, $brushMuted, ($x + 16), $fy)
        $fb = Create-RoundedRectangle ($x + 16) ($fy + 18) ($w - 32) 36 6
        $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $fb)
        $fy += 66
    }
}

# 4. Enterprise Dashboard
Render-DesktopScreen "dashboard-desktop.png" "Executive Telemetry Dashboard" "Executive" {
    param($g, $x, $y, $w, $h)
    $statW = ($w - 45) / 4
    $statData = @(
        @{ Label="Total Tracked Tasks"; Val="54"; Delta="+5 this week"; Trend="up" },
        @{ Label="Completed Work"; Val="31"; Delta="+12% velocity"; Trend="up" },
        @{ Label="Active In Progress"; Val="14"; Delta="+3 new"; Trend="neutral" },
        @{ Label="Sprint Velocity"; Val="87.4%"; Delta="+4.2% SLA"; Trend="up" }
    )

    for ($i = 0; $i -lt 4; $i++) {
        $sx = $x + ($i * ($statW + 15))
        $sPath = Create-RoundedRectangle $sx $y $statW 95 8
        $g.FillPath($brushWhite, $sPath)
        $g.DrawPath($penBorder, $sPath)

        $d = $statData[$i]
        $g.DrawString($d.Label, $fontSmall, $brushMuted, ($sx + 14), ($y + 14))
        $g.DrawString($d.Val, (New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)), $brushDark, ($sx + 14), ($y + 32))
        $g.DrawString($d.Delta, $fontSmall, $brushSuccess, ($sx + 14), ($y + 68))
    }

    $chartW = 620
    $chartH = 260
    $cPath = Create-RoundedRectangle $x ($y + 115) $chartW $chartH 10
    $g.FillPath($brushWhite, $cPath)
    $g.DrawPath($penBorder, $cPath)
    $g.DrawString("Weekly Velocity & Throughput", $fontH2, $brushDark, ($x + 20), ($y + 130))

    $penWave = New-Object System.Drawing.Pen($cIndigo, 3)
    $points = @(
        (New-Object System.Drawing.Point ($x + 30), ($y + 320)),
        (New-Object System.Drawing.Point ($x + 130), ($y + 240)),
        (New-Object System.Drawing.Point ($x + 240), ($y + 270)),
        (New-Object System.Drawing.Point ($x + 360), ($y + 180)),
        (New-Object System.Drawing.Point ($x + 480), ($y + 210)),
        (New-Object System.Drawing.Point ($x + 590), ($y + 190))
    )
    $g.DrawCurve($penWave, $points)

    $workW = $w - $chartW - 20
    $wPath = Create-RoundedRectangle ($x + $chartW + 20) ($y + 115) $workW $chartH 10
    $g.FillPath($brushWhite, $wPath)
    $g.DrawPath($penBorder, $wPath)
    $g.DrawString("Team Workload", $fontH2, $brushDark, ($x + $chartW + 40), ($y + 130))

    $members = @("Alex Chen (Staff)", "Sarah Jenkins (Security)", "Marcus Vance (Cloud)", "Elena Rostova (Frontend)")
    $my = $y + 165
    foreach ($m in $members) {
        $g.DrawString($m, $fontBody, $brushDark, ($x + $chartW + 40), $my)
        $progPath = Create-RoundedRectangle ($x + $chartW + 40) ($my + 20) 220 6 3
        $g.FillPath((New-Object System.Drawing.SolidBrush($cIndigoLight)), $progPath)
        $progFill = Create-RoundedRectangle ($x + $chartW + 40) ($my + 20) 160 6 3
        $g.FillPath($brushIndigo, $progFill)
        $my += 48
    }

    $tabY = $y + 395
    $tabH = 260
    $tPath = Create-RoundedRectangle $x $tabY $w $tabH 10
    $g.FillPath($brushWhite, $tPath)
    $g.DrawPath($penBorder, $tPath)
    $g.DrawString("Active Project Sprint Tasks", $fontH2, $brushDark, ($x + 20), ($tabY + 16))

    $tasks = @(
        @{ Key="CCA-101"; Title="Migrate socket clustering to Redis streams adapter"; Status="In Progress"; Pri="Urgent"; Date="Nov 18" },
        @{ Key="CCA-102"; Title="Audit tenant isolation query middleware filters"; Status="In Review"; Pri="High"; Date="Nov 14" },
        @{ Key="CCA-103"; Title="Build accessible design system tokens and components"; Status="Done"; Pri="High"; Date="Nov 11" },
        @{ Key="CCA-104"; Title="Configure Stripe and Paystack webhook reconciliation"; Status="To Do"; Pri="Medium"; Date="Nov 22" }
    )
    $ty = $tabY + 52
    foreach ($t in $tasks) {
        $g.DrawString($t.Key, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + 20), $ty)
        $g.DrawString($t.Title, $fontBody, $brushDark, ($x + 100), $ty)
        $g.DrawString($t.Status, $fontSmall, $brushMuted, ($x + 650), $ty)
        $g.DrawString($t.Pri, $fontSmall, $brushDanger, ($x + 780), $ty)
        $g.DrawString($t.Date, $fontSmall, $brushMuted, ($x + 890), $ty)
        $g.DrawLine((New-Object System.Drawing.Pen($cSlate100, 1)), ($x + 20), ($ty + 28), ($x + $w - 20), ($ty + 28))
        $ty += 38
    }
}

Render-MobileScreen "dashboard-mobile.png" "Workzen" {
    param($g, $x, $y, $w, $h)
    $cardPath = Create-RoundedRectangle $x $y $w 80 8
    $g.FillPath($brushWhite, $cardPath)
    $g.DrawPath($penBorder, $cardPath)
    $g.DrawString("Active Sprint Velocity", $fontSmall, $brushMuted, ($x + 14), ($y + 12))
    $g.DrawString("87.4% Completed", $fontH2, $brushDark, ($x + 14), ($y + 30))
    $g.DrawString("31 of 54 deliverables completed", $fontSmall, $brushSuccess, ($x + 14), ($y + 54))

    $my = $y + 96
    $mobileTasks = @(
        @{ Key="CCA-101"; Title="Migrate socket clustering to Redis"; Pri="Urgent" },
        @{ Key="CCA-102"; Title="Audit tenant isolation queries"; Pri="High" },
        @{ Key="CCA-103"; Title="Accessible design system tokens"; Pri="Done" },
        @{ Key="CCA-104"; Title="Stripe and Paystack webhook sync"; Pri="Medium" }
    )
    foreach ($mt in $mobileTasks) {
        $c = Create-RoundedRectangle $x $my $w 70 8
        $g.FillPath($brushWhite, $c)
        $g.DrawPath($penBorder, $c)
        $g.DrawString($mt.Key, (New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + 12), ($my + 10))
        $g.DrawString($mt.Title, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($x + 12), ($my + 28))
        $g.DrawString($mt.Pri, $fontSmall, $brushMuted, ($x + 12), ($my + 48))
        $my += 80
    }
}

# 5. Kanban Board
Render-DesktopScreen "kanban-desktop.png" "Sprint 14 Kanban Workflow" "Kanban" {
    param($g, $x, $y, $w, $h)
    $cols = @("Backlog (1)", "To Do (2)", "In Progress (3)", "Review (1)", "Done (4)")
    $colW = ($w - 40) / 5

    for ($i = 0; $i -lt 5; $i++) {
        $cx = $x + ($i * ($colW + 10))
        $colPath = Create-RoundedRectangle $cx $y $colW ($h - 20) 8
        $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $colPath)
        $g.DrawString($cols[$i], (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($cx + 12), ($y + 12))

        for ($j = 0; $j -lt 2; $j++) {
            $cardY = $y + 44 + ($j * 110)
            $c = Create-RoundedRectangle ($cx + 8) $cardY ($colW - 16) 96 6
            $g.FillPath($brushWhite, $c)
            $g.DrawPath($penBorder, $c)
            $g.DrawString("CCA-10$($i*2 + $j + 1)", $fontBadge, $brushIndigo, ($cx + 16), ($cardY + 10))
            $g.DrawString("Refactor service module layer #$j", (New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)), $brushDark, ($cx + 16), ($cardY + 26))
            $g.DrawString("Tenant boundary isolation verified", $fontSmall, $brushMuted, ($cx + 16), ($cardY + 54))
        }
    }
}

Render-MobileScreen "kanban-mobile.png" "Kanban Board" {
    param($g, $x, $y, $w, $h)
    $g.DrawString("Sprint 14 &bull; In Progress (3)", $fontH2, $brushDark, $x, $y)
    $my = $y + 30
    for ($i = 1; $i -le 3; $i++) {
        $c = Create-RoundedRectangle $x $my $w 100 8
        $g.FillPath($brushWhite, $c)
        $g.DrawPath($penBorder, $c)
        $g.DrawString("CCA-10$i", $fontBadge, $brushIndigo, ($x + 14), ($my + 12))
        $g.DrawString("Feature Delivery & Sync Gateway #$i", (New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)), $brushDark, ($x + 14), ($my + 30))
        $g.DrawString("Assignee: Alex Chen &bull; Due Nov 18", $fontSmall, $brushMuted, ($x + 14), ($my + 68))
        $my += 114
    }
}

# 6. Project Overview
Render-DesktopScreen "project-overview-desktop.png" "Core Cloud Architecture (CCA)" "Project" {
    param($g, $x, $y, $w, $h)
    $pHead = Create-RoundedRectangle $x $y $w 120 10
    $g.FillPath($brushWhite, $pHead)
    $g.DrawPath($penBorder, $pHead)

    $g.DrawString("CCA", (New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + 20), ($y + 20))
    $g.DrawString("Core Cloud Architecture & Distributed Bus", $fontTitle, $brushDark, ($x + 75), ($y + 16))
    $g.DrawString("Lead: Alex Chen &bull; Timeline: Oct 01, 2026 - Dec 15, 2026 &bull; Priority: Urgent", $fontBody, $brushMuted, ($x + 75), ($y + 50))
    $g.DrawString("Sprint Progress: 58% (31/54 tasks completed)", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushSuccess, ($x + 75), ($y + 75))

    $mY = $y + 140
    $mPath = Create-RoundedRectangle $x $mY $w 360 10
    $g.FillPath($brushWhite, $mPath)
    $g.DrawPath($penBorder, $mPath)
    $g.DrawString("Project Roadmap Milestones", $fontH2, $brushDark, ($x + 24), ($mY + 20))

    $milestones = @(
        "M1: Multi-Tenant Architecture & Schemas (Completed)",
        "M2: Real-time Socket.IO Sync & Kanban (In Progress)",
        "M3: Stripe & Paystack Webhook Reconciliation (Upcoming)",
        "M4: Enterprise Zero-Trust Audit Logs (Upcoming)"
    )
    $my = $mY + 60
    foreach ($ms in $milestones) {
        $g.DrawString($ms, $fontBody, $brushDark, ($x + 30), $my)
        $g.DrawLine((New-Object System.Drawing.Pen($cSlate100, 1)), ($x + 24), ($my + 28), ($x + $w - 24), ($my + 28))
        $my += 44
    }
}

Render-MobileScreen "project-overview-mobile.png" "Project Overview" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 120 8
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Core Cloud Architecture", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("Sprint 14 Active &bull; 58% Complete", $fontSmall, $brushSuccess, ($x + 14), ($y + 44))
    $g.DrawString("Lead: Alex Chen", $fontSmall, $brushMuted, ($x + 14), ($y + 72))
}

# 7. Task Details
Render-DesktopScreen "task-details-desktop.png" "Task Details: CCA-101" "Task" {
    param($g, $x, $y, $w, $h)
    $leftW = 620
    $lPath = Create-RoundedRectangle $x $y $leftW 480 10
    $g.FillPath($brushWhite, $lPath)
    $g.DrawPath($penBorder, $lPath)

    $g.DrawString("CCA-101", $fontBadge, $brushIndigo, ($x + 24), ($y + 24))
    $g.DrawString("Migrate socket clustering to Redis streams adapter", $fontH2, $brushDark, ($x + 24), ($y + 44))
    $g.DrawString("Description", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushMuted, ($x + 24), ($y + 80))
    $g.DrawString("Configure multi-node Socket.IO redis streams adapter to synchronize real-time board updates across horizontal worker pods without packet loss.", $fontBody, $brushDark, ($x + 24), ($y + 104))

    $g.DrawString("Subtasks (2/4 Completed)", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushMuted, ($x + 24), ($y + 160))
    $subs = @("[X] Install and configure @socket.io/redis-adapter", "[X] Implement cluster connection retries with backoff", "[ ] Write load test script simulating 5,000 sockets", "[ ] Deploy staging container and monitor CPU spikes")
    $sy = $y + 188
    foreach ($sub in $subs) {
        $g.DrawString($sub, $fontBody, $brushDark, ($x + 30), $sy)
        $sy += 26
    }

    $rightX = $x + $leftW + 20
    $rightW = $w - $leftW - 20
    $rPath = Create-RoundedRectangle $rightX $y $rightW 480 10
    $g.FillPath($brushWhite, $rPath)
    $g.DrawPath($penBorder, $rPath)
    $g.DrawString("Task Properties", $fontH2, $brushDark, ($rightX + 20), ($y + 24))
    $g.DrawString("Status: In Progress", $fontBody, $brushIndigo, ($rightX + 20), ($y + 60))
    $g.DrawString("Priority: Urgent", $fontBody, $brushDanger, ($rightX + 20), ($y + 90))
    $g.DrawString("Assignees: Alex Chen, Marcus Vance", $fontBody, $brushDark, ($rightX + 20), ($y + 120))
    $g.DrawString("Due Date: Nov 18, 2026", $fontBody, $brushDark, ($rightX + 20), ($y + 150))
    $g.DrawString("Time Logged: 9h / 16h estimated", $fontBody, $brushSuccess, ($rightX + 20), ($y + 180))
}

Render-MobileScreen "task-details-mobile.png" "Task Details" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 200 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("CCA-101", $fontBadge, $brushIndigo, ($x + 14), ($y + 14))
    $g.DrawString("Migrate socket clustering to Redis", $fontH2, $brushDark, ($x + 14), ($y + 32))
    $g.DrawString("Status: In Progress &bull; Priority: Urgent", $fontSmall, $brushDanger, ($x + 14), ($y + 70))
    $g.DrawString("Subtasks: 2/4 Done", $fontSmall, $brushSuccess, ($x + 14), ($y + 98))
}

# 8. Team Management
Render-DesktopScreen "team-management-desktop.png" "Team Directory & RBAC Roles" "Team" {
    param($g, $x, $y, $w, $h)
    $tPath = Create-RoundedRectangle $x $y $w 460 10
    $g.FillPath($brushWhite, $tPath)
    $g.DrawPath($penBorder, $tPath)
    $g.DrawString("Organisation Members (4 Active)", $fontH2, $brushDark, ($x + 24), ($y + 20))

    $members = @(
        @{ Name="Alex Chen"; Email="alex.chen@workzen.io"; Role="Owner"; Status="Active"; Sec="2FA Active" },
        @{ Name="Sarah Jenkins"; Email="sarah.jenkins@workzen.io"; Role="Admin"; Status="Active"; Sec="2FA Active" },
        @{ Name="Marcus Vance"; Email="marcus.vance@workzen.io"; Role="Manager"; Status="Active"; Sec="2FA Active" },
        @{ Name="Elena Rostova"; Email="elena.rostova@workzen.io"; Role="Member"; Status="Active"; Sec="2FA Active" }
    )

    $my = $y + 60
    foreach ($m in $members) {
        $g.DrawString($m.Name, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($x + 30), $my)
        $g.DrawString($m.Email, $fontBody, $brushMuted, ($x + 220), $my)
        $g.DrawString($m.Role, $fontSmall, $brushIndigo, ($x + 500), $my)
        $g.DrawString($m.Status, $fontSmall, $brushSuccess, ($x + 650), $my)
        $g.DrawString($m.Sec, $fontSmall, $brushSuccess, ($x + 780), $my)
        $g.DrawLine((New-Object System.Drawing.Pen($cSlate100, 1)), ($x + 24), ($my + 32), ($x + $w - 24), ($my + 32))
        $my += 48
    }
}

Render-MobileScreen "team-management-mobile.png" "Team Members" {
    param($g, $x, $y, $w, $h)
    $my = $y
    $mList = @("Alex Chen (Owner)", "Sarah Jenkins (Admin)", "Marcus Vance (Manager)", "Elena Rostova (Member)")
    foreach ($ml in $mList) {
        $c = Create-RoundedRectangle $x $my $w 54 8
        $g.FillPath($brushWhite, $c)
        $g.DrawPath($penBorder, $c)
        $g.DrawString($ml, (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushDark, ($x + 14), ($my + 16))
        $my += 64
    }
}

# 9. Reports & Analytics
Render-DesktopScreen "analytics-desktop.png" "Reports & Executive Velocity" "Reports" {
    param($g, $x, $y, $w, $h)
    $c1 = Create-RoundedRectangle $x $y ($w - 320) 320 10
    $g.FillPath($brushWhite, $c1)
    $g.DrawPath($penBorder, $c1)
    $g.DrawString("Sprint Burndown Velocity Wave", $fontH2, $brushDark, ($x + 24), ($y + 20))

    $c2 = Create-RoundedRectangle ($x + $w - 300) $y 300 320 10
    $g.FillPath($brushWhite, $c2)
    $g.DrawPath($penBorder, $c2)
    $g.DrawString("Resolution SLA", $fontH2, $brushDark, ($x + $w - 280), ($y + 20))
    $g.DrawString("94.2%", (New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + $w - 280), ($y + 60))
    $g.DrawString("+3.4% vs last cycle", $fontSmall, $brushSuccess, ($x + $w - 280), ($y + 115))
}

Render-MobileScreen "analytics-mobile.png" "Reports" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 140 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Sprint Velocity", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("94.2% Resolution SLA", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + 14), ($y + 44))
    $g.DrawString("31 Completed Deliverables", $fontSmall, $brushSuccess, ($x + 14), ($y + 80))
}

# 10. Calendar
Render-DesktopScreen "calendar-desktop.png" "Sprint Calendar & Deadlines" "Calendar" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 460 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("November 2026 Sprint Schedule", $fontH2, $brushDark, ($x + 24), ($y + 20))

    $days = @("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    $dw = ($w - 48) / 7
    for ($i = 0; $i -lt 7; $i++) {
        $g.DrawString($days[$i], (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushMuted, ($x + 24 + ($i * $dw)), ($y + 60))
    }
}

Render-MobileScreen "calendar-mobile.png" "Calendar" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 120 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("November 2026", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("4 Major Deliverables Scheduled", $fontSmall, $brushMuted, ($x + 14), ($y + 46))
}

# 11. Settings & Security
Render-DesktopScreen "settings-desktop.png" "Organisation Settings & Audit" "Settings" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 460 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Tenant Security Policies & Stripe Billing", $fontH2, $brushDark, ($x + 24), ($y + 20))
    $g.DrawString("Enterprise Plan &bull; 250 Licensed Seats &bull; Multi-Tenant Isolation Verified", $fontBody, $brushMuted, ($x + 24), ($y + 50))
}

Render-MobileScreen "settings-mobile.png" "Settings" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 120 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Acme Global Enterprises", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("Enterprise Tier &bull; 2FA Enabled", $fontSmall, $brushIndigo, ($x + 14), ($y + 44))
}

# 12. Notifications
Render-DesktopScreen "notifications-desktop.png" "Notification Alert Centre" "Notification" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 460 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Real-Time Mentions & System Notifications", $fontH2, $brushDark, ($x + 24), ($y + 20))

    $notifs = @(
        "Marcus Vance assigned you to CCA-101: Migrate socket clustering to Redis (15m ago)",
        "Sarah Jenkins moved CCA-102 to 'In Review' (2h ago)",
        "Sprint 14 deadline in 3 days. 6 deliverables remaining in progress (1d ago)"
    )
    $ny = $y + 60
    foreach ($n in $notifs) {
        $nPath = Create-RoundedRectangle ($x + 24) $ny ($w - 48) 50 6
        $g.FillPath((New-Object System.Drawing.SolidBrush($cSlate100)), $nPath)
        $g.DrawString($n, $fontBody, $brushDark, ($x + 40), ($ny + 16))
        $ny += 64
    }
}

Render-MobileScreen "notifications-mobile.png" "Notifications" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 80 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Task Assigned", (New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)), $brushIndigo, ($x + 14), ($y + 14))
    $g.DrawString("Marcus assigned you to CCA-101", $fontSmall, $brushDark, ($x + 14), ($y + 36))
}

# 13. Organisation Dashboard
Render-DesktopScreen "organisation-dashboard-desktop.png" "Organisation Operational Hub" "Organisation" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 200 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Acme Global Enterprises", $fontTitle, $brushDark, ($x + 24), ($y + 24))
    $g.DrawString("Enterprise Plan &bull; 3 Active Workspaces &bull; 250 Seats Licensed", $fontBody, $brushMuted, ($x + 24), ($y + 56))
}

Render-MobileScreen "organisation-dashboard-mobile.png" "Organisation" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 100 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Acme Global Enterprises", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("3 Active Workspaces", $fontSmall, $brushMuted, ($x + 14), ($y + 44))
}

# 14. Workspace Dashboard
Render-DesktopScreen "workspace-dashboard-desktop.png" "Engineering & Cloud Ops Workspace" "Workspace" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 200 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Engineering & Cloud Ops", $fontTitle, $brushDark, ($x + 24), ($y + 24))
    $g.DrawString("Core microservices, infrastructure and frontend clients", $fontBody, $brushMuted, ($x + 24), ($y + 56))
}

Render-MobileScreen "workspace-dashboard-mobile.png" "Workspace" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 100 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Engineering & Cloud Ops", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("3 Projects Active", $fontSmall, $brushMuted, ($x + 14), ($y + 44))
}

# 15. User Profile
Render-DesktopScreen "profile-desktop.png" "User Profile & Preferences" "Settings" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 360 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Alex Chen (Staff Engineer &bull; Org Owner)", $fontH2, $brushDark, ($x + 24), ($y + 24))
    $g.DrawString("alex.chen@workzen.io &bull; Active Session on Windows (Current)", $fontBody, $brushMuted, ($x + 24), ($y + 54))
}

Render-MobileScreen "profile-mobile.png" "Profile" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 100 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Alex Chen", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("alex.chen@workzen.io", $fontSmall, $brushMuted, ($x + 14), ($y + 44))
}

# 16. Subscription & Billing
Render-DesktopScreen "billing-desktop.png" "Subscription & Invoices" "Settings" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 360 10
    $g.FillPath($brushWhite, $c)
    $g.DrawPath($penBorder, $c)
    $g.DrawString("Enterprise SaaS Subscription", $fontH2, $brushDark, ($x + 24), ($y + 24))
    $g.DrawString("250 Seats &bull; $49/seat/mo &bull; Renews Dec 2026 via Stripe Customer Portal", $fontBody, $brushMuted, ($x + 24), ($y + 54))
    $g.DrawString("Payment Method: MasterCard ending in 8842 (Verified 3D Secure)", $fontBody, $brushSuccess, ($x + 24), ($y + 84))
}

Render-MobileScreen "billing-mobile.png" "Billing" {
    param($g, $x, $y, $w, $h)
    $c = Create-RoundedRectangle $x $y $w 100 8
    $g.FillPath($brushWhite, $c)
    $g.DrawString("Enterprise Plan", $fontH2, $brushDark, ($x + 14), ($y + 16))
    $g.DrawString("250 Seats Licensed", $fontSmall, $brushSuccess, ($x + 14), ($y + 44))
}

Write-Host "All 16 Desktop and Mobile design screenshots generated successfully."

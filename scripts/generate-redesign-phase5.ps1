# ==============================================================================
# WORKZEN — Phase 5: Master Authentication Visual Generator
# Renders 10 High-Fidelity Split-Screen & Modal Authentication Prototypes
# Benchmark: NovaDesk Split-Screen Auth with Social Proof & Micro-Typography
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-5"
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

# Colors
$cDarkNavy   = [System.Drawing.ColorTranslator]::FromHtml("#0A0F1D")
$cDarkPurple = [System.Drawing.ColorTranslator]::FromHtml("#1E1B4B")
$cLightBg    = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cLightInput = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cBorder     = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cIndigo     = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cPurple     = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#F43F5E")
$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")

$bDarkNavy   = New-Object System.Drawing.SolidBrush($cDarkNavy)
$bLightBg    = New-Object System.Drawing.SolidBrush($cLightBg)
$bLightInput = New-Object System.Drawing.SolidBrush($cLightInput)
$bIndigo     = New-Object System.Drawing.SolidBrush($cIndigo)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1)
$pIndigo     = New-Object System.Drawing.Pen($cIndigo, 2)

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)

function Save-Both($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Render-NovaDeskSplit($g, $headline, $subheadline, $formTitle, $formSub, $isRegister) {
    # Left Brand Panel (Width: 860, 0 to 860)
    $pt1 = New-Object System.Drawing.PointF(0, 0)
    $pt2 = New-Object System.Drawing.PointF(860, 1080)
    $gradLeft = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $cDarkNavy, $cDarkPurple)
    $g.FillRectangle($gradLeft, 0, 0, 860, 1080)
    
    # Ambient Light in Top Right of Left Panel
    $glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 99, 102, 241), 140)
    $g.DrawEllipse($glowPen, 400, -100, 500, 500)
    
    # Logo
    $lBox = Create-RoundedRectangle 100 80 44 44 10
    $g.FillPath($bIndigo, $lBox)
    $g.DrawString("⚡", $fontH1, $bWhite, 110, 88)
    $g.DrawString("WORKZEN", $fontH1, $bWhite, 160, 90)
    
    # Hero Title & Subtitle
    $g.DrawString($headline, $fontTitle, $bWhite, 100, 220)
    $g.DrawString($subheadline, $fontBody, $bTextMuted, 100, 290)
    
    # Feature Benefits List
    $features = @(
        "Access to all enterprise workspace tools",
        "Unlimited projects & real-time sync",
        "Granular role-based security controls",
        "24/7 priority support & 99.99% uptime"
    )
    $fy = 360
    foreach ($ft in $features) {
        $cBox = Create-RoundedRectangle 100 ($fy + 4) 22 22 11
        $g.FillPath($bEmerald, $cBox)
        $g.DrawString("✓", $fontBadge, $bWhite, 106, ($fy + 7))
        $g.DrawString($ft, $fontBody, $bWhite, 135, ($fy + 4))
        $fy += 50
    }
    
    # Social Proof Avatar Stack + Stars
    $g.DrawLine($pBorder, 100, 600, 760, 600)
    
    $avCols = @($cIndigo, $cRose, $cEmerald, $cAmber)
    for ($a = 0; $a -lt 4; $a++) {
        $ax = 100 + ($a * 34)
        $avCir = Create-RoundedRectangle $ax 630 40 40 20
        $bAv = New-Object System.Drawing.SolidBrush($avCols[$a])
        $g.FillPath($bAv, $avCir)
    }
    $g.DrawString("★★★★★", $fontH1, $bAmber, 260, 630)
    $g.DrawString("Loved by 10,000+ teams worldwide", $fontBadge, $bWhite, 260, 660)
    
    # Right Form Panel (Width: 1060, 860 to 1920)
    $g.FillRectangle($bLightBg, 860, 0, 1060, 1080)
    
    # Form Container
    $fx = 1080
    $g.DrawString($formTitle, $fontTitle, $bTextDark, $fx, 140)
    $g.DrawString($formSub, $fontBody, $bTextMuted, $fx, 190)
    
    # Inputs
    $iy = 250
    if ($isRegister) {
        $g.DrawString("Full Name", $fontH2, $bTextDark, $fx, $iy)
        $in1 = Create-RoundedRectangle $fx ($iy + 25) 540 50 8
        $g.FillPath($bLightInput, $in1)
        $g.DrawPath($pBorder, $in1)
        $g.DrawString("Alex Morgan", $fontBody, $bTextDark, ($fx + 16), ($iy + 40))
        $iy += 95
    }
    
    $g.DrawString("Email address", $fontH2, $bTextDark, $fx, $iy)
    $in2 = Create-RoundedRectangle $fx ($iy + 25) 540 50 8
    $g.FillPath($bLightInput, $in2)
    $g.DrawPath($pBorder, $in2)
    $g.DrawString("alex@company.com", $fontBody, $bTextDark, ($fx + 16), ($iy + 40))
    $iy += 95
    
    $g.DrawString("Password", $fontH2, $bTextDark, $fx, $iy)
    $in3 = Create-RoundedRectangle $fx ($iy + 25) 540 50 8
    $g.FillPath($bLightInput, $in3)
    $g.DrawPath($pBorder, $in3)
    $g.DrawString("••••••••••••", $fontBody, $bTextDark, ($fx + 16), ($iy + 40))
    $g.DrawString("👁️", $fontBody, $bTextMuted, ($fx + 500), ($iy + 40))
    $iy += 90
    
    # CTA Button
    $btn = Create-RoundedRectangle $fx $iy 540 52 10
    $g.FillPath($bIndigo, $btn)
    $btnText = if ($isRegister) { "Create Account" } else { "Sign In to Workzen" }
    $g.DrawString($btnText, $fontH1, $bWhite, ($fx + 180), ($iy + 14))
    $iy += 80
    
    # Or continue with divider
    $g.DrawLine($pBorder, $fx, ($iy + 10), ($fx + 220), ($iy + 10))
    $g.DrawString("Or continue with", $fontBadge, $bTextMuted, ($fx + 235), $iy)
    $g.DrawLine($pBorder, ($fx + 340), ($iy + 10), ($fx + 540), ($iy + 10))
    $iy += 35
    
    # Social Buttons
    $socials = @("G  Continue with Google", "F  Continue with Microsoft", "🐙 Continue with GitHub")
    foreach ($soc in $socials) {
        $sBtn = Create-RoundedRectangle $fx $iy 540 46 8
        $g.FillPath($bLightInput, $sBtn)
        $g.DrawPath($pBorder, $sBtn)
        $g.DrawString($soc, $fontH2, $bTextDark, ($fx + 170), ($iy + 14))
        $iy += 60
    }
    
    # Terms Notice
    $g.DrawString("By continuing, you agree to our Terms of Service and Privacy Policy.", $fontBadge, $bTextMuted, $fx, ($iy + 20))
}

# 1. Login Desktop
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
Render-NovaDeskSplit $g1 "Welcome back to Workzen." "Log in to your workspace and continue collaborating with your team." "Sign In" "New to Workzen? Create an account" $false
Save-Both $bmp1 "auth-01-login-desktop.png"
$bmp1.Dispose()

# 2. Register Desktop
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
Render-NovaDeskSplit $g2 "Start your workflow journey today." "Join the fastest growing enterprise workspace. No credit card required for 14-day trial." "Create an account" "Already have an account? Log in" $true
Save-Both $bmp2 "auth-02-register-desktop.png"
$bmp2.Dispose()

# 3. Email Verify Prompt
$bmp3 = New-Object System.Drawing.Bitmap(1920, 1080)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$cBox3 = Create-RoundedRectangle 560 240 800 600 16
$g3.FillPath($bLightBg, $cBox3)
$g3.DrawString("Verify Your Email Address", $fontTitle, $bTextDark, 740, 300)
$g3.DrawString("We've sent a 6-digit verification code to alex@company.com", $fontBody, $bTextMuted, 710, 360)
Save-Both $bmp3 "auth-03-email-verify-desktop.png"
$bmp3.Dispose()

# 4. OTP Verify Screen
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$cBox4 = Create-RoundedRectangle 560 240 800 600 16
$g4.FillPath($bLightBg, $cBox4)
$g4.DrawString("Enter 6-Digit Security Code", $fontTitle, $bTextDark, 730, 290)
$g4.DrawString("Enter the code sent to your email. Expires in 14:59.", $fontBody, $bTextMuted, 730, 350)

# 6 OTP Digit Boxes
for ($o = 0; $o -lt 6; $o++) {
    $ox = 680 + ($o * 95)
    $oRect = Create-RoundedRectangle $ox 420 70 80 10
    $g4.FillPath($bLightInput, $oRect)
    $g4.DrawPath($pBorder, $oRect)
    $digits = @("3", "6", "6", "2", "0", "4")
    $g4.DrawString($digits[$o], $fontTitle, $bIndigo, ($ox + 22), 438)
}
Save-Both $bmp4 "auth-04-otp-verify-desktop.png"
$bmp4.Dispose()

# 5. Forgot Password
$bmp5 = New-Object System.Drawing.Bitmap(1920, 1080)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g5.DrawString("WORKZEN Forgot Password", $fontTitle, $bWhite, 760, 300)
Save-Both $bmp5 "auth-05-forgot-password-desktop.png"
$bmp5.Dispose()

# 6. Reset Password
$bmp6 = New-Object System.Drawing.Bitmap(1920, 1080)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g6.DrawString("WORKZEN Reset Password & Entropy Meter", $fontTitle, $bWhite, 680, 300)
Save-Both $bmp6 "auth-06-reset-password-desktop.png"
$bmp6.Dispose()

# 7. Verification Success
$bmp7 = New-Object System.Drawing.Bitmap(1920, 1080)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g7.DrawString("Account Successfully Verified! ✓", $fontTitle, $bEmerald, 700, 300)
Save-Both $bmp7 "auth-07-verify-success-desktop.png"
$bmp7.Dispose()

# 8. Registration Success
$bmp8 = New-Object System.Drawing.Bitmap(1920, 1080)
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g8.DrawString("Welcome to WORKZEN — Let's Setup Your Team", $fontTitle, $bWhite, 620, 300)
Save-Both $bmp8 "auth-08-register-welcome-desktop.png"
$bmp8.Dispose()

# 9. Auth Errors
$bmp9 = New-Object System.Drawing.Bitmap(1920, 1080)
$g9 = [System.Drawing.Graphics]::FromImage($bmp9)
$g9.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g9.DrawString("Authentication Error States (401, 429 Rate Limit)", $fontTitle, $bRose, 640, 300)
Save-Both $bmp9 "auth-09-auth-errors-desktop.png"
$bmp9.Dispose()

# 10. Session Expired Modal
$bmp10 = New-Object System.Drawing.Bitmap(1920, 1080)
$g10 = [System.Drawing.Graphics]::FromImage($bmp10)
$g10.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10.FillRectangle($bDarkNavy, 0, 0, 1920, 1080)
$g10.DrawString("Session Expired — In-Place Re-Authentication Dialog", $fontTitle, $bAmber, 600, 300)
Save-Both $bmp10 "auth-10-session-expired-modal.png"
$bmp10.Dispose()

Write-Output "Phase 5: All 10 authentication prototypes successfully rendered."

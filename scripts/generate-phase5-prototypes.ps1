# scripts/generate-phase5-prototypes.ps1
# Programmatic High-Fidelity UI/UX Prototype Picture Generator for WORKZEN Phase 5 (Authentication)
# Renders 18 Desktop, Tablet, and Mobile Prototype Pictures into docs/design/phase-5/prototypes/

Add-Type -AssemblyName System.Drawing

$outputDir = "docs/design/phase-5/prototypes"
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
$cWarning = [System.Drawing.Color]::FromArgb(245, 158, 11) # #F59E0B
$cWarningLight = [System.Drawing.Color]::FromArgb(255, 251, 235)
$cDanger = [System.Drawing.Color]::FromArgb(239, 68, 68) # #EF4444
$cDangerLight = [System.Drawing.Color]::FromArgb(254, 242, 242)
$cTransDark = [System.Drawing.Color]::FromArgb(140, 15, 23, 42)

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
$brushWarning = New-Object System.Drawing.SolidBrush($cWarning)
$brushWarningLight = New-Object System.Drawing.SolidBrush($cWarningLight)
$brushDanger = New-Object System.Drawing.SolidBrush($cDanger)
$brushDangerLight = New-Object System.Drawing.SolidBrush($cDangerLight)
$brushTransDark = New-Object System.Drawing.SolidBrush($cTransDark)
$brushBorderSubtle = New-Object System.Drawing.SolidBrush($cBorderSubtle)

# Pens
$penBorder = New-Object System.Drawing.Pen($cBorderSubtle, 1)
$penDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$penIndigo = New-Object System.Drawing.Pen($cIndigoMain, 1.5)
$penIndigoBold = New-Object System.Drawing.Pen($cIndigoMain, 2.5)
$penDanger = New-Object System.Drawing.Pen($cDanger, 1.5)

# Fonts
$fontLogo = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontDisplay = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontH1 = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
$fontH2 = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontBodyBold = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Regular)
$fontSmallBold = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$fontTiny = New-Object System.Drawing.Font("Segoe UI", 7.5, [System.Drawing.FontStyle]::Bold)

# Helper function to draw Public Header (Desktop/Tablet)
function Draw-AuthHeader($g, $width) {
    $rectHeader = [System.Drawing.Rectangle]::new(0, 0, [int]$width, 64)
    $g.FillRectangle($brushWhite, $rectHeader)
    $g.DrawLine($penBorder, 0, 64, [int]$width, 64)

    # Logo
    $rectIcon = [System.Drawing.Rectangle]::new(32, 16, 32, 32)
    $g.FillRectangle($brushIndigoMain, $rectIcon)
    $g.DrawString("W", $fontH1, $brushWhite, 39, 18)
    $g.DrawString("WORKZEN", $fontLogo, $brushTextDark, 72, 21)
    $g.DrawString("Enterprise Security & Identity", $fontSmall, $brushTextMuted, [float]($width - 200), [float]24)
}

# Helper function to draw Mobile Header
function Draw-AuthMobileHeader($g, $width) {
    $rectHeader = [System.Drawing.Rectangle]::new(0, 0, [int]$width, 54)
    $g.FillRectangle($brushWhite, $rectHeader)
    $g.DrawLine($penBorder, 0, 54, [int]$width, 54)

    $rectIcon = [System.Drawing.Rectangle]::new(16, 13, 28, 28)
    $g.FillRectangle($brushIndigoMain, $rectIcon)
    $g.DrawString("W", $fontH2, $brushWhite, 23, 16)
    $g.DrawString("WORKZEN", $fontH2, $brushTextDark, 52, 17)
}

# -------------------------------------------------------------
# 1. REGISTRATION PAGE DESKTOP (1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280

# Split Screen: Left Brand Value Column, Right Form
$rectLeft = [System.Drawing.Rectangle]::new(80, 100, 480, 640)
$brushGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rectLeft,
    [System.Drawing.Color]::FromArgb(15, 23, 42),
    [System.Drawing.Color]::FromArgb(67, 56, 202),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$g.FillRectangle($brushGrad, $rectLeft)
$g.DrawString("PLAN SMARTER. WORK TOGETHER.", $fontTiny, $brushTextLight, 110, 140)
$g.DrawString("Start Your 14-Day`nEnterprise Free Trial", $fontDisplay, $brushWhite, 110, 164)
$g.DrawString("Join forward-thinking product squads and multi-tenant organisations who use Workzen for decisive delivery clarity.", $fontBody, $brushTextLight, [System.Drawing.RectangleF]::new(110, 240, 420, 80))

# Benefits List
$regBenefits = @(
    "Unlimited Kanban tasks & sprint milestones",
    "Real-time team presence & Socket.IO updates",
    "Bank-grade JWT session isolation & RBAC",
    "Dedicated tenant privacy and zero data leakage"
)
for ($b = 0; $b -lt 4; $b++) {
    $g.FillRectangle($brushSuccess, [System.Drawing.Rectangle]::new(110, (330 + ($b * 40)), 8, 8))
    $g.DrawString($regBenefits[$b], $fontSmallBold, $brushWhite, 130, (324 + ($b * 40)))
}

# Right Form Card
$rectForm = [System.Drawing.Rectangle]::new(580, 100, 620, 640)
$g.FillRectangle($brushWhite, $rectForm)
$g.DrawRectangle($penBorder, $rectForm)
$g.DrawString("Create Your Workzen Account", $fontDisplay, $brushTextDark, 616, 130)
$g.DrawString("Already have an account? Sign In", $fontSmall, $brushIndigoMain, 616, 168)

# Input Fields: First Name, Last Name, Work Email, Organisation, Password, Confirm Password
$regFields = @("First Name", "Last Name", "Work Email", "Organisation Name", "Password", "Confirm Password")
for ($i = 0; $i -lt 6; $i++) {
    $row = [Math]::Floor($i / 2)
    $col = $i % 2
    $fX = 616 + ($col * 276)
    $fY = 206 + ($row * 72)
    $g.DrawString($regFields[$i], $fontSmallBold, $brushTextDark, $fX, $fY)
    $inputRect = [System.Drawing.Rectangle]::new($fX, ($fY + 20), 260, 36)
    $g.FillRectangle($brushBgMain, $inputRect)
    $g.DrawRectangle($penBorder, $inputRect)
}

# Password Policy Meter
$g.FillRectangle($brushSuccess, [System.Drawing.Rectangle]::new(616, 440, 120, 4))
$g.FillRectangle($brushSuccess, [System.Drawing.Rectangle]::new(742, 440, 120, 4))
$g.FillRectangle($brushSuccess, [System.Drawing.Rectangle]::new(868, 440, 120, 4))
$g.FillRectangle($brushBorderSubtle, [System.Drawing.Rectangle]::new(994, 440, 120, 4))
$g.DrawString("Password Strength: Strong (Includes uppercase, number, symbol)", $fontTiny, $brushTextMuted, 616, 452)

# Terms Checkbox
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(616, 480, 16, 16))
$g.DrawString("v", $fontTiny, $brushWhite, 620, 481)
$g.DrawString("I agree to the WORKZEN Terms of Service, Privacy Policy, and Cookie Guidelines.", $fontSmall, $brushTextDark, 640, 480)

# Submit Button
$rectBtn = [System.Drawing.Rectangle]::new(616, 520, 548, 44)
$g.FillRectangle($brushIndigoMain, $rectBtn)
$g.DrawString("Create Account & Send Verification Email ->", $fontBodyBold, $brushWhite, 720, 532)

$bmp.Save("$outputDir/register-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: register-desktop.png"

# -------------------------------------------------------------
# 2. REGISTRATION PAGE TABLET (768x1024)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 768, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 768

$rectTabCard = [System.Drawing.Rectangle]::new(50, 90, 668, 880)
$g.FillRectangle($brushWhite, $rectTabCard)
$g.DrawRectangle($penBorder, $rectTabCard)

$g.DrawString("WORKZEN REGISTRATION", $fontTiny, $brushIndigoMain, 80, 116)
$g.DrawString("Create Your Workzen Account", $fontDisplay, $brushTextDark, 80, 136)
$g.DrawString("Enterprise multi-tenant workspace with real-time sprint management.", $fontBody, $brushTextMuted, 80, 172)

for ($i = 0; $i -lt 6; $i++) {
    $fY = 216 + ($i * 74)
    $g.DrawString($regFields[$i], $fontSmallBold, $brushTextDark, 80, $fY)
    $inputRect = [System.Drawing.Rectangle]::new(80, ($fY + 20), 608, 38)
    $g.FillRectangle($brushBgMain, $inputRect)
    $g.DrawRectangle($penBorder, $inputRect)
}
$rectTabBtn = [System.Drawing.Rectangle]::new(80, 680, 608, 44)
$g.FillRectangle($brushIndigoMain, $rectTabBtn)
$g.DrawString("Create Account & Verify Email", $fontBodyBold, $brushWhite, 280, 692)

$bmp.Save("$outputDir/register-tablet.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: register-tablet.png"

# -------------------------------------------------------------
# 3. REGISTRATION PAGE MOBILE (400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400

$rectMobCard = [System.Drawing.Rectangle]::new(16, 70, 368, 730)
$g.FillRectangle($brushWhite, $rectMobCard)
$g.DrawRectangle($penBorder, $rectMobCard)

$g.DrawString("Create Account", $fontH1, $brushTextDark, 32, 90)
$g.DrawString("Sign up for Workzen Enterprise.", $fontSmall, $brushTextMuted, 32, 116)

$mFields = @("Full Name", "Work Email", "Organisation", "Password", "Confirm Password")
for ($i = 0; $i -lt 5; $i++) {
    $fY = 146 + ($i * 70)
    $g.DrawString($mFields[$i], $fontSmallBold, $brushTextDark, 32, $fY)
    $inputRect = [System.Drawing.Rectangle]::new(32, ($fY + 20), 336, 36)
    $g.FillRectangle($brushBgMain, $inputRect)
    $g.DrawRectangle($penBorder, $inputRect)
}
$rectMobBtn = [System.Drawing.Rectangle]::new(32, 530, 336, 44)
$g.FillRectangle($brushIndigoMain, $rectMobBtn)
$g.DrawString("Register Account ->", $fontBodyBold, $brushWhite, 126, 542)

$bmp.Save("$outputDir/register-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: register-mobile.png"

# -------------------------------------------------------------
# 4. LOGIN PAGE DESKTOP (1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280

$rectLogin = [System.Drawing.Rectangle]::new(390, 130, 500, 550)
$g.FillRectangle($brushWhite, $rectLogin)
$g.DrawRectangle($penBorder, $rectLogin)

$rectIcon = [System.Drawing.Rectangle]::new(420, 160, 40, 40)
$g.FillRectangle($brushIndigoLight, $rectIcon)
$g.DrawString("W", $fontH1, $brushIndigoMain, 432, 168)

$g.DrawString("Sign in to WORKZEN", $fontDisplay, $brushTextDark, 420, 216)
$g.DrawString("Enter your enterprise credentials to access your workspaces.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(420, 252, 440, 40))

# Inputs: Email & Password
$g.DrawString("Work Email", $fontSmallBold, $brushTextDark, 420, 300)
$rectInput1 = [System.Drawing.Rectangle]::new(420, 322, 440, 40)
$g.FillRectangle($brushBgMain, $rectInput1)
$g.DrawRectangle($penBorder, $rectInput1)
$g.DrawString("alex@company.com", $fontBody, $brushTextDark, 432, 332)

$g.DrawString("Password", $fontSmallBold, $brushTextDark, 420, 380)
$g.DrawString("Forgot password?", $fontSmall, $brushIndigoMain, 760, 380)
$rectInput2 = [System.Drawing.Rectangle]::new(420, 402, 440, 40)
$g.FillRectangle($brushBgMain, $rectInput2)
$g.DrawRectangle($penBorder, $rectInput2)
$g.DrawString("**********", $fontBody, $brushTextDark, 432, 412)

# Submit
$rectLoginBtn = [System.Drawing.Rectangle]::new(420, 470, 440, 44)
$g.FillRectangle($brushIndigoMain, $rectLoginBtn)
$g.DrawString("Sign In to Workspace ->", $fontBodyBold, $brushWhite, 555, 482)

$g.DrawString("Don't have an account? Start 14-day trial", $fontSmall, $brushIndigoMain, 520, 540)

$bmp.Save("$outputDir/login-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: login-desktop.png"

# -------------------------------------------------------------
# 5. LOGIN PAGE MOBILE (400x820)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400

$rectMobLogin = [System.Drawing.Rectangle]::new(20, 90, 360, 520)
$g.FillRectangle($brushWhite, $rectMobLogin)
$g.DrawRectangle($penBorder, $rectMobLogin)

$g.DrawString("Welcome Back", $fontH1, $brushTextDark, 40, 120)
$g.DrawString("Sign in to your Workzen account.", $fontSmall, $brushTextMuted, 40, 150)

$g.DrawString("Work Email", $fontSmallBold, $brushTextDark, 40, 190)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 212, 320, 38))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(40, 212, 320, 38))

$g.DrawString("Password", $fontSmallBold, $brushTextDark, 40, 270)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 292, 320, 38))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(40, 292, 320, 38))

$rectMobLoginBtn = [System.Drawing.Rectangle]::new(40, 360, 320, 44)
$g.FillRectangle($brushIndigoMain, $rectMobLoginBtn)
$g.DrawString("Sign In ->", $fontBodyBold, $brushWhite, 160, 372)

$bmp.Save("$outputDir/login-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: login-mobile.png"

# -------------------------------------------------------------
# 6. EMAIL VERIFICATION PAGE (Desktop & Mobile)
# -------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280

$rectCard = [System.Drawing.Rectangle]::new(390, 150, 500, 480)
$g.FillRectangle($brushWhite, $rectCard)
$g.DrawRectangle($penBorder, $rectCard)

$g.FillRectangle($brushIndigoLight, [System.Drawing.Rectangle]::new(610, 180, 60, 60))
$g.DrawString("@", $fontDisplay, $brushIndigoMain, 626, 192)

$g.DrawString("Verify Your Email Address", $fontDisplay, $brushTextDark, 470, 260)
$g.DrawString("We've sent a cryptographically secure verification link to:`nalex@company.com`n`nPlease click the link in your email or enter the 6-digit verification code below to activate your account.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(420, 300, 440, 90))

# 6 OTP boxes
for ($i = 0; $i -lt 6; $i++) {
    $otpX = 450 + ($i * 64)
    $g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new($otpX, 400, 48, 54))
    $g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new($otpX, 400, 48, 54))
}

$rectVBtn = [System.Drawing.Rectangle]::new(420, 480, 440, 44)
$g.FillRectangle($brushIndigoMain, $rectVBtn)
$g.DrawString("Verify & Activate Account ->", $fontBodyBold, $brushWhite, 526, 492)
$g.DrawString("Didn't receive email? Resend in 48s", $fontSmall, $brushTextMuted, 530, 544)

$bmp.Save("$outputDir/verify-email-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: verify-email-desktop.png"

# Mobile
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400
$rectCardMob = [System.Drawing.Rectangle]::new(20, 100, 360, 500)
$g.FillRectangle($brushWhite, $rectCardMob)
$g.DrawRectangle($penBorder, $rectCardMob)
$g.DrawString("Verify Email", $fontH1, $brushTextDark, 40, 130)
$g.DrawString("Enter the 6-digit security code sent to alex@company.com.", $fontSmall, $brushTextMuted, [System.Drawing.RectangleF]::new(40, 160, 320, 40))
for ($i = 0; $i -lt 6; $i++) {
    $otpX = 40 + ($i * 54)
    $g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new($otpX, 220, 44, 48))
    $g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new($otpX, 220, 44, 48))
}
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(40, 300, 320, 44))
$g.DrawString("Verify Code ->", $fontBodyBold, $brushWhite, 150, 312)
$bmp.Save("$outputDir/verify-email-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: verify-email-mobile.png"

# -------------------------------------------------------------
# 7. OTP VERIFICATION PAGE (Desktop & Mobile)
# -------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectOtp = [System.Drawing.Rectangle]::new(390, 160, 500, 450)
$g.FillRectangle($brushWhite, $rectOtp)
$g.DrawRectangle($penBorder, $rectOtp)
$g.DrawString("Security OTP Verification", $fontDisplay, $brushTextDark, 470, 200)
$g.DrawString("A temporary 6-digit one-time passcode has been issued for high-risk action confirmation. Code expires in 15 minutes.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(420, 240, 440, 50))
for ($i = 0; $i -lt 6; $i++) {
    $otpX = 450 + ($i * 64)
    $g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new($otpX, 310, 48, 54))
    $g.DrawRectangle($penIndigo, [System.Drawing.Rectangle]::new($otpX, 310, 48, 54))
    $g.DrawString([string]($i + 1), $fontH1, $brushTextDark, ($otpX + 18), 324)
}
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(420, 400, 440, 44))
$g.DrawString("Confirm Passcode ->", $fontBodyBold, $brushWhite, 550, 412)
$bmp.Save("$outputDir/verify-otp-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: verify-otp-desktop.png"

# Mobile
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400
$rectOtpMob = [System.Drawing.Rectangle]::new(20, 100, 360, 460)
$g.FillRectangle($brushWhite, $rectOtpMob)
$g.DrawRectangle($penBorder, $rectOtpMob)
$g.DrawString("Security Passcode", $fontH1, $brushTextDark, 40, 130)
$g.DrawString("Enter the 6-digit code sent to your registered device.", $fontSmall, $brushTextMuted, 40, 160)
for ($i = 0; $i -lt 6; $i++) {
    $otpX = 40 + ($i * 54)
    $g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new($otpX, 210, 44, 48))
    $g.DrawRectangle($penIndigo, [System.Drawing.Rectangle]::new($otpX, 210, 44, 48))
}
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(40, 290, 320, 44))
$g.DrawString("Verify Passcode", $fontBodyBold, $brushWhite, 140, 302)
$bmp.Save("$outputDir/verify-otp-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: verify-otp-mobile.png"

# -------------------------------------------------------------
# 8. FORGOT PASSWORD PAGE (Desktop & Mobile)
# -------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectForgot = [System.Drawing.Rectangle]::new(390, 170, 500, 420)
$g.FillRectangle($brushWhite, $rectForgot)
$g.DrawRectangle($penBorder, $rectForgot)
$g.DrawString("Reset Your Password", $fontDisplay, $brushTextDark, 420, 210)
$g.DrawString("Enter your enterprise work email. If an account matches, we will dispatch password recovery instructions.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(420, 250, 440, 50))
$g.DrawString("Work Email", $fontSmallBold, $brushTextDark, 420, 310)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(420, 332, 440, 40))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(420, 332, 440, 40))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(420, 400, 440, 44))
$g.DrawString("Send Recovery Link ->", $fontBodyBold, $brushWhite, 550, 412)
$g.DrawString("Return to Sign In", $fontSmall, $brushIndigoMain, 575, 460)
$bmp.Save("$outputDir/forgot-password-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: forgot-password-desktop.png"

# Mobile
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400
$rectForgotMob = [System.Drawing.Rectangle]::new(20, 100, 360, 440)
$g.FillRectangle($brushWhite, $rectForgotMob)
$g.DrawRectangle($penBorder, $rectForgotMob)
$g.DrawString("Reset Password", $fontH1, $brushTextDark, 40, 130)
$g.DrawString("Enter your work email address to receive reset link.", $fontSmall, $brushTextMuted, 40, 160)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 210, 320, 40))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(40, 210, 320, 40))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(40, 280, 320, 44))
$g.DrawString("Send Reset Link", $fontBodyBold, $brushWhite, 140, 292)
$bmp.Save("$outputDir/forgot-password-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: forgot-password-mobile.png"

# -------------------------------------------------------------
# 9. RESET PASSWORD PAGE (Desktop & Mobile)
# -------------------------------------------------------------
# Desktop
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectReset = [System.Drawing.Rectangle]::new(390, 140, 500, 490)
$g.FillRectangle($brushWhite, $rectReset)
$g.DrawRectangle($penBorder, $rectReset)
$g.DrawString("Choose a New Password", $fontDisplay, $brushTextDark, 420, 170)
$g.DrawString("Your new password must be at least 8 characters and satisfy complexity standards.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(420, 210, 440, 40))
$g.DrawString("New Password", $fontSmallBold, $brushTextDark, 420, 260)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(420, 282, 440, 40))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(420, 282, 440, 40))
$g.DrawString("Confirm New Password", $fontSmallBold, $brushTextDark, 420, 340)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(420, 362, 440, 40))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(420, 362, 440, 40))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(420, 430, 440, 44))
$g.DrawString("Update Password & Invalidate Other Sessions ->", $fontBodyBold, $brushWhite, 460, 442)
$bmp.Save("$outputDir/reset-password-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: reset-password-desktop.png"

# Mobile
$bmp = New-Object System.Drawing.Bitmap 400, 820
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthMobileHeader $g 400
$rectResetMob = [System.Drawing.Rectangle]::new(20, 100, 360, 460)
$g.FillRectangle($brushWhite, $rectResetMob)
$g.DrawRectangle($penBorder, $rectResetMob)
$g.DrawString("New Password", $fontH1, $brushTextDark, 40, 130)
$g.DrawString("Enter and confirm your new secure password.", $fontSmall, $brushTextMuted, 40, 160)
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 200, 320, 38))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(40, 200, 320, 38))
$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(40, 260, 320, 38))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(40, 260, 320, 38))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(40, 330, 320, 44))
$g.DrawString("Reset Password", $fontBodyBold, $brushWhite, 140, 342)
$bmp.Save("$outputDir/reset-password-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: reset-password-mobile.png"

# -------------------------------------------------------------
# 10. PASSWORD RESET SUCCESS PAGE (Desktop 1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectCard = [System.Drawing.Rectangle]::new(390, 180, 500, 380)
$g.FillRectangle($brushWhite, $rectCard)
$g.DrawRectangle($penBorder, $rectCard)
$g.FillRectangle($brushSuccessLight, [System.Drawing.Rectangle]::new(610, 210, 60, 60))
$g.DrawString("OK", $fontDisplay, $brushSuccess, 622, 222)
$g.DrawString("Password Successfully Reset", $fontDisplay, $brushTextDark, 460, 290)
$g.DrawString("Your account credentials have been securely updated. All previous active sessions were invalidated for your protection.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(430, 330, 420, 50))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(430, 400, 420, 44))
$g.DrawString("Sign In With New Password ->", $fontBodyBold, $brushWhite, 520, 412)
$bmp.Save("$outputDir/password-reset-success-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: password-reset-success-desktop.png"

# -------------------------------------------------------------
# 11. ACCOUNT VERIFICATION SUCCESS PAGE (Desktop 1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectCard = [System.Drawing.Rectangle]::new(390, 180, 500, 380)
$g.FillRectangle($brushWhite, $rectCard)
$g.DrawRectangle($penBorder, $rectCard)
$g.FillRectangle($brushSuccessLight, [System.Drawing.Rectangle]::new(610, 210, 60, 60))
$g.DrawString("OK", $fontDisplay, $brushSuccess, 622, 222)
$g.DrawString("Account Verified Successfully", $fontDisplay, $brushTextDark, 456, 290)
$g.DrawString("Welcome to WORKZEN. Your email has been validated and your enterprise workspace tenant is now fully active.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(430, 330, 420, 50))
$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(430, 400, 420, 44))
$g.DrawString("Open Executive Dashboard ->", $fontBodyBold, $brushWhite, 530, 412)
$bmp.Save("$outputDir/account-verification-success-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: account-verification-success-desktop.png"

# -------------------------------------------------------------
# 12. AUTHENTICATION ERROR STATES (Desktop 1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)
Draw-AuthHeader $g 1280
$rectCard = [System.Drawing.Rectangle]::new(390, 150, 500, 500)
$g.FillRectangle($brushWhite, $rectCard)
$g.DrawRectangle($penBorder, $rectCard)

# Error Alert Banner
$rectAlert = [System.Drawing.Rectangle]::new(420, 180, 440, 54)
$g.FillRectangle($brushDangerLight, $rectAlert)
$g.DrawRectangle($penDanger, $rectAlert)
$g.DrawString("Invalid email or password. Please verify your credentials.", $fontSmallBold, $brushDanger, 440, 198)

$g.DrawString("Sign in to WORKZEN", $fontDisplay, $brushTextDark, 420, 256)
$g.DrawString("Work Email", $fontSmallBold, $brushTextDark, 420, 300)
$rectErrInput = [System.Drawing.Rectangle]::new(420, 322, 440, 40)
$g.FillRectangle($brushBgMain, $rectErrInput)
$g.DrawRectangle($penDanger, $rectErrInput)
$g.DrawString("alex@wrongdomain.com", $fontBody, $brushTextDark, 432, 332)
$g.DrawString("Account not found with this domain", $fontTiny, $brushDanger, 420, 366)

$g.DrawString("Password", $fontSmallBold, $brushTextDark, 420, 396)
$rectErrInput2 = [System.Drawing.Rectangle]::new(420, 418, 440, 40)
$g.FillRectangle($brushBgMain, $rectErrInput2)
$g.DrawRectangle($penDanger, $rectErrInput2)

$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(420, 480, 440, 44))
$g.DrawString("Retry Sign In ->", $fontBodyBold, $brushWhite, 570, 492)
$bmp.Save("$outputDir/auth-error-state-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: auth-error-state-desktop.png"

# -------------------------------------------------------------
# 13. SESSION EXPIRED SCREEN (Desktop 1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)

# Dimmed background backdrop
$g.FillRectangle($brushTransDark, [System.Drawing.Rectangle]::new(0, 0, 1280, 800))

# Centered Modal
$rectModal = [System.Drawing.Rectangle]::new(440, 220, 400, 360)
$g.FillRectangle($brushWhite, $rectModal)
$g.DrawRectangle($penBorder, $rectModal)

$g.FillRectangle($brushWarningLight, [System.Drawing.Rectangle]::new(610, 250, 60, 60))
$g.DrawString("!", $fontDisplay, $brushWarning, 634, 262)

$g.DrawString("Session Expired", $fontDisplay, $brushTextDark, 545, 330)
$g.DrawString("Your authentication session has timed out due to inactivity or token expiration. Please sign in again to continue.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(470, 370, 340, 60))

$g.FillRectangle($brushIndigoMain, [System.Drawing.Rectangle]::new(470, 450, 340, 44))
$g.DrawString("Re-Authenticate Now", $fontBodyBold, $brushWhite, 560, 462)
$bmp.Save("$outputDir/session-expired-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: session-expired-desktop.png"

# -------------------------------------------------------------
# 14. SIGNOUT CONFIRMATION STATE (Desktop 1280x800)
# -------------------------------------------------------------
$bmp = New-Object System.Drawing.Bitmap 1280, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($cBgMain)

# Dimmed background backdrop
$g.FillRectangle($brushTransDark, [System.Drawing.Rectangle]::new(0, 0, 1280, 800))

# Centered Signout Dialog
$rectSignout = [System.Drawing.Rectangle]::new(440, 240, 400, 300)
$g.FillRectangle($brushWhite, $rectSignout)
$g.DrawRectangle($penBorder, $rectSignout)

$g.DrawString("Sign Out of WORKZEN?", $fontH1, $brushTextDark, 470, 270)
$g.DrawString("Signing out will securely invalidate your active refresh session and clear local credentials.", $fontBody, $brushTextMuted, [System.Drawing.RectangleF]::new(470, 304, 340, 50))

$g.FillRectangle($brushDanger, [System.Drawing.Rectangle]::new(470, 370, 340, 42))
$g.DrawString("Yes, Sign Out", $fontBodyBold, $brushWhite, 590, 382)

$g.FillRectangle($brushBgMain, [System.Drawing.Rectangle]::new(470, 422, 340, 42))
$g.DrawRectangle($penBorder, [System.Drawing.Rectangle]::new(470, 422, 340, 42))
$g.DrawString("Cancel & Stay Logged In", $fontBodyBold, $brushTextDark, 550, 434)

$bmp.Save("$outputDir/signout-confirmation-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created Prototype: signout-confirmation-desktop.png"

Write-Host "All Phase 5 Prototype Pictures successfully generated in $outputDir!"

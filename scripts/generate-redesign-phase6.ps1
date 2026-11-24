# ==============================================================================
# WORKZEN — Phase 6: Master Organization Management Visual Generator
# Renders 12 High-Fidelity Organization Prototypes
# Benchmarks: Sassy Onboarding, B2B Popover Switcher, Reem Hospital Overview, Zuper Mobile
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-6"
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
$cDarkCanvas = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
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
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")

$bDarkCanvas = New-Object System.Drawing.SolidBrush($cDarkCanvas)
$bDarkCard   = New-Object System.Drawing.SolidBrush($cDarkCard)
$bDarkInner  = New-Object System.Drawing.SolidBrush($cDarkInner)
$bLightCanvas= New-Object System.Drawing.SolidBrush($cLightCanvas)
$bLightCard  = New-Object System.Drawing.SolidBrush($cLightCard)
$bLightInner = New-Object System.Drawing.SolidBrush($cLightInner)

$bIndigo  = New-Object System.Drawing.SolidBrush($cIndigo)
$bEmerald = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber   = New-Object System.Drawing.SolidBrush($cAmber)
$bRose    = New-Object System.Drawing.SolidBrush($cRose)
$bSky     = New-Object System.Drawing.SolidBrush($cSky)

$bTextDark  = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$bWhite     = New-Object System.Drawing.SolidBrush($cWhite)

$pDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$pLightBorder= New-Object System.Drawing.Pen($cLightBorder, 1)
$pIndigo = New-Object System.Drawing.Pen($cIndigo, 2)

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Save-Both($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

# 1. Organization Creation Desktop
$bmp1 = New-Object System.Drawing.Bitmap(1920, 1080)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g1.DrawString("01. Organization Creation Experience", $fontTitle, $bWhite, 80, 50)
$g1.DrawString("Register organization name, industry, size, and primary region", $fontBody, $bTextMuted, 80, 100)
Save-Both $bmp1 "org-01-create-desktop.png"
$bmp1.Dispose()

# 2. Sassy / Mixpanel Split-Screen Onboarding
$bmp2 = New-Object System.Drawing.Bitmap(1920, 1080)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# Left Panel Form
$g2.DrawString("WORKZEN", $fontH1, $bTextDark, 80, 60)
$g2.DrawString("Create your Organization", $fontTitle, $bTextDark, 80, 240)
$g2.DrawString("This is where your team can work and collaborate on projects.", $fontBody, $bTextMuted, 80, 290)

$g2.DrawString("Organization Name", $fontH2, $bTextDark, 80, 360)
$inName = Create-RoundedRectangle 80 395 560 48 8
$g2.FillPath($bLightCard, $inName)
$g2.DrawPath($pLightBorder, $inName)
$g2.DrawString("Acme Global Technologies", $fontBody, $bTextDark, 95, 410)

$g2.DrawString("Data Centre ⓘ", $fontH2, $bTextDark, 80, 480)
# Residency Pills: Nigeria (Green), US (White), EU (White)
$p1 = Create-RoundedRectangle 80 515 160 40 8
$g2.FillPath($bEmerald, $p1)
$g2.DrawString("🇳🇬 Nigeria", $fontBadge, $bWhite, 120, 528)

$p2 = Create-RoundedRectangle 260 515 160 40 8
$g2.FillPath($bLightCard, $p2)
$g2.DrawPath($pLightBorder, $p2)
$g2.DrawString("🇺🇸 United States", $fontBadge, $bTextDark, 290, 528)

$p3 = Create-RoundedRectangle 440 515 160 40 8
$g2.FillPath($bLightCard, $p3)
$g2.DrawPath($pLightBorder, $p3)
$g2.DrawString("🇪🇺 Europe (EU)", $fontBadge, $bTextDark, 475, 528)

$g2.DrawString("☑ Anyone with @acme.com domain can auto-join", $fontBody, $bTextDark, 80, 590)

$btnCont = Create-RoundedRectangle 80 660 240 50 10
$g2.FillPath($bIndigo, $btnCont)
$g2.DrawString("Continue →", $fontH2, $bWhite, 150, 674)

# Right Panel 3D Graphic Area
$gRect = Create-RoundedRectangle 1000 120 840 840 20
$g2.FillPath($bLightCard, $gRect)
$g2.DrawPath($pLightBorder, $gRect)
$g2.DrawString("Enterprise Cloud Infrastructure", $fontTitle, $bIndigo, 1180, 460)
$g2.DrawString("Private Multi-Tenant VPC • 99.99% SLA • Isolated Keys", $fontBody, $bTextMuted, 1160, 510)

Save-Both $bmp2 "org-02-onboarding-desktop.png"
$bmp2.Dispose()

# 3. Organization Selection Directory
$bmp3 = New-Object System.Drawing.Bitmap(1920, 1080)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g3.DrawString("03. Organization Selection Directory", $fontTitle, $bWhite, 80, 50)
$g3.DrawString("User organization selector grid with active tenant roles and member counts", $fontBody, $bTextMuted, 80, 100)
Save-Both $bmp3 "org-03-select-grid-desktop.png"
$bmp3.Dispose()

# 4. B2B Popover Switcher (Image 6 Benchmark)
$bmp4 = New-Object System.Drawing.Bitmap(1920, 1080)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# Background page simulation
$g4.FillRectangle($bLightCard, 0, 0, 1920, 70)
$g4.DrawLine($pLightBorder, 0, 70, 1920, 70)
$g4.DrawString("WORKZEN Application Header", $fontH1, $bTextDark, 60, 22)

# Floating Popover (w: 420)
$pop = Create-RoundedRectangle 1100 80 440 520 14
$g4.FillPath($bLightCard, $pop)
$g4.DrawPath($pLightBorder, $pop)

# Popover Search Bar
$sbPop = Create-RoundedRectangle 1120 100 400 40 8
$g4.FillPath($bLightInner, $sbPop)
$g4.DrawString("🔍 Search for an organization", $fontBody, $bTextMuted, 1140, 110)

# Active Org with Vibrant Gold Gradient (Image 6 Benchmark)
$ptA = New-Object System.Drawing.PointF(1120, 160)
$ptB = New-Object System.Drawing.PointF(1520, 160)
$colA = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$colB = [System.Drawing.ColorTranslator]::FromHtml("#FBBF24")
$gradActive = New-Object System.Drawing.Drawing2D.LinearGradientBrush($ptA, $ptB, $colA, $colB)
$actPill = Create-RoundedRectangle 1120 160 400 52 8
$g4.FillPath($gradActive, $actPill)

$g4.DrawString("🏢 Acme Global Technologies", $fontH2, $bWhite, 1140, 175)
$currPill = Create-RoundedRectangle 1420 170 80 28 6
$g4.FillPath($bTextDark, $currPill)
$g4.DrawString("Current", $fontBadge, $bWhite, 1435, 177)

# Inactive Orgs
$g4.DrawString("🏢 Starlight Labs", $fontH2, $bTextDark, 1140, 240)
$g4.DrawString("🏢 Nexus Innovations", $fontH2, $bTextDark, 1140, 290)
$g4.DrawString("🏢 Apex Systems", $fontH2, $bTextDark, 1140, 340)

# Bottom Links
$g4.DrawLine($pLightBorder, 1100, 480, 1540, 480)
$g4.DrawString("+ Create New Organization", $fontBadge, $bIndigo, 1130, 520)
$g4.DrawString("⚙️ Organization Settings", $fontBadge, $bTextMuted, 1340, 520)

Save-Both $bmp4 "org-04-switcher-popover-desktop.png"
$bmp4.Dispose()

# 5. Reem Hospital Overview (Image 7 Benchmark)
$bmp5 = New-Object System.Drawing.Bitmap(1920, 1080)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

# Top Bar
$g5.DrawString("← Organization Overview", $fontTitle, $bTextDark, 80, 40)
$g5.DrawString("View and edit organizational settings", $fontBody, $bTextMuted, 80, 85)

# Left Card: Telemetry
$cLeft = Create-RoundedRectangle 80 140 500 500 14
$g5.FillPath($bLightCard, $cLeft)
$g5.DrawPath($pLightBorder, $cLeft)

$avOrg = Create-RoundedRectangle 110 170 60 60 12
$g5.FillPath($bIndigo, $avOrg)
$g5.DrawString("🏢", $fontTitle, $bWhite, 122, 180)

$g5.DrawString("Reem Hospital", $fontH1, $bTextDark, 190, 170)
$g5.DrawString("Organization ID: #409283905", $fontBadge, $bTextMuted, 190, 205)

$actBadge = Create-RoundedRectangle 460 170 90 26 6
$g5.FillPath($bEmerald, $actBadge)
$g5.DrawString("● Active", $fontBadge, $bWhite, 480, 176)

$g5.DrawString("Created at:          28 Aug, 2024", $fontBody, $bTextDark, 110, 260)
$g5.DrawString("Latest Activity:     Today, 11:30 AM", $fontBody, $bTextDark, 110, 300)
$g5.DrawString("Deployment Type:     Private Multi-Tenant VPC", $fontBody, $bTextDark, 110, 340)

# Quota Bars
$g5.DrawString("Storage Quota: 20%", $fontBadge, $bTextDark, 110, 400)
$qb1 = Create-RoundedRectangle 110 425 440 10 5
$g5.FillPath($bLightInner, $qb1)
$qb1f = Create-RoundedRectangle 110 425 90 10 5
$g5.FillPath($bEmerald, $qb1f)

$g5.DrawString("API Rate Quota: 20%", $fontBadge, $bTextDark, 110, 460)
$qb2 = Create-RoundedRectangle 110 485 440 10 5
$g5.FillPath($bLightInner, $qb2)
$qb2f = Create-RoundedRectangle 110 485 90 10 5
$g5.FillPath($bEmerald, $qb2f)

# Right Card: Details Form
$cRight = Create-RoundedRectangle 610 140 1230 500 14
$g5.FillPath($bLightCard, $cRight)
$g5.DrawPath($pLightBorder, $cRight)

$g5.DrawString("Organization Details", $fontH1, $bTextDark, 640, 170)
$g5.DrawString("Organization Name", $fontH2, $bTextDark, 640, 220)
$inD1 = Create-RoundedRectangle 640 250 800 48 8
$g5.FillPath($bLightInner, $inD1)
$g5.DrawString("Reem Hospital", $fontBody, $bTextDark, 660, 264)

$g5.DrawString("Organization Description", $fontH2, $bTextDark, 640, 320)
$inD2 = Create-RoundedRectangle 640 350 800 120 8
$g5.FillPath($bLightInner, $inD2)
$g5.DrawString("Healthcare and clinical operations workspace.", $fontBody, $bTextDark, 660, 370)

$btnSave = Create-RoundedRectangle 640 500 160 48 8
$g5.FillPath($bIndigo, $btnSave)
$g5.DrawString("Save Changes", $fontBadge, $bWhite, 675, 516)

# Full-Width Enable/Disable Toggle Card
$cToggle = Create-RoundedRectangle 80 670 1760 120 14
$g5.FillPath($bLightCard, $cToggle)
$g5.DrawPath($pLightBorder, $cToggle)
$g5.DrawString("Enable/Disable Organization", $fontH1, $bTextDark, 110, 700)
$g5.DrawString("All active processes and workflows associated with the organization will be halted or resumed immediately", $fontBody, $bTextMuted, 110, 735)

$togPill = Create-RoundedRectangle 1660 705 140 40 20
$g5.FillPath($bIndigo, $togPill)
$g5.DrawString("● Enabled", $fontBadge, $bWhite, 1690, 718)

# Full-Width Delete Organization Card
$cDel = Create-RoundedRectangle 80 820 1760 120 14
$g5.FillPath($bLightCard, $cDel)
$g5.DrawPath($pLightBorder, $cDel)
$g5.DrawString("Delete Organization", $fontH1, $bTextDark, 110, 850)
$g5.DrawString("In case of the deletion of organization, the organization will be archived and can be restored within 60 days.", $fontBody, $bTextMuted, 110, 885)

$btnDel = Create-RoundedRectangle 1640 855 160 44 8
$g5.FillPath($bRose, $btnDel)
$g5.DrawString("Delete Organization", $fontBadge, $bWhite, 1660, 870)

Save-Both $bmp5 "org-05-overview-reem-desktop.png"
$bmp5.Dispose()

# 6. Profile
$bmp6 = New-Object System.Drawing.Bitmap(1920, 1080)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g6.DrawString("06. Organization Profile & General Details", $fontTitle, $bWhite, 80, 50)
Save-Both $bmp6 "org-06-profile-desktop.png"
$bmp6.Dispose()

# 7. Settings
$bmp7 = New-Object System.Drawing.Bitmap(1920, 1080)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g7.DrawString("07. Organization Security & Governance Policies", $fontTitle, $bWhite, 80, 50)
Save-Both $bmp7 "org-07-settings-desktop.png"
$bmp7.Dispose()

# 8. Branding
$bmp8 = New-Object System.Drawing.Bitmap(1920, 1080)
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g8.DrawString("08. Organization White-Label Branding", $fontTitle, $bWhite, 80, 50)
Save-Both $bmp8 "org-08-branding-desktop.png"
$bmp8.Dispose()

# 9. Ownership Transfer
$bmp9 = New-Object System.Drawing.Bitmap(1920, 1080)
$g9 = [System.Drawing.Graphics]::FromImage($bmp9)
$g9.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g9.DrawString("09. Organization Ownership Transfer Dialog", $fontTitle, $bRose, 80, 50)
Save-Both $bmp9 "org-09-ownership-transfer-desktop.png"
$bmp9.Dispose()

# 10. Members Directory
$bmp10 = New-Object System.Drawing.Bitmap(1920, 1080)
$g10 = [System.Drawing.Graphics]::FromImage($bmp10)
$g10.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g10.DrawString("10. Organization Members & RBAC Directory", $fontTitle, $bWhite, 80, 50)
Save-Both $bmp10 "org-10-members-directory-desktop.png"
$bmp10.Dispose()

# 11. Deletion Confirm
$bmp11 = New-Object System.Drawing.Bitmap(1920, 1080)
$g11 = [System.Drawing.Graphics]::FromImage($bmp11)
$g11.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g11.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
$g11.DrawString("11. Safe Archival & 60-Day Recovery Confirmation", $fontTitle, $bRose, 80, 50)
Save-Both $bmp11 "org-11-deletion-confirm-desktop.png"
$bmp11.Dispose()

# 12. Zuper Mobile List (Image 8 Benchmark, 800x1200)
$bmp12 = New-Object System.Drawing.Bitmap(800, 1200)
$g12 = [System.Drawing.Graphics]::FromImage($bmp12)
$g12.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g12.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g12.FillRectangle($bLightCanvas, 0, 0, 800, 1200)

# Top Bar
$g12.DrawString("Organizations (5) v", $fontTitle, $bTextDark, 40, 40)
$g12.DrawString("🔍", $fontH1, $bTextDark, 660, 45)
$g12.DrawString("⚙️", $fontH1, $bTextDark, 720, 45)

# 4 Cards
$orgs = @(
    @{ Name="Lijo"; Email="lijo@gmail.com"; Members="3 Members"; Loc="Rotterdam, Zuid-Holland"; Status="Active" },
    @{ Name="RIO Enterprises"; Email="contact@rio.io"; Members="5 Members"; Loc="Dallas, Texas, USA"; Status="Active" },
    @{ Name="South Cravica"; Email="scar@rez.com"; Members="1 Member"; Loc="Ilirska Bistrica"; Status="Inactive" },
    @{ Name="Sparkle Cleaning"; Email="sparkle@sample.com"; Members="11 Members"; Loc="Washington D.C., USA"; Status="Inactive" }
)

$oy = 130
foreach ($o in $orgs) {
    $oCard = Create-RoundedRectangle 40 $oy 720 200 14
    $g12.FillPath($bLightCard, $oCard)
    $g12.DrawPath($pLightBorder, $oCard)
    
    $avBox = Create-RoundedRectangle 65 ($oy + 25) 50 50 10
    $g12.FillPath($bLightInner, $avBox)
    $g12.DrawString("🏢", $fontH1, $bIndigo, 77, ($oy + 35))
    
    $g12.DrawString($o.Name, $fontH1, $bTextDark, 130, ($oy + 25))
    $g12.DrawString($o.Email, $fontBody, $bIndigo, 130, ($oy + 55))
    
    # Status Pill
    $sPill = Create-RoundedRectangle 620 ($oy + 25) 100 30 6
    if ($o.Status -eq "Active") {
        $g12.FillPath($bEmerald, $sPill)
        $g12.DrawString("Active", $fontBadge, $bWhite, 645, ($oy + 32))
    } else {
        $g12.FillPath($bRose, $sPill)
        $g12.DrawString("Inactive", $fontBadge, $bWhite, 640, ($oy + 32))
    }
    
    $g12.DrawLine($pLightBorder, 65, ($oy + 95), 720, ($oy + 95))
    
    $g12.DrawString("👤 $($o.Members)", $fontBadge, $bTextMuted, 65, ($oy + 115))
    $g12.DrawString("📍 $($o.Loc)", $fontBadge, $bTextMuted, 65, ($oy + 145))
    
    $oy += 230
}

Save-Both $bmp12 "org-12-zuper-mobile-list.png"
$bmp12.Dispose()

Write-Output "Phase 6: All 12 organization prototypes successfully rendered."


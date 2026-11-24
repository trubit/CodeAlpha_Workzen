# ==============================================================================
# WORKZEN — Phase 9: Master Enterprise Team Management Visual Generator
# Renders 21 Desktop (1920x1080) and 21 Mobile (800x1200) Prototypes
# Visual Identity: WORKZEN Premium Slate Dark & Precision Enterprise Light
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-9"
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

# Palette
$cDarkCanvas = [System.Drawing.ColorTranslator]::FromHtml("#0B0C10")
$cDarkSidebar= [System.Drawing.ColorTranslator]::FromHtml("#11131A")
$cDarkCard   = [System.Drawing.ColorTranslator]::FromHtml("#181924")
$cDarkInner  = [System.Drawing.ColorTranslator]::FromHtml("#202230")
$cDarkBorder = [System.Drawing.ColorTranslator]::FromHtml("#2C2E42")

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
$cTeal    = [System.Drawing.ColorTranslator]::FromHtml("#14B8A6")

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
$bLightBorder= New-Object System.Drawing.SolidBrush($cLightBorder)

$bIndigo  = New-Object System.Drawing.SolidBrush($cIndigo)
$bPurple  = New-Object System.Drawing.SolidBrush($cPurple)
$bEmerald = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber   = New-Object System.Drawing.SolidBrush($cAmber)
$bRose    = New-Object System.Drawing.SolidBrush($cRose)
$bSky     = New-Object System.Drawing.SolidBrush($cSky)
$bTeal    = New-Object System.Drawing.SolidBrush($cTeal)

$bTextDark  = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim   = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite     = New-Object System.Drawing.SolidBrush($cWhite)

$pDarkBorder = New-Object System.Drawing.Pen($cDarkBorder, 1)
$pLightBorder= New-Object System.Drawing.Pen($cLightBorder, 1)
$pIndigo = New-Object System.Drawing.Pen($cIndigo, 2)
$pRose   = New-Object System.Drawing.Pen($cRose, 2)
$pEmerald= New-Object System.Drawing.Pen($cEmerald, 2)
$pAmber  = New-Object System.Drawing.Pen($cAmber, 2)

$fontHero  = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Save-Image-Pair($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $p2 = Join-Path $screenDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-TopNav($g, $width, $activeTab, $isDark) {
    $barBrush = if ($isDark) { $bDarkSidebar } else { $bLightCard }
    $g.FillRectangle($barBrush, 0, 0, $width, 70)
    $borderPen = if ($isDark) { $pDarkBorder } else { $pLightBorder }
    $g.DrawLine($borderPen, 0, 70, $width, 70)

    # Logo
    $g.FillRectangle($bIndigo, 30, 18, 34, 34)
    $g.DrawString("W", $fontH1, $bWhite, 41, 24)
    $brandBrush = if ($isDark) { $bWhite } else { $bTextDark }
    $g.DrawString("WORKZEN", $fontH1, $brandBrush, 75, 24)
    $g.DrawString("TEAM MANAGEMENT", $fontBadge, $bIndigo, 165, 28)

    # Search bar
    $sb = Create-RoundedRectangle 340 18 360 34 8
    $sbFill = if ($isDark) { $bDarkInner } else { $bLightInner }
    $g.FillPath($sbFill, $sb)
    $g.DrawString("Search members, emails, roles (Ctrl+K)...", $fontBody, $bTextMuted, 355, 25)

    # Navigation Tabs
    $tabs = @("Directory", "Pending Invitations", "Workspace Access", "Team Audit History")
    $tx = 730
    foreach ($tab in $tabs) {
        $isActive = ($tab -eq $activeTab)
        if ($isActive) {
            $tabRect = Create-RoundedRectangle $tx 18 165 34 6
            $g.FillPath($bIndigo, $tabRect)
            $g.DrawString($tab, $fontH2, $bWhite, ($tx + 12), 25)
        } else {
            $tBrush = if ($isDark) { $bTextDim } else { $bTextMuted }
            $g.DrawString($tab, $fontH2, $tBrush, ($tx + 12), 25)
        }
        $tx += 175
    }

    # Org Pill & User Avatar
    $orgPill = Create-RoundedRectangle ($width - 240) 18 160 34 8
    $g.FillPath($sbFill, $orgPill)
    $g.DrawString("Acme Global Org", $fontH2, $brandBrush, ($width - 230), 25)
    $avatar = Create-RoundedRectangle ($width - 65) 16 38 38 19
    $g.FillPath($bEmerald, $avatar)
    $g.DrawString("AO", $fontBadge, $bWhite, ($width - 55), 26)
}

function Draw-Sidebar($g, $height, $activeItem, $isDark) {
    $sbWidth = 260
    $sbBrush = if ($isDark) { $bDarkSidebar } else { $bLightCard }
    $g.FillRectangle($sbBrush, 0, 70, $sbWidth, $height - 70)
    $borderPen = if ($isDark) { $pDarkBorder } else { $pLightBorder }
    $g.DrawLine($borderPen, $sbWidth, 70, $sbWidth, $height)

    $items = @("Dashboard", "Projects", "Workspaces", "Team Members", "Roles & RBAC", "Settings", "Audit Log")
    $sy = 100
    foreach ($item in $items) {
        $isActive = ($item -eq $activeItem)
        if ($isActive) {
            $itemRect = Create-RoundedRectangle 16 $sy 228 40 8
            $g.FillPath($bIndigo, $itemRect)
            $g.DrawString($item, $fontH2, $bWhite, 40, ($sy + 10))
        } else {
            $iBrush = if ($isDark) { $bTextDim } else { $bTextMuted }
            $g.DrawString($item, $fontH2, $iBrush, 40, ($sy + 10))
        }
        $sy += 50
    }
}

function Render-Screen($title, $subtitle, $activeTab, $renderContent, $filenameBase) {
    # Desktop (1920x1080)
    $bDesktop = New-Object System.Drawing.Bitmap(1920, 1080)
    $gDesktop = [System.Drawing.Graphics]::FromImage($bDesktop)
    $gDesktop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gDesktop.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)

    Draw-TopNav $gDesktop 1920 $activeTab $false
    Draw-Sidebar $gDesktop 1080 "Team Members" $false

    # Page Header in main canvas
    $gDesktop.DrawString($title, $fontHero, $bTextDark, 300, 100)
    $gDesktop.DrawString($subtitle, $fontBody, $bTextMuted, 300, 145)

    # Invoke custom content renderer
    & $renderContent $gDesktop 300 180 1570 860 $false

    Save-Image-Pair $bDesktop "$filenameBase-desktop.png"
    $gDesktop.Dispose()
    $bDesktop.Dispose()

    # Mobile (800x1200)
    $bMobile = New-Object System.Drawing.Bitmap(800, 1200)
    $gMobile = [System.Drawing.Graphics]::FromImage($bMobile)
    $gMobile.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gMobile.FillRectangle($bLightCanvas, 0, 0, 800, 1200)

    # Mobile Header
    $gMobile.FillRectangle($bLightCard, 0, 0, 800, 65)
    $gMobile.DrawLine($pLightBorder, 0, 65, 800, 65)
    $gMobile.FillRectangle($bIndigo, 20, 16, 32, 32)
    $gMobile.DrawString("W", $fontH1, $bWhite, 30, 21)
    $gMobile.DrawString("WORKZEN TEAM", $fontH1, $bTextDark, 65, 21)
    
    $avMob = Create-RoundedRectangle 740 15 35 35 17
    $gMobile.FillPath($bEmerald, $avMob)
    $gMobile.DrawString("AO", $fontBadge, $bWhite, 747, 24)

    # Mobile Title
    $gMobile.DrawString($title, $fontTitle, $bTextDark, 25, 85)
    $gMobile.DrawString($subtitle, $fontBody, $bTextMuted, 25, 120)

    # Invoke custom content renderer
    & $renderContent $gMobile 25 155 750 1010 $true

    Save-Image-Pair $bMobile "$filenameBase-mobile.png"
    $gMobile.Dispose()
    $bMobile.Dispose()
}

Write-Host "Rendering 21 Phase 9 High-Fidelity Prototypes & Screenshots..." -ForegroundColor Cyan

# 1. Team Management Overview
Render-Screen "Team Management Overview" "Tenant directory, active seats, and operational membership metrics" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    # 4 Stat Cards
    $cw = if ($isMob) { $w } else { [int](($w - 60) / 4) }
    $stats = @(
        @("Total Members", "24 Active", "+3 this month", $cIndigo),
        @("Pending Invites", "4 Awaiting", "Expiring in 7 days", $cAmber),
        @("Workspaces Assigned", "12 Active", "100% tenant scoped", $cEmerald),
        @("Seat Capacity", "28 / 50 Used", "Enterprise Plan", $cPurple)
    )
    for ($i = 0; $i -lt $stats.Count; $i++) {
        $cx = if ($isMob) { $x } else { $x + $i * ($cw + 20) }
        $cy = if ($isMob) { $y + $i * 105 } else { $y }
        $cardH = if ($isMob) { 90 } else { 120 }
        $card = Create-RoundedRectangle $cx $cy $cw $cardH 12
        $g.FillPath($bLightCard, $card)
        $g.DrawPath($pLightBorder, $card)
        $g.DrawString($stats[$i][0], $fontBadge, $bTextMuted, ($cx + 20), ($cy + 18))
        $g.DrawString($stats[$i][1], $fontTitle, $bTextDark, ($cx + 20), ($cy + 40))
        $g.DrawString($stats[$i][2], $fontBody, (New-Object System.Drawing.SolidBrush($stats[$i][3])), ($cx + 20), ($cy + 80))
    }

    # Main Card
    $my = if ($isMob) { $y + 440 } else { $y + 150 }
    $mh = if ($isMob) { $h - 450 } else { $h - 160 }
    $mainCard = Create-RoundedRectangle $x $my $w $mh 12
    $g.FillPath($bLightCard, $mainCard)
    $g.DrawPath($pLightBorder, $mainCard)

    $g.DrawString("Organization Team Roster", $fontH1, $bTextDark, ($x + 25), ($my + 20))
    $g.DrawString("Authenticated users authorized for multi-tenant collaboration", $fontBody, $bTextMuted, ($x + 25), ($my + 45))
} "team-01-team-management-overview"

# 2. Team Member Directory
Render-Screen "Team Member Directory" "Search, inspect, and manage tenant members across all authorized roles" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $mainCard = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $mainCard)
    $g.DrawPath($pLightBorder, $mainCard)

    $g.DrawString("Active Organization Members (24)", $fontH1, $bTextDark, ($x + 25), ($y + 20))
    
    # Table headers
    $g.DrawLine($pLightBorder, ($x + 20), ($y + 60), ($x + $w - 20), ($y + 60))
    $g.DrawString("MEMBER", $fontBadge, $bTextMuted, ($x + 30), ($y + 70))
    $g.DrawString("EMAIL", $fontBadge, $bTextMuted, ($x + 260), ($y + 70))
    $g.DrawString("ROLE", $fontBadge, $bTextMuted, ($x + 520), ($y + 70))
    $g.DrawString("STATUS", $fontBadge, $bTextMuted, ($x + 700), ($y + 70))
    $g.DrawString("WORKSPACES", $fontBadge, $bTextMuted, ($x + 850), ($y + 70))
    $g.DrawString("ACTIONS", $fontBadge, $bTextMuted, ($x + $w - 120), ($y + 70))
    $g.DrawLine($pLightBorder, ($x + 20), ($y + 95), ($x + $w - 20), ($y + 95))

    # Sample Member Rows
    $members = @(
        @("Alex Morgan", "Owner", "alex@acme.com", "Active", "4 Workspaces", "AM", $cIndigo),
        @("Sarah Jenkins", "Admin", "sarah.j@acme.com", "Active", "3 Workspaces", "SJ", $cPurple),
        @("Marcus Vance", "Manager", "marcus.v@acme.com", "Active", "2 Workspaces", "MV", $cEmerald),
        @("Elena Rostova", "Member", "elena.r@acme.com", "Active", "1 Workspace", "ER", $cSky),
        @("David Kim", "Viewer", "david.k@acme.com", "Suspended", "0 Workspaces", "DK", $cRose)
    )
    $ry = $y + 115
    foreach ($m in $members) {
        $av = Create-RoundedRectangle ($x + 30) $ry 32 32 16
        $g.FillPath((New-Object System.Drawing.SolidBrush($m[6])), $av)
        $g.DrawString($m[5], $fontBadge, $bWhite, ($x + 38), ($ry + 8))
        $g.DrawString($m[0], $fontH2, $bTextDark, ($x + 75), ($ry + 7))
        $g.DrawString($m[2], $fontBody, $bTextMuted, ($x + 260), ($ry + 7))
        
        # Role Pill
        $rp = Create-RoundedRectangle ($x + 520) ($ry + 4) 80 24 6
        $g.FillPath($bLightInner, $rp)
        $g.DrawString($m[1], $fontBadge, $bTextDark, ($x + 535), ($ry + 8))

        # Status Pill
        $stColor = if ($m[3] -eq "Active") { $cEmerald } else { $cRose }
        $sp = Create-RoundedRectangle ($x + 700) ($ry + 4) 75 24 6
        $g.FillPath($bLightInner, $sp)
        $g.DrawString($m[3], $fontBadge, (New-Object System.Drawing.SolidBrush($stColor)), ($x + 715), ($ry + 8))

        $g.DrawString($m[4], $fontBody, $bTextMuted, ($x + 850), ($ry + 7))
        $g.DrawString("Manage", $fontH2, $bIndigo, ($x + $w - 110), ($ry + 7))

        $g.DrawLine($pLightBorder, ($x + 20), ($ry + 45), ($x + $w - 20), ($ry + 45))
        $ry += 60
    }
} "team-02-member-directory"

# 3. Member Search, Filtering, and Sorting
Render-Screen "Member Search, Filtering & Sorting" "Real-time fuzzy search, role facet filtering, and multi-column sorting" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $mainCard = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $mainCard)
    $g.DrawPath($pLightBorder, $mainCard)

    # Search and Filter Toolbar
    $searchBox = Create-RoundedRectangle ($x + 25) ($y + 20) 380 40 8
    $g.FillPath($bLightInner, $searchBox)
    $g.DrawPath($pIndigo, $searchBox)
    $g.DrawString("sarah", $fontH2, $bTextDark, ($x + 40), ($y + 30))

    # Filters
    $filter1 = Create-RoundedRectangle ($x + 425) ($y + 20) 140 40 8
    $g.FillPath($bLightInner, $filter1)
    $g.DrawString("Role: All Roles", $fontBody, $bTextDark, ($x + 440), ($y + 30))

    $filter2 = Create-RoundedRectangle ($x + 580) ($y + 20) 140 40 8
    $g.FillPath($bLightInner, $filter2)
    $g.DrawString("Status: Active", $fontBody, $bTextDark, ($x + 595), ($y + 30))

    $g.DrawString("Showing 1 matched member", $fontBody, $bTextMuted, ($x + 25), ($y + 80))
    $g.DrawLine($pLightBorder, ($x + 20), ($y + 110), ($x + $w - 20), ($y + 110))

    # Matched Row
    $av = Create-RoundedRectangle ($x + 30) ($y + 130) 36 36 18
    $g.FillPath($bPurple, $av)
    $g.DrawString("SJ", $fontBadge, $bWhite, ($x + 40), ($y + 140))
    $g.DrawString("Sarah Jenkins (Match)", $fontH2, $bIndigo, ($x + 80), ($y + 138))
    $g.DrawString("sarah.j@acme.com", $fontBody, $bTextMuted, ($x + 320), ($y + 138))
    $g.DrawString("Admin", $fontBadge, $bTextDark, ($x + 540), ($y + 138))
} "team-03-search-filter-sort"

# 4. Invite Team Member Modal
Render-Screen "Invite Team Member Modal" "Launch modal with verified email validation and multi-tenant scoping" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    # Modal backdrop
    $overlay = Create-RoundedRectangle ($x + 200) ($y + 40) 800 620 16
    $g.FillPath($bLightCard, $overlay)
    $g.DrawPath($pIndigo, $overlay)

    $g.DrawString("Invite Team Member to Acme Global Org", $fontTitle, $bTextDark, ($x + 240), ($y + 70))
    $g.DrawString("Enter corporate email and select organization role", $fontBody, $bTextMuted, ($x + 240), ($y + 105))

    # Input Fields
    $g.DrawString("Corporate Email Address *", $fontH2, $bTextDark, ($x + 240), ($y + 160))
    $in1 = Create-RoundedRectangle ($x + 240) ($y + 190) 720 45 8
    $g.FillPath($bLightInner, $in1)
    $g.DrawString("engineer@partner.com", $fontH2, $bTextDark, ($x + 255), ($y + 202))

    $g.DrawString("Select Organization Role *", $fontH2, $bTextDark, ($x + 240), ($y + 260))
    $in2 = Create-RoundedRectangle ($x + 240) ($y + 290) 720 45 8
    $g.FillPath($bLightInner, $in2)
    $g.DrawString("Member (Standard task author and workspace contributor)", $fontBody, $bTextDark, ($x + 255), ($y + 302))

    # Action Buttons
    $btnCancel = Create-RoundedRectangle ($x + 640) ($y + 570) 140 45 8
    $g.FillPath($bLightInner, $btnCancel)
    $g.DrawString("Cancel", $fontH2, $bTextMuted, ($x + 685), ($y + 582))

    $btnSend = Create-RoundedRectangle ($x + 800) ($y + 570) 160 45 8
    $g.FillPath($bIndigo, $btnSend)
    $g.DrawString("Send Invitation", $fontH2, $bWhite, ($x + 825), ($y + 582))
} "team-04-invite-member-modal"

# 5. Invitation Form with Workspace Assignment
Render-Screen "Invitation Form With Workspace Assignment" "Fine-grained workspace assignment during member invitation" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $modal = Create-RoundedRectangle ($x + 180) ($y + 20) 840 720 16
    $g.FillPath($bLightCard, $modal)
    $g.DrawPath($pLightBorder, $modal)

    $g.DrawString("Assign Initial Workspaces", $fontTitle, $bTextDark, ($x + 220), ($y + 50))
    $g.DrawString("New members will automatically gain access to checked workspaces", $fontBody, $bTextMuted, ($x + 220), ($y + 85))

    $wsList = @(
        @("Engineering Workspace", "Core development and PR tracking", $true),
        @("Product Workspace", "Roadmaps and user stories", $true),
        @("Marketing Operations", "Content calendars and campaigns", $false),
        @("Customer Support", "Ticket triage and client escalations", $false)
    )
    $wy = $y + 140
    foreach ($ws in $wsList) {
        $wbox = Create-RoundedRectangle ($x + 220) $wy 760 65 8
        $fillB = if ($ws[2]) { $bLightInner } else { $bWhite }
        $borderP = if ($ws[2]) { $pIndigo } else { $pLightBorder }
        $g.FillPath($fillB, $wbox)
        $g.DrawPath($borderP, $wbox)

        # Checkbox
        $cbFill = if ($ws[2]) { $bIndigo } else { $bLightInner }
        $cb = Create-RoundedRectangle ($x + 240) ($wy + 22) 20 20 4
        $g.FillPath($cbFill, $cb)
        if ($ws[2]) { $g.DrawString("v", $fontBadge, $bWhite, ($x + 245), ($wy + 23)) }

        $g.DrawString($ws[0], $fontH2, $bTextDark, ($x + 280), ($wy + 15))
        $g.DrawString($ws[1], $fontBody, $bTextMuted, ($x + 280), ($wy + 35))
        $wy += 85
    }
} "team-05-invitation-form"

# 6. Pending Invitations View
Render-Screen "Pending Invitations Directory" "Review awaiting invitations, token lifetimes, and invitation states" "Pending Invitations" {
    param($g, $x, $y, $w, $h, $isMob)
    $card = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $card)
    $g.DrawPath($pLightBorder, $card)

    $g.DrawString("Pending Organization Invitations (4)", $fontH1, $bTextDark, ($x + 25), ($y + 20))
    $g.DrawLine($pLightBorder, ($x + 20), ($y + 60), ($x + $w - 20), ($y + 60))

    $invites = @(
        @("lead.architect@partner.com", "Admin", "Alex Morgan", "Expires in 6 days", "Pending"),
        @("devops.spec@cloud.io", "Manager", "Sarah Jenkins", "Expires in 4 days", "Pending"),
        @("contractor.ui@agency.net", "Member", "Alex Morgan", "Expires in 2 days", "Pending"),
        @("qa.analyst@testing.com", "Viewer", "Marcus Vance", "Expires in 18 hours", "Pending")
    )
    $iy = $y + 90
    foreach ($inv in $invites) {
        $g.DrawString($inv[0], $fontH2, $bTextDark, ($x + 30), ($iy + 8))
        $g.DrawString("Role: " + $inv[1], $fontBody, $bTextMuted, ($x + 320), ($iy + 8))
        $g.DrawString("Invited by: " + $inv[2], $fontBody, $bTextMuted, ($x + 500), ($iy + 8))
        $g.DrawString($inv[3], $fontBadge, $bAmber, ($x + 720), ($iy + 9))

        # Actions
        $g.DrawString("Resend", $fontH2, $bIndigo, ($x + $w - 180), ($iy + 8))
        $g.DrawString("Cancel", $fontH2, $bRose, ($x + $w - 100), ($iy + 8))

        $g.DrawLine($pLightBorder, ($x + 20), ($iy + 40), ($x + $w - 20), ($iy + 40))
        $iy += 60
    }
} "team-06-pending-invitations"

# 7. Invitation Details Modal
Render-Screen "Invitation Details & Audit Metadata" "Cryptographic token verification, timestamp, and audit origin" "Pending Invitations" {
    param($g, $x, $y, $w, $h, $isMob)
    $dtl = Create-RoundedRectangle ($x + 250) ($y + 50) 720 500 16
    $g.FillPath($bLightCard, $dtl)
    $g.DrawPath($pLightBorder, $dtl)

    $g.DrawString("Invitation Details", $fontTitle, $bTextDark, ($x + 290), ($y + 80))
    $g.DrawString("lead.architect@partner.com", $fontH2, $bIndigo, ($x + 290), ($y + 120))

    $fields = @(
        @("Organization:", "Acme Global Org"),
        @("Assigned Role:", "Admin (Elevated Permissions)"),
        @("Invited By:", "Alex Morgan (Owner)"),
        @("Created At:", "Nov 18, 2026 14:15 UTC"),
        @("Expires At:", "Nov 25, 2026 14:15 UTC (Active)"),
        @("Token Integrity:", "SHA-256 Verified Token Hash")
    )
    $fy = $y + 170
    foreach ($f in $fields) {
        $g.DrawString($f[0], $fontBody, $bTextMuted, ($x + 290), $fy)
        $g.DrawString($f[1], $fontH2, $bTextDark, ($x + 450), $fy)
        $fy += 40
    }
} "team-07-invitation-details"

# 8. Invitation Acceptance Screen
Render-Screen "Invitation Acceptance Portal" "Public recipient onboarding with single-click organization joining" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $joinBox = Create-RoundedRectangle ($x + 280) ($y + 60) 660 520 16
    $g.FillPath($bLightCard, $joinBox)
    $g.DrawPath($pIndigo, $joinBox)

    $g.FillRectangle($bIndigo, ($x + 580), ($y + 90), 50, 50)
    $g.DrawString("W", $fontHero, $bWhite, ($x + 590), ($y + 95))

    $g.DrawString("Join Acme Global Org on WORKZEN", $fontTitle, $bTextDark, ($x + 380), ($y + 160))
    $g.DrawString("Alex Morgan invited you to collaborate as an Admin", $fontBody, $bTextMuted, ($x + 400), ($y + 195))

    $acceptBtn = Create-RoundedRectangle ($x + 420) ($y + 260) 380 50 8
    $g.FillPath($bIndigo, $acceptBtn)
    $g.DrawString("Accept Invitation & Join Team", $fontH1, $bWhite, ($x + 470), ($y + 273))

    $declineBtn = Create-RoundedRectangle ($x + 420) ($y + 330) 380 45 8
    $g.FillPath($bLightInner, $declineBtn)
    $g.DrawString("Decline Invitation", $fontH2, $bTextMuted, ($x + 540), ($y + 342))
} "team-08-invitation-acceptance"

# 9. Invitation Expired State
Render-Screen "Invitation Expired State" "Safe error handling when token lifetime has elapsed" "Pending Invitations" {
    param($g, $x, $y, $w, $h, $isMob)
    $expBox = Create-RoundedRectangle ($x + 320) ($y + 80) 580 420 16
    $g.FillPath($bLightCard, $expBox)
    $g.DrawPath($pRose, $expBox)

    $g.DrawString("Invitation Expired or Revoked", $fontTitle, $bRose, ($x + 420), ($y + 140))
    $g.DrawString("This invitation token has expired or was revoked by an administrator.", $fontBody, $bTextMuted, ($x + 360), ($y + 185))
    $g.DrawString("Please contact your organization owner to request a new invitation.", $fontBody, $bTextMuted, ($x + 375), ($y + 215))

    $btn = Create-RoundedRectangle ($x + 450) ($y + 280) 320 45 8
    $g.FillPath($bLightInner, $btn)
    $g.DrawString("Return to Home Portal", $fontH2, $bTextDark, ($x + 520), ($y + 292))
} "team-09-invitation-expired"

# 10. Member Profile & Details Drawer
Render-Screen "Member Profile & Details Drawer" "Comprehensive member dossier with contact, roles, and status" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $drawer = Create-RoundedRectangle ($x + $w - 550) $y 550 $h 12
    $g.FillPath($bLightCard, $drawer)
    $g.DrawPath($pLightBorder, $drawer)

    $av = Create-RoundedRectangle ($x + $w - 500) ($y + 40) 64 64 32
    $g.FillPath($bPurple, $av)
    $g.DrawString("SJ", $fontTitle, $bWhite, ($x + $w - 485), ($y + 55))

    $g.DrawString("Sarah Jenkins", $fontTitle, $bTextDark, ($x + $w - 410), ($y + 45))
    $g.DrawString("sarah.j@acme.com", $fontBody, $bTextMuted, ($x + $w - 410), ($y + 75))

    $g.DrawLine($pLightBorder, ($x + $w - 520), ($y + 130), ($x + $w - 30), ($y + 130))

    $info = @(
        @("Organization Role", "Admin"),
        @("Membership Status", "Active"),
        @("Joined Date", "November 12, 2026"),
        @("Last Activity", "12 minutes ago"),
        @("Two-Factor Auth", "Enforced & Active"),
        @("Workspaces Assigned", "3 Workspaces")
    )
    $iy = $y + 160
    foreach ($item in $info) {
        $g.DrawString($item[0], $fontBody, $bTextMuted, ($x + $w - 500), $iy)
        $g.DrawString($item[1], $fontH2, $bTextDark, ($x + $w - 280), $iy)
        $iy += 45
    }
} "team-10-member-profile-details"

# 11. Member Role and Permissions Overview
Render-Screen "Member Role & Permissions Overview" "Direct integration with Phase 8 RBAC matrix and role grants" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $box = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $box)
    $g.DrawPath($pLightBorder, $box)

    $g.DrawString("Effective Permissions for Sarah Jenkins (Admin)", $fontH1, $bTextDark, ($x + 30), ($y + 25))
    $g.DrawString("Derived from Organization Role: Admin (All organization-level management granted)", $fontBody, $bTextMuted, ($x + 30), ($y + 55))

    $perms = @(
        @("org:read", "Granted via Admin", $cEmerald),
        @("org:update", "Granted via Admin", $cEmerald),
        @("org:manage_members", "Granted via Admin", $cEmerald),
        @("org:manage_roles", "Granted via Admin", $cEmerald),
        @("workspace:create", "Granted via Admin", $cEmerald),
        @("workspace:manage_access", "Granted via Admin", $cEmerald),
        @("org:transfer_ownership", "Denied (Owner Only)", $cRose),
        @("org:archive", "Denied (Owner Only)", $cRose)
    )
    $py = $y + 100
    foreach ($p in $perms) {
        $pcard = Create-RoundedRectangle ($x + 30) $py ($w - 60) 45 6
        $g.FillPath($bLightInner, $pcard)
        $g.DrawString($p[0], $fontCode, $bTextDark, ($x + 50), ($py + 12))
        $g.DrawString($p[1], $fontBadge, (New-Object System.Drawing.SolidBrush($p[2])), ($x + $w - 250), ($py + 14))
        $py += 55
    }
} "team-11-member-role-permissions"

# 12. Workspace Membership Management
Render-Screen "Workspace Membership Management" "Configure workspace access boundaries per team member" "Workspace Access" {
    param($g, $x, $y, $w, $h, $isMob)
    $box = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $box)
    $g.DrawPath($pLightBorder, $box)

    $g.DrawString("Workspace Assignments for Sarah Jenkins", $fontH1, $bTextDark, ($x + 30), ($y + 25))
    
    $wsList = @(
        @("Engineering Workspace", "Admin", "Active"),
        @("Product Workspace", "Manager", "Active"),
        @("Marketing Operations", "Viewer", "Active"),
        @("Customer Support", "None", "No Access")
    )
    $wy = $y + 90
    foreach ($wItem in $wsList) {
        $wcard = Create-RoundedRectangle ($x + 30) $wy ($w - 60) 60 8
        $g.FillPath($bLightInner, $wcard)
        $g.DrawString($wItem[0], $fontH2, $bTextDark, ($x + 50), ($wy + 18))
        $g.DrawString("Workspace Role: " + $wItem[1], $fontBody, $bTextMuted, ($x + 380), ($wy + 18))
        $badgeB = if ($wItem[2] -eq "Active") { $bEmerald } else { $bTextMuted }
        $g.DrawString($wItem[2], $fontBadge, $badgeB, ($x + 650), ($wy + 20))
        $g.DrawString("Edit Access", $fontH2, $bIndigo, ($x + $w - 180), ($wy + 18))
        $wy += 75
    }
} "team-12-workspace-memberships"

# 13. Member Access & Status Management
Render-Screen "Member Access & Status Management" "Toggle member status between Active, Suspended, and Deactivated" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $card = Create-RoundedRectangle ($x + 200) ($y + 50) 800 520 16
    $g.FillPath($bLightCard, $card)
    $g.DrawPath($pLightBorder, $card)

    $g.DrawString("Update Member Status", $fontTitle, $bTextDark, ($x + 240), ($y + 80))
    $g.DrawString("Manage tenant authorization state for Elena Rostova (elena.r@acme.com)", $fontBody, $bTextMuted, ($x + 240), ($y + 115))

    $statuses = @(
        @("Active", "User has full access to permitted workspaces and projects", $true, $cEmerald),
        @("Suspended", "Temporary access lock; existing sessions immediately terminated", $false, $cAmber),
        @("Deactivated", "Soft-deactivated; all workspace access blocked while preserving history", $false, $cRose)
    )
    $sy = $y + 170
    foreach ($s in $statuses) {
        $sbox = Create-RoundedRectangle ($x + 240) $sy 720 70 8
        $sFill = if ($s[2]) { $bLightInner } else { $bWhite }
        $sBorder = if ($s[2]) { $pIndigo } else { $pLightBorder }
        $g.FillPath($sFill, $sbox)
        $g.DrawPath($sBorder, $sbox)
        $g.DrawString($s[0], $fontH2, (New-Object System.Drawing.SolidBrush($s[3])), ($x + 265), ($sy + 14))
        $g.DrawString($s[1], $fontBody, $bTextMuted, ($x + 265), ($sy + 38))
        $sy += 90
    }
} "team-13-member-access-status"

# 14. Deactivate Member Confirmation
Render-Screen "Deactivate Member Confirmation" "Security confirmation dialog preventing accidental lockout" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $dialog = Create-RoundedRectangle ($x + 260) ($y + 80) 680 400 16
    $g.FillPath($bLightCard, $dialog)
    $g.DrawPath($pRose, $dialog)

    $g.DrawString("Deactivate Team Member?", $fontTitle, $bRose, ($x + 300), ($y + 120))
    $g.DrawString("Are you sure you want to deactivate David Kim (david.k@acme.com)?", $fontH2, $bTextDark, ($x + 300), ($y + 165))
    $g.DrawString("This will revoke active sessions, invalidate tokens, and suspend workspace participation.", $fontBody, $bTextMuted, ($x + 300), ($y + 195))
    $g.DrawString("Historical task contributions and audit logs will remain intact.", $fontBody, $bTextMuted, ($x + 300), ($y + 220))

    $btnCancel = Create-RoundedRectangle ($x + 500) ($y + 300) 140 45 8
    $g.FillPath($bLightInner, $btnCancel)
    $g.DrawString("Keep Active", $fontH2, $bTextMuted, ($x + 530), ($y + 312))

    $btnDeact = Create-RoundedRectangle ($x + 660) ($y + 300) 240 45 8
    $g.FillPath($bRose, $btnDeact)
    $g.DrawString("Confirm Deactivation", $fontH2, $bWhite, ($x + 695), ($y + 312))
} "team-14-deactivate-member-confirm"

# 15. Reactivate Member Flow
Render-Screen "Reactivate Member Flow" "Restore access to suspended or deactivated team members" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $dialog = Create-RoundedRectangle ($x + 260) ($y + 80) 680 380 16
    $g.FillPath($bLightCard, $dialog)
    $g.DrawPath($pEmerald, $dialog)

    $g.DrawString("Reactivate Team Member", $fontTitle, $bEmerald, ($x + 300), ($y + 120))
    $g.DrawString("Restore tenant authorization for David Kim (david.k@acme.com)?", $fontH2, $bTextDark, ($x + 300), ($y + 165))
    $g.DrawString("David will regain access to authorized workspaces and receive a reactivation notification.", $fontBody, $bTextMuted, ($x + 300), ($y + 195))

    $btnConfirm = Create-RoundedRectangle ($x + 660) ($y + 280) 240 45 8
    $g.FillPath($bEmerald, $btnConfirm)
    $g.DrawString("Reactivate Account", $fontH2, $bWhite, ($x + 700), ($y + 292))
} "team-15-reactivate-member"

# 16. Remove Member Confirmation
Render-Screen "Remove Member Confirmation" "Safe member removal with last-owner protection and audit trail" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $dialog = Create-RoundedRectangle ($x + 240) ($y + 60) 720 440 16
    $g.FillPath($bLightCard, $dialog)
    $g.DrawPath($pRose, $dialog)

    $g.DrawString("Remove Member from Organization", $fontTitle, $bRose, ($x + 280), ($y + 100))
    $g.DrawString("You are about to remove Elena Rostova from Acme Global Org.", $fontH2, $bTextDark, ($x + 280), ($y + 145))
    $g.DrawString("Protection Invariant: The Organization Owner cannot be removed without ownership transfer.", $fontBadge, $bAmber, ($x + 280), ($y + 180))
    $g.DrawString("Type REMOVE to confirm member eviction:", $fontBody, $bTextMuted, ($x + 280), ($y + 220))

    $input = Create-RoundedRectangle ($x + 280) ($y + 250) 640 45 8
    $g.FillPath($bLightInner, $input)
    $g.DrawString("REMOVE", $fontH2, $bTextDark, ($x + 295), ($y + 262))

    $btnConfirm = Create-RoundedRectangle ($x + 680) ($y + 340) 240 45 8
    $g.FillPath($bRose, $btnConfirm)
    $g.DrawString("Permanently Remove", $fontH2, $bWhite, ($x + 710), ($y + 352))
} "team-16-remove-member-confirm"

# 17. Invitation Cancellation
Render-Screen "Invitation Cancellation Dialog" "Revoke pending invitation before token acceptance" "Pending Invitations" {
    param($g, $x, $y, $w, $h, $isMob)
    $dialog = Create-RoundedRectangle ($x + 280) ($y + 90) 640 340 16
    $g.FillPath($bLightCard, $dialog)
    $g.DrawPath($pLightBorder, $dialog)

    $g.DrawString("Cancel Invitation", $fontTitle, $bTextDark, ($x + 320), ($y + 130))
    $g.DrawString("Revoke invitation for contractor.ui@agency.net?", $fontH2, $bTextDark, ($x + 320), ($y + 175))
    $g.DrawString("The invitation link will immediately become invalid.", $fontBody, $bTextMuted, ($x + 320), ($y + 205))

    $btn = Create-RoundedRectangle ($x + 640) ($y + 260) 240 45 8
    $g.FillPath($bRose, $btn)
    $g.DrawString("Revoke Invitation", $fontH2, $bWhite, ($x + 680), ($y + 272))
} "team-17-invitation-cancellation"

# 18. Invitation Resend Flow
Render-Screen "Invitation Resend Flow" "Regenerate secure token and re-dispatch invitation email" "Pending Invitations" {
    param($g, $x, $y, $w, $h, $isMob)
    $dialog = Create-RoundedRectangle ($x + 280) ($y + 90) 640 340 16
    $g.FillPath($bLightCard, $dialog)
    $g.DrawPath($pIndigo, $dialog)

    $g.DrawString("Resend Invitation Email", $fontTitle, $bIndigo, ($x + 320), ($y + 130))
    $g.DrawString("Resend to: devops.spec@cloud.io", $fontH2, $bTextDark, ($x + 320), ($y + 175))
    $g.DrawString("A fresh cryptographic token will be issued, resetting the 7-day expiration window.", $fontBody, $bTextMuted, ($x + 320), ($y + 205))

    $btn = Create-RoundedRectangle ($x + 640) ($y + 260) 240 45 8
    $g.FillPath($bIndigo, $btn)
    $g.DrawString("Resend Email Now", $fontH2, $bWhite, ($x + 685), ($y + 272))
} "team-18-invitation-resend"

# 19. Empty Team State
Render-Screen "Empty Team State" "Zero mock data: clean, professional empty state when no other members exist" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    $box = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $box)
    $g.DrawPath($pLightBorder, $box)

    $g.FillRectangle($bLightInner, ($x + [int]($w/2) - 40), ($y + 180), 80, 80)
    $g.DrawString("T", $fontHero, $bIndigo, ($x + [int]($w/2) - 15), ($y + 195))

    $g.DrawString("No Team Members Yet", $fontTitle, $bTextDark, ($x + [int]($w/2) - 130), ($y + 280))
    $g.DrawString("You are currently the only member of Acme Global Org.", $fontBody, $bTextMuted, ($x + [int]($w/2) - 180), ($y + 320))
    $g.DrawString("Invite colleagues to collaborate in enterprise workspaces and assign roles.", $fontBody, $bTextMuted, ($x + [int]($w/2) - 230), ($y + 345))

    $btn = Create-RoundedRectangle ($x + [int]($w/2) - 110) ($y + 400) 220 48 8
    $g.FillPath($bIndigo, $btn)
    $g.DrawString("+ Invite First Member", $fontH2, $bWhite, ($x + [int]($w/2) - 80), ($y + 414))
} "team-19-empty-team-state"

# 20. Loading, Validation & Permission-Denied States
Render-Screen "Loading, Validation & Error States" "Comprehensive UX handling for network loading, validations, and 403 blocks" "Directory" {
    param($g, $x, $y, $w, $h, $isMob)
    # 3 State cards
    $sw = [int](($w - 40) / 3)
    
    # 1: Loading
    $c1 = Create-RoundedRectangle $x $y $sw $h 12
    $g.FillPath($bLightCard, $c1)
    $g.DrawPath($pLightBorder, $c1)
    $g.DrawString("Loading Team Directory...", $fontH2, $bIndigo, ($x + 30), ($y + 30))
    $g.DrawString("Querying authenticated tenant memberships...", $fontBody, $bTextMuted, ($x + 30), ($y + 60))
    $bar = Create-RoundedRectangle ($x + 30) ($y + 100) ($sw - 60) 8 4
    $g.FillPath($bIndigo, $bar)

    # 2: Validation Error
    $c2 = Create-RoundedRectangle ($x + $sw + 20) $y $sw $h 12
    $g.FillPath($bLightCard, $c2)
    $g.DrawPath($pRose, $c2)
    $g.DrawString("Validation Failed", $fontH2, $bRose, ($x + $sw + 50), ($y + 30))
    $g.DrawString("Email address 'invalid-email' is malformed.", $fontBody, $bTextDark, ($x + $sw + 50), ($y + 60))
    $g.DrawString("Please provide a valid RFC-5322 corporate email.", $fontBody, $bTextMuted, ($x + $sw + 50), ($y + 85))

    # 3: Permission Denied (403)
    $c3 = Create-RoundedRectangle ($x + ($sw * 2) + 40) $y $sw $h 12
    $g.FillPath($bLightCard, $c3)
    $g.DrawPath($pAmber, $c3)
    $g.DrawString("Permission Denied (403)", $fontH2, $bAmber, ($x + ($sw * 2) + 70), ($y + 30))
    $g.DrawString("Requires 'org:manage_members' permission.", $fontBody, $bTextDark, ($x + ($sw * 2) + 70), ($y + 60))
    $g.DrawString("Contact your organization owner to upgrade your role.", $fontBody, $bTextMuted, ($x + ($sw * 2) + 70), ($y + 85))
} "team-20-team-states"

# 21. Team Audit History
Render-Screen "Team Management Audit History" "Immutable chronological log of all membership and invitation events" "Team Audit History" {
    param($g, $x, $y, $w, $h, $isMob)
    $card = Create-RoundedRectangle $x $y $w $h 12
    $g.FillPath($bLightCard, $card)
    $g.DrawPath($pLightBorder, $card)

    $g.DrawString("Audit Trail: Team & Access Mutations", $fontH1, $bTextDark, ($x + 25), ($y + 20))
    $g.DrawLine($pLightBorder, ($x + 20), ($y + 60), ($x + $w - 20), ($y + 60))

    $logs = @(
        @("INVITATION_CREATED", "Alex Morgan invited lead.architect@partner.com (Role: Admin)", "Nov 18, 2026 14:15 UTC"),
        @("MEMBER_ROLE_CHANGED", "Sarah Jenkins promoted to Admin by Alex Morgan", "Nov 18, 2026 13:40 UTC"),
        @("WORKSPACE_MEMBERSHIP_CHANGED", "Marcus Vance assigned to Product Workspace", "Nov 18, 2026 11:22 UTC"),
        @("INVITATION_ACCEPTED", "Elena Rostova accepted invitation to Acme Global Org", "Nov 17, 2026 16:05 UTC"),
        @("MEMBER_SUSPENDED", "David Kim suspended by Alex Morgan (Policy Violation)", "Nov 16, 2026 09:30 UTC")
    )
    $ly = $y + 90
    foreach ($log in $logs) {
        $g.DrawString($log[0], $fontBadge, $bIndigo, ($x + 30), ($ly + 8))
        $g.DrawString($log[1], $fontH2, $bTextDark, ($x + 260), ($ly + 6))
        $g.DrawString($log[2], $fontBody, $bTextMuted, ($x + $w - 240), ($ly + 6))
        $g.DrawLine($pLightBorder, ($x + 20), ($ly + 40), ($x + $w - 20), ($ly + 40))
        $ly += 60
    }
} "team-21-team-audit-history"

Write-Host "All 21 Phase 9 Desktop + Mobile Prototypes & Screenshots successfully rendered!" -ForegroundColor Green

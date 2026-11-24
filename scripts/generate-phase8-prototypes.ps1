# ==============================================================================
# WORKZEN — Phase 8: Master Enterprise RBAC & Permissions Visual Generator
# Renders 15 Desktop (1920x1080), 15 Mobile (800x1200) Prototypes + 7 Diagrams
# Visual Identity: WORKZEN Premium Slate Dark & Precision Enterprise Light
# ==============================================================================
Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-8"
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

$fontHero  = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontH1    = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontH2    = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)
$fontBody  = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$fontCode  = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Bold)

function Save-Proto($bmp, $filename) {
    $p1 = Join-Path $protoDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Diag($bmp, $filename) {
    $p1 = Join-Path $diagDir $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
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
    $g.DrawString("ENTERPRISE RBAC", $fontBadge, $bIndigo, 165, 28)

    # Search bar
    $sb = Create-RoundedRectangle 320 18 380 34 8
    $sbFill = if ($isDark) { $bDarkInner } else { $bLightInner }
    $g.FillPath($sbFill, $sb)
    $g.DrawString("Search roles, permissions, members (Ctrl+K)...", $fontBody, $bTextMuted, 335, 25)

    # Tabs
    $tabs = @("Roles & Matrix", "User Assignments", "Permission Catalogue", "Audit Trail")
    $tx = 750
    foreach ($tab in $tabs) {
        $isActive = ($tab -eq $activeTab)
        if ($isActive) {
            $tabRect = Create-RoundedRectangle $tx 18 160 34 6
            $g.FillPath($bIndigo, $tabRect)
            $g.DrawString($tab, $fontH2, $bWhite, ($tx + 15), 25)
        } else {
            $tBrush = if ($isDark) { $bTextDim } else { $bTextMuted }
            $g.DrawString($tab, $fontH2, $tBrush, ($tx + 15), 25)
        }
        $tx += 175
    }

    # Profile & Org Pill
    $orgPill = Create-RoundedRectangle ($width - 240) 18 160 34 8
    $g.FillPath($sbFill, $orgPill)
    $g.DrawString("Acme Global Org", $fontH2, $brandBrush, ($width - 230), 25)
    $avatar = Create-RoundedRectangle ($width - 65) 16 38 38 19
    $g.FillPath($bEmerald, $avatar)
    $g.DrawString("AO", $fontBadge, $bWhite, ($width - 55), 26)
}

Write-Host "Rendering 15 Desktop Prototypes..." -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Roles and Permissions Overview
# ------------------------------------------------------------------------------
$b1d = New-Object System.Drawing.Bitmap(1920, 1080)
$g1d = [System.Drawing.Graphics]::FromImage($b1d)
$g1d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g1d 1920 "Roles & Matrix" $false

# Header bar
$g1d.DrawString("Roles & Permissions Management", $fontHero, $bTextDark, 60, 95)
$g1d.DrawString("Configure granular enterprise access levels, define custom roles, and enforce security policies.", $fontBody, $bTextMuted, 60, 138)

$btnCreate = Create-RoundedRectangle 1660 100 200 42 8
$g1d.FillPath($bIndigo, $btnCreate)
$g1d.DrawString("+ Create Custom Role", $fontH2, $bWhite, 1685, 112)

# KPI Cards
$kpis = @(
    @{ T="Total Active Roles"; V="10"; S="5 Org + 5 Workspace System Roles"; C=$bIndigo },
    @{ T="Custom Roles"; V="3"; S="Tailored by Org Administrators"; C=$bPurple },
    @{ T="Granular Permissions"; V="35"; S="Across 6 Security Categories"; C=$bEmerald },
    @{ T="Role Assignments"; V="142"; S="Active Members Protected"; C=$bSky }
)
$kx = 60
foreach ($k in $kpis) {
    $kc = Create-RoundedRectangle $kx 180 425 110 12
    $g1d.FillPath($bLightCard, $kc)
    $g1d.DrawPath($pLightBorder, $kc)
    $g1d.DrawString($k.T, $fontH2, $bTextMuted, ($kx + 20), 195)
    $g1d.DrawString($k.V, $fontHero, $k.C, ($kx + 20), 220)
    $g1d.DrawString($k.S, $fontBody, $bTextDim, ($kx + 20), 262)
    $kx += 460
}

# Table Card
$tbl = Create-RoundedRectangle 60 320 1800 700 12
$g1d.FillPath($bLightCard, $tbl)
$g1d.DrawPath($pLightBorder, $tbl)

# Table Header
$g1d.DrawLine($pLightBorder, 60, 380, 1860, 380)
$g1d.DrawString("ROLE NAME & SLUG", $fontBadge, $bTextMuted, 90, 345)
$g1d.DrawString("SCOPE", $fontBadge, $bTextMuted, 440, 345)
$g1d.DrawString("TYPE", $fontBadge, $bTextMuted, 650, 345)
$g1d.DrawString("ASSIGNED USERS", $fontBadge, $bTextMuted, 870, 345)
$g1d.DrawString("PERMISSIONS GRANTED", $fontBadge, $bTextMuted, 1150, 345)
$g1d.DrawString("ACTIONS", $fontBadge, $bTextMuted, 1680, 345)

# Role Rows
$rolesData = @(
    @{ N="Organization Owner"; S="org-owner"; Sc="Organization"; T="System Default"; U="1 Member"; P="35/35 Full Enterprise Access"; C=$bRose },
    @{ N="Organization Admin"; S="org-admin"; Sc="Organization"; T="System Default"; U="4 Members"; P="31/35 High Administrative"; C=$bIndigo },
    @{ N="Workspace Admin"; S="ws-admin"; Sc="Workspace"; T="System Default"; U="8 Members"; P="22/35 Workspace Scoped"; C=$bSky },
    @{ N="Manager"; S="org-manager"; Sc="Organization"; T="System Default"; U="12 Members"; P="18/35 Team & Resource Ops"; C=$bPurple },
    @{ N="Security & Compliance Lead"; S="sec-compliance"; Sc="Organization"; T="Custom Role"; U="2 Members"; P="14/35 Audit & Policy Focus"; C=$bAmber },
    @{ N="Editor"; S="ws-editor"; Sc="Workspace"; T="System Default"; U="45 Members"; P="12/35 Project Contributor"; C=$bEmerald },
    @{ N="Member"; S="org-member"; Sc="Organization"; T="System Default"; U="62 Members"; P="9/35 Standard Member"; C=$bTextDark },
    @{ N="Viewer / Auditor"; S="ws-viewer"; Sc="Workspace"; T="System Default"; U="10 Members"; P="6/35 Read-Only Access"; C=$bTextDim }
)
$ry = 400
foreach ($r in $rolesData) {
    $g1d.DrawString($r.N, $fontH1, $bTextDark, 90, $ry)
    $g1d.DrawString($r.S, $fontCode, $bTextDim, 90, ($ry + 22))

    # Scope badge
    $scRect = Create-RoundedRectangle 440 ($ry + 5) 120 26 6
    $scFill = if ($r.Sc -eq "Organization") { $bIndigo } else { $bSky }
    $g1d.FillPath($scFill, $scRect)
    $g1d.DrawString($r.Sc, $fontBadge, $bWhite, 452, ($ry + 10))

    # Type badge
    $tpRect = Create-RoundedRectangle 650 ($ry + 5) 130 26 6
    $tpFill = if ($r.T -eq "System Default") { $bLightInner } else { $bPurple }
    $g1d.FillPath($tpFill, $tpRect)
    $tpTxtBrush = if ($r.T -eq "System Default") { $bTextMuted } else { $bWhite }
    $g1d.DrawString($r.T, $fontBadge, $tpTxtBrush, 660, ($ry + 10))

    $g1d.DrawString($r.U, $fontBody, $bTextDark, 870, ($ry + 10))
    $g1d.DrawString($r.P, $fontH2, $r.C, 1150, ($ry + 10))

    # Action buttons
    $actRect = Create-RoundedRectangle 1680 ($ry + 4) 80 28 6
    $g1d.FillPath($bLightInner, $actRect)
    $g1d.DrawString("Details", $fontH2, $bIndigo, 1698, ($ry + 10))

    $g1d.DrawLine($pLightBorder, 60, ($ry + 55), 1860, ($ry + 55))
    $ry += 65
}
Save-Proto $b1d "rbac-01-roles-permissions-overview-desktop.png"

# ------------------------------------------------------------------------------
# 2. Default Organization Roles
# ------------------------------------------------------------------------------
$b2d = New-Object System.Drawing.Bitmap(1920, 1080)
$g2d = [System.Drawing.Graphics]::FromImage($b2d)
$g2d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g2d 1920 "Roles & Matrix" $true

$g2d.DrawString("Default Organization Roles (System Immutable)", $fontHero, $bWhite, 60, 95)
$g2d.DrawString("Protected built-in roles governing organization-wide authority and security boundaries.", $fontBody, $bTextDim, 60, 138)

$orgRoles = @(
    @{ Name="Organization Owner"; Slug="org-owner"; Desc="Ultimate control over billing, compliance, ownership transfer, and all organizational resources."; Color=$cRose; Badge="Protected Owner"; Users="1 Assigned"; Perms="All 35 Permissions (100%)" },
    @{ Name="Organization Admin"; Slug="org-admin"; Desc="High-level administration, member management, security policies, and workspace creation."; Color=$cIndigo; Badge="System Core"; Users="4 Assigned"; Perms="31 Permissions (No Transfer/Delete Org)" },
    @{ Name="Organization Manager"; Slug="org-manager"; Desc="Operational management over workspaces, departments, project backlogs, and reporting."; Color=$cPurple; Badge="System Operational"; Users="12 Assigned"; Perms="18 Permissions" },
    @{ Name="Organization Member"; Slug="org-member"; Desc="Standard collaborative access. Can create workspaces, manage assigned projects, and tasks."; Color=$cEmerald; Badge="Standard Default"; Users="62 Assigned"; Perms="9 Permissions" },
    @{ Name="Organization Viewer"; Slug="org-viewer"; Desc="Read-only observational access across all tenant dashboards, reports, and public workspaces."; Color=$cSky; Badge="Auditor Read-Only"; Users="8 Assigned"; Perms="6 Permissions (View Only)" }
)

$cx = 60
$cy = 190
foreach ($or in $orgRoles) {
    $card = Create-RoundedRectangle $cx $cy 860 145 12
    $g2d.FillPath($bDarkCard, $card)
    $g2d.DrawPath($pDarkBorder, $card)

    # Accent Strip
    $strip = Create-RoundedRectangle $cx $cy 8 145 4
    $bStrip = New-Object System.Drawing.SolidBrush($or.Color)
    $g2d.FillPath($bStrip, $strip)

    $g2d.DrawString($or.Name, $fontTitle, $bWhite, ($cx + 30), ($cy + 20))
    $g2d.DrawString($or.Slug, $fontCode, $bTextDim, ($cx + 30), ($cy + 52))
    $g2d.DrawString($or.Desc, $fontBody, $bTextMuted, ($cx + 30), ($cy + 80))

    # Badge
    $bgBrd = Create-RoundedRectangle ($cx + 620) ($cy + 20) 180 30 6
    $g2d.FillPath($bDarkInner, $bgBrd)
    $g2d.DrawString($or.Badge, $fontBadge, $bStrip, ($cx + 635), ($cy + 27))

    $g2d.DrawString($or.Perms, $fontH2, $bWhite, ($cx + 30), ($cy + 112))
    $g2d.DrawString($or.Users, $fontBadge, $bEmerald, ($cx + 640), ($cy + 112))

    $cy += 165
    if ($cy -gt 700) {
        $cx += 900
        $cy = 190
    }
}
Save-Proto $b2d "rbac-02-default-org-roles-desktop.png"

# ------------------------------------------------------------------------------
# 3. Custom Role Creation Modal / Interface
# ------------------------------------------------------------------------------
$b3d = New-Object System.Drawing.Bitmap(1920, 1080)
$g3d = [System.Drawing.Graphics]::FromImage($b3d)
$g3d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g3d 1920 "Roles & Matrix" $false

# Modal Backdrop Overlay
$bBackdrop = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 15, 23, 42))
$g3d.FillRectangle($bBackdrop, 0, 70, 1920, 1010)

# Modal Card
$m3 = Create-RoundedRectangle 460 110 1000 860 16
$g3d.FillPath($bLightCard, $m3)
$g3d.DrawPath($pLightBorder, $m3)

$g3d.DrawString("Create Custom Enterprise Role", $fontTitle, $bTextDark, 500, 140)
$g3d.DrawString("Define a unique role with specific granular action grants. Protected against privilege escalation.", $fontBody, $bTextMuted, 500, 178)

# Role Inputs
$g3d.DrawString("Role Name", $fontH2, $bTextDark, 500, 220)
$in1 = Create-RoundedRectangle 500 245 440 44 8
$g3d.FillPath($bLightInner, $in1)
$g3d.DrawString("Quality Assurance Lead", $fontBody, $bTextDark, 515, 258)

$g3d.DrawString("Role Slug (Unique)", $fontH2, $bTextDark, 980, 220)
$in2 = Create-RoundedRectangle 980 245 440 44 8
$g3d.FillPath($bLightInner, $in2)
$g3d.DrawString("qa-lead", $fontCode, $bIndigo, 995, 258)

$g3d.DrawString("Description & Purpose", $fontH2, $bTextDark, 500, 305)
$in3 = Create-RoundedRectangle 500 330 920 44 8
$g3d.FillPath($bLightInner, $in3)
$g3d.DrawString("Oversees automated test suites, quality gates, release verification, and issue triage.", $fontBody, $bTextDark, 515, 343)

$g3d.DrawString("Authority Scope", $fontH2, $bTextDark, 500, 390)
$sc1 = Create-RoundedRectangle 500 415 280 40 8
$g3d.FillPath($bIndigo, $sc1)
$g3d.DrawString("Organization Scoped", $fontH2, $bWhite, 530, 427)

$sc2 = Create-RoundedRectangle 800 415 280 40 8
$g3d.FillPath($bLightInner, $sc2)
$g3d.DrawString("Workspace Scoped", $fontH2, $bTextMuted, 830, 427)

# Permission Selector Header
$g3d.DrawString("Select Granular Permissions (Capability Matrix)", $fontH1, $bTextDark, 500, 475)
$g3d.DrawString("Selected: 14 / 35 Permissions (Within Administrator Delegation Authority)", $fontBadge, $bIndigo, 500, 502)

# Permission Group Pills & Checkboxes
$cats = @("Organization", "Workspace", "Projects", "Tasks", "Collaboration", "Reports")
$px = 500
$py = 530
foreach ($c in $cats) {
    $catCard = Create-RoundedRectangle $px $py 440 100 8
    $g3d.FillPath($bLightInner, $catCard)
    $g3d.DrawPath($pLightBorder, $catCard)
    $g3d.DrawString($c + " Domain Grants", $fontH2, $bIndigo, ($px + 15), ($py + 10))

    $g3d.DrawString("[x] View  [x] Manage Backlogs  [x] Create Issues", $fontBody, $bTextDark, ($px + 15), ($py + 35))
    $g3d.DrawString("Strict delegation policy: Cannot grant delete permissions.", $fontBadge, $bTextMuted, ($px + 15), ($py + 65))

    $px += 480
    if ($px -gt 1300) {
        $px = 500
        $py += 115
    }
}

# Modal Actions
$btnCancel = Create-RoundedRectangle 1100 890 140 44 8
$g3d.FillPath($bLightInner, $btnCancel)
$g3d.DrawString("Cancel", $fontH2, $bTextDark, 1145, 903)

$btnSubmit = Create-RoundedRectangle 1260 890 160 44 8
$g3d.FillPath($bIndigo, $btnSubmit)
$g3d.DrawString("Create Role", $fontH2, $bWhite, 1295, 903)

Save-Proto $b3d "rbac-03-custom-role-creation-desktop.png"

# ------------------------------------------------------------------------------
# 4. Role Editing Interface
# ------------------------------------------------------------------------------
$b4d = New-Object System.Drawing.Bitmap(1920, 1080)
$g4d = [System.Drawing.Graphics]::FromImage($b4d)
$g4d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g4d 1920 "Roles & Matrix" $false

$g4d.DrawString("Edit Role: Security & Compliance Auditor", $fontHero, $bTextDark, 60, 95)
$g4d.DrawString("Modify role metadata and granular capability grants. Changes take effect on next token/query refresh.", $fontBody, $bTextMuted, 60, 138)

$editCard = Create-RoundedRectangle 60 180 1800 840 12
$g4d.FillPath($bLightCard, $editCard)
$g4d.DrawPath($pLightBorder, $editCard)

# Top Info Row
$g4d.DrawString("Role Identifier: role_sec_auditor_9918 (Custom Role)", $fontH2, $bIndigo, 90, 210)
$g4d.DrawString("Active Assignments: 3 Corporate Officers", $fontBadge, $bEmerald, 550, 212)

$g4d.DrawString("Role Display Name", $fontH2, $bTextDark, 90, 250)
$e1 = Create-RoundedRectangle 90 275 520 44 8
$g4d.FillPath($bLightInner, $e1)
$g4d.DrawString("Security & Compliance Auditor", $fontBody, $bTextDark, 105, 288)

$g4d.DrawString("Description", $fontH2, $bTextDark, 640, 250)
$e2 = Create-RoundedRectangle 640 275 1180 44 8
$g4d.FillPath($bLightInner, $e2)
$g4d.DrawString("Dedicated security oversight role. Inspects audit trails, telemetry logs, and tenant compliance exports.", $fontBody, $bTextDark, 655, 288)

$g4d.DrawLine($pLightBorder, 90, 345, 1820, 345)

# Permission matrix editor table
$g4d.DrawString("Granular Permission Grants Matrix (35 Available Capabilities)", $fontTitle, $bTextDark, 90, 370)

$permRows = @(
    @{ C="Organization"; P="org:read"; D="View organization profile & metadata"; G=$true },
    @{ C="Organization"; P="org:view_audit_logs"; D="Query immutable system audit log records"; G=$true },
    @{ C="Organization"; P="org:manage_settings"; D="Configure multi-tenant security and 2FA policies"; G=$false },
    @{ C="Workspace"; P="workspace:read"; D="Inspect workspace configurations and member directories"; G=$true },
    @{ C="Workspace"; P="workspace:manage_access"; D="Modify workspace member access controls"; G=$false },
    @{ C="Reports"; P="report:read"; D="Access velocity, audit, and team metrics"; G=$true },
    @{ C="Reports"; P="report:export"; D="Export SOC2 compliance and velocity reports to CSV/PDF"; G=$true },
    @{ C="Tasks"; P="task:read"; D="Read-only access across all project sprint tasks"; G=$true }
)
$pmy = 430
$g4d.DrawString("CATEGORY", $fontBadge, $bTextMuted, 90, 410)
$g4d.DrawString("PERMISSION KEY", $fontBadge, $bTextMuted, 300, 410)
$g4d.DrawString("DESCRIPTION & SCOPE", $fontBadge, $bTextMuted, 620, 410)
$g4d.DrawString("STATUS", $fontBadge, $bTextMuted, 1350, 410)
$g4d.DrawString("TOGGLE", $fontBadge, $bTextMuted, 1650, 410)

foreach ($pr in $permRows) {
    $g4d.DrawString($pr.C, $fontH2, $bIndigo, 90, $pmy)
    $g4d.DrawString($pr.P, $fontCode, $bTextDark, 300, $pmy)
    $g4d.DrawString($pr.D, $fontBody, $bTextMuted, 620, $pmy)

    if ($pr.G) {
        $stRect = Create-RoundedRectangle 1350 ($pmy - 2) 90 26 6
        $g4d.FillPath($bEmerald, $stRect)
        $g4d.DrawString("GRANTED", $fontBadge, $bWhite, 1362, ($pmy + 3))

        $tog = Create-RoundedRectangle 1650 ($pmy - 2) 70 26 13
        $g4d.FillPath($bIndigo, $tog)
        $g4d.DrawString("ON", $fontBadge, $bWhite, 1675, ($pmy + 3))
    } else {
        $stRect = Create-RoundedRectangle 1350 ($pmy - 2) 90 26 6
        $g4d.FillPath($bLightInner, $stRect)
        $g4d.DrawString("DENIED", $fontBadge, $bTextMuted, 1368, ($pmy + 3))

        $tog = Create-RoundedRectangle 1650 ($pmy - 2) 70 26 13
        $g4d.FillPath($bLightInner, $tog)
        $g4d.DrawString("OFF", $fontBadge, $bTextDim, 1673, ($pmy + 3))
    }

    $g4d.DrawLine($pLightBorder, 90, ($pmy + 35), 1820, ($pmy + 35))
    $pmy += 48
}

# Footer Save
$btnSave = Create-RoundedRectangle 1660 950 160 44 8
$g4d.FillPath($bIndigo, $btnSave)
$g4d.DrawString("Save Changes", $fontH2, $bWhite, 1685, 963)

Save-Proto $b4d "rbac-04-role-editing-desktop.png"

# ------------------------------------------------------------------------------
# 5. Role Details Screen
# ------------------------------------------------------------------------------
$b5d = New-Object System.Drawing.Bitmap(1920, 1080)
$g5d = [System.Drawing.Graphics]::FromImage($b5d)
$g5d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g5d 1920 "Roles & Matrix" $false

$g5d.DrawString("Role Details & Telemetry", $fontHero, $bTextDark, 60, 95)

$dCard = Create-RoundedRectangle 60 160 1800 860 12
$g5d.FillPath($bLightCard, $dCard)
$g5d.DrawPath($pLightBorder, $dCard)

# Profile Card
$g5d.DrawString("Organization Admin", $fontHero, $bIndigo, 90, 190)
$g5d.DrawString("slug: org-admin  •  Scope: Organization  •  Type: System Built-In (Immutable)", $fontCode, $bTextMuted, 90, 235)
$g5d.DrawString("Full enterprise administration permissions with strict ownership safeguards. Cannot transfer ownership or delete the organization.", $fontBody, $bTextDark, 90, 265)

# Metrics Cards inside Details
$dx = 90
$dm = @(
    @{ T="Assigned Members"; V="4 Active Users"; C=$bEmerald },
    @{ T="Granted Permissions"; V="31 of 35"; C=$bIndigo },
    @{ T="Scope Level"; V="Organization-Wide"; C=$bPurple },
    @{ T="Security Invariant"; V="Protected Role"; C=$bRose }
)
foreach ($m in $dm) {
    $mc = Create-RoundedRectangle $dx 310 390 90 8
    $g5d.FillPath($bLightInner, $mc)
    $g5d.DrawPath($pLightBorder, $mc)
    $g5d.DrawString($m.T, $fontH2, $bTextMuted, ($dx + 15), 325)
    $g5d.DrawString($m.V, $fontTitle, $m.C, ($dx + 15), 350)
    $dx += 420
}

# Member Assignments List
$g5d.DrawString("Users Assigned to this Role", $fontTitle, $bTextDark, 90, 430)
$assignedUsers = @(
    @{ N="Alex Morgan"; E="alex.morgan@workzen.io"; D="Engineering VP"; A="Assigned by System at Org Creation" },
    @{ N="Sarah Connor"; E="sarah.c@workzen.io"; D="Head of Product"; A="Assigned Nov 12, 2026 by Alex Morgan" },
    @{ N="David Kim"; E="david.k@workzen.io"; D="Security Director"; A="Assigned Nov 14, 2026 by Alex Morgan" },
    @{ N="Elena Rostova"; E="elena.r@workzen.io"; D="IT Operations Lead"; A="Assigned Nov 16, 2026 by Alex Morgan" }
)
$uy = 475
foreach ($u in $assignedUsers) {
    $uBox = Create-RoundedRectangle 90 $uy 1620 60 8
    $g5d.FillPath($bLightInner, $uBox)
    $g5d.DrawPath($pLightBorder, $uBox)

    $g5d.DrawString($u.N, $fontH1, $bTextDark, 110, ($uy + 12))
    $g5d.DrawString($u.E, $fontCode, $bTextDim, 110, ($uy + 34))
    $g5d.DrawString($u.D, $fontH2, $bIndigo, 450, ($uy + 20))
    $g5d.DrawString($u.A, $fontBody, $bTextMuted, 850, ($uy + 20))

    $btnRev = Create-RoundedRectangle 1570 ($uy + 14) 120 32 6
    $g5d.FillPath($bRose, $btnRev)
    $g5d.DrawString("Revoke Role", $fontBadge, $bWhite, 1595, ($uy + 22))

    $uy += 72
}

Save-Proto $b5d "rbac-05-role-details-desktop.png"

# ------------------------------------------------------------------------------
# 6. Permission Assignment Interface
# ------------------------------------------------------------------------------
$b6d = New-Object System.Drawing.Bitmap(1920, 1080)
$g6d = [System.Drawing.Graphics]::FromImage($b6d)
$g6d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g6d 1920 "Permission Catalogue" $false

$g6d.DrawString("Permission Assignment & Capabilities Engine", $fontHero, $bTextDark, 60, 95)
$g6d.DrawString("Fine-grained action capabilities grouped across 6 domain categories.", $fontBody, $bTextMuted, 60, 138)

# Permission matrix cards
$gridCats = @(
    @{ Name="Organization Domain (8 Actions)"; Items=@("org:read", "org:update", "org:manage_settings", "org:manage_members", "org:manage_roles", "org:manage_permissions", "org:archive", "org:transfer_ownership"); Color=$cIndigo },
    @{ Name="Workspace Domain (7 Actions)"; Items=@("workspace:read", "workspace:create", "workspace:update", "workspace:manage_settings", "workspace:manage_access", "workspace:manage_roles", "workspace:archive"); Color=$cSky },
    @{ Name="Project Domain (5 Actions)"; Items=@("project:read", "project:create", "project:update", "project:delete", "project:manage_settings"); Color=$cPurple },
    @{ Name="Task Domain (6 Actions)"; Items=@("task:read", "task:create", "task:update", "task:delete", "task:assign", "task:manage_status"); Color=$cEmerald },
    @{ Name="Collaboration Domain (6 Actions)"; Items=@("collaboration:read", "comment:create", "comment:update", "comment:delete", "file:upload", "file:manage"); Color=$cAmber },
    @{ Name="Reports & Intelligence Domain (3 Actions)"; Items=@("report:read", "report:generate", "report:export"); Color=$cTeal }
)
$gx = 60
$gy = 180
foreach ($gc in $gridCats) {
    $gCard = Create-RoundedRectangle $gx $gy 560 380 12
    $g6d.FillPath($bLightCard, $gCard)
    $g6d.DrawPath($pLightBorder, $gCard)

    $bHeader = New-Object System.Drawing.SolidBrush($gc.Color)
    $g6d.DrawString($gc.Name, $fontH1, $bHeader, ($gx + 20), ($gy + 20))
    $g6d.DrawLine($pLightBorder, ($gx + 20), ($gy + 50), ($gx + 540), ($gy + 50))

    $iy = $gy + 65
    foreach ($item in $gc.Items) {
        $chk = Create-RoundedRectangle ($gx + 25) ($iy + 2) 16 16 4
        $g6d.FillPath($bHeader, $chk)
        $g6d.DrawString($item, $fontCode, $bTextDark, ($gx + 50), $iy)
        $iy += 38
    }

    $gx += 600
    if ($gx -gt 1300) {
        $gx = 60
        $gy += 420
    }
}
Save-Proto $b6d "rbac-06-permission-assignment-desktop.png"

# ------------------------------------------------------------------------------
# 7. Permission Categories Breakdown
# ------------------------------------------------------------------------------
$b7d = New-Object System.Drawing.Bitmap(1920, 1080)
$g7d = [System.Drawing.Graphics]::FromImage($b7d)
$g7d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7d.FillRectangle($bDarkCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g7d 1920 "Permission Catalogue" $true

$g7d.DrawString("Permission Categories & Security Governance", $fontHero, $bWhite, 60, 95)
$g7d.DrawString("Standardized taxonomy separating enterprise authority boundaries across all SaaS layers.", $fontBody, $bTextDim, 60, 138)

$catData = @(
    @{ N="Organization Security"; S="8 Operations"; D="Controls legal entity tenant settings, membership, custom roles, ownership transfer, and audit queries."; C=$cRose },
    @{ N="Workspace Governance"; S="7 Operations"; D="Controls agile squad creation, operational settings, department policies, and member access."; C=$cIndigo },
    @{ N="Project Management"; S="5 Operations"; D="Controls project roadmaps, milestones, portfolio visibility, and project lifecycles."; C=$cPurple },
    @{ N="Tasks & Sprints"; S="6 Operations"; D="Controls agile backlog items, Kanban card assignment, status transitions, and estimation."; C=$cEmerald },
    @{ N="Team Collaboration"; S="6 Operations"; D="Controls real-time discussions, comment threads, file attachments, and mentions."; C=$cAmber },
    @{ N="Enterprise Reporting"; S="3 Operations"; D="Controls executive velocity insights, sprint burn-down charts, and compliance exports."; C=$cSky }
)
$cx = 60
$cy = 190
foreach ($cd in $catData) {
    $cdCard = Create-RoundedRectangle $cx $cy 860 220 12
    $g7d.FillPath($bDarkCard, $cdCard)
    $g7d.DrawPath($pDarkBorder, $cdCard)

    $bCatC = New-Object System.Drawing.SolidBrush($cd.C)
    $g7d.DrawString($cd.N, $fontTitle, $bCatC, ($cx + 30), ($cy + 25))
    $g7d.DrawString($cd.S, $fontBadge, $bWhite, ($cx + 680), ($cy + 30))
    $g7d.DrawString($cd.D, $fontBody, $bTextMuted, ($cx + 30), ($cy + 75))

    # Security guard badge
    $sg = Create-RoundedRectangle ($cx + 30) ($cy + 150) 240 32 6
    $g7d.FillPath($bDarkInner, $sg)
    $g7d.DrawString("Backend Protected (IDOR Guard)", $fontBadge, $bCatC, ($cx + 42), ($cy + 158))

    $cy += 250
    if ($cy -gt 600) {
        $cx += 900
        $cy = 190
    }
}
Save-Proto $b7d "rbac-07-permission-categories-desktop.png"

# ------------------------------------------------------------------------------
# 8. Organization-Level Role Management
# ------------------------------------------------------------------------------
$b8d = New-Object System.Drawing.Bitmap(1920, 1080)
$g8d = [System.Drawing.Graphics]::FromImage($b8d)
$g8d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g8d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g8d 1920 "Roles & Matrix" $false

$g8d.DrawString("Organization Role Governance", $fontHero, $bTextDark, 60, 95)
$g8d.DrawString("Manage organization-wide authority for Acme Global Technologies.", $fontBody, $bTextMuted, 60, 138)

$orgTable = Create-RoundedRectangle 60 180 1800 840 12
$g8d.FillPath($bLightCard, $orgTable)
$g8d.DrawPath($pLightBorder, $orgTable)

$g8d.DrawString("ORGANIZATION ROLES (5 DEFAULT + 2 CUSTOM)", $fontH1, $bIndigo, 90, 215)
$g8d.DrawLine($pLightBorder, 90, 255, 1820, 255)

$orgRData = @(
    @{ N="Organization Owner"; S="org-owner"; P="Full Authority (35/35)"; U="1 Member (Alex Morgan)"; St="Immutable System Role" },
    @{ N="Organization Admin"; S="org-admin"; P="Administrative (31/35)"; U="4 Members"; St="Immutable System Role" },
    @{ N="Organization Manager"; S="org-manager"; P="Operations (18/35)"; U="12 Members"; St="Immutable System Role" },
    @{ N="Organization Member"; S="org-member"; P="Standard (9/35)"; U="62 Members"; St="Immutable System Role" },
    @{ N="Organization Viewer"; S="org-viewer"; P="Read-Only (6/35)"; U="8 Members"; St="Immutable System Role" },
    @{ N="Security & Compliance Auditor"; S="sec-auditor"; P="Audit Focus (14/35)"; U="3 Members"; St="Custom Enterprise Role" },
    @{ N="Billing & Contract Lead"; S="billing-lead"; P="Financial Ops (11/35)"; U="2 Members"; St="Custom Enterprise Role" }
)
$oty = 280
foreach ($ord in $orgRData) {
    $g8d.DrawString($ord.N, $fontH1, $bTextDark, 100, $oty)
    $g8d.DrawString($ord.S, $fontCode, $bTextDim, 100, ($oty + 22))
    $g8d.DrawString($ord.P, $fontH2, $bIndigo, 520, ($oty + 10))
    $g8d.DrawString($ord.U, $fontBody, $bTextDark, 950, ($oty + 10))
    $g8d.DrawString($ord.St, $fontBadge, $bPurple, 1350, ($oty + 10))

    $btnMng = Create-RoundedRectangle 1660 ($oty + 4) 120 32 6
    $g8d.FillPath($bLightInner, $btnMng)
    $g8d.DrawString("Manage Role", $fontH2, $bIndigo, 1675, ($oty + 12))

    $g8d.DrawLine($pLightBorder, 90, ($oty + 65), 1820, ($oty + 65))
    $oty += 75
}
Save-Proto $b8d "rbac-08-org-role-management-desktop.png"

# ------------------------------------------------------------------------------
# 9. Workspace-Level Role Management
# ------------------------------------------------------------------------------
$b9d = New-Object System.Drawing.Bitmap(1920, 1080)
$g9d = [System.Drawing.Graphics]::FromImage($b9d)
$g9d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g9d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g9d 1920 "Roles & Matrix" $false

$g9d.DrawString("Workspace Role Governance: Engineering Squad", $fontHero, $bTextDark, 60, 95)
$g9d.DrawString("Workspace-scoped permissions isolated from organization-level authority.", $fontBody, $bTextMuted, 60, 138)

$wsTable = Create-RoundedRectangle 60 180 1800 840 12
$g9d.FillPath($bLightCard, $wsTable)
$g9d.DrawPath($pLightBorder, $wsTable)

$g9d.DrawString("WORKSPACE SPECIFIC ROLES (ISOLATED WITHIN /engineering)", $fontH1, $bSky, 90, 215)
$g9d.DrawLine($pLightBorder, 90, 255, 1820, 255)

$wsRData = @(
    @{ N="Workspace Admin"; S="ws-admin"; P="Workspace Full (22/35)"; U="2 Members"; St="System Role" },
    @{ N="Workspace Manager"; S="ws-manager"; P="Sprint Ops (16/35)"; U="5 Members"; St="System Role" },
    @{ N="Editor"; S="ws-editor"; P="Contributor (12/35)"; U="24 Members"; St="System Role" },
    @{ N="Member"; S="ws-member"; P="Standard (8/35)"; U="18 Members"; St="System Role" },
    @{ N="Viewer"; S="ws-viewer"; P="Read-Only (5/35)"; U="6 Members"; St="System Role" },
    @{ N="QA Automation Lead"; S="ws-qa-lead"; P="Test & Release (14/35)"; U="3 Members"; St="Custom Role" }
)
$wty = 280
foreach ($wrd in $wsRData) {
    $g9d.DrawString($wrd.N, $fontH1, $bTextDark, 100, $wty)
    $g9d.DrawString($wrd.S, $fontCode, $bTextDim, 100, ($wty + 22))
    $g9d.DrawString($wrd.P, $fontH2, $bSky, 520, ($wty + 10))
    $g9d.DrawString($wrd.U, $fontBody, $bTextDark, 950, ($wty + 10))
    $g9d.DrawString($wrd.St, $fontBadge, $bEmerald, 1350, ($wty + 10))

    $btnMngW = Create-RoundedRectangle 1660 ($wty + 4) 120 32 6
    $g9d.FillPath($bLightInner, $btnMngW)
    $g9d.DrawString("Configure", $fontH2, $bSky, 1685, ($wty + 12))

    $g9d.DrawLine($pLightBorder, 90, ($wty + 65), 1820, ($wty + 65))
    $wty += 75
}
Save-Proto $b9d "rbac-09-workspace-role-management-desktop.png"

# ------------------------------------------------------------------------------
# 10. User Role Assignment Interface
# ------------------------------------------------------------------------------
$b10d = New-Object System.Drawing.Bitmap(1920, 1080)
$g10d = [System.Drawing.Graphics]::FromImage($b10d)
$g10d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g10d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g10d 1920 "User Assignments" $false

$g10d.DrawString("User Role Assignments & Access Grants", $fontHero, $bTextDark, 60, 95)
$g10d.DrawString("Assign roles to active team members. Enforces non-self promotion and owner protection.", $fontBody, $bTextMuted, 60, 138)

$btnAssign = Create-RoundedRectangle 1660 100 200 42 8
$g10d.FillPath($bIndigo, $btnAssign)
$g10d.DrawString("+ Assign Member Role", $fontH2, $bWhite, 1680, 112)

$uTbl = Create-RoundedRectangle 60 180 1800 840 12
$g10d.FillPath($bLightCard, $uTbl)
$g10d.DrawPath($pLightBorder, $uTbl)

$g10d.DrawString("ACTIVE MEMBER", $fontBadge, $bTextMuted, 100, 205)
$g10d.DrawString("EMAIL ADDRESS", $fontBadge, $bTextMuted, 400, 205)
$g10d.DrawString("PRIMARY ORG ROLE", $fontBadge, $bTextMuted, 780, 205)
$g10d.DrawString("WORKSPACE ASSIGNMENTS", $fontBadge, $bTextMuted, 1150, 205)
$g10d.DrawString("ACTIONS", $fontBadge, $bTextMuted, 1680, 205)
$g10d.DrawLine($pLightBorder, 60, 235, 1860, 235)

$userRows = @(
    @{ N="Alex Morgan"; E="alex.morgan@workzen.io"; OR="Organization Owner"; WS="All Workspaces (Unrestricted)"; C=$bRose },
    @{ N="Sarah Connor"; E="sarah.c@workzen.io"; OR="Organization Admin"; WS="Engineering (Admin), Product (Admin)"; C=$bIndigo },
    @{ N="David Kim"; E="david.k@workzen.io"; OR="Security Auditor"; WS="Engineering (Viewer), Ops (Auditor)"; C=$bAmber },
    @{ N="Elena Rostova"; E="elena.r@workzen.io"; OR="Organization Manager"; WS="Engineering (Manager)"; C=$bPurple },
    @{ N="Marcus Vance"; E="marcus.v@workzen.io"; OR="Organization Member"; WS="Engineering (Editor)"; C=$bEmerald },
    @{ N="Chloe Bennet"; E="chloe.b@workzen.io"; OR="Organization Member"; WS="Product & Design (Editor)"; C=$bEmerald },
    @{ N="James Wilson"; E="james.w@workzen.io"; OR="Organization Member"; WS="Engineering (Member)"; C=$bTextDark },
    @{ N="Rachel Zane"; E="rachel.z@workzen.io"; OR="Organization Viewer"; WS="General (Viewer)"; C=$bTextDim }
)
$ury = 260
foreach ($ur in $userRows) {
    $g10d.DrawString($ur.N, $fontH1, $bTextDark, 100, $ury)
    $g10d.DrawString($ur.E, $fontCode, $bTextDim, 400, ($ury + 3))

    $orBadge = Create-RoundedRectangle 780 $ury 200 28 6
    $bOrC = $ur.C
    $g10d.FillPath($bOrC, $orBadge)
    $g10d.DrawString($ur.OR, $fontBadge, $bWhite, 795, ($ury + 7))

    $g10d.DrawString($ur.WS, $fontBody, $bTextDark, 1150, ($ury + 5))

    $bEditU = Create-RoundedRectangle 1680 $ury 80 28 6
    $g10d.FillPath($bLightInner, $bEditU)
    $g10d.DrawString("Change", $fontBadge, $bIndigo, 1698, ($ury + 7))

    $g10d.DrawLine($pLightBorder, 60, ($ury + 55), 1860, ($ury + 55))
    $ury += 65
}
Save-Proto $b10d "rbac-10-user-role-assignment-desktop.png"

# ------------------------------------------------------------------------------
# 11. Role Assignment Confirmation Modal
# ------------------------------------------------------------------------------
$b11d = New-Object System.Drawing.Bitmap(1920, 1080)
$g11d = [System.Drawing.Graphics]::FromImage($b11d)
$g11d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g11d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g11d 1920 "User Assignments" $false

# Modal Backdrop
$g11d.FillRectangle($bBackdrop, 0, 70, 1920, 1010)

$m11 = Create-RoundedRectangle 610 240 700 560 16
$g11d.FillPath($bLightCard, $m11)
$g11d.DrawPath($pLightBorder, $m11)

$g11d.DrawString("Confirm Role Assignment", $fontTitle, $bTextDark, 660, 280)
$g11d.DrawString("Review updated privileges and access boundaries before applying.", $fontBody, $bTextMuted, 660, 320)

# Target User Box
$uBox = Create-RoundedRectangle 660 360 600 70 8
$g11d.FillPath($bLightInner, $uBox)
$g11d.DrawString("Target Member: Marcus Vance (marcus.v@workzen.io)", $fontH2, $bTextDark, 680, 375)
$g11d.DrawString("Current Role: Organization Member -> Proposed Role: Workspace Admin", $fontBody, $bIndigo, 680, 400)

# Security verification check
$secBox = Create-RoundedRectangle 660 450 600 130 8
$g11d.FillPath($bDarkCard, $secBox)
$g11d.DrawString("SECURITY AUDIT VERIFICATION", $fontBadge, $bEmerald, 680, 465)
$g11d.DrawString("[OK] Target belongs to Acme Global Technologies tenant.", $fontCode, $bWhite, 680, 490)
$g11d.DrawString("[OK] Assigning Administrator has delegation authority.", $fontCode, $bWhite, 680, 510)
$g11d.DrawString("[OK] Non-self promotion policy satisfied.", $fontCode, $bWhite, 680, 530)
$g11d.DrawString("[OK] Event will be recorded in immutable audit log.", $fontCode, $bWhite, 680, 550)

$btnCancel11 = Create-RoundedRectangle 980 720 120 44 8
$g11d.FillPath($bLightInner, $btnCancel11)
$g11d.DrawString("Cancel", $fontH2, $bTextDark, 1015, 733)

$btnConf11 = Create-RoundedRectangle 1120 720 140 44 8
$g11d.FillPath($bIndigo, $btnConf11)
$g11d.DrawString("Confirm & Grant", $fontH2, $bWhite, 1135, 733)

Save-Proto $b11d "rbac-11-role-assignment-confirm-desktop.png"

# ------------------------------------------------------------------------------
# 12. Permission-Denied State (403 Access Denied)
# ------------------------------------------------------------------------------
$b12d = New-Object System.Drawing.Bitmap(1920, 1080)
$g12d = [System.Drawing.Graphics]::FromImage($b12d)
$g12d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g12d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g12d 1920 "Roles & Matrix" $false

$denCard = Create-RoundedRectangle 560 220 800 620 16
$g12d.FillPath($bLightCard, $denCard)
$g12d.DrawPath($pRose, $denCard)

# Lock Icon Circle
$lockC = Create-RoundedRectangle 910 270 100 100 50
$bRoseLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 226, 226))
$g12d.FillPath($bRoseLight, $lockC)
$g12d.DrawString("403", $fontTitle, $bRose, 938, 305)

$g12d.DrawString("Access Denied: Insufficient Role Permissions", $fontTitle, $bTextDark, 630, 400)
$g12d.DrawString("You do not have the required capability to perform this administrative action.", $fontBody, $bTextMuted, 670, 440)

# Security Violation Metadata
$errBox = Create-RoundedRectangle 620 480 680 180 8
$g12d.FillPath($bLightInner, $errBox)
$g12d.DrawPath($pLightBorder, $errBox)

$g12d.DrawString("REQUIRED PERMISSION:", $fontBadge, $bTextMuted, 640, 500)
$g12d.DrawString("org:manage_roles (Organization Role Governance)", $fontCode, $bRose, 820, 498)

$g12d.DrawString("YOUR EFFECTIVE ROLE:", $fontBadge, $bTextMuted, 640, 535)
$g12d.DrawString("Organization Member (Standard Collaborative Access)", $fontCode, $bTextDark, 820, 533)

$g12d.DrawString("SECURITY CONTEXT:", $fontBadge, $bTextMuted, 640, 570)
$g12d.DrawString("Acme Global Technologies / Engineering Squad", $fontCode, $bTextDark, 820, 568)

$g12d.DrawString("INCIDENT LOG ID:", $fontBadge, $bTextMuted, 640, 605)
$g12d.DrawString("audit_403_sec_9918237 (Logged for Compliance)", $fontCode, $bIndigo, 820, 603)

$btnReturn = Create-RoundedRectangle 860 740 200 44 8
$g12d.FillPath($bIndigo, $btnReturn)
$g12d.DrawString("Return to Dashboard", $fontH2, $bWhite, 885, 753)

Save-Proto $b12d "rbac-12-permission-denied-desktop.png"

# ------------------------------------------------------------------------------
# 13. Role Deletion Confirmation Dialog
# ------------------------------------------------------------------------------
$b13d = New-Object System.Drawing.Bitmap(1920, 1080)
$g13d = [System.Drawing.Graphics]::FromImage($b13d)
$g13d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g13d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g13d 1920 "Roles & Matrix" $false

# Modal Backdrop
$g13d.FillRectangle($bBackdrop, 0, 70, 1920, 1010)

$m13 = Create-RoundedRectangle 610 250 700 520 16
$g13d.FillPath($bLightCard, $m13)
$g13d.DrawPath($pLightBorder, $m13)

$g13d.DrawString("Delete Custom Role: Security Auditor", $fontTitle, $bRose, 660, 290)
$g13d.DrawString("Are you sure you want to permanently delete this custom role?", $fontBody, $bTextMuted, 660, 330)

$warnBox = Create-RoundedRectangle 660 370 600 130 8
$bWarn = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 242, 242))
$g13d.FillPath($bWarn, $warnBox)
$g13d.DrawPath($pRose, $warnBox)

$g13d.DrawString("CRITICAL SAFETY SAFEGUARDS:", $fontBadge, $bRose, 680, 385)
$g13d.DrawString("• System Default roles can NEVER be deleted.", $fontBody, $bTextDark, 680, 410)
$g13d.DrawString("• Roles currently assigned to active users cannot be deleted.", $fontBody, $bTextDark, 680, 435)
$g13d.DrawString("• All 3 currently assigned members must be migrated first.", $fontBody, $bTextDark, 680, 460)

$g13d.DrawString("Type role name to confirm deletion:", $fontH2, $bTextDark, 660, 520)
$inDel = Create-RoundedRectangle 660 545 600 44 8
$g13d.FillPath($bLightInner, $inDel)
$g13d.DrawString("Security & Compliance Auditor", $fontCode, $bRose, 675, 558)

$btnCancel13 = Create-RoundedRectangle 960 670 120 44 8
$g13d.FillPath($bLightInner, $btnCancel13)
$g13d.DrawString("Cancel", $fontH2, $bTextDark, 995, 683)

$btnDel13 = Create-RoundedRectangle 1100 670 160 44 8
$g13d.FillPath($bRose, $btnDel13)
$g13d.DrawString("Confirm Delete", $fontH2, $bWhite, 1125, 683)

Save-Proto $b13d "rbac-13-role-deletion-confirm-desktop.png"

# ------------------------------------------------------------------------------
# 14. Role Audit History (Immutable Audit Log)
# ------------------------------------------------------------------------------
$b14d = New-Object System.Drawing.Bitmap(1920, 1080)
$g14d = [System.Drawing.Graphics]::FromImage($b14d)
$g14d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g14d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g14d 1920 "Audit Trail" $false

$g14d.DrawString("Security Audit Trail: RBAC Lifecycle & Events", $fontHero, $bTextDark, 60, 95)
$g14d.DrawString("Immutable append-only record of all role creations, edits, assignments, and authorization denials.", $fontBody, $bTextMuted, 60, 138)

$audTbl = Create-RoundedRectangle 60 180 1800 840 12
$g14d.FillPath($bLightCard, $audTbl)
$g14d.DrawPath($pLightBorder, $audTbl)

$g14d.DrawString("TIMESTAMP", $fontBadge, $bTextMuted, 100, 205)
$g14d.DrawString("ACTOR", $fontBadge, $bTextMuted, 320, 205)
$g14d.DrawString("EVENT ACTION", $fontBadge, $bTextMuted, 600, 205)
$g14d.DrawString("TARGET RESOURCE", $fontBadge, $bTextMuted, 950, 205)
$g14d.DrawString("DETAILS & SECURITY CONTEXT", $fontBadge, $bTextMuted, 1300, 205)
$g14d.DrawLine($pLightBorder, 60, 235, 1860, 235)

$auditLogs = @(
    @{ T="Nov 18, 2026 13:14:02"; A="Alex Morgan (Owner)"; E="ROLE_ASSIGNED"; Tg="Marcus Vance"; D="Assigned ws-admin in /engineering squad"; C=$bEmerald },
    @{ T="Nov 18, 2026 12:45:11"; A="Sarah Connor (Admin)"; E="CUSTOM_ROLE_CREATED"; Tg="QA Lead"; D="Defined 14 granular action grants"; C=$bIndigo },
    @{ T="Nov 18, 2026 11:22:38"; A="David Kim (Auditor)"; E="PERMISSION_EVALUATED"; Tg="report:export"; D="Exported SOC2 Telemetry Logs to CSV"; C=$bSky },
    @{ T="Nov 18, 2026 10:05:19"; A="Rachel Zane (Viewer)"; E="ACCESS_DENIED"; Tg="org:manage_roles"; D="403 Forbidden: Insufficient role authority"; C=$bRose },
    @{ T="Nov 17, 2026 18:30:00"; A="Alex Morgan (Owner)"; E="ROLE_UPDATED"; Tg="Security Auditor"; D="Granted org:view_audit_logs permission"; C=$bPurple },
    @{ T="Nov 17, 2026 16:15:42"; A="System Kernel"; E="SYSTEM_ROLES_SEEDED"; Tg="Acme Global Org"; D="Seeded 5 Org Roles + 5 Workspace Roles"; C=$bTextMuted }
)
$aly = 260
foreach ($al in $auditLogs) {
    $g14d.DrawString($al.T, $fontCode, $bTextDim, 100, ($aly + 5))
    $g14d.DrawString($al.A, $fontH2, $bTextDark, 320, ($aly + 5))

    $eBadge = Create-RoundedRectangle 600 $aly 180 28 6
    $bEvC = $al.C
    $g14d.FillPath($bEvC, $eBadge)
    $g14d.DrawString($al.E, $fontBadge, $bWhite, 615, ($aly + 7))

    $g14d.DrawString($al.Tg, $fontH2, $bIndigo, 950, ($aly + 5))
    $g14d.DrawString($al.D, $fontBody, $bTextDark, 1300, ($aly + 5))

    $g14d.DrawLine($pLightBorder, 60, ($aly + 55), 1860, ($aly + 55))
    $aly += 65
}
Save-Proto $b14d "rbac-14-role-audit-history-desktop.png"

# ------------------------------------------------------------------------------
# 15. Role Management Empty, Loading, and Error States
# ------------------------------------------------------------------------------
$b15d = New-Object System.Drawing.Bitmap(1920, 1080)
$g15d = [System.Drawing.Graphics]::FromImage($b15d)
$g15d.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g15d.FillRectangle($bLightCanvas, 0, 0, 1920, 1080)
Draw-TopNav $g15d 1920 "Roles & Matrix" $false

$g15d.DrawString("Role Management: State Handling (Empty, Loading, Error)", $fontHero, $bTextDark, 60, 95)

# Panel 1: Empty State
$pEmpty = Create-RoundedRectangle 60 170 560 840 12
$g15d.FillPath($bLightCard, $pEmpty)
$g15d.DrawPath($pLightBorder, $pEmpty)
$g15d.DrawString("1. Empty Custom Roles State", $fontTitle, $bIndigo, 90, 200)

$empCircle = Create-RoundedRectangle 240 380 180 180 90
$g15d.FillPath($bLightInner, $empCircle)
$g15d.DrawString("[Icon: Shield]", $fontH2, $bTextDim, 280, 460)

$g15d.DrawString("No Custom Roles Created Yet", $fontTitle, $bTextDark, 140, 600)
$g15d.DrawString("Your organization is using default system roles. Click below to craft customized access tiers.", $fontBody, $bTextMuted, 90, 640)
$btnCreEmpty = Create-RoundedRectangle 190 710 260 44 8
$g15d.FillPath($bIndigo, $btnCreEmpty)
$g15d.DrawString("+ Create First Custom Role", $fontH2, $bWhite, 215, 723)

# Panel 2: Loading Skeleton State
$pLoad = Create-RoundedRectangle 680 170 560 840 12
$g15d.FillPath($bLightCard, $pLoad)
$g15d.DrawPath($pLightBorder, $pLoad)
$g15d.DrawString("2. TanStack Query Loading Skeleton", $fontTitle, $bSky, 710, 200)

$skY = 260
for ($s = 0; $s -lt 6; $s++) {
    $skBox = Create-RoundedRectangle 710 $skY 500 70 8
    $g15d.FillPath($bLightInner, $skBox)
    $skBar1 = Create-RoundedRectangle 730 ($skY + 18) 220 14 4
    $g15d.FillPath($bLightBorder, $skBar1)
    $skBar2 = Create-RoundedRectangle 730 ($skY + 40) 360 10 4
    $g15d.FillPath($bLightBorder, $skBar2)
    $skY += 90
}
$g15d.DrawString("Fetching role matrices from /api/v1/organizations/:id/roles...", $fontCode, $bTextMuted, 730, 840)

# Panel 3: Error State
$pErr = Create-RoundedRectangle 1300 170 560 840 12
$g15d.FillPath($bLightCard, $pErr)
$g15d.DrawPath($pRose, $pErr)
$g15d.DrawString("3. Resilient Error Boundary State", $fontTitle, $bRose, 1330, 200)

$errCircle = Create-RoundedRectangle 1480 380 180 180 90
$bRoseLight2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 226, 226))
$g15d.FillPath($bRoseLight2, $errCircle)
$g15d.DrawString("[Alert: 500]", $fontTitle, $bRose, 1515, 460)

$g15d.DrawString("Failed to Synchronize RBAC Policies", $fontTitle, $bTextDark, 1360, 600)
$g15d.DrawString("Could not connect to authentication gateway or token expired. Your existing permissions are safely cached.", $fontBody, $bTextMuted, 1330, 640)

$btnRetry = Create-RoundedRectangle 1460 710 220 44 8
$g15d.FillPath($bRose, $btnRetry)
$g15d.DrawString("Retry Request", $fontH2, $bWhite, 1515, 723)

Save-Proto $b15d "rbac-15-role-management-states-desktop.png"

# ==============================================================================
# Mobile Prototypes (800x1200) - Generating all 15 mobile screens
# ==============================================================================
Write-Host "Rendering 15 Mobile Prototypes..." -ForegroundColor Yellow

$screensMobile = @(
    @{ Name="rbac-01-roles-permissions-overview-mobile.png"; Title="Roles Overview"; Tab="Roles & Matrix" },
    @{ Name="rbac-02-default-org-roles-mobile.png"; Title="Default Org Roles"; Tab="Default Roles" },
    @{ Name="rbac-03-custom-role-creation-mobile.png"; Title="Create Custom Role"; Tab="Role Builder" },
    @{ Name="rbac-04-role-editing-mobile.png"; Title="Edit Role Grants"; Tab="Matrix Editor" },
    @{ Name="rbac-05-role-details-mobile.png"; Title="Role Telemetry"; Tab="Role Details" },
    @{ Name="rbac-06-permission-assignment-mobile.png"; Title="Capability Matrix"; Tab="Capabilities" },
    @{ Name="rbac-07-permission-categories-mobile.png"; Title="Permission Domains"; Tab="Domains" },
    @{ Name="rbac-08-org-role-management-mobile.png"; Title="Org Governance"; Tab="Org Scope" },
    @{ Name="rbac-09-workspace-role-management-mobile.png"; Title="Workspace Roles"; Tab="Workspace Scope" },
    @{ Name="rbac-10-user-role-assignment-mobile.png"; Title="User Assignments"; Tab="Members" },
    @{ Name="rbac-11-role-assignment-confirm-mobile.png"; Title="Confirm Assignment"; Tab="Verification" },
    @{ Name="rbac-12-permission-denied-mobile.png"; Title="403 Access Denied"; Tab="Security Block" },
    @{ Name="rbac-13-role-deletion-confirm-mobile.png"; Title="Delete Role Dialog"; Tab="Danger Zone" },
    @{ Name="rbac-14-role-audit-history-mobile.png"; Title="RBAC Audit Trail"; Tab="Audit Logs" },
    @{ Name="rbac-15-role-management-states-mobile.png"; Title="Empty & Error States"; Tab="Resilience" }
)

foreach ($sm in $screensMobile) {
    $bmpM = New-Object System.Drawing.Bitmap(800, 1200)
    $gM = [System.Drawing.Graphics]::FromImage($bmpM)
    $gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gM.FillRectangle($bLightCanvas, 0, 0, 800, 1200)

    # Mobile Header
    $gM.FillRectangle($bLightCard, 0, 0, 800, 75)
    $gM.DrawLine($pLightBorder, 0, 75, 800, 75)

    $gM.FillRectangle($bIndigo, 25, 20, 36, 36)
    $gM.DrawString("W", $fontH1, $bWhite, 36, 27)
    $gM.DrawString("WORKZEN RBAC", $fontH1, $bTextDark, 75, 26)

    $mBadge = Create-RoundedRectangle 620 22 150 32 6
    $gM.FillPath($bLightInner, $mBadge)
    $gM.DrawString("Mobile App", $fontBadge, $bIndigo, 655, 30)

    # Title Banner
    $gM.DrawString($sm.Title, $fontTitle, $bTextDark, 30, 95)
    $gM.DrawString("Acme Global Technologies • " + $sm.Tab, $fontBody, $bTextMuted, 30, 130)

    # Mobile Card 1: Primary Controls
    $mCard1 = Create-RoundedRectangle 30 170 740 460 12
    $gM.FillPath($bLightCard, $mCard1)
    $gM.DrawPath($pLightBorder, $mCard1)

    $gM.DrawString("Active Role: Organization Admin", $fontH1, $bIndigo, 55, 195)
    $gM.DrawString("Scope: Enterprise Organization • 31 / 35 Grants", $fontCode, $bTextMuted, 55, 230)

    # Mobile Granular Items
    $my = 270
    $mItems = @("org:read (View profile)", "org:manage_members (Add/remove members)", "workspace:create (Spin up agile squads)", "project:read (Access roadmaps)", "task:assign (Delegate backlog items)")
    foreach ($mi in $mItems) {
        $chkM = Create-RoundedRectangle 55 ($my + 2) 16 16 4
        $gM.FillPath($bEmerald, $chkM)
        $gM.DrawString($mi, $fontBody, $bTextDark, 80, $my)
        $my += 45
    }

    # Mobile Action Button
    $btnMob = Create-RoundedRectangle 55 540 690 48 8
    $gM.FillPath($bIndigo, $btnMob)
    $gM.DrawString("Manage Permissions & Members", $fontH2, $bWhite, 250, 555)

    # Mobile Card 2: Security & Audit Summary
    $mCard2 = Create-RoundedRectangle 30 660 740 480 12
    $gM.FillPath($bDarkCard, $mCard2)
    $gM.DrawPath($pDarkBorder, $mCard2)

    $gM.DrawString("Security & Anti-IDOR Invariants", $fontTitle, $bWhite, 55, 685)
    $gM.DrawString("Enforced server-side via requirePermission() middleware.", $fontBody, $bTextDim, 55, 725)

    $secPoints = @(
        "• Strict tenant isolation: Zero cross-tenant role leakage",
        "• Non-self-promotion: Users cannot elevate their own roles",
        "• Protected Owner: Final organization owner is immutable",
        "• Fast TanStack Query invalidation on role changes",
        "• TLS 1.3 Certified Session Token Encryption"
    )
    $spy = 770
    foreach ($sp in $secPoints) {
        $gM.DrawString($sp, $fontBody, $bTextDim, 55, $spy)
        $spy += 40
    }

    $btnAuditM = Create-RoundedRectangle 55 1020 690 48 8
    $gM.FillPath($bDarkInner, $btnAuditM)
    $gM.DrawString("View Immutable Audit Log", $fontH2, $bIndigo, 280, 1035)

    Save-Proto $bmpM $sm.Name
}

# ==============================================================================
# Architecture Diagrams (7 System Diagrams)
# ==============================================================================
Write-Host "Rendering 7 Architecture Diagrams..." -ForegroundColor Green

# 1. Tenant Hierarchy
$bd1 = New-Object System.Drawing.Bitmap(1600, 900)
$gd1 = [System.Drawing.Graphics]::FromImage($bd1)
$gd1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd1.FillRectangle($bDarkCanvas, 0, 0, 1600, 900)
$gd1.DrawString("WORKZEN — Multi-Tenant RBAC Hierarchy Architecture", $fontHero, $bWhite, 50, 40)

$orgBox = Create-RoundedRectangle 100 120 1400 320 16
$gd1.FillPath($bDarkCard, $orgBox)
$gd1.DrawPath($pIndigo, $orgBox)
$gd1.DrawString("ORGANIZATION TENANT BOUNDARY (Phase 6 Parent Entity)", $fontTitle, $bIndigo, 130, 150)
$gd1.DrawString("Governs legal compliance, billing, member directories, custom roles, and owner protection.", $fontBody, $bTextDim, 130, 190)

$gd1.DrawString("Org Roles: Owner (Unrestricted) • Admin (High Authority) • Manager • Member • Viewer", $fontH2, $bWhite, 130, 240)
$gd1.DrawString("Custom Roles Scoped to Org: Security Auditor • Compliance Officer • Billing Lead", $fontCode, $bEmerald, 130, 275)

$ws1Box = Create-RoundedRectangle 150 480 620 340 12
$gd1.FillPath($bDarkCard, $ws1Box)
$gd1.DrawPath($pLightBorder, $ws1Box)
$gd1.DrawString("WORKSPACE 1: /engineering", $fontTitle, $bSky, 180, 510)
$gd1.DrawString("Roles: WS Admin • Manager • Editor • Member • QA Lead", $fontBody, $bWhite, 180, 560)
$gd1.DrawString("Isolated Task Backlogs, Sprints & Code Reviews", $fontCode, $bTextDim, 180, 600)

$ws2Box = Create-RoundedRectangle 830 480 620 340 12
$gd1.FillPath($bDarkCard, $ws2Box)
$gd1.DrawPath($pLightBorder, $ws2Box)
$gd1.DrawString("WORKSPACE 2: /product-design", $fontTitle, $bPurple, 860, 510)
$gd1.DrawString("Roles: WS Admin • Lead Designer • Contributor • Viewer", $fontBody, $bWhite, 860, 560)
$gd1.DrawString("Isolated Roadmaps, Wireframes & Spec Docs", $fontCode, $bTextDim, 860, 600)

Save-Diag $bd1 "rbac-diag-01-tenant-hierarchy.png"

# 2. Permission Domains
$bd2 = New-Object System.Drawing.Bitmap(1600, 900)
$gd2 = [System.Drawing.Graphics]::FromImage($bd2)
$gd2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd2.FillRectangle($bLightCanvas, 0, 0, 1600, 900)
$gd2.DrawString("WORKZEN — 6 Granular Permission Domains (35 Total Actions)", $fontHero, $bTextDark, 50, 40)

$domains = @(
    @{ N="Organization (8)"; C=$cRose; A="org:read, org:update, org:manage_settings, org:manage_members, org:manage_roles, org:manage_permissions, org:archive, org:transfer_ownership" },
    @{ N="Workspace (7)"; C=$cIndigo; A="workspace:read, workspace:create, workspace:update, workspace:manage_settings, workspace:manage_access, workspace:manage_roles, workspace:archive" },
    @{ N="Projects (5)"; C=$cPurple; A="project:read, project:create, project:update, project:delete, project:manage_settings" },
    @{ N="Tasks & Sprints (6)"; C=$cEmerald; A="task:read, task:create, task:update, task:delete, task:assign, task:manage_status" },
    @{ N="Collaboration (6)"; C=$cAmber; A="collaboration:read, comment:create, comment:update, comment:delete, file:upload, file:manage" },
    @{ N="Reports & Telemetry (3)"; C=$cSky; A="report:read, report:generate, report:export" }
)
$dy = 120
foreach ($d in $domains) {
    $dBox = Create-RoundedRectangle 100 $dy 1400 105 12
    $gd2.FillPath($bLightCard, $dBox)
    $gd2.DrawPath($pLightBorder, $dBox)

    $bDc = New-Object System.Drawing.SolidBrush($d.C)
    $gd2.DrawString($d.N, $fontTitle, $bDc, 130, ($dy + 18))
    $gd2.DrawString($d.A, $fontCode, $bTextDark, 130, ($dy + 60))
    $dy += 120
}
Save-Diag $bd2 "rbac-diag-02-permission-categories.png"

# 3. Delegation Boundaries
$bd3 = New-Object System.Drawing.Bitmap(1600, 900)
$gd3 = [System.Drawing.Graphics]::FromImage($bd3)
$gd3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd3.FillRectangle($bDarkCanvas, 0, 0, 1600, 900)
$gd3.DrawString("WORKZEN — Delegation Boundary & Anti-Privilege Escalation Guard", $fontHero, $bWhite, 50, 40)

$delFlow = Create-RoundedRectangle 100 140 1400 680 16
$gd3.FillPath($bDarkCard, $delFlow)
$gd3.DrawPath($pRose, $delFlow)

$gd3.DrawString("STEP 1: ACTOR REQUEST", $fontH1, $bWhite, 150, 180)
$gd3.DrawString("Admin attempts to create or update a custom role with a set of permissions.", $fontBody, $bTextDim, 150, 215)

$gd3.DrawString("STEP 2: ACTOR AUTHORITY INSPECTION (Anti-Escalation Check)", $fontH1, $bAmber, 150, 280)
$gd3.DrawString("Server resolves Actor's effective permissions: hasPermission(Actor, p) for all requested permissions.", $fontCode, $bWhite, 150, 315)

$gd3.DrawString("STEP 3: DELEGATION EVALUATION", $fontH1, $bEmerald, 150, 380)
$gd3.DrawString("If Actor lacks ANY requested permission -> REJECT with 403 FORBIDDEN_PERMISSION_DELEGATION_DENIED.", $fontCode, $bRose, 150, 415)
$gd3.DrawString("If Actor possesses ALL requested permissions -> PERMIT creation and record event in AuditLog.", $fontCode, $bEmerald, 150, 445)

$gd3.DrawString("STEP 4: SELF-PROMOTION GUARD", $fontH1, $bSky, 150, 510)
$gd3.DrawString("An administrator cannot assign themselves an elevated role without multi-admin consensus.", $fontBody, $bTextDim, 150, 545)

$gd3.DrawString("STEP 5: IMMUTABLE OWNER INVARIANT", $fontH1, $bRose, 150, 610)
$gd3.DrawString("The last remaining Organization Owner CANNOT be demoted, removed, or revoked under any condition.", $fontTitle, $bRose, 150, 645)

Save-Diag $bd3 "rbac-diag-03-delegation-boundary.png"

# 4. User Role Assignment Flow
$bd4 = New-Object System.Drawing.Bitmap(1600, 900)
$gd4 = [System.Drawing.Graphics]::FromImage($bd4)
$gd4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd4.FillRectangle($bLightCanvas, 0, 0, 1600, 900)
$gd4.DrawString("WORKZEN — User Role Assignment & Resolution Flow", $fontHero, $bTextDark, 50, 40)

$steps4 = @(
    @{ S="1. Authenticate Request"; D="Verify JWT token via verifyAccessToken(); resolve req.user.userId"; C=$bIndigo },
    @{ S="2. Validate Tenant Membership"; D="Verify caller holds active membership in target organization"; C=$bSky },
    @{ S="3. Inspect Actor Authorization"; D="Verify caller holds 'org:manage_roles' or 'workspace:manage_roles'"; C=$bPurple },
    @{ S="4. Check Target User Scope"; D="Ensure target user belongs to the active tenant/workspace"; C=$bEmerald },
    @{ S="5. Execute Assignment"; D="Upsert RoleAssignment document with compound index { orgId, userId, roleId }"; C=$bAmber },
    @{ S="6. Invalidate Caches"; D="TanStack Query invalidates 'roles' & 'permissions'; UI reflects instantly"; C=$bTeal }
)
$s4y = 120
foreach ($st in $steps4) {
    $sBox = Create-RoundedRectangle 100 $s4y 1400 100 12
    $gd4.FillPath($bLightCard, $sBox)
    $gd4.DrawPath($pLightBorder, $sBox)

    $bSc = $st.C
    $gd4.DrawString($st.S, $fontTitle, $bSc, 130, ($s4y + 15))
    $gd4.DrawString($st.D, $fontCode, $bTextDark, 130, ($s4y + 55))
    $s4y += 115
}
Save-Diag $bd4 "rbac-diag-04-role-assignment-flow.png"

# 5. Middleware Decision Engine
$bd5 = New-Object System.Drawing.Bitmap(1600, 900)
$gd5 = [System.Drawing.Graphics]::FromImage($bd5)
$gd5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd5.FillRectangle($bDarkCanvas, 0, 0, 1600, 900)
$gd5.DrawString("WORKZEN — requirePermission() Authorization Engine Flow", $fontHero, $bWhite, 50, 40)

$decBox = Create-RoundedRectangle 100 140 1400 680 16
$gd5.FillPath($bDarkCard, $decBox)
$gd5.DrawPath($pIndigo, $decBox)

$gd5.DrawString("Incoming API Request -> requirePermission('workspace:create')", $fontTitle, $bWhite, 150, 180)
$gd5.DrawString("1. Is user authenticated? (req.user exists) -> YES", $fontBody, $bEmerald, 150, 230)
$gd5.DrawString("2. Is tenant active? (req.tenant.organisation.status !== 'archived') -> YES", $fontBody, $bEmerald, 150, 270)
$gd5.DrawString("3. Is caller the Organization Owner? -> IF YES: BYPASS CHECK & PERMIT ALL", $fontH2, $bRose, 150, 310)
$gd5.DrawString("4. Resolve Effective Permissions: Aggregate Direct Roles + Membership Roles", $fontBody, $bSky, 150, 350)
$gd5.DrawString("5. Does effectivePermissions.includes('workspace:create')? -> YES -> next()", $fontH1, $bEmerald, 150, 400)
$gd5.DrawString("6. If NO -> Fail Secure: Return 403 Forbidden with structured ErrorEnvelope", $fontH1, $bRose, 150, 450)
$gd5.DrawString("7. Structured Audit Log: Log actorId, ip, userAgent, requiredPermission, and resolution status", $fontCode, $bTextDim, 150, 520)

Save-Diag $bd5 "rbac-diag-05-middleware-decision-flow.png"

# 6. Audit Logging Pipeline
$bd6 = New-Object System.Drawing.Bitmap(1600, 900)
$gd6 = [System.Drawing.Graphics]::FromImage($bd6)
$gd6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd6.FillRectangle($bLightCanvas, 0, 0, 1600, 900)
$gd6.DrawString("WORKZEN — Immutable Audit Logging Pipeline", $fontHero, $bTextDark, 50, 40)

$pipeBox = Create-RoundedRectangle 100 140 1400 680 16
$gd6.FillPath($bLightCard, $pipeBox)
$gd6.DrawPath($pLightBorder, $pipeBox)

$gd6.DrawString("Security Action Triggered (e.g., Role Created, Assigned, or Denied)", $fontTitle, $bIndigo, 150, 180)
$gd6.DrawString("• Actor: req.user.userId & req.user.email", $fontBody, $bTextDark, 150, 230)
$gd6.DrawString("• Tenant: req.tenant.organisationId (Acme Global Org)", $fontBody, $bTextDark, 150, 260)
$gd6.DrawString("• Entity Type: 'role' | 'permission' | 'role_assignment'", $fontBody, $bTextDark, 150, 290)
$gd6.DrawString("• Metadata: Sanitized changes snapshot (Zero passwords or tokens logged)", $fontBody, $bTextDark, 150, 320)
$gd6.DrawString("• Storage: MongoDB AuditLog Collection with compound index { organisationId: 1, createdAt: -1 }", $fontH2, $bEmerald, 150, 370)
$gd6.DrawString("• Tamper-Proof: Normal users cannot edit or delete audit log records", $fontH2, $bRose, 150, 410)

Save-Diag $bd6 "rbac-diag-06-audit-trail-pipeline.png"

# 7. Cache Invalidation Flow
$bd7 = New-Object System.Drawing.Bitmap(1600, 900)
$gd7 = [System.Drawing.Graphics]::FromImage($bd7)
$gd7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gd7.FillRectangle($bDarkCanvas, 0, 0, 1600, 900)
$gd7.DrawString("WORKZEN — Zero-Stale State & Cache Invalidation Flow", $fontHero, $bWhite, 50, 40)

$cchBox = Create-RoundedRectangle 100 140 1400 680 16
$gd7.FillPath($bDarkCard, $cchBox)
$gd7.DrawPath($pEmerald, $cchBox)

$gd7.DrawString("1. Administrator updates role permissions in React UI", $fontTitle, $bWhite, 150, 180)
$gd7.DrawString("2. PATCH /api/v1/roles/:roleId commits updates to MongoDB", $fontBody, $bSky, 150, 230)
$gd7.DrawString("3. TanStack Query queryClient.invalidateQueries({ queryKey: ['roles'] }) triggers", $fontH2, $bEmerald, 150, 280)
$gd7.DrawString("4. Zustand store syncs active user effective permissions without full-page reload", $fontH2, $bIndigo, 150, 330)
$gd7.DrawString("5. UI buttons and navigation tabs reactively show or hide according to new permissions", $fontBody, $bWhite, 150, 380)
$gd7.DrawString("6. Backend enforces every API request; client never bypasses server checks", $fontTitle, $bRose, 150, 440)

Save-Diag $bd7 "rbac-diag-07-cache-invalidation-flow.png"

Write-Host "All 15 Desktop + 15 Mobile Prototypes and 7 Diagrams generated successfully!" -ForegroundColor Green

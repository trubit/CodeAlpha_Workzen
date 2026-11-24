# ==============================================================================
# WORKZEN — Phase 12: Project Members & Collaboration Implementation Screenshot Generator
# Renders high-fidelity implementation screenshots of the actual UI
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-12\screenshots"
if (!(Test-Path $baseDir)) { New-Item -ItemType Directory -Force -Path $baseDir | Out-Null }

function Create-RoundedRectangle($x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -le 0) {
        $path.AddRectangle((New-Object System.Drawing.RectangleF([float]$x, [float]$y, [float]$w, [float]$h)))
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

$cCanvas     = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cSidebar    = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cCard       = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cCardSubtle = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cBorder     = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cPrimary    = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cTextDim    = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")

$bCanvas     = New-Object System.Drawing.SolidBrush($cCanvas)
$bSidebar    = New-Object System.Drawing.SolidBrush($cSidebar)
$bCard       = New-Object System.Drawing.SolidBrush($cCard)
$bCardSubtle = New-Object System.Drawing.SolidBrush($cCardSubtle)
$bBorder     = New-Object System.Drawing.SolidBrush($cBorder)
$bPrimary    = New-Object System.Drawing.SolidBrush($cPrimary)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)

$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 20, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 13, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 10.5, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 10.5, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 9, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 9, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 8, [System.Drawing.FontStyle]::Regular)

$screens = @(
    @{ File="project-members-roster-desktop.png"; Width=1920; Height=1080; SidebarW=260; Type="roster" },
    @{ File="project-members-roster-tablet.png";  Width=1024; Height=768;  SidebarW=200; Type="roster" },
    @{ File="project-members-roster-mobile.png";  Width=800;  Height=1200; SidebarW=0;   Type="roster" },
    @{ File="add-project-members-modal.png";      Width=1920; Height=1080; SidebarW=260; Type="add-modal" },
    @{ File="update-project-role-modal.png";      Width=1920; Height=1080; SidebarW=260; Type="role-modal" },
    @{ File="remove-project-member-modal.png";    Width=1920; Height=1080; SidebarW=260; Type="remove-modal" },
    @{ File="project-member-activity-log.png";    Width=1920; Height=1080; SidebarW=260; Type="activity" }
)

Write-Host "Rendering Phase 12 actual implementation screenshots..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    $filepath = Join-Path $baseDir $scr.File
    $bmp = New-Object System.Drawing.Bitmap $scr.Width, $scr.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Canvas
    $g.FillRectangle($bCanvas, 0, 0, $scr.Width, $scr.Height)

    # Sidebar
    if ($scr.SidebarW -gt 0) {
        $g.FillRectangle($bSidebar, 0, 0, $scr.SidebarW, $scr.Height)
        $logoRect = Create-RoundedRectangle 24 24 36 36 8
        $g.FillPath($bPrimary, $logoRect)
        $g.DrawString("W", $fBrand, $bWhite, 32, 28)
        $g.DrawString("WORKZEN", $fBrand, $bWhite, 70, 30)

        $navY = 90
        $navItems = @("Enterprise Dashboard", "Projects & Squads", "Kanban Board", "Team Management", "Settings")
        foreach ($item in $navItems) {
            $isProjects = ($item -eq "Projects & Squads")
            if ($isProjects) {
                $itemBg = Create-RoundedRectangle 16 ($navY - 4) ($scr.SidebarW - 32) 38 6
                $g.FillPath($bPrimary, $itemBg)
                $g.DrawString($item, $fBodyBold, $bWhite, 36, ($navY + 4))
            } else {
                $g.DrawString($item, $fBody, $bTextDim, 36, ($navY + 4))
            }
            $navY += 46
        }
    }

    # Top Navbar
    $mainX = $scr.SidebarW
    $mainW = $scr.Width - $scr.SidebarW
    $headerH = 70
    $g.FillRectangle($bCard, $mainX, 0, $mainW, $headerH)
    $g.DrawLine($pBorder, $mainX, $headerH, $scr.Width, $headerH)
    $g.DrawString("Projects / Platform Infrastructure / Members & Collaboration", $fSmall, $bTextMuted, ($mainX + 32), 26)

    # Content Area
    $contentX = $mainX + 32
    $contentY = $headerH + 28
    $contentW = $mainW - 64

    # Project Banner
    $bannerH = 110
    $bannerBox = Create-RoundedRectangle $contentX $contentY $contentW $bannerH 12
    $g.FillPath($bCard, $bannerBox)
    $g.DrawPath($pBorder, $bannerBox)

    $keyBadge = Create-RoundedRectangle ($contentX + 24) ($contentY + 22) 54 30 6
    $g.FillPath($bPrimary, $keyBadge)
    $g.DrawString("PLAT", $fBodyBold, $bWhite, ($contentX + 32), ($contentY + 28))
    $g.DrawString("Platform Infrastructure Roadmap", $fTitle, $bTextDark, ($contentX + 90), ($contentY + 20))
    $g.DrawString("High-velocity core backend services, authentication, and multitenancy orchestration.", $fSmall, $bTextMuted, ($contentX + 90), ($contentY + 52))

    # Tabs inside Banner
    $tabY = $contentY + $bannerH - 34
    $g.DrawString("• Members & Collaboration (4)", $fBodyBold, $bPrimary, ($contentX + 90), $tabY)
    $g.DrawString("Deliverables & Roadmap", $fSmall, $bTextMuted, ($contentX + 320), ($tabY + 1))
    $g.DrawString("Membership Activity Log", $fSmall, $bTextMuted, ($contentX + 490), ($tabY + 1))

    # Stat Cards
    $statY = $contentY + $bannerH + 20
    $cardW = ($contentW - 32) / 3
    if ($scr.Width -le 800) { $cardW = $contentW }

    $stats = @(
        @{ Label="Total Collaborators"; Val="4 Members"; Sub="Across 3 squads"; Color=$bPrimary },
        @{ Label="Project Leadership"; Val="1 Lead"; Sub="Owner: Alex Chen"; Color=$bEmerald },
        @{ Label="Available Org Teammates"; Val="12 Available"; Sub="Active members eligible to join"; Color=$bSky }
    )
    for ($i = 0; $i -lt 3; $i++) {
        if ($scr.Width -le 800 -and $i -gt 0) { continue }
        $sx = $contentX + ($i * ($cardW + 16))
        $sBox = Create-RoundedRectangle $sx $statY $cardW 90 10
        $g.FillPath($bCard, $sBox)
        $g.DrawPath($pBorder, $sBox)
        $g.DrawString($stats[$i].Label, $fSmall, $bTextMuted, ($sx + 18), ($statY + 14))
        $g.DrawString($stats[$i].Val, $fSection, $stats[$i].Color, ($sx + 18), ($statY + 36))
        $g.DrawString($stats[$i].Sub, $fTiny, $bTextDim, ($sx + 18), ($statY + 64))
    }

    # Main Table
    $tableY = $statY + 110
    $tableH = $scr.Height - $tableY - 32
    $tBox = Create-RoundedRectangle $contentX $tableY $contentW $tableH 12
    $g.FillPath($bCard, $tBox)
    $g.DrawPath($pBorder, $tBox)

    $g.DrawString("Project Member Roster", $fSection, $bTextDark, ($contentX + 24), ($tableY + 18))
    $g.DrawString("4 active collaborators allocated to Platform Infrastructure Roadmap", $fSmall, $bTextMuted, ($contentX + 24), ($tableY + 40))

    # Add Button
    $addBtn = Create-RoundedRectangle ($contentX + $contentW - 170) ($tableY + 18) 146 36 6
    $g.FillPath($bPrimary, $addBtn)
    $g.DrawString("+ Add Team Member", $fSmallBold, $bWhite, ($contentX + $contentW - 160), ($tableY + 28))

    # Table Header Line
    $colY = $tableY + 70
    $g.DrawLine($pBorder, ($contentX + 20), $colY, ($contentX + $contentW - 20), $colY)
    $colY += 10
    $g.DrawString("COLLABORATOR", $fSmallBold, $bTextMuted, ($contentX + 32), $colY)
    $g.DrawString("ROLE & ACCESS", $fSmallBold, $bTextMuted, ($contentX + 320), $colY)
    $g.DrawString("JOINED PROJECT", $fSmallBold, $bTextMuted, ($contentX + 500), $colY)
    $g.DrawString("STATUS", $fSmallBold, $bTextMuted, ($contentX + 660), $colY)
    $g.DrawString("ACTIONS", $fSmallBold, $bTextMuted, ($contentX + $contentW - 130), $colY)

    # Roster Rows
    $rowY = $colY + 26
    $members = @(
        @{ Name="Alex Chen"; Email="alex.chen@workzen.io"; Role="Lead"; IsOwner=$true; Joined="11/18/2026"; Status="Active" },
        @{ Name="Diana Prince"; Email="diana.p@workzen.io"; Role="Contributor"; IsOwner=$false; Joined="11/18/2026"; Status="Active" },
        @{ Name="Marcus Brody"; Email="marcus.b@workzen.io"; Role="Contributor"; IsOwner=$false; Joined="11/18/2026"; Status="Active" },
        @{ Name="Elena Vance"; Email="elena.v@workzen.io"; Role="Observer"; IsOwner=$false; Joined="11/18/2026"; Status="Active" }
    )

    foreach ($m in $members) {
        $g.DrawLine($pBorder, ($contentX + 20), $rowY, ($contentX + $contentW - 20), $rowY)
        $rowY += 10

        # Avatar
        $avRect = New-Object System.Drawing.RectangleF(($contentX + 32), $rowY, 34, 34)
        $g.FillEllipse($bCardSubtle, $avRect)
        $g.DrawEllipse($pBorder, $avRect)
        $g.DrawString($m.Name.Substring(0, 1), $fSmallBold, $bPrimary, ($contentX + 43), ($rowY + 8))

        # Details
        $g.DrawString($m.Name, $fBodyBold, $bTextDark, ($contentX + 76), $rowY)
        $g.DrawString($m.Email, $fTiny, $bTextMuted, ($contentX + 76), ($rowY + 18))

        # Role
        $rolePill = Create-RoundedRectangle ($contentX + 320) ($rowY + 4) 100 24 12
        $g.FillPath($bCardSubtle, $rolePill)
        $rColor = if ($m.Role -eq "Lead") { $bEmerald } elseif ($m.Role -eq "Observer") { $bSky } else { $bPrimary }
        $g.DrawString($m.Role, $fTiny, $rColor, ($contentX + 334), ($rowY + 8))

        # Joined & Status
        $g.DrawString($m.Joined, $fSmall, $bTextMuted, ($contentX + 500), ($rowY + 6))
        $g.DrawString($m.Status, $fSmallBold, $bEmerald, ($contentX + 660), ($rowY + 6))

        # Actions
        $g.DrawString("Role  •  Remove", $fSmall, $bPrimary, ($contentX + $contentW - 130), ($rowY + 6))

        $rowY += 46
    }

    # Overlay Modals if requested
    if ($scr.Type -eq "add-modal") {
        $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
        $g.FillRectangle($overlay, 0, 0, $scr.Width, $scr.Height)

        $mW = 560
        $mH = 460
        $mX = ($scr.Width - $mW) / 2
        $mY = ($scr.Height - $mH) / 2
        $mBox = Create-RoundedRectangle $mX $mY $mW $mH 14
        $g.FillPath($bCard, $mBox)
        $g.DrawPath($pBorder, $mBox)

        $g.DrawString("Add Team Members", $fSection, $bTextDark, ($mX + 28), ($mY + 24))
        $g.DrawString("Grant access to Platform Infrastructure Roadmap", $fSmall, $bTextMuted, ($mX + 28), ($mY + 48))

        $g.DrawString("Initial Project Role: Contributor", $fSmallBold, $bTextDark, ($mX + 28), ($mY + 86))

        $sbR = Create-RoundedRectangle ($mX + 28) ($mY + 115) ($mW - 56) 38 6
        $g.FillPath($bCardSubtle, $sbR)
        $g.DrawPath($pBorder, $sbR)
        $g.DrawString("Search teammates by name or email...", $fSmall, $bTextDim, ($mX + 42), ($mY + 126))

        $teammates = @("Chloe Decker (chloe.d@workzen.io)", "Brian O'Conner (brian.o@workzen.io)", "Lisa Taylor (lisa.t@workzen.io)")
        $tY = $mY + 168
        foreach ($t in $teammates) {
            $tBox = Create-RoundedRectangle ($mX + 28) $tY ($mW - 56) 44 6
            $g.FillPath($bCardSubtle, $tBox)
            $g.DrawString($t, $fBody, $bTextDark, ($mX + 68), ($tY + 12))
            $cR = Create-RoundedRectangle ($mX + 40) ($tY + 14) 16 16 4
            $g.FillPath($bPrimary, $cR)
            $g.DrawString("✓", $fTiny, $bWhite, ($mX + 43), ($tY + 15))
            $tY += 50
        }

        $addBtnM = Create-RoundedRectangle ($mX + $mW - 150) ($mY + $mH - 58) 122 36 6
        $g.FillPath($bPrimary, $addBtnM)
        $g.DrawString("Add Selected (3)", $fSmallBold, $bWhite, ($mX + $mW - 140), ($mY + $mH - 48))
    }

    if ($scr.Type -eq "role-modal") {
        $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
        $g.FillRectangle($overlay, 0, 0, $scr.Width, $scr.Height)

        $mW = 480
        $mH = 340
        $mX = ($scr.Width - $mW) / 2
        $mY = ($scr.Height - $mH) / 2
        $mBox = Create-RoundedRectangle $mX $mY $mW $mH 14
        $g.FillPath($bCard, $mBox)
        $g.DrawPath($pBorder, $mBox)

        $g.DrawString("Modify Project Role", $fSection, $bTextDark, ($mX + 28), ($mY + 24))
        $g.DrawString("Diana Prince (diana.p@workzen.io)", $fSmall, $bTextMuted, ($mX + 28), ($mY + 48))

        $roles = @(
            @{ Name="Project Lead"; Desc="Full management permissions, member management, and roadmap editing." },
            @{ Name="Contributor (Selected)"; Desc="Can create, update, and manage tasks, sprints, and deliverables." },
            @{ Name="Observer"; Desc="Read-only project access. Can view roadmaps, tasks, and velocity metrics." }
        )
        $rY = $mY + 84
        foreach ($r in $roles) {
            $rBox = Create-RoundedRectangle ($mX + 28) $rY ($mW - 56) 56 6
            $g.FillPath($bCardSubtle, $rBox)
            $g.DrawString($r.Name, $fSmallBold, $bTextDark, ($mX + 42), ($rY + 10))
            $g.DrawString($r.Desc, $fTiny, $bTextMuted, ($mX + 42), ($rY + 28))
            $rY += 64
        }
    }

    if ($scr.Type -eq "remove-modal") {
        $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
        $g.FillRectangle($overlay, 0, 0, $scr.Width, $scr.Height)

        $mW = 460
        $mH = 240
        $mX = ($scr.Width - $mW) / 2
        $mY = ($scr.Height - $mH) / 2
        $mBox = Create-RoundedRectangle $mX $mY $mW $mH 14
        $g.FillPath($bCard, $mBox)
        $g.DrawPath($pBorder, $mBox)

        $g.DrawString("Remove Project Member?", $fSection, $bRose, ($mX + 28), ($mY + 24))
        $g.DrawString("Are you sure you want to remove Marcus Brody from this project? Their assigned tasks will remain in the project backlog.", $fSmall, $bTextMuted, (New-Object System.Drawing.RectangleF(($mX + 28), ($mY + 56), ($mW - 56), 60)))

        $rBtn = Create-RoundedRectangle ($mX + $mW - 150) ($mY + $mH - 56) 122 36 6
        $g.FillPath($bRose, $rBtn)
        $g.DrawString("Confirm Removal", $fSmallBold, $bWhite, ($mX + $mW - 140), ($mY + $mH - 46))
    }

    if ($scr.Type -eq "activity") {
        # Activity Log overlay
        $actH = $scr.Height - $tableY - 32
        $aBox = Create-RoundedRectangle $contentX $tableY $contentW $actH 12
        $g.FillPath($bCard, $aBox)
        $g.DrawPath($pBorder, $aBox)

        $g.DrawString("Project Membership History & Audit Trail", $fSection, $bTextDark, ($contentX + 24), ($tableY + 18))
        $g.DrawString("Immutable record of collaborator allocations, role changes, and access modifications", $fSmall, $bTextMuted, ($contentX + 24), ($tableY + 40))

        $events = @(
            @{ Action="Collaborator Added: Diana Prince (Contributor)"; Actor="Alex Chen"; Time="10 minutes ago" },
            @{ Action="Collaborator Added: Marcus Brody (Contributor)"; Actor="Alex Chen"; Time="15 minutes ago" },
            @{ Action="Collaborator Added: Elena Vance (Observer)"; Actor="Alex Chen"; Time="22 minutes ago" },
            @{ Action="Project Created & Owner Initialized"; Actor="Alex Chen"; Time="35 minutes ago" }
        )
        $eY = $tableY + 75
        foreach ($e in $events) {
            $eBox = Create-RoundedRectangle ($contentX + 24) $eY ($contentW - 48) 50 6
            $g.FillPath($bCardSubtle, $eBox)
            $g.DrawString($e.Action, $fSmallBold, $bTextDark, ($contentX + 44), ($eY + 10))
            $g.DrawString("Executed by $($e.Actor) • $($e.Time)", $fTiny, $bTextMuted, ($contentX + 44), ($eY + 28))
            $eY += 60
        }
    }

    $bmp.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Write-Host "All Phase 12 implementation screenshots generated in: $baseDir" -ForegroundColor Green


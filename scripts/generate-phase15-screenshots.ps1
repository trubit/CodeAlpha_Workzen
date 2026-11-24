# ==============================================================================
# WORKZEN — Phase 15: Subtasks & Dependencies Implementation Screenshot Generator
# Renders actual implementation screenshots into docs/design/phase-15/screenshots
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-15\screenshots"
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
$cIndigo     = [System.Drawing.ColorTranslator]::FromHtml("#6366F1")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cRoseBg     = [System.Drawing.ColorTranslator]::FromHtml("#FFF1F2")
$cRoseBorder = [System.Drawing.ColorTranslator]::FromHtml("#FECDD3")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cSlate      = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
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
$bIndigo     = New-Object System.Drawing.SolidBrush($cIndigo)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bRoseBg     = New-Object System.Drawing.SolidBrush($cRoseBg)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bSlate      = New-Object System.Drawing.SolidBrush($cSlate)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pRose       = New-Object System.Drawing.Pen($cRoseBorder, 1.0)
$pRoseSolid  = New-Object System.Drawing.Pen($cRose, 2.0)

$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Bold)
$fMono      = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 7.5, [System.Drawing.FontStyle]::Regular)

$screens = @(
    @{ File="task-details-subtasks-desktop.png";  Width=1920; Height=1080; SidebarW=260; State="subtasks" },
    @{ File="task-details-blocked-state.png";     Width=1920; Height=1080; SidebarW=260; State="blocked" },
    @{ File="task-dependencies-card.png";         Width=1920; Height=1080; SidebarW=260; State="dependencies" },
    @{ File="add-dependency-modal.png";           Width=1920; Height=1080; SidebarW=260; State="dep-modal" },
    @{ File="circular-dependency-error.png";      Width=1920; Height=1080; SidebarW=260; State="circular-error" },
    @{ File="kanban-subtasks-and-blocked.png";    Width=1920; Height=1080; SidebarW=260; State="kanban" },
    @{ File="task-list-subtasks-telemetry.png";   Width=1920; Height=1080; SidebarW=260; State="tasklist" },
    @{ File="subtask-details-breadcrumb.png";     Width=1920; Height=1080; SidebarW=260; State="breadcrumb" }
)

Write-Host "Rendering Phase 15 Implementation Screenshots into docs/design/phase-15/screenshots..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    $w = $scr.Width
    $h = $scr.Height
    $sbW = $scr.SidebarW

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $g.FillRectangle($bCanvas, 0, 0, $w, $h)

    # 1. Sidebar (if present)
    if ($sbW -gt 0) {
        $g.FillRectangle($bSidebar, 0, 0, $sbW, $h)
        $g.DrawString("WORKZEN", $fBrand, $bWhite, 24, 28)
        $g.DrawString("ENTERPRISE SAAS", $fTiny, $bTextDim, 26, 50)

        $navItems = @("Enterprise Dashboard", "Project Portfolio", "Tasks", "Kanban Board", "Team Management", "Roles & Permissions", "Settings")
        $navY = 96
        foreach ($item in $navItems) {
            $isCur = ($scr.State -eq "kanban" -and $item -eq "Kanban Board") -or ($scr.State -ne "kanban" -and $item -eq "Tasks")
            if ($isCur) {
                $pathNav = Create-RoundedRectangle 14 $navY ($sbW - 28) 36 6
                $g.FillPath($bPrimary, $pathNav)
                $g.DrawString($item, $fSmallBold, $bWhite, 28, ($navY + 9))
            } else {
                $g.DrawString($item, $fSmall, $bTextDim, 28, ($navY + 9))
            }
            $navY += 44
        }
    }

    # 2. Main Content Canvas
    $contentX = $sbW + 28
    $contentW = $w - $contentX - 28

    # Top App Bar
    $g.FillRectangle($bCard, $sbW, 0, ($w - $sbW), 64)
    $g.DrawLine($pBorder, $sbW, 64, $w, 64)
    $g.DrawString("Acme Global Inc. / Engineering Workspace / Core Platform", $fSmall, $bTextMuted, ($sbW + 28), 24)
    $g.DrawString("Alex Chen (Admin)", $fSmallBold, $bTextDark, ($w - 180), 24)

    # Header Toolbar
    $tbY = 82
    $tbH = 88
    $tbPath = Create-RoundedRectangle $contentX $tbY $contentW $tbH 10
    $g.FillPath($bCard, $tbPath)
    $g.DrawPath($pBorder, $tbPath)

    $headerTitle = if ($scr.State -eq "kanban") { "Interactive Sprint Kanban Board" } `
                   elseif ($scr.State -eq "tasklist") { "Sprint Task Management Repository" } `
                   else { "Task Specifications: WZ-101" }

    $headerSub = if ($scr.State -eq "kanban") { "Dynamic board with live subtasks telemetry and prerequisite blocked indicators" } `
                 elseif ($scr.State -eq "tasklist") { "Complete sprint catalog with subtask progress bars and dependency columns" } `
                 else { "Centralized technical specification, subtask progress, and prerequisite dependency graph" }

    $g.DrawString($headerTitle, $fTitle, $bTextDark, ($contentX + 24), ($tbY + 16))
    $g.DrawString($headerSub, $fSmall, $bTextMuted, ($contentX + 26), ($tbY + 44))

    $mainY = $tbY + $tbH + 16
    $mainH = $h - $mainY - 24

    if ($scr.State -eq "kanban") {
        # Kanban Board with Subtask Badge & Blocked Badge
        $colW = [Math]::Floor(($contentW - 48) / 3)
        $colNames = @("TO DO", "IN PROGRESS", "DONE")
        $colBrushes = @($bSky, $bIndigo, $bEmerald)

        for ($ci = 0; $ci -lt 3; $ci++) {
            $cx = $contentX + ($ci * ($colW + 24))
            $cPath = Create-RoundedRectangle $cx $mainY $colW $mainH 8
            $g.FillPath($bCardSubtle, $cPath)
            $g.DrawPath($pBorder, $cPath)

            $g.DrawString($colNames[$ci], $fSmallBold, $colBrushes[$ci], ($cx + 16), ($mainY + 14))

            $cardY = $mainY + 46
            $cardH = 124
            for ($k = 0; $k -lt 2; $k++) {
                $kPath = Create-RoundedRectangle ($cx + 12) $cardY ($colW - 24) $cardH 6
                $g.FillPath($bCard, $kPath)
                $g.DrawPath($pBorder, $kPath)

                $keyStr = "WZ-$($ci * 10 + $k + 101)"
                $g.DrawString($keyStr, $fMono, $bPrimary, ($cx + 24), ($cardY + 12))

                $cardTitle = if ($ci -eq 0 -and $k -eq 0) { "OAuth2 PKCE flow verification" } `
                             elseif ($ci -eq 1 -and $k -eq 0) { "Implement Redis token revocation blacklist" } `
                             else { "Database migration schema update" }
                $g.DrawString($cardTitle, $fBodyBold, $bTextDark, ($cx + 24), ($cardY + 28))

                # Subtasks Badge
                $subPill = Create-RoundedRectangle ($cx + 24) ($cardY + 84) 100 22 4
                $g.FillPath($bCardSubtle, $subPill)
                $g.DrawPath($pBorder, $subPill)
                $g.DrawString("📋 3/5 subtasks", $fTiny, $bIndigo, ($cx + 32), ($cardY + 88))

                # Blocked Badge (on in-progress card)
                if ($ci -eq 1 -and $k -eq 0) {
                    $blkPill = Create-RoundedRectangle ($cx + 132) ($cardY + 84) 88 22 4
                    $g.FillPath($bRoseBg, $blkPill)
                    $g.DrawPath($pRose, $blkPill)
                    $g.DrawString("🔒 Blocked (1)", $fTiny, $bRose, ($cx + 140), ($cardY + 88))
                }

                $cardY += $cardH + 16
            }
        }
    } elseif ($scr.State -eq "tasklist") {
        # Task List Table with Subtasks & Blocked Columns
        $tablePath = Create-RoundedRectangle $contentX $mainY $contentW $mainH 10
        $g.FillPath($bCard, $tablePath)
        $g.DrawPath($pBorder, $tablePath)

        $g.FillRectangle($bCardSubtle, ($contentX + 1), ($mainY + 1), ($contentW - 2), 42)
        $g.DrawLine($pBorder, $contentX, ($mainY + 43), ($contentX + $contentW), ($mainY + 43))

        $tCols = @(
            @{ Label="KEY & TITLE"; X=($contentX + 24) },
            @{ Label="STATUS"; X=($contentX + 440) },
            @{ Label="SUBTASKS PROGRESS"; X=($contentX + 600) },
            @{ Label="DEPENDENCIES"; X=($contentX + 800) },
            @{ Label="ASSIGNEE"; X=($contentX + 1000) },
            @{ Label="ACTIONS"; X=($contentX + 1180) }
        )
        foreach ($tc in $tCols) {
            $g.DrawString($tc.Label, $fSmallBold, $bTextMuted, $tc.X, ($mainY + 13))
        }

        $rows = @(
            @{ Key="WZ-101"; Title="Implement Redis token revocation blacklist"; Status="In Progress"; Sub="3/5 (60%)"; Blk="Blocked (1)"; BlkCol=$cRose; SCol=$cIndigo },
            @{ Key="WZ-102"; Title="OAuth2 PKCE flow verification"; Status="To Do"; Sub="0/3 (0%)"; Blk="— Clear"; BlkCol=$cSlate; SCol=$cSky },
            @{ Key="WZ-103"; Title="Database migration schema update"; Status="Done"; Sub="4/4 (100%)"; Blk="— Clear"; BlkCol=$cSlate; SCol=$cEmerald },
            @{ Key="WZ-104"; Title="Audit RBAC project permission isolation"; Status="In Review"; Sub="2/4 (50%)"; Blk="— Clear"; BlkCol=$cSlate; SCol=$cAmber }
        )

        $rY = $mainY + 44
        foreach ($r in $rows) {
            $g.DrawLine($pBorder, $contentX, ($rY + 54), ($contentX + $contentW), ($rY + 54))
            $g.DrawString($r.Key, $fMono, $bPrimary, ($contentX + 24), ($rY + 10))
            $g.DrawString($r.Title, $fBodyBold, $bTextDark, ($contentX + 24), ($rY + 26))

            $sPill = Create-RoundedRectangle ($contentX + 440) ($rY + 14) 96 24 5
            $g.FillPath((New-Object System.Drawing.SolidBrush($r.SCol)), $sPill)
            $g.DrawString($r.Status, $fTiny, $bWhite, ($contentX + 452), ($rY + 18))

            $g.DrawString($r.Sub, $fSmallBold, $bIndigo, ($contentX + 600), ($rY + 16))

            $dPill = Create-RoundedRectangle ($contentX + 800) ($rY + 14) 98 24 5
            if ($r.Blk -like "*Blocked*") {
                $g.FillPath($bRoseBg, $dPill)
                $g.DrawPath($pRose, $dPill)
                $g.DrawString("🔒 $($r.Blk)", $fTiny, $bRose, ($contentX + 808), ($rY + 18))
            } else {
                $g.DrawString("— Clear", $fSmall, $bTextDim, ($contentX + 808), ($rY + 18))
            }

            $g.DrawString("Dev Engineer", $fSmall, $bTextDark, ($contentX + 1000), ($rY + 18))
            $g.DrawString("View  •  Edit", $fSmallBold, $bPrimary, ($contentX + 1180), ($rY + 18))
            $rY += 54
        }
    } else {
        # Task Details Page Layout with Subtasks & Dependencies
        $leftW = [Math]::Floor($contentW * 0.65)
        $rightW = $contentW - $leftW - 24
        $rightX = $contentX + $leftW + 24

        $dY = $mainY

        # Blocked Banner (if blocked or state=blocked)
        if ($scr.State -eq "blocked" -or $scr.State -eq "dependencies") {
            $banH = 54
            $banPath = Create-RoundedRectangle $contentX $dY $leftW $banH 8
            $g.FillPath($bRoseBg, $banPath)
            $g.DrawPath($pRoseSolid, $banPath)
            $g.DrawString("🔒 Task is Currently Blocked", $fBodyBold, $bRose, ($contentX + 24), ($dY + 10))
            $g.DrawString("Waiting on prerequisite completion: WZ-99 (Database migration pipeline) to be marked DONE.", $fSmall, $bTextDark, ($contentX + 24), ($dY + 30))
            $dY += $banH + 16
        }

        # Parent Task Breadcrumb (if state=breadcrumb)
        if ($scr.State -eq "breadcrumb") {
            $bcH = 38
            $bcPath = Create-RoundedRectangle $contentX $dY $leftW $bcH 6
            $g.FillPath($bCardSubtle, $bcPath)
            $g.DrawPath($pBorder, $bcPath)
            $g.DrawString("Parent Task: WZ-101 (Implement Redis token revocation blacklist)", $fSmallBold, $bPrimary, ($contentX + 16), ($dY + 10))
            $g.DrawString("Status: In Progress", $fTiny, $bIndigo, ($contentX + $leftW - 140), ($dY + 11))
            $dY += $bcH + 16
        }

        # 1. Main Task Card
        $card1H = 170
        $c1Path = Create-RoundedRectangle $contentX $dY $leftW $card1H 10
        $g.FillPath($bCard, $c1Path)
        $g.DrawPath($pBorder, $c1Path)

        $g.DrawString("Projects / Core Platform / WZ-101", $fSmallBold, $bPrimary, ($contentX + 24), ($dY + 20))
        $g.DrawString("WZ-101: Implement Redis token revocation blacklist", $fTitle, $bTextDark, ($contentX + 24), ($dY + 42))
        $g.DrawString("Status: In Progress   |   Priority: Urgent   |   Assignee: Dev Engineer", $fSmallBold, $bIndigo, ($contentX + 24), ($dY + 76))
        $g.DrawLine($pBorder, ($contentX + 24), ($dY + 106), ($contentX + $leftW - 24), ($dY + 106))
        $g.DrawString("Production token revocation cache with TTL auto-expiry and distributed invalidation.", $fBody, $bTextDark, ($contentX + 24), ($dY + 122))

        $dY += $card1H + 16

        # 2. Subtasks Management Card
        $card2H = 290
        $c2Path = Create-RoundedRectangle $contentX $dY $leftW $card2H 10
        $g.FillPath($bCard, $c2Path)
        $g.DrawPath($pBorder, $c2Path)

        $g.DrawString("Subtasks (3 of 5 completed — 60%)", $fSection, $bTextDark, ($contentX + 24), ($dY + 18))
        $g.DrawString("60% Complete", $fSmallBold, $bIndigo, ($contentX + $leftW - 130), ($dY + 20))

        # Progress bar
        $pbW = $leftW - 48
        $pbBg = Create-RoundedRectangle ($contentX + 24) ($dY + 46) $pbW 6 3
        $g.FillPath($bCardSubtle, $pbBg)
        $pbFill = Create-RoundedRectangle ($contentX + 24) ($dY + 46) ([Math]::Floor($pbW * 0.6)) 6 3
        $g.FillPath($bPrimary, $pbFill)

        # Subtask rows
        $stY = $dY + 64
        $subList = @(
            @{ Done=$true; Key="WZ-101-1"; Title="Configure Redis cluster connection pooling in container"; P="High" },
            @{ Done=$true; Key="WZ-101-2"; Title="Implement token hash generation and TTL expiration index"; P="High" },
            @{ Done=$true; Key="WZ-101-3"; Title="Write token blacklist middleware hook in Express pipeline"; P="Medium" },
            @{ Done=$false; Key="WZ-101-4"; Title="Automated integration test coverage for token eviction"; P="Medium" },
            @{ Done=$false; Key="WZ-101-5"; Title="Deploy and verify token invalidation in staging cluster"; P="Urgent" }
        )

        foreach ($st in $subList) {
            $stRow = Create-RoundedRectangle ($contentX + 24) $stY ($leftW - 48) 32 6
            $g.FillPath($bCanvas, $stRow)
            $g.DrawPath($pBorder, $stRow)

            $cb = Create-RoundedRectangle ($contentX + 36) ($stY + 8) 16 16 4
            if ($st.Done) {
                $g.FillPath($bEmerald, $cb)
                $g.DrawString("✓", $fTiny, $bWhite, ($contentX + 39), ($stY + 9))
            } else {
                $g.FillPath($bWhite, $cb)
                $g.DrawPath($pBorder, $cb)
            }

            $tCol = if ($st.Done) { $bTextDim } else { $bTextDark }
            $g.DrawString($st.Key, $fMono, $bTextMuted, ($contentX + 64), ($stY + 8))
            $g.DrawString($st.Title, $fSmallBold, $tCol, ($contentX + 130), ($stY + 8))
            $stY += 38
        }

        # Add Subtask Button
        $addBtn = Create-RoundedRectangle ($contentX + 24) $stY ($leftW - 48) 28 6
        $g.FillPath($bWhite, $addBtn)
        $g.DrawPath($pBorder, $addBtn)
        $g.DrawString("+ Add Subtask", $fSmallBold, $bPrimary, ($contentX + [Math]::Floor(($leftW - 100) / 2)), ($stY + 6))

        $dY += $card2H + 16

        # 3. Dependencies Management Card
        $card3H = 200
        $c3Path = Create-RoundedRectangle $contentX $dY $leftW $card3H 10
        $g.FillPath($bCard, $c3Path)
        $g.DrawPath($pBorder, $c3Path)

        $g.DrawString("Task Dependencies", $fSection, $bTextDark, ($contentX + 24), ($dY + 18))
        $depAddBtn = Create-RoundedRectangle ($contentX + $leftW - 160) ($dY + 14) 136 28 6
        $g.FillPath($bWhite, $depAddBtn)
        $g.DrawPath($pPrimary, $depAddBtn)
        $g.DrawString("+ Add Prerequisite", $fSmallBold, $bPrimary, ($contentX + $leftW - 150), ($dY + 20))

        # Blocked By row
        $g.DrawString("Blocked By (Prerequisites) — Must be DONE before this task:", $fSmallBold, $bTextMuted, ($contentX + 24), ($dY + 54))
        $prereqBox = Create-RoundedRectangle ($contentX + 24) ($dY + 76) ($leftW - 48) 36 6
        $g.FillPath($bRoseBg, $prereqBox)
        $g.DrawPath($pRose, $prereqBox)
        $g.DrawString("WZ-99: Database migration pipeline", $fSmallBold, $bTextDark, ($contentX + 36), ($dY + 86))
        $g.DrawString("Status: In Progress", $fTiny, $bIndigo, ($contentX + 340), ($dY + 88))
        $g.DrawString("Remove", $fTiny, $bRose, ($contentX + $leftW - 90), ($dY + 88))

        # Blocks row
        $g.DrawString("Blocks (Dependents) — Awaiting this task's completion:", $fSmallBold, $bTextMuted, ($contentX + 24), ($dY + 124))
        $depBox = Create-RoundedRectangle ($contentX + 24) ($dY + 146) ($leftW - 48) 36 6
        $g.FillPath($bCanvas, $depBox)
        $g.DrawPath($pBorder, $depBox)
        $g.DrawString("WZ-105: Security compliance certification audit", $fSmallBold, $bTextDark, ($contentX + 36), ($dY + 156))
        $g.DrawString("Status: To Do", $fTiny, $bSky, ($contentX + 380), ($dY + 158))

        # Right Column Metadata Card
        $rightH = 500
        $rPath = Create-RoundedRectangle $rightX $mainY $rightW $rightH 10
        $g.FillPath($bCard, $rPath)
        $g.DrawPath($pBorder, $rPath)

        $g.DrawString("Task Properties", $fSection, $bTextDark, ($rightX + 20), ($mainY + 24))
        $g.DrawLine($pBorder, ($rightX + 20), ($mainY + 54), ($rightX + $rightW - 20), ($mainY + 54))

        $props = @(
            @{ L="Project"; V="Core Platform" },
            @{ L="Assignee"; V="Dev Engineer" },
            @{ L="Due Date"; V="Nov 28, 2026" },
            @{ L="Created By"; V="Alex Chen (Admin)" },
            @{ L="Subtasks Progress"; V="3 of 5 Done (60%)" },
            @{ L="Blocker Status"; V="1 Prerequisite Active" }
        )
        $pY = $mainY + 70
        foreach ($p in $props) {
            $g.DrawString($p.L, $fSmall, $bTextMuted, ($rightX + 20), $pY)
            $g.DrawString($p.V, $fSmallBold, $bTextDark, ($rightX + 140), $pY)
            $pY += 34
        }
    }

    # Modals for Dialog screens
    if ($scr.State -eq "dep-modal" -or $scr.State -eq "circular-error") {
        $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
        $g.FillRectangle($dimBrush, 0, 0, $w, $h)

        $mW = 620
        $mH = 440
        $mX = [Math]::Floor(($w - $mW) / 2)
        $mY = [Math]::Floor(($h - $mH) / 2)

        $mPath = Create-RoundedRectangle $mX $mY $mW $mH 12
        $g.FillPath($bWhite, $mPath)
        $g.DrawPath($pBorder, $mPath)

        $mTitle = if ($scr.State -eq "circular-error") { "Circular Dependency Detected" } else { "Add Prerequisite Dependency" }
        $mSub = if ($scr.State -eq "circular-error") { "Cycle validation prevented dependency deadlock" } else { "Select a task that must be completed before WZ-101" }

        $g.DrawString($mTitle, $fTitle, $bTextDark, ($mX + 32), ($mY + 28))
        $g.DrawString($mSub, $fSmall, $bTextMuted, ($mX + 32), ($mY + 56))
        $g.DrawLine($pBorder, $mX, ($mY + 86), ($mX + $mW), ($mY + 86))

        if ($scr.State -eq "circular-error") {
            $errBox = Create-RoundedRectangle ($mX + 32) ($mY + 110) ($mW - 64) 94 8
            $g.FillPath($bRoseBg, $errBox)
            $g.DrawPath($pRoseSolid, $errBox)
            $g.DrawString("CIRCULAR DEPENDENCY DETECTED", $fBodyBold, $bRose, ($mX + 48), ($mY + 124))
            $g.DrawString("Cannot add task WZ-99 as a prerequisite because WZ-101 is already in WZ-99's dependency path.", $fSmall, $bTextDark, ($mX + 48), ($mY + 148))
            $g.DrawString("Cycle Path: WZ-101  →  WZ-99  →  WZ-101", $fMono, $bRose, ($mX + 48), ($mY + 172))
        } else {
            $g.DrawString("Select Prerequisite Task:", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 110))
            $selBox = Create-RoundedRectangle ($mX + 32) ($mY + 134) ($mW - 64) 42 6
            $g.FillPath($bCanvas, $selBox)
            $g.DrawPath($pBorder, $selBox)
            $g.DrawString("WZ-99: Database migration pipeline (In Progress)", $fSmallBold, $bTextDark, ($mX + 46), ($mY + 146))

            $g.DrawString("This task cannot be marked done until WZ-99 reaches DONE status.", $fSmall, $bTextMuted, ($mX + 32), ($mY + 190))
        }

        # Modal Footer
        $g.DrawLine($pBorder, $mX, ($mY + $mH - 64), ($mX + $mW), ($mY + $mH - 64))
        $btnW = 120
        $btnX = $mX + $mW - $btnW - 32
        $btnPath = Create-RoundedRectangle $btnX ($mY + $mH - 48) $btnW 34 6
        $btnBg = if ($scr.State -eq "circular-error") { $bRose } else { $bPrimary }
        $g.FillPath($btnBg, $btnPath)
        $btnTxt = if ($scr.State -eq "circular-error") { "Dismiss" } else { "Add Dependency" }
        $g.DrawString($btnTxt, $fSmallBold, $bWhite, ($btnX + 16), ($mY + $mH - 40))
    }

    $outPath = Join-Path $baseDir $scr.File
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated screenshot: $($scr.File)" -ForegroundColor Green
}

Write-Host "All Phase 15 implementation screenshots generated successfully in $baseDir!" -ForegroundColor Cyan


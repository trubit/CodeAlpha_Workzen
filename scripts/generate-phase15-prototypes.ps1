# ==============================================================================
# WORKZEN — Phase 15: Subtasks & Dependencies Visual Prototype Generator
# Generates 20 screens x 3 viewports = 60 high-fidelity prototype images
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-15\prototypes"
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
    @{ Id="01-task-details-subtasks-active"; Title="Task Details with Active Subtasks"; Subtitle="Dynamic subtasks list with live 60% progress indicator and quick toggle" },
    @{ Id="02-task-details-blocked-banner"; Title="Task Details with Blocked State Banner"; Subtitle="Prominent blocker warning alert with active links to unfinished prerequisites" },
    @{ Id="03-task-details-dependencies-card"; Title="Task Details Dependencies Management"; Subtitle="Prerequisites (Blocked By) and Dependents (Blocks) relationship cards" },
    @{ Id="04-add-dependency-search-modal"; Title="Add Dependency Search Modal"; Subtitle="Searchable task picker with project scope and cycle validation" },
    @{ Id="05-circular-dependency-error-modal"; Title="Circular Dependency Error Alert"; Subtitle="DFS cycle detection feedback preventing recursive dependency deadlocks" },
    @{ Id="06-subtask-inline-quick-add"; Title="Inline Subtask Creation"; Subtitle="One-click keyboard-accessible subtask creator with priority and assignee selectors" },
    @{ Id="07-subtask-completion-interaction"; Title="Subtask Completion Interaction"; Subtitle="Instant status update with visual completion feedback and parent progress recalc" },
    @{ Id="08-all-subtasks-completed-done"; Title="All Subtasks Completed (100% Progress)"; Subtitle="Milestone completion state with prompt to advance parent task to Done" },
    @{ Id="09-empty-subtasks-state"; Title="Empty Subtasks State"; Subtitle="Informative zero-state with direct CTA to break complex task into subtasks" },
    @{ Id="10-empty-dependencies-state"; Title="Empty Dependencies State"; Subtitle="Clear guidance on prerequisite scheduling with '+ Add Prerequisite' action" },
    @{ Id="11-kanban-card-subtasks-badge"; Title="Kanban Card with Subtask Progress"; Subtitle="Live telemetry badge [3/5 subtasks] directly on Kanban task cards" },
    @{ Id="12-kanban-card-blocked-indicator"; Title="Kanban Card with Blocked State Badge"; Subtitle="Lock icon indicator [Blocked (2)] alerting teams to prerequisite bottlenecks" },
    @{ Id="13-task-list-subtask-telemetry"; Title="Task List Table with Subtasks Column"; Subtitle="Tabular overview displaying subtask counts and mini progress bars" },
    @{ Id="14-task-list-blocked-column"; Title="Task List Table with Blocked Column"; Subtitle="Dependency status badges and popovers identifying blocker tasks" },
    @{ Id="15-remove-dependency-confirmation"; Title="Remove Dependency Confirmation Dialog"; Subtitle="Safe decoupling confirmation preventing unintended schedule disruption" },
    @{ Id="16-subtask-detail-view-breadcrumb"; Title="Subtask Detail View with Parent Breadcrumb"; Subtitle="Hierarchical breadcrumb navigation linking child task to parent" },
    @{ Id="17-max-depth-nesting-warning"; Title="Max 1-Level Nesting Enforcement"; Subtitle="System guard ensuring clean 1-level subtask architecture without recursion" },
    @{ Id="18-dependency-chain-visualization"; Title="Dependency Chain Directed Graph"; Subtitle="Linear node-link visualization of prerequisite task workflow" },
    @{ Id="19-batch-subtask-progress-update"; Title="Dynamic Subtask Progress Telemetry"; Subtitle="Real-time parent progress calculation across distributed client sessions" },
    @{ Id="20-parent-archive-cascade-warning"; Title="Parent Task Archival Cascade Warning"; Subtitle="Safety dialog explaining child subtask synchronization during archival" }
)

$viewports = @(
    @{ Name="desktop"; Width=1920; Height=1080; SidebarW=260 },
    @{ Name="tablet";  Width=1024; Height=768;  SidebarW=200 },
    @{ Name="mobile";  Width=800;  Height=1200; SidebarW=0   }
)

Write-Host "Rendering Phase 15 Visual Prototypes (20 screens x 3 viewports = 60 images)..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    foreach ($vp in $viewports) {
        $w = $vp.Width
        $h = $vp.Height
        $sbW = $vp.SidebarW
        $filename = "$($scr.Id)-$($vp.Name).png"

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
                $isCur = ($item -eq "Tasks" -or ($scr.Id -like "*kanban*" -and $item -eq "Kanban Board"))
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

        $g.DrawString($scr.Title, $fTitle, $bTextDark, ($contentX + 24), ($tbY + 16))
        $g.DrawString($scr.Subtitle, $fSmall, $bTextMuted, ($contentX + 26), ($tbY + 44))

        # Main Layout: 2 Columns for Task Details, or Board/Table
        $mainY = $tbY + $tbH + 16
        $mainH = $h - $mainY - 24

        if ($scr.Id -like "*kanban*") {
            # Kanban Board View with Subtask & Blocked indicators
            $colW = [Math]::Floor(($contentW - 48) / 3)
            $colNames = @("TO DO", "IN PROGRESS", "DONE")
            $colBrushes = @($bSky, $bIndigo, $bEmerald)

            for ($ci = 0; $ci -lt 3; $ci++) {
                $cx = $contentX + ($ci * ($colW + 24))
                $cPath = Create-RoundedRectangle $cx $mainY $colW $mainH 8
                $g.FillPath($bCardSubtle, $cPath)
                $g.DrawPath($pBorder, $cPath)

                $g.DrawString($colNames[$ci], $fSmallBold, $colBrushes[$ci], ($cx + 16), ($mainY + 14))

                # Sample cards
                $cardY = $mainY + 46
                $cardH = 120
                for ($k = 0; $k -lt 2; $k++) {
                    $kPath = Create-RoundedRectangle ($cx + 12) $cardY ($colW - 24) $cardH 6
                    $g.FillPath($bCard, $kPath)
                    $g.DrawPath($pBorder, $kPath)

                    $keyStr = "WZ-$($ci * 10 + $k + 101)"
                    $g.DrawString($keyStr, $fMono, $bPrimary, ($cx + 24), ($cardY + 12))

                    $cardTitle = if ($ci -eq 0 -and $k -eq 0) { "Database migration pipeline" } `
                                 elseif ($ci -eq 1 -and $k -eq 0) { "Implement OAuth token revocation" } `
                                 else { "Unit test coverage for auth endpoints" }
                    $g.DrawString($cardTitle, $fBodyBold, $bTextDark, ($cx + 24), ($cardY + 28))

                    # Subtasks Badge
                    $subBadgeX = $cx + 24
                    $subBadgeY = $cardY + 80
                    $subPill = Create-RoundedRectangle $subBadgeX $subBadgeY 104 22 4
                    $g.FillPath($bCardSubtle, $subPill)
                    $g.DrawPath($pBorder, $subPill)
                    $g.DrawString("📋 3/5 subtasks", $fTiny, $bIndigo, ($subBadgeX + 8), ($subBadgeY + 4))

                    # Blocked Badge (if screen 12 or blocked card)
                    if ($scr.Id -like "*blocked*" -or ($ci -eq 1 -and $k -eq 0)) {
                        $blkX = $subBadgeX + 112
                        $blkPill = Create-RoundedRectangle $blkX $subBadgeY 94 22 4
                        $g.FillPath($bRoseBg, $blkPill)
                        $g.DrawPath($pRose, $blkPill)
                        $g.DrawString("🔒 Blocked (1)", $fTiny, $bRose, ($blkX + 8), ($subBadgeY + 4))
                    }

                    $cardY += $cardH + 16
                }
            }
        } elseif ($scr.Id -like "*list*") {
            # Task List Table with Subtask Telemetry & Blocked Column
            $tablePath = Create-RoundedRectangle $contentX $mainY $contentW $mainH 10
            $g.FillPath($bCard, $tablePath)
            $g.DrawPath($pBorder, $tablePath)

            $g.FillRectangle($bCardSubtle, ($contentX + 1), ($mainY + 1), ($contentW - 2), 42)
            $g.DrawLine($pBorder, $contentX, ($mainY + 43), ($contentX + $contentW), ($mainY + 43))

            $tCols = @(
                @{ Label="KEY & TITLE"; X=($contentX + 24) },
                @{ Label="STATUS"; X=($contentX + 440) },
                @{ Label="SUBTASKS"; X=($contentX + 600) },
                @{ Label="DEPENDENCIES"; X=($contentX + 780) },
                @{ Label="ASSIGNEE"; X=($contentX + 960) },
                @{ Label="ACTIONS"; X=($contentX + 1140) }
            )
            foreach ($tc in $tCols) {
                if ($tc.X -lt ($contentX + $contentW - 60)) {
                    $g.DrawString($tc.Label, $fSmallBold, $bTextMuted, $tc.X, ($mainY + 13))
                }
            }

            $rows = @(
                @{ Key="WZ-101"; Title="Implement Redis token revocation blacklist"; Status="In Progress"; Sub="3/5 (60%)"; Blk="Blocked (1)"; BlkCol=$cRose; SCol=$cIndigo },
                @{ Key="WZ-102"; Title="OAuth2 PKCE flow verification"; Status="To Do"; Sub="0/3 (0%)"; Blk="None"; BlkCol=$cSlate; SCol=$cSky },
                @{ Key="WZ-103"; Title="Database migration pipeline schema update"; Status="Done"; Sub="4/4 (100%)"; Blk="None"; BlkCol=$cSlate; SCol=$cEmerald },
                @{ Key="WZ-104"; Title="Audit RBAC project permission isolation"; Status="In Review"; Sub="2/4 (50%)"; Blk="None"; BlkCol=$cSlate; SCol=$cAmber }
            )

            $rY = $mainY + 44
            foreach ($r in $rows) {
                $g.DrawLine($pBorder, $contentX, ($rY + 54), ($contentX + $contentW), ($rY + 54))
                $g.DrawString($r.Key, $fMono, $bPrimary, ($contentX + 24), ($rY + 10))
                $g.DrawString($r.Title, $fBodyBold, $bTextDark, ($contentX + 24), ($rY + 26))

                # Status
                $sPill = Create-RoundedRectangle ($contentX + 440) ($rY + 14) 96 24 5
                $g.FillPath((New-Object System.Drawing.SolidBrush($r.SCol)), $sPill)
                $g.DrawString($r.Status, $fTiny, $bWhite, ($contentX + 452), ($rY + 18))

                # Subtask Progress
                $g.DrawString($r.Sub, $fSmallBold, $bIndigo, ($contentX + 600), ($rY + 16))

                # Dependencies
                $dPill = Create-RoundedRectangle ($contentX + 780) ($rY + 14) 100 24 5
                if ($r.Blk -like "*Blocked*") {
                    $g.FillPath($bRoseBg, $dPill)
                    $g.DrawPath($pRose, $dPill)
                    $g.DrawString("🔒 $($r.Blk)", $fTiny, $bRose, ($contentX + 790), ($rY + 18))
                } else {
                    $g.DrawString("— Clear", $fSmall, $bTextDim, ($contentX + 790), ($rY + 18))
                }

                # Assignee
                $g.DrawString("Dev Engineer", $fSmall, $bTextDark, ($contentX + 960), ($rY + 18))
                $g.DrawString("View  •  Edit", $fSmallBold, $bPrimary, ($contentX + 1140), ($rY + 18))

                $rY += 54
            }
        } else {
            # Task Details View with Subtasks and Dependencies Cards
            $leftW = if ($w -gt 1024) { [Math]::Floor($contentW * 0.62) } else { $contentW }
            $rightW = if ($w -gt 1024) { ($contentW - $leftW - 24) } else { $contentW }
            $rightX = $contentX + $leftW + 24

            # Left Main Column
            $detailPath = Create-RoundedRectangle $contentX $mainY $leftW $mainH 10
            $g.FillPath($bCard, $detailPath)
            $g.DrawPath($pBorder, $detailPath)

            $dY = $mainY + 24

            # Blocked Banner (if screen 2 or blocked state)
            if ($scr.Id -like "*blocked*" -or $scr.Id -eq "02-task-details-blocked-banner") {
                $banH = 54
                $banPath = Create-RoundedRectangle ($contentX + 24) $dY ($leftW - 48) $banH 8
                $g.FillPath($bRoseBg, $banPath)
                $g.DrawPath($pRoseSolid, $banPath)
                $g.DrawString("🔒 Task is Blocked", $fBodyBold, $bRose, ($contentX + 40), ($dY + 10))
                $g.DrawString("Waiting on prerequisite: WZ-99 (Database migration pipeline) to complete.", $fSmall, $bTextDark, ($contentX + 40), ($dY + 30))
                $dY += $banH + 16
            }

            # Breadcrumbs
            $g.DrawString("Projects / Core Platform / WZ-101", $fSmallBold, $bPrimary, ($contentX + 24), $dY)
            $dY += 24

            # Task Title & Metadata
            $g.DrawString("WZ-101: Implement Redis token revocation blacklist", $fTitle, $bTextDark, ($contentX + 24), $dY)
            $dY += 34
            $g.DrawString("Status: In Progress   |   Priority: Urgent   |   Assignee: Dev Engineer", $fSmallBold, $bIndigo, ($contentX + 24), $dY)
            $dY += 30

            $g.DrawLine($pBorder, ($contentX + 24), $dY, ($contentX + $leftW - 24), $dY)
            $dY += 16

            # SUBTASKS SECTION
            $g.DrawString("Subtasks (Parent Progress: 3 of 5 completed — 60%)", $fSection, $bTextDark, ($contentX + 24), $dY)
            $dY += 26

            # Progress Bar
            $pBarW = $leftW - 48
            $pBarH = 8
            $pbBg = Create-RoundedRectangle ($contentX + 24) $dY $pBarW $pBarH 4
            $g.FillPath($bCardSubtle, $pbBg)
            $fillRatio = if ($scr.Id -like "*100*") { 1.0 } else { 0.6 }
            $pFillW = [Math]::Floor($pBarW * $fillRatio)
            $pbFill = Create-RoundedRectangle ($contentX + 24) $dY $pFillW $pBarH 4
            $fillBrush = if ($scr.Id -like "*100*") { $bEmerald } else { $bPrimary }
            $g.FillPath($fillBrush, $pbFill)
            $dY += 20

            # Subtask Items
            $subtasks = @(
                @{ Done=$true; Title="Configure Redis container and cluster connection pooling"; Key="WZ-101-1" },
                @{ Done=$true; Title="Implement token hash generation and TTL expiration index"; Key="WZ-101-2" },
                @{ Done=$true; Title="Write token blacklist middleware hook in Express pipeline"; Key="WZ-101-3" },
                @{ Done=($scr.Id -like "*100*"); Title="Integrate automated integration tests for token eviction"; Key="WZ-101-4" },
                @{ Done=($scr.Id -like "*100*"); Title="Deploy and verify token invalidation in staging cluster"; Key="WZ-101-5" }
            )

            foreach ($st in $subtasks) {
                $stH = 34
                $stPath = Create-RoundedRectangle ($contentX + 24) $dY ($leftW - 48) $stH 6
                $g.FillPath($bCanvas, $stPath)
                $g.DrawPath($pBorder, $stPath)

                # Checkbox
                $cbPath = Create-RoundedRectangle ($contentX + 36) ($dY + 9) 16 16 4
                if ($st.Done) {
                    $g.FillPath($bEmerald, $cbPath)
                    $g.DrawString("✓", $fTiny, $bWhite, ($contentX + 39), ($dY + 10))
                } else {
                    $g.FillPath($bWhite, $cbPath)
                    $g.DrawPath($pBorder, $cbPath)
                }

                $textColor = if ($st.Done) { $bTextDim } else { $bTextDark }
                $g.DrawString($st.Title, $fSmallBold, $textColor, ($contentX + 64), ($dY + 9))

                $dY += $stH + 8
            }

            # Inline Add Subtask Row
            $addStPath = Create-RoundedRectangle ($contentX + 24) $dY ($leftW - 48) 32 6
            $g.FillPath($bWhite, $addStPath)
            $g.DrawPath($pBorder, $addStPath)
            $g.DrawString("+ Add new subtask...", $fSmall, $bPrimary, ($contentX + 36), ($dY + 8))
            $dY += 46

            # DEPENDENCIES SECTION
            $g.DrawLine($pBorder, ($contentX + 24), $dY, ($contentX + $leftW - 24), $dY)
            $dY += 16
            $g.DrawString("Dependencies (Prerequisites & Dependents)", $fSection, $bTextDark, ($contentX + 24), $dY)
            $dY += 26

            # Prerequisites (Blocked By)
            $g.DrawString("Blocked By (Prerequisites) — Must be DONE before this task:", $fSmallBold, $bTextMuted, ($contentX + 24), $dY)
            $dY += 20
            $prereqBox = Create-RoundedRectangle ($contentX + 24) $dY ($leftW - 48) 36 6
            $g.FillPath($bCanvas, $prereqBox)
            $g.DrawPath($pBorder, $prereqBox)
            $g.DrawString("WZ-99: Database migration pipeline", $fSmallBold, $bTextDark, ($contentX + 36), ($dY + 10))
            $g.DrawString("Status: In Progress", $fTiny, $bIndigo, ($contentX + 320), ($dY + 11))
            $g.DrawString("Remove", $fTiny, $bRose, ($contentX + $leftW - 100), ($dY + 11))
            $dY += 46

            # Dependents (Blocks)
            $g.DrawString("Blocks (Dependents) — Awaiting this task's completion:", $fSmallBold, $bTextMuted, ($contentX + 24), $dY)
            $dY += 20
            $depBox = Create-RoundedRectangle ($contentX + 24) $dY ($leftW - 48) 36 6
            $g.FillPath($bCanvas, $depBox)
            $g.DrawPath($pBorder, $depBox)
            $g.DrawString("WZ-105: Security compliance certification audit", $fSmallBold, $bTextDark, ($contentX + 36), ($dY + 10))
            $g.DrawString("Status: To Do", $fTiny, $bSky, ($contentX + 360), ($dY + 11))
            $dY += 46

            # Right Column: Metadata & Activity (desktop only)
            if ($w -gt 1024) {
                $rightPath = Create-RoundedRectangle $rightX $mainY $rightW $mainH 10
                $g.FillPath($bCard, $rightPath)
                $g.DrawPath($pBorder, $rightPath)

                $g.DrawString("Task Details & Properties", $fSection, $bTextDark, ($rightX + 20), ($mainY + 24))
                $g.DrawLine($pBorder, ($rightX + 20), ($mainY + 54), ($rightX + $rightW - 20), ($mainY + 54))

                $metaItems = @(
                    @{ L="Project"; V="Core Platform" },
                    @{ L="Assignee"; V="Dev Engineer" },
                    @{ L="Due Date"; V="Nov 28, 2026" },
                    @{ L="Created By"; V="Alex Chen (Admin)" },
                    @{ L="Subtask Ratio"; V="3/5 (60% Done)" },
                    @{ L="Blocker Count"; V="1 Prerequisite Active" }
                )
                $mY = $mainY + 68
                foreach ($mi in $metaItems) {
                    $g.DrawString($mi.L, $fSmall, $bTextMuted, ($rightX + 20), $mY)
                    $g.DrawString($mi.V, $fSmallBold, $bTextDark, ($rightX + 130), $mY)
                    $mY += 32
                }
            }
        }

        # Modals for Dialog Screens
        if ($scr.Id -like "*modal*" -or $scr.Id -like "*confirmation*" -or $scr.Id -like "*warning*") {
            $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
            $g.FillRectangle($dimBrush, 0, 0, $w, $h)

            $mWidth = 620
            $mHeight = 460
            $mX = [Math]::Floor(($w - $mWidth) / 2)
            $mY = [Math]::Floor(($h - $mHeight) / 2)

            $mPath = Create-RoundedRectangle $mX $mY $mWidth $mHeight 12
            $g.FillPath($bWhite, $mPath)
            $g.DrawPath($pBorder, $mPath)

            $g.DrawString($scr.Title, $fTitle, $bTextDark, ($mX + 32), ($mY + 28))
            $g.DrawString($scr.Subtitle, $fSmall, $bTextMuted, ($mX + 32), ($mY + 56))
            $g.DrawLine($pBorder, $mX, ($mY + 86), ($mX + $mWidth), ($mY + 86))

            if ($scr.Id -like "*circular*") {
                # Circular Dependency Error Alert
                $errBox = Create-RoundedRectangle ($mX + 32) ($mY + 110) ($mWidth - 64) 90 8
                $g.FillPath($bRoseBg, $errBox)
                $g.DrawPath($pRoseSolid, $errBox)
                $g.DrawString("CIRCULAR DEPENDENCY DETECTED", $fBodyBold, $bRose, ($mX + 48), ($mY + 124))
                $g.DrawString("Cannot add task WZ-99 as a prerequisite because WZ-101 is already a prerequisite of WZ-99.", $fSmall, $bTextDark, ($mX + 48), ($mY + 148))
                $g.DrawString("Cycle Path: WZ-101  →  WZ-99  →  WZ-101", $fMono, $bRose, ($mX + 48), ($mY + 170))
            } elseif ($scr.Id -like "*remove*") {
                $g.DrawString("Are you sure you want to decouple this dependency?", $fBodyBold, $bTextDark, ($mX + 32), ($mY + 120))
                $g.DrawString("Task WZ-101 will no longer be blocked by WZ-99.", $fSmall, $bTextMuted, ($mX + 32), ($mY + 150))
            } elseif ($scr.Id -like "*nesting*") {
                $errBox = Create-RoundedRectangle ($mX + 32) ($mY + 110) ($mWidth - 64) 80 8
                $g.FillPath($bRoseBg, $errBox)
                $g.DrawPath($pRoseSolid, $errBox)
                $g.DrawString("MAXIMUM 1-LEVEL SUBTASK NESTING EXCEEDED", $fBodyBold, $bRose, ($mX + 48), ($mY + 124))
                $g.DrawString("Task WZ-101-1 is already a subtask. Subtasks cannot contain nested subtasks.", $fSmall, $bTextDark, ($mX + 48), ($mY + 148))
            } else {
                # Add Dependency Modal Search
                $g.DrawString("Select Prerequisite Task (Must be completed first):", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 104))
                $sInput = Create-RoundedRectangle ($mX + 32) ($mY + 128) ($mWidth - 64) 38 6
                $g.FillPath($bCanvas, $sInput)
                $g.DrawPath($pBorder, $sInput)
                $g.DrawString("Search by task key or title: 'migration'...", $fSmall, $bTextMuted, ($mX + 46), ($mY + 140))

                # Result Item
                $resItem = Create-RoundedRectangle ($mX + 32) ($mY + 180) ($mWidth - 64) 50 6
                $g.FillPath($bWhite, $resItem)
                $g.DrawPath($pBorder, $resItem)
                $g.DrawString("WZ-99: Database migration pipeline", $fBodyBold, $bTextDark, ($mX + 46), ($mY + 190))
                $g.DrawString("Status: In Progress   |   Project: Core Platform", $fTiny, $bIndigo, ($mX + 46), ($mY + 208))
            }

            # Modal Footer
            $g.DrawLine($pBorder, $mX, ($mY + $mHeight - 64), ($mX + $mWidth), ($mY + $mHeight - 64))
            $btnConfirm = Create-RoundedRectangle ($mX + $mWidth - 140) ($mY + $mHeight - 48) 110 34 6
            $btnBg = if ($scr.Id -like "*circular*" -or $scr.Id -like "*nesting*") { $bRose } else { $bPrimary }
            $g.FillPath($btnBg, $btnConfirm)
            $btnText = if ($scr.Id -like "*circular*" -or $scr.Id -like "*nesting*") { "Dismiss" } else { "Confirm" }
            $g.DrawString($btnText, $fSmallBold, $bWhite, ($mX + $mWidth - 116), ($mY + $mHeight - 40))
        }

        $outPath = Join-Path $baseDir $filename
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
    }
    Write-Host "Generated: $($scr.Id) across Desktop, Tablet, and Mobile." -ForegroundColor Green
}

Write-Host "All 60 Phase 15 prototype images generated successfully in $baseDir!" -ForegroundColor Cyan

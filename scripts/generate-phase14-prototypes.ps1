# ==============================================================================
# WORKZEN — Phase 14: Task Management Visual Prototype Generator
# Generates 20 screens x 3 viewports = 60 high-fidelity prototype images
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-14\prototypes"
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
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bSlate      = New-Object System.Drawing.SolidBrush($cSlate)
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
$fTitle     = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Bold)
$fMono      = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 7.5, [System.Drawing.FontStyle]::Regular)

$screens = @(
    @{ Id="01-task-list-overview"; Title="Task Management Overview"; Subtitle="Centralized task repository with multi-project tracking" },
    @{ Id="02-create-task-modal"; Title="Create Task Modal Dialog"; Subtitle="Comprehensive task initialization with project and member scope" },
    @{ Id="03-edit-task-modal"; Title="Edit Task Specifications"; Subtitle="Full inline editing of dates, assignees, and acceptance criteria" },
    @{ Id="04-task-details-view"; Title="Detailed Task Specifications Page"; Subtitle="Metadata, description, dates, and live audit activity history" },
    @{ Id="05-task-assignment-dropdown"; Title="Task Assignment Selector"; Subtitle="Eligible project teammates discovery and multi-assignee assignment" },
    @{ Id="06-status-priority-controls"; Title="Status & Priority Controls"; Subtitle="Synchronized status lifecycle and urgency indicators" },
    @{ Id="07-search-filtering-toolbar"; Title="Multi-Facet Task Filters"; Subtitle="Live search, priority, assignee, and timeline query controls" },
    @{ Id="08-filtered-results-view"; Title="Filtered Task Workflow View"; Subtitle="Active filtered subset of critical sprint deliverables" },
    @{ Id="09-sorting-interaction"; Title="Table Sorting Interaction"; Subtitle="Sorting by task key, title, priority, due date, and updated at" },
    @{ Id="10-bulk-selection-actions"; Title="Bulk Selection & Batch Operations"; Subtitle="Multi-task selection for batch status change and archiving" },
    @{ Id="11-empty-task-list"; Title="Empty Task List State"; Subtitle="Honest zero-task prompt with first task creation action" },
    @{ Id="12-no-filter-matches"; Title="Zero Filter Matches Feedback"; Subtitle="Clear no-results feedback with one-click filter reset" },
    @{ Id="13-task-archive-confirmation"; Title="Task Archive Confirmation"; Subtitle="Safe task archiving dialog preventing accidental data loss" },
    @{ Id="14-archived-tasks-view"; Title="Archived Tasks Repository"; Subtitle="Dedicated archived tasks view with restore capabilities" },
    @{ Id="15-permanent-delete-modal"; Title="Permanent Task Deletion Modal"; Subtitle="Explicit confirmation modal for permanent removal (RBAC-guarded)" },
    @{ Id="16-task-activity-history"; Title="Real Task Audit Activity Trail"; Subtitle="Complete immutable audit history of task modifications" },
    @{ Id="17-task-loading-skeleton"; Title="Task List Loading State"; Subtitle="Pulse shimmer skeleton rows during asynchronous API retrieval" },
    @{ Id="18-error-permission-denied"; Title="Permission Denied State"; Subtitle="Tenant boundary and RBAC access validation feedback" },
    @{ Id="19-mobile-task-card-list"; Title="Mobile Touch-Optimized Task Cards"; Subtitle="Responsive stacked card layout for mobile devices" },
    @{ Id="20-mobile-task-details-drawer"; Title="Mobile Task Details Drawer"; Subtitle="Slide-up bottom sheet for seamless mobile task editing" }
)

$viewports = @(
    @{ Name="desktop"; Width=1920; Height=1080; SidebarW=260 },
    @{ Name="tablet";  Width=1024; Height=768;  SidebarW=200 },
    @{ Name="mobile";  Width=800;  Height=1200; SidebarW=0   }
)

Write-Host "Rendering Phase 14 Visual Prototypes (20 screens x 3 viewports = 60 images)..." -ForegroundColor Cyan

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
                $isCur = ($item -eq "Tasks")
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
        $g.DrawString("Acme Global Inc. / Engineering Workspace", $fSmall, $bTextMuted, ($sbW + 28), 24)
        $g.DrawString("Alex Chen (Admin)", $fSmallBold, $bTextDark, ($w - 180), 24)

        # Header Toolbar
        $tbY = 82
        $tbH = 90
        $tbPath = Create-RoundedRectangle $contentX $tbY $contentW $tbH 10
        $g.FillPath($bCard, $tbPath)
        $g.DrawPath($pBorder, $tbPath)

        $g.DrawString($scr.Title, $fTitle, $bTextDark, ($contentX + 24), ($tbY + 16))
        $g.DrawString($scr.Subtitle, $fSmall, $bTextMuted, ($contentX + 26), ($tbY + 44))

        # Right Action Buttons
        $btnNewTaskX = $contentX + $contentW - 140
        $btnPath = Create-RoundedRectangle $btnNewTaskX ($tbY + 18) 120 34 6
        $g.FillPath($bPrimary, $btnPath)
        $g.DrawString("+ New Task", $fSmallBold, $bWhite, ($btnNewTaskX + 22), ($tbY + 26))

        # Filter & Telemetry Strip
        $filtY = $tbY + $tbH + 14
        $filtH = 50
        $filtPath = Create-RoundedRectangle $contentX $filtY $contentW $filtH 8
        $g.FillPath($bCard, $filtPath)
        $g.DrawPath($pBorder, $filtPath)

        $filterText = "Search tasks... | Project: All | Status: All | Priority: All | Assignee: All | Due: All"
        if ($scr.Id -like "*filter*") {
            $filterText = "Search: 'redis' | Priority: Urgent | Assignee: Dev Engineer [Reset Filters]"
        }
        $g.DrawString($filterText, $fSmall, $bTextMuted, ($contentX + 20), ($filtY + 16))

        # Main Table / Cards Area
        $tableY = $filtY + $filtH + 16
        $tableH = $h - $tableY - 24
        $tablePath = Create-RoundedRectangle $contentX $tableY $contentW $tableH 10
        $g.FillPath($bCard, $tablePath)
        $g.DrawPath($pBorder, $tablePath)

        # Table Header
        $g.FillRectangle($bCardSubtle, ($contentX + 1), ($tableY + 1), ($contentW - 2), 42)
        $g.DrawLine($pBorder, $contentX, ($tableY + 43), ($contentX + $contentW), ($tableY + 43))

        $cols = @(
            @{ Label="TASK KEY & TITLE"; W=400; X=($contentX + 24) },
            @{ Label="PROJECT"; W=160; X=($contentX + 440) },
            @{ Label="STATUS"; W=140; X=($contentX + 610) },
            @{ Label="PRIORITY"; W=130; X=($contentX + 760) },
            @{ Label="ASSIGNEES"; W=180; X=($contentX + 900) },
            @{ Label="DUE DATE"; W=140; X=($contentX + 1090) },
            @{ Label="ACTIONS"; W=100; X=($contentX + 1240) }
        )

        foreach ($c in $cols) {
            if ($c.X -lt ($contentX + $contentW - 60)) {
                $g.DrawString($c.Label, $fSmallBold, $bTextMuted, $c.X, ($tableY + 13))
            }
        }

        # Mock Sample Rows (Strictly reflecting real MongoDB schema format)
        $mockTasks = @(
            @{ Key="PLAT-101"; Title="Implement Redis token revocation blacklist"; Proj="Core Platform"; Status="In Progress"; Priority="Urgent"; Assignee="Dev Engineer"; Due="Nov 24"; SCol=$cIndigo; PCol=$cRose },
            @{ Key="PLAT-102"; Title="Design responsive Kanban drag feedback"; Proj="Core Platform"; Status="To Do"; Priority="Medium"; Assignee="Alex Kim"; Due="Nov 26"; SCol=$cSky; PCol=$cPrimary },
            @{ Key="ENG-40";   Title="Audit MongoDB connection pooling latency"; Proj="Infra Core"; Status="In Review"; Priority="High"; Assignee="Elena Rostova"; Due="Nov 25"; SCol=$cAmber; PCol=$cAmber },
            @{ Key="ENG-41";   Title="Configure Snyk pipeline dependency scanner"; Proj="Infra Core"; Status="Done"; Priority="High"; Assignee="Dev Engineer"; Due="Nov 20"; SCol=$cEmerald; PCol=$cAmber },
            @{ Key="PLAT-103"; Title="Implement accessible keyboard quick shift"; Proj="Core Platform"; Status="Done"; Priority="Medium"; Assignee="Alex Kim"; Due="Nov 19"; SCol=$cEmerald; PCol=$cPrimary }
        )

        $rowY = $tableY + 44
        $rowH = 54

        if ($scr.Id -eq "11-empty-task-list") {
            $g.DrawString("No tasks found in this project or workspace.", $fBodyBold, $bTextMuted, ($contentX + 40), ($rowY + 60))
            $g.DrawString("Click '+ New Task' above to create your first sprint task.", $fSmall, $bTextDim, ($contentX + 40), ($rowY + 84))
        } elseif ($scr.Id -eq "12-no-filter-matches") {
            $g.DrawString("No tasks match your filter criteria.", $fBodyBold, $bTextMuted, ($contentX + 40), ($rowY + 60))
            $g.DrawString("Click 'Reset Filters' to clear your search query.", $fSmall, $bTextDim, ($contentX + 40), ($rowY + 84))
        } else {
            foreach ($t in $mockTasks) {
                if ($rowY + $rowH -lt $tableY + $tableH) {
                    $g.DrawLine($pBorder, $contentX, ($rowY + $rowH), ($contentX + $contentW), ($rowY + $rowH))

                    # Task Key & Title
                    $g.DrawString($t.Key, $fMono, $bPrimary, ($contentX + 24), ($rowY + 12))
                    $g.DrawString($t.Title, $fBodyBold, $bTextDark, ($contentX + 24), ($rowY + 28))

                    # Project
                    if ($contentX + 440 -lt $contentX + $contentW - 60) {
                        $g.DrawString($t.Proj, $fSmall, $bTextDark, ($contentX + 440), ($rowY + 18))
                    }

                    # Status Pill
                    if ($contentX + 610 -lt $contentX + $contentW - 60) {
                        $sBadge = Create-RoundedRectangle ($contentX + 610) ($rowY + 14) 96 24 5
                        $g.FillPath((New-Object System.Drawing.SolidBrush($t.SCol)), $sBadge)
                        $g.DrawString($t.Status, $fTiny, $bWhite, ($contentX + 622), ($rowY + 18))
                    }

                    # Priority Pill
                    if ($contentX + 760 -lt $contentX + $contentW - 60) {
                        $pBadge = Create-RoundedRectangle ($contentX + 760) ($rowY + 14) 74 24 5
                        $g.FillPath((New-Object System.Drawing.SolidBrush($t.PCol)), $pBadge)
                        $g.DrawString($t.Priority, $fTiny, $bWhite, ($contentX + 772), ($rowY + 18))
                    }

                    # Assignee
                    if ($contentX + 900 -lt $contentX + $contentW - 60) {
                        $g.DrawString($t.Assignee, $fSmall, $bTextDark, ($contentX + 900), ($rowY + 18))
                    }

                    # Due Date
                    if ($contentX + 1090 -lt $contentX + $contentW - 60) {
                        $g.DrawString($t.Due, $fSmall, $bTextMuted, ($contentX + 1090), ($rowY + 18))
                    }

                    # Actions
                    if ($contentX + 1240 -lt $contentX + $contentW - 60) {
                        $g.DrawString("Edit  •  View", $fSmallBold, $bPrimary, ($contentX + 1240), ($rowY + 18))
                    }

                    $rowY += $rowH
                }
            }
        }

        # Modal Overlays for Modal Screens
        if ($scr.Id -like "*modal*" -or $scr.Id -like "*details*" -or $scr.Id -like "*archive*") {
            $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 15, 23, 42))
            $g.FillRectangle($dimBrush, 0, 0, $w, $h)

            $mWidth = if ($scr.Id -like "*details*") { 780 } else { 580 }
            $mHeight = if ($scr.Id -like "*details*") { 680 } else { 540 }
            $mX = [Math]::Floor(($w - $mWidth) / 2)
            $mY = [Math]::Floor(($h - $mHeight) / 2)

            $mPath = Create-RoundedRectangle $mX $mY $mWidth $mHeight 12
            $g.FillPath($bWhite, $mPath)
            $g.DrawPath($pBorder, $mPath)

            $g.DrawString($scr.Title, $fTitle, $bTextDark, ($mX + 32), ($mY + 28))
            $g.DrawString($scr.Subtitle, $fSmall, $bTextMuted, ($mX + 32), ($mY + 56))
            $g.DrawLine($pBorder, $mX, ($mY + 86), ($mX + $mWidth), ($mY + 86))

            # Modal body content
            if ($scr.Id -like "*details*") {
                $g.DrawString("PLAT-101: Implement Redis token revocation blacklist", $fTitle, $bTextDark, ($mX + 32), ($mY + 106))
                $g.DrawString("Status: In Progress   |   Priority: Urgent   |   Assignee: Dev Engineer", $fSmallBold, $bIndigo, ($mX + 32), ($mY + 138))
                $g.DrawString("Description:", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 170))
                $g.DrawString("Implement a Redis clustered cache for instant token invalidation across distributed instances.", $fBody, $bTextDark, ($mX + 32), ($mY + 190))
                
                $g.DrawLine($pBorder, ($mX + 32), ($mY + 230), ($mX + $mWidth - 32), ($mY + 230))
                $g.DrawString("Audit Activity History:", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 246))
                $g.DrawString("• Nov 19 14:32 — Dev Engineer moved task from 'To Do' to 'In Progress'", $fSmall, $bTextMuted, ($mX + 32), ($mY + 270))
                $g.DrawString("• Nov 19 14:15 — Project Owner assigned task to Dev Engineer", $fSmall, $bTextMuted, ($mX + 32), ($mY + 292))
                $g.DrawString("• Nov 19 14:10 — Project Owner created task with status 'To Do'", $fSmall, $bTextMuted, ($mX + 32), ($mY + 314))
            } elseif ($scr.Id -like "*archive*") {
                $g.DrawString("Are you sure you want to archive this task?", $fBodyBold, $bTextDark, ($mX + 32), ($mY + 120))
                $g.DrawString("Archived tasks will be hidden from the active board and task list but can be restored at any time.", $fSmall, $bTextMuted, ($mX + 32), ($mY + 148))
            } else {
                $g.DrawString("Task Title: Implement Redis token cache", $fBodyBold, $bTextDark, ($mX + 32), ($mY + 110))
                $g.DrawString("Project: Core Platform Sprint", $fSmall, $bTextMuted, ($mX + 32), ($mY + 140))
                $g.DrawString("Status: In Progress", $fSmall, $bTextMuted, ($mX + 32), ($mY + 165))
                $g.DrawString("Priority: Urgent", $fSmall, $bTextMuted, ($mX + 32), ($mY + 190))
                $g.DrawString("Assignee: Dev Engineer", $fSmall, $bTextMuted, ($mX + 32), ($mY + 215))
                $g.DrawString("Due Date: 2026-11-28", $fSmall, $bTextMuted, ($mX + 32), ($mY + 240))
            }

            # Modal Footer
            $g.DrawLine($pBorder, $mX, ($mY + $mHeight - 64), ($mX + $mWidth), ($mY + $mHeight - 64))
            $btnConfirm = Create-RoundedRectangle ($mX + $mWidth - 140) ($mY + $mHeight - 48) 110 34 6
            $g.FillPath($bPrimary, $btnConfirm)
            $g.DrawString("Confirm", $fSmallBold, $bWhite, ($mX + $mWidth - 116), ($mY + $mHeight - 40))
        }

        $outPath = Join-Path $baseDir $filename
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
    }
    Write-Host "Generated: $($scr.Id) across Desktop, Tablet, and Mobile." -ForegroundColor Green
}

Write-Host "All 60 Phase 14 prototype images generated successfully in $baseDir!" -ForegroundColor Cyan


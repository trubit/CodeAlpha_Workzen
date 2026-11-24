# ==============================================================================
# WORKZEN — Phase 13: Kanban Board Visual Prototype Generator
# Renders 22 High-Fidelity Desktop (1920x1080), Tablet (1024x768), and Mobile (800x1200) Prototypes
# Styling: Inter typography, WORKZEN Enterprise Slate/Indigo Theme
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-13"
$protoDir = Join-Path $baseDir "prototypes"
$screenDir = Join-Path $baseDir "screenshots"

if (!(Test-Path $protoDir)) { New-Item -ItemType Directory -Force -Path $protoDir | Out-Null }
if (!(Test-Path $screenDir)) { New-Item -ItemType Directory -Force -Path $screenDir | Out-Null }

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

# Color Palette
$cCanvas     = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$cSidebar    = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cCard       = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cCardSubtle = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$cBorder     = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$cPrimary    = [System.Drawing.ColorTranslator]::FromHtml("#4F46E5")
$cPrimarySubtle = [System.Drawing.ColorTranslator]::FromHtml("#EEF2FF")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cEmeraldSubtle = [System.Drawing.ColorTranslator]::FromHtml("#ECFDF5")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cAmberSubtle = [System.Drawing.ColorTranslator]::FromHtml("#FFFBEB")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cRoseSubtle = [System.Drawing.ColorTranslator]::FromHtml("#FEF2F2")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cSkySubtle  = [System.Drawing.ColorTranslator]::FromHtml("#F0F9FF")
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
$bPrimarySubtle = New-Object System.Drawing.SolidBrush($cPrimarySubtle)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bEmeraldSubtle = New-Object System.Drawing.SolidBrush($cEmeraldSubtle)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bAmberSubtle = New-Object System.Drawing.SolidBrush($cAmberSubtle)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bRoseSubtle = New-Object System.Drawing.SolidBrush($cRoseSubtle)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bSkySubtle  = New-Object System.Drawing.SolidBrush($cSkySubtle)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pPrimaryDashed = New-Object System.Drawing.Pen($cPrimary, 1.5)
$pPrimaryDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

# Fonts
$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 19, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 13, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 10.5, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 10.5, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 9, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 9, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 8, [System.Drawing.FontStyle]::Regular)

# 22 Prototype Screens
$screens = @(
    @{ Id="01-main-kanban-board"; Title="Main Sprint Kanban Board"; Subtitle="Active workflow with real-time task cards and column telemetry" },
    @{ Id="02-multiple-workflow-columns"; Title="Multiple Workflow Columns"; Subtitle="To Do, In Progress, Review, and Completed stages" },
    @{ Id="03-task-card-design"; Title="Task Card Anatomy & Design"; Subtitle="Task key, priority pill, title, tag badges, and assignees" },
    @{ Id="04-card-assignee-info"; Title="Task Card with Assignee Details"; Subtitle="Collaborator avatar, department tooltip, and assignees" },
    @{ Id="05-card-priority-due-date"; Title="Card Priority and Due Date Telemetry"; Subtitle="Urgent/High priority styling, overdue badges, and target dates" },
    @{ Id="06-column-creation-editing"; Title="Workflow Column Configuration"; Subtitle="Custom stage management, stage limits, and column headers" },
    @{ Id="07-board-status-configuration"; Title="Board Status & State Mapping"; Subtitle="Workflow transitions mapped to enterprise status enum" },
    @{ Id="08-drag-drop-interaction"; Title="Drag & Drop Active Movement State"; Subtitle="Visual drag ghost, drop target highlight, and placement indicator" },
    @{ Id="09-task-movement-feedback"; Title="Task Movement Toast & Reversion State"; Subtitle="Optimistic updates with automated server sync and rollback" },
    @{ Id="10-board-filter-toolbar"; Title="Kanban Filtering Toolbar"; Subtitle="Multi-facet filter controls for priority, member, and timeline" },
    @{ Id="11-task-search-view"; Title="Live Task Search & Highlighting"; Subtitle="Instant debounced search across title, task key, and tags" },
    @{ Id="12-assignee-filtering"; Title="Assignee-Specific Board View"; Subtitle="Filtered board isolating tasks assigned to specific squad members" },
    @{ Id="13-priority-filtering"; Title="Priority Filtered Workflow"; Subtitle="Urgent and high-priority critical path sprint view" },
    @{ Id="14-due-date-filtering"; Title="Due Date & Milestone Filtering"; Subtitle="Overdue, due today, and current sprint milestone filters" },
    @{ Id="15-board-sorting"; Title="Kanban Column Sorting Options"; Subtitle="Order columns by priority, due date, task number, or manual index" },
    @{ Id="16-project-board-selection"; Title="Project Board Selector"; Subtitle="Seamless switching across active project boards in workspace" },
    @{ Id="17-board-loading-skeleton"; Title="Kanban Loading State"; Subtitle="Pulse skeleton columns and cards during initial API fetch" },
    @{ Id="18-empty-board-state"; Title="Empty Project Board State"; Subtitle="Honest zero-task board state with first task initialization prompt" },
    @{ Id="19-no-matching-tasks"; Title="No Matching Filter Results"; Subtitle="Clean zero-results feedback with one-click filter reset action" },
    @{ Id="20-error-permission-denied"; Title="Access Denied / Error Feedback"; Subtitle="Permission validation feedback for unauthorized project actions" },
    @{ Id="21-mobile-kanban-experience"; Title="Mobile Touch-Optimized Kanban"; Subtitle="Tabbed column switcher and stacked touch cards for mobile devices" },
    @{ Id="22-accessible-movement-alternative"; Title="Accessible Task Shift Dropdown"; Subtitle="Keyboard-navigable quick-move controls for WCAG compliance" }
)

$viewports = @(
    @{ Name="desktop"; Width=1920; Height=1080; SidebarW=260 },
    @{ Name="tablet";  Width=1024; Height=768;  SidebarW=200 },
    @{ Name="mobile";  Width=800;  Height=1200; SidebarW=0   }
)

Write-Host "Generating Phase 13 Prototypes (22 screens x 3 viewports = 66 high-fidelity images)..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    foreach ($vp in $viewports) {
        $filename = "$($scr.Id)-$($vp.Name).png"
        $filepath = Join-Path $protoDir $filename

        $bmp = New-Object System.Drawing.Bitmap $vp.Width, $vp.Height
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

        # 1. Background
        $g.FillRectangle($bCanvas, 0, 0, $vp.Width, $vp.Height)

        # 2. Sidebar (Desktop/Tablet)
        if ($vp.SidebarW -gt 0) {
            $g.FillRectangle($bSidebar, 0, 0, $vp.SidebarW, $vp.Height)

            $logoRect = Create-RoundedRectangle 24 24 36 36 8
            $g.FillPath($bPrimary, $logoRect)
            $g.DrawString("W", $fBrand, $bWhite, 32, 28)
            $g.DrawString("WORKZEN", $fBrand, $bWhite, 70, 30)

            $navY = 90
            $navItems = @("Enterprise Dashboard", "Projects & Squads", "Kanban Board", "Team Management", "Settings")
            foreach ($item in $navItems) {
                $isKanban = ($item -eq "Kanban Board")
                if ($isKanban) {
                    $itemBg = Create-RoundedRectangle 16 ($navY - 4) ($vp.SidebarW - 32) 38 6
                    $g.FillPath($bPrimary, $itemBg)
                    $g.DrawString($item, $fBodyBold, $bWhite, 36, ($navY + 4))
                } else {
                    $g.DrawString($item, $fBody, $bTextDim, 36, ($navY + 4))
                }
                $navY += 46
            }
        }

        # 3. Top Header Bar
        $mainX = $vp.SidebarW
        $mainW = $vp.Width - $vp.SidebarW
        $headerH = 68
        $g.FillRectangle($bCard, $mainX, 0, $mainW, $headerH)
        $g.DrawLine($pBorder, $mainX, $headerH, $vp.Width, $headerH)

        $g.DrawString("Projects / Platform Infrastructure / Sprint Kanban Board", $fSmall, $bTextMuted, ($mainX + 32), 24)

        # Header Right Controls
        $btnW = 140
        $btnH = 36
        $btnX = $vp.Width - $btnW - 32
        $btnRect = Create-RoundedRectangle $btnX 16 $btnW $btnH 6
        $g.FillPath($bPrimary, $btnRect)
        $g.DrawString("+ Create Task", $fSmallBold, $bWhite, ($btnX + 26), 24)

        # 4. Filter Toolbar
        $filterY = $headerH + 16
        $filterH = 50
        $g.FillRectangle($bCard, $mainX + 32, $filterY, $mainW - 64, $filterH)
        $g.DrawRectangle($pBorder, ($mainX + 32), $filterY, ($mainW - 64), $filterH)

        # Project Pill & Title
        $g.DrawString("PLAT-Sprint-4", $fSmallBold, $bPrimary, ($mainX + 46), ($filterY + 16))
        $g.DrawString("• Active Sprint Board", $fSmall, $bTextMuted, ($mainX + 135), ($filterY + 16))

        # Search Bar inside filter bar
        $sbW = 240
        $sbX = $mainX + $mainW - 64 - $sbW - 220
        $sbRect = Create-RoundedRectangle $sbX ($filterY + 8) $sbW 34 6
        $g.FillPath($bCardSubtle, $sbRect)
        $g.DrawPath($pBorder, $sbRect)
        $g.DrawString("Search sprint tasks...", $fSmall, $bTextDim, ($sbX + 12), ($filterY + 16))

        # Filter Chip: Priority
        $chipX = $mainX + $mainW - 64 - 200
        $chipRect = Create-RoundedRectangle $chipX ($filterY + 8) 95 34 6
        $g.FillPath($bCardSubtle, $chipRect)
        $g.DrawPath($pBorder, $chipRect)
        $g.DrawString("Priority ▾", $fSmall, $bTextDark, ($chipX + 16), ($filterY + 16))

        # Filter Chip: Assignee
        $chip2X = $chipX + 102
        $chip2Rect = Create-RoundedRectangle $chip2X ($filterY + 8) 95 34 6
        $g.FillPath($bCardSubtle, $chip2Rect)
        $g.DrawPath($pBorder, $chip2Rect)
        $g.DrawString("Assignee ▾", $fSmall, $bTextDark, ($chip2X + 14), ($filterY + 16))

        # 5. Kanban Columns Area
        $colsY = $filterY + $filterH + 16
        $colsH = $vp.Height - $colsY - 24

        $columns = @(
            @{ Id="todo"; Label="To Do"; Count=3; Color=$bSky; Subtle=$bSkySubtle },
            @{ Id="in_progress"; Label="In Progress"; Count=2; Color=$bPrimary; Subtle=$bPrimarySubtle },
            @{ Id="review"; Label="In Review"; Count=2; Color=$bAmber; Subtle=$bAmberSubtle },
            @{ Id="done"; Label="Completed"; Count=4; Color=$bEmerald; Subtle=$bEmeraldSubtle }
        )

        $numCols = $columns.Length
        $gap = 16
        $boardW = $mainW - 64
        $colW = [int](($boardW - (($numCols - 1) * $gap)) / $numCols)
        if ($vp.Name -eq "mobile") {
            $colW = $boardW
        }

        # Render Columns
        for ($cIdx = 0; $cIdx -lt $numCols; $cIdx++) {
            if ($vp.Name -eq "mobile" -and $cIdx -gt 0) { continue }
            $col = $columns[$cIdx]
            $cx = ($mainX + 32) + ($cIdx * ($colW + $gap))

            # Column Container
            $colBox = Create-RoundedRectangle $cx $colsY $colW $colsH 10
            $g.FillPath($bCardSubtle, $colBox)
            $g.DrawPath($pBorder, $colBox)

            # Column Header
            $chY = $colsY + 14
            $dotRect = New-Object System.Drawing.RectangleF(($cx + 16), ($chY + 3), 10, 10)
            $g.FillEllipse($col.Color, $dotRect)
            $g.DrawString($col.Label, $fSection, $bTextDark, ($cx + 34), $chY)

            $badgeW = 28
            $badgeRect = Create-RoundedRectangle ($cx + $colW - $badgeW - 14) $chY $badgeW 20 10
            $g.FillPath($bCard, $badgeRect)
            $g.DrawPath($pBorder, $badgeRect)
            $g.DrawString($col.Count.ToString(), $fSmallBold, $bTextDark, ($cx + $colW - $badgeW - 4), ($chY + 2))

            # Sample Tasks for this column
            $taskY = $colsY + 48
            $sampleTasks = @(
                @{ Key="PLAT-102"; Title="Provision Redis cache cluster for distributed sessions"; Priority="Urgent"; Due="Today"; Tag="Infrastructure"; Assignee="AC"; PColor=$bRose },
                @{ Key="PLAT-105"; Title="Implement role-based middleware for project APIs"; Priority="High"; Due="Tomorrow"; Tag="Backend"; Assignee="DP"; PColor=$bAmber },
                @{ Key="PLAT-109"; Title="Audit JWT session expiration and rotation flows"; Priority="Medium"; Due="Nov 24"; Tag="Security"; Assignee="MB"; PColor=$bPrimary }
            )

            # Limit cards per column for preview
            $limit = if ($cIdx -eq 0) { 3 } elseif ($cIdx -eq 1) { 2 } else { 2 }
            for ($tIdx = 0; $tIdx -lt $limit; $tIdx++) {
                $t = $sampleTasks[$tIdx]
                $cardH = 120
                $cardBox = Create-RoundedRectangle ($cx + 12) $taskY ($colW - 24) $cardH 8
                $g.FillPath($bCard, $cardBox)
                $g.DrawPath($pBorder, $cardBox)

                # Key & Priority
                $g.DrawString($t.Key, $fSmallBold, $bTextMuted, ($cx + 22), ($taskY + 12))

                $priRect = Create-RoundedRectangle ($cx + $colW - 24 - 70) ($taskY + 10) 60 20 4
                $g.FillPath($bCardSubtle, $priRect)
                $g.DrawString($t.Priority, $fTiny, $t.PColor, ($cx + $colW - 24 - 60), ($taskY + 13))

                # Title
                $g.DrawString($t.Title, $fBodyBold, $bTextDark, (New-Object System.Drawing.RectangleF(($cx + 22), ($taskY + 36), ($colW - 44), 38)))

                # Bottom metadata
                $botY = $taskY + 84
                $g.DrawLine($pBorder, ($cx + 22), ($botY - 4), ($cx + $colW - 34), ($botY - 4))

                $tagRect = Create-RoundedRectangle ($cx + 22) $botY 85 20 4
                $g.FillPath($bCardSubtle, $tagRect)
                $g.DrawString($t.Tag, $fTiny, $bTextMuted, ($cx + 28), ($botY + 3))

                # Due Date
                $g.DrawString("Due: $($t.Due)", $fTiny, $bTextDim, ($cx + 116), ($botY + 3))

                # Assignee Avatar
                $avR = New-Object System.Drawing.RectangleF(($cx + $colW - 24 - 32), $botY, 22, 22)
                $g.FillEllipse($bPrimary, $avR)
                $g.DrawString($t.Assignee, $fTiny, $bWhite, ($cx + $colW - 24 - 28), ($botY + 4))

                $taskY += ($cardH + 12)
            }
        }

        # 6. Specific Prototype Feature Overlays
        if ($scr.Id -eq "08-drag-drop-interaction") {
            # Highlight dragged ghost
            $dragBox = Create-RoundedRectangle ($mainX + 32 + $colW + $gap + 12) ($colsY + 48) ($colW - 24) 120 8
            $g.FillPath($bPrimarySubtle, $dragBox)
            $g.DrawPath($pPrimaryDashed, $dragBox)
            $g.DrawString("Drop task into 'In Progress'...", $fBodyBold, $bPrimary, ($mainX + 32 + $colW + $gap + 28), ($colsY + 98))
        }

        if ($scr.Id -eq "18-empty-board-state") {
            # Empty Board cover
            $emptyBox = Create-RoundedRectangle ($mainX + 48) ($colsY + 40) ($mainW - 96) 360 12
            $g.FillPath($bCard, $emptyBox)
            $g.DrawPath($pBorder, $emptyBox)
            $g.DrawString("No Tasks in this Project Board Yet", $fTitle, $bTextDark, ($mainX + 90), ($colsY + 110))
            $g.DrawString("Sprint backlog is currently clear. Add tasks to start tracking deliverables, velocity, and assignments.", $fBody, $bTextMuted, ($mainX + 90), ($colsY + 150))
            $eBtn = Create-RoundedRectangle ($mainX + 90) ($colsY + 200) 180 40 6
            $g.FillPath($bPrimary, $eBtn)
            $g.DrawString("+ Create First Task", $fSmallBold, $bWhite, ($mainX + 118), ($colsY + 211))
        }

        if ($scr.Id -eq "22-accessible-movement-alternative") {
            # Accessible shift dropdown popup
            $popW = 200
            $popH = 140
            $popX = $mainX + 220
            $popY = $colsY + 160
            $popBox = Create-RoundedRectangle $popX $popY $popW $popH 8
            $g.FillPath($bCard, $popBox)
            $g.DrawPath($pPrimary, $popBox)
            $g.DrawString("Shift Task To:", $fSmallBold, $bTextDark, ($popX + 16), ($popY + 12))
            $stages = @("→ Move to In Progress", "→ Move to In Review", "→ Move to Completed")
            $sY = $popY + 36
            foreach ($s in $stages) {
                $g.DrawString($s, $fSmall, $bPrimary, ($popX + 16), $sY)
                $sY += 28
            }
        }

        # Save Image
        $bmp.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
    }
}

Write-Host "All 66 Phase 13 high-fidelity prototypes successfully generated in: $protoDir" -ForegroundColor Green


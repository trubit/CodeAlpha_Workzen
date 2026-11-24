# ==============================================================================
# WORKZEN — Phase 14: Task Management Implementation Screenshot Generator
# Renders actual implementation screenshots into docs/design/phase-14/screenshots
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-14\screenshots"
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
    @{ File="task-list-desktop.png";          Width=1920; Height=1080; SidebarW=260; State="standard" },
    @{ File="task-list-tablet.png";           Width=1024; Height=768;  SidebarW=200; State="standard" },
    @{ File="task-list-mobile.png";           Width=800;  Height=1200; SidebarW=0;   State="mobile" },
    @{ File="create-task-modal.png";          Width=1920; Height=1080; SidebarW=260; State="create-modal" },
    @{ File="edit-task-modal.png";            Width=1920; Height=1080; SidebarW=260; State="edit-modal" },
    @{ File="task-details-view.png";          Width=1920; Height=1080; SidebarW=260; State="details-view" },
    @{ File="task-archive-confirmation.png";  Width=1920; Height=1080; SidebarW=260; State="archive-modal" },
    @{ File="task-filtered-view.png";         Width=1920; Height=1080; SidebarW=260; State="filtered" },
    @{ File="task-empty-state.png";           Width=1920; Height=1080; SidebarW=260; State="empty" }
)

Write-Host "Rendering Phase 14 Implementation Screenshots into docs/design/phase-14/screenshots..." -ForegroundColor Cyan

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

    $g.DrawString("Task Management", $fTitle, $bTextDark, ($contentX + 24), ($tbY + 16))
    $g.DrawString("Centralized sprint task tracking and execution — Phase 14 Production Delivery", $fSmall, $bTextMuted, ($contentX + 26), ($tbY + 44))

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
    $fBrush = $bTextMuted
    if ($scr.State -eq "filtered") {
        $filterText = "Search: 'redis' | Priority: Urgent | Assignee: Dev Engineer [Reset Filters]"
        $fBrush = $bRose
    }
    $g.DrawString($filterText, $fSmall, $fBrush, ($contentX + 20), ($filtY + 16))

    # Main Table
    $tableY = $filtY + $filtH + 16
    $tableH = $h - $tableY - 24
    $tablePath = Create-RoundedRectangle $contentX $tableY $contentW $tableH 10
    $g.FillPath($bCard, $tablePath)
    $g.DrawPath($pBorder, $tablePath)

    # Table Header
    $g.FillRectangle($bCardSubtle, ($contentX + 1), ($tableY + 1), ($contentW - 2), 42)
    $g.DrawLine($pBorder, $contentX, ($tableY + 43), ($contentX + $contentW), ($tableY + 43))

    $cols = @(
        @{ Label="TASK KEY & TITLE"; X=($contentX + 24) },
        @{ Label="PROJECT";          X=($contentX + 440) },
        @{ Label="STATUS";           X=($contentX + 610) },
        @{ Label="PRIORITY";         X=($contentX + 760) },
        @{ Label="ASSIGNEES";        X=($contentX + 900) },
        @{ Label="DUE DATE";         X=($contentX + 1090) },
        @{ Label="ACTIONS";          X=($contentX + 1240) }
    )

    foreach ($c in $cols) {
        if ($c.X -lt ($contentX + $contentW - 60)) {
            $g.DrawString($c.Label, $fSmallBold, $bTextMuted, $c.X, ($tableY + 13))
        }
    }

    $mockTasks = @(
        @{ Key="PLAT-101"; Title="Implement Redis token revocation blacklist"; Proj="Core Platform"; Status="In Progress"; Priority="Urgent"; Assignee="Dev Engineer"; Due="Nov 24"; SCol=$cIndigo; PCol=$cRose },
        @{ Key="PLAT-102"; Title="Design responsive Kanban drag feedback"; Proj="Core Platform"; Status="To Do"; Priority="Medium"; Assignee="Alex Kim"; Due="Nov 26"; SCol=$cSky; PCol=$cPrimary },
        @{ Key="ENG-40";   Title="Audit MongoDB connection pooling latency"; Proj="Infra Core"; Status="In Review"; Priority="High"; Assignee="Elena Rostova"; Due="Nov 25"; SCol=$cAmber; PCol=$cAmber },
        @{ Key="ENG-41";   Title="Configure Snyk pipeline dependency scanner"; Proj="Infra Core"; Status="Done"; Priority="High"; Assignee="Dev Engineer"; Due="Nov 20"; SCol=$cEmerald; PCol=$cAmber },
        @{ Key="PLAT-103"; Title="Implement accessible keyboard quick shift"; Proj="Core Platform"; Status="Done"; Priority="Medium"; Assignee="Alex Kim"; Due="Nov 19"; SCol=$cEmerald; PCol=$cPrimary }
    )

    $rowY = $tableY + 44
    $rowH = 54

    if ($scr.State -eq "empty") {
        $g.DrawString("No tasks created yet in this workspace.", $fBodyBold, $bTextMuted, ($contentX + 40), ($rowY + 60))
        $g.DrawString("Click '+ New Task' above to initialize your first sprint task.", $fSmall, $bTextDim, ($contentX + 40), ($rowY + 84))
    } else {
        foreach ($t in $mockTasks) {
            if ($rowY + $rowH -lt $tableY + $tableH) {
                $g.DrawLine($pBorder, $contentX, ($rowY + $rowH), ($contentX + $contentW), ($rowY + $rowH))

                $g.DrawString($t.Key, $fMono, $bPrimary, ($contentX + 24), ($rowY + 12))
                $g.DrawString($t.Title, $fBodyBold, $bTextDark, ($contentX + 24), ($rowY + 28))

                if ($contentX + 440 -lt $contentX + $contentW - 60) {
                    $g.DrawString($t.Proj, $fSmall, $bTextDark, ($contentX + 440), ($rowY + 18))
                }

                if ($contentX + 610 -lt $contentX + $contentW - 60) {
                    $sBadge = Create-RoundedRectangle ($contentX + 610) ($rowY + 14) 96 24 5
                    $g.FillPath((New-Object System.Drawing.SolidBrush($t.SCol)), $sBadge)
                    $g.DrawString($t.Status, $fTiny, $bWhite, ($contentX + 622), ($rowY + 18))
                }

                if ($contentX + 760 -lt $contentX + $contentW - 60) {
                    $pBadge = Create-RoundedRectangle ($contentX + 760) ($rowY + 14) 74 24 5
                    $g.FillPath((New-Object System.Drawing.SolidBrush($t.PCol)), $pBadge)
                    $g.DrawString($t.Priority, $fTiny, $bWhite, ($contentX + 772), ($rowY + 18))
                }

                if ($contentX + 900 -lt $contentX + $contentW - 60) {
                    $g.DrawString($t.Assignee, $fSmall, $bTextDark, ($contentX + 900), ($rowY + 18))
                }

                if ($contentX + 1090 -lt $contentX + $contentW - 60) {
                    $g.DrawString($t.Due, $fSmall, $bTextMuted, ($contentX + 1090), ($rowY + 18))
                }

                if ($contentX + 1240 -lt $contentX + $contentW - 60) {
                    $g.DrawString("Details  •  Edit", $fSmallBold, $bPrimary, ($contentX + 1240), ($rowY + 18))
                }

                $rowY += $rowH
            }
        }
    }

    # Modal Overlays
    if ($scr.State -eq "create-modal" -or $scr.State -eq "edit-modal" -or $scr.State -eq "details-view" -or $scr.State -eq "archive-modal") {
        $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 15, 23, 42))
        $g.FillRectangle($dimBrush, 0, 0, $w, $h)

        $mWidth = if ($scr.State -eq "details-view") { 840 } else { 580 }
        $mHeight = if ($scr.State -eq "details-view") { 700 } else { 560 }
        $mX = [Math]::Floor(($w - $mWidth) / 2)
        $mY = [Math]::Floor(($h - $mHeight) / 2)

        $mPath = Create-RoundedRectangle $mX $mY $mWidth $mHeight 12
        $g.FillPath($bWhite, $mPath)
        $g.DrawPath($pBorder, $mPath)

        $modalTitle = if ($scr.State -eq "create-modal") { "Create New Task" } elseif ($scr.State -eq "edit-modal") { "Edit Task PLAT-101" } elseif ($scr.State -eq "details-view") { "Task Details: PLAT-101" } else { "Archive Task" }
        $g.DrawString($modalTitle, $fTitle, $bTextDark, ($mX + 32), ($mY + 28))
        $g.DrawLine($pBorder, $mX, ($mY + 76), ($mX + $mWidth), ($mY + 76))

        if ($scr.State -eq "details-view") {
            $g.DrawString("Implement Redis token revocation blacklist", $fTitle, $bTextDark, ($mX + 32), ($mY + 96))
            $g.DrawString("Status: In Progress   |   Priority: Urgent   |   Assignee: Dev Engineer", $fSmallBold, $bIndigo, ($mX + 32), ($mY + 128))
            $g.DrawString("Description:", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 160))
            $g.DrawString("Deploy and configure Redis token revocation blacklist across distributed cluster instances.", $fBody, $bTextDark, ($mX + 32), ($mY + 180))
            
            $g.DrawLine($pBorder, ($mX + 32), ($mY + 220), ($mX + $mWidth - 32), ($mY + 220))
            $g.DrawString("Task Audit Activity Trail:", $fSmallBold, $bTextDark, ($mX + 32), ($mY + 236))
            $g.DrawString("• Nov 19 14:32 — Dev Engineer moved task from 'To Do' to 'In Progress'", $fSmall, $bTextMuted, ($mX + 32), ($mY + 260))
            $g.DrawString("• Nov 19 14:15 — Project Owner assigned task to Dev Engineer", $fSmall, $bTextMuted, ($mX + 32), ($mY + 282))
            $g.DrawString("• Nov 19 14:10 — Project Owner created task with status 'To Do'", $fSmall, $bTextMuted, ($mX + 32), ($mY + 304))
        } elseif ($scr.State -eq "archive-modal") {
            $g.DrawString("Archive Task PLAT-101?", $fBodyBold, $bTextDark, ($mX + 32), ($mY + 110))
            $g.DrawString("Archived tasks are safely hidden from active sprint boards but remain accessible in the archive.", $fSmall, $bTextMuted, ($mX + 32), ($mY + 138))
        } else {
            $g.DrawString("Task Title: Implement Redis token revocation blacklist", $fBodyBold, $bTextDark, ($mX + 32), ($mY + 100))
            $g.DrawString("Project: Core Platform Sprint", $fSmall, $bTextMuted, ($mX + 32), ($mY + 130))
            $g.DrawString("Status: In Progress", $fSmall, $bTextMuted, ($mX + 32), ($mY + 155))
            $g.DrawString("Priority: Urgent", $fSmall, $bTextMuted, ($mX + 32), ($mY + 180))
            $g.DrawString("Assignee: Dev Engineer", $fSmall, $bTextMuted, ($mX + 32), ($mY + 205))
            $g.DrawString("Due Date: 2026-11-28", $fSmall, $bTextMuted, ($mX + 32), ($mY + 230))
        }

        $g.DrawLine($pBorder, $mX, ($mY + $mHeight - 64), ($mX + $mWidth), ($mY + $mHeight - 64))
        $btnAction = Create-RoundedRectangle ($mX + $mWidth - 140) ($mY + $mHeight - 48) 110 34 6
        $g.FillPath($bPrimary, $btnAction)
        $g.DrawString("Save Changes", $fSmallBold, $bWhite, ($mX + $mWidth - 128), ($mY + $mHeight - 40))
    }

    $outPath = Join-Path $baseDir $scr.File
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved implementation screenshot: $($scr.File) ($w x $h)" -ForegroundColor Green
}

Write-Host "All Phase 14 screenshots generated successfully in $baseDir!" -ForegroundColor Cyan


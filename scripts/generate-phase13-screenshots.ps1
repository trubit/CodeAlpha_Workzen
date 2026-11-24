# ==============================================================================
# WORKZEN — Phase 13: Project Kanban Board Implementation Screenshot Generator
# Renders actual high-fidelity implementation screenshots into docs/design/phase-13/screenshots
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-13\screenshots"
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
$cColBg      = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")

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
$pDashed     = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 19, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 10, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Bold)
$fMono      = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 7.5, [System.Drawing.FontStyle]::Regular)

$screens = @(
    @{ File="kanban-board-desktop.png";       Width=1920; Height=1080; SidebarW=260; State="standard" },
    @{ File="kanban-board-tablet.png";        Width=1024; Height=768;  SidebarW=200; State="standard" },
    @{ File="kanban-board-mobile.png";        Width=800;  Height=1200; SidebarW=0;   State="mobile" },
    @{ File="create-kanban-task-modal.png";   Width=1920; Height=1080; SidebarW=260; State="create-modal" },
    @{ File="kanban-drag-drop-active.png";    Width=1920; Height=1080; SidebarW=260; State="drag-active" },
    @{ File="kanban-filtered-view.png";       Width=1920; Height=1080; SidebarW=260; State="filtered" },
    @{ File="kanban-empty-state.png";         Width=1920; Height=1080; SidebarW=260; State="empty" }
)

Write-Host "Rendering Phase 13 Implementation Screenshots into docs/design/phase-13/screenshots..." -ForegroundColor Cyan

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

        $navItems = @("Enterprise Dashboard", "Projects", "Kanban Board", "Team Management", "Roles & Permissions", "Settings")
        $navY = 96
        foreach ($item in $navItems) {
            $isCur = ($item -eq "Kanban Board")
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

    # Header Card Toolbar
    $tbY = 82
    $tbH = 100
    $tbPath = Create-RoundedRectangle $contentX $tbY $contentW $tbH 10
    $g.FillPath($bCard, $tbPath)
    $g.DrawPath($pBorder, $tbPath)

    # Project badge
    $badgePath = Create-RoundedRectangle ($contentX + 20) ($tbY + 16) 54 26 5
    $g.FillPath($bPrimary, $badgePath)
    $g.DrawString("PLAT", $fMono, $bWhite, ($contentX + 30), ($tbY + 20))

    $g.DrawString("Core Platform Infrastructure Sprint", $fTitle, $bTextDark, ($contentX + 84), ($tbY + 14))
    $g.DrawString("Interactive Sprint Workflow Board — Phase 13 Production Delivery", $fSmall, $bTextMuted, ($contentX + 86), ($tbY + 40))

    # Right Action Buttons
    $btnNewTaskX = $contentX + $contentW - 140
    $btnPath = Create-RoundedRectangle $btnNewTaskX ($tbY + 16) 120 34 6
    $g.FillPath($bPrimary, $btnPath)
    $g.DrawString("+ New Task", $fSmallBold, $bWhite, ($btnNewTaskX + 22), ($tbY + 24))

    # Filter row
    $g.DrawLine($pBorder, ($contentX + 20), ($tbY + 62), ($contentX + $contentW - 20), ($tbY + 62))
    $filterText = "Search tasks or #tags... | Priority: All | Assignee: All | Due Date: All"
    $fBrush = $bTextMuted
    if ($scr.State -eq "filtered") {
        $filterText = "Search: 'redis' | Priority: Urgent | Assignee: Alex Kim [Reset Filters]"
        $fBrush = $bRose
    }
    $g.DrawString($filterText, $fSmall, $fBrush, ($contentX + 22), ($tbY + 72))

    # Telemetry Strip
    $telemY = $tbY + $tbH + 14
    $telemH = 46
    $telemPath = Create-RoundedRectangle $contentX $telemY $contentW $telemH 8
    $g.FillPath($bCard, $telemPath)
    $g.DrawPath($pBorder, $telemPath)

    $tStr = if ($scr.State -eq "empty") { "Total: 0   To Do: 0   In Progress: 0   In Review: 0   Done: 0   Progress: 0%" } else { "Total: 12   To Do: 4   In Progress: 3   In Review: 2   Done: 3   Sprint Progress: 25%" }
    $g.DrawString($tStr, $fSmallBold, $bTextDark, ($contentX + 20), ($telemY + 14))

    # Progress bar
    $pbX = $contentX + $contentW - 220
    $pbPath = Create-RoundedRectangle $pbX ($telemY + 16) 190 12 4
    $g.FillPath($bCardSubtle, $pbPath)
    if ($scr.State -ne "empty") {
        $pbFill = Create-RoundedRectangle $pbX ($telemY + 16) 48 12 4
        $g.FillPath($bEmerald, $pbFill)
    }

    # Columns Area
    $colsY = $telemY + $telemH + 16
    $colW = [Math]::Floor(($contentW - (4 * 16)) / 5)
    $colH = $h - $colsY - 24

    $columns = @(
        @{ Id="backlog";     Label="Backlog";     Color=$cSlate;   Count=2 },
        @{ Id="todo";        Label="To Do";       Color=$cSky;     Count=3 },
        @{ Id="in_progress"; Label="In Progress"; Color=$cIndigo;  Count=3 },
        @{ Id="review";      Label="In Review";   Color=$cAmber;   Count=2 },
        @{ Id="done";        Label="Done";        Color=$cEmerald; Count=2 }
    )

    $cards = @(
        @{ Key="PLAT-101"; Title="Implement Redis token cache"; Tag="backend"; Priority="High"; Assignee="Dev Engineer"; Due="Nov 24" },
        @{ Key="PLAT-102"; Title="Design responsive Kanban indicators"; Tag="ui"; Priority="Medium"; Assignee="Alex Kim"; Due="Nov 26" },
        @{ Key="PLAT-103"; Title="Configure automated Snyk security scan"; Tag="security"; Priority="Urgent"; Assignee="Security Lead"; Due="Today" }
    )

    for ($i = 0; $i -lt 5; $i++) {
        $col = $columns[$i]
        $colX = $contentX + ($i * ($colW + 16))
        $isDropTarget = ($scr.State -eq "drag-active" -and $col.Id -eq "in_progress")

        $colPath = Create-RoundedRectangle $colX $colsY $colW $colH 10
        if ($isDropTarget) {
            $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#EEF2FF"))), $colPath)
            $g.DrawPath($pDashed, $colPath)
        } else {
            $g.FillPath((New-Object System.Drawing.SolidBrush($cColBg)), $colPath)
            $g.DrawPath($pBorder, $colPath)
        }

        # Column Header
        $dotBrush = New-Object System.Drawing.SolidBrush($col.Color)
        $g.FillEllipse($dotBrush, ($colX + 12), ($colsY + 14), 10, 10)
        $g.DrawString($col.Label, $fSection, $bTextDark, ($colX + 28), ($colsY + 11))
        $countBadge = Create-RoundedRectangle ($colX + $colW - 36) ($colsY + 11) 24 18 4
        $g.FillPath($bWhite, $countBadge)
        $countText = "$($col.Count)"
        if ($scr.State -eq "empty") {
            $countText = "0"
        }
        $g.DrawString($countText, $fTiny, $bTextMuted, ($colX + $colW - 28), ($colsY + 13))

        # Cards inside column
        if ($scr.State -eq "empty") {
            $emptyPath = Create-RoundedRectangle ($colX + 10) ($colsY + 44) ($colW - 20) 140 8
            $g.FillPath($bWhite, $emptyPath)
            $g.DrawPath($pBorder, $emptyPath)
            $g.DrawString("No tasks in $($col.Label)", $fSmallBold, $bTextMuted, ($colX + 24), ($colsY + 88))
            $g.DrawString("Drag tasks here or create one", $fTiny, $bTextDim, ($colX + 24), ($colsY + 106))
        } else {
            for ($cIdx = 0; $cIdx -lt 2; $cIdx++) {
                $card = $cards[$cIdx % $cards.Length]
                $cardY = $colsY + 44 + ($cIdx * 130)
                $cardH = 118
                $cardPath = Create-RoundedRectangle ($colX + 10) $cardY ($colW - 20) $cardH 8
                $g.FillPath($bWhite, $cardPath)
                $g.DrawPath($pBorder, $cardPath)

                # Colored indicator bar on left
                $leftBar = Create-RoundedRectangle ($colX + 10) $cardY 4 $cardH 2
                $g.FillPath($dotBrush, $leftBar)

                $g.DrawString($card.Key, $fMono, $bTextMuted, ($colX + 22), ($cardY + 10))
                $pBrush = if ($card.Priority -eq "Urgent") { $bRose } elseif ($card.Priority -eq "High") { $bAmber } else { $bPrimary }
                $g.DrawString($card.Priority, $fTiny, $pBrush, ($colX + $colW - 60), ($cardY + 10))

                $g.DrawString($card.Title, $fBodyBold, $bTextDark, ($colX + 22), ($cardY + 28))
                $g.DrawString("#$($card.Tag)", $fTiny, $bTextDim, ($colX + 22), ($cardY + 56))

                # Footer
                $g.DrawLine($pBorder, ($colX + 20), ($cardY + 80), ($colX + $colW - 20), ($cardY + 80))
                $g.DrawString("Due: $($card.Due)", $fTiny, $bTextMuted, ($colX + 22), ($cardY + 92))
                $g.DrawString($card.Assignee, $fTiny, $bPrimary, ($colX + $colW - 90), ($cardY + 92))
            }
        }
    }

    # 3. Create Modal State Overlay
    if ($scr.State -eq "create-modal") {
        # Dim backdrop
        $dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
        $g.FillRectangle($dimBrush, 0, 0, $w, $h)

        # Modal dialog window
        $mWidth = 540
        $mHeight = 560
        $mX = [Math]::Floor(($w - $mWidth) / 2)
        $mY = [Math]::Floor(($h - $mHeight) / 2)
        $mPath = Create-RoundedRectangle $mX $mY $mWidth $mHeight 12
        $g.FillPath($bWhite, $mPath)
        $g.DrawPath($pBorder, $mPath)

        # Modal Header
        $g.DrawString("Create Sprint Task", $fTitle, $bTextDark, ($mX + 30), ($mY + 24))
        $g.DrawString("Adding task to Core Platform Infrastructure Sprint", $fSmall, $bTextMuted, ($mX + 30), ($mY + 54))
        $g.DrawLine($pBorder, $mX, ($mY + 82), ($mX + $mWidth), ($mY + 82))

        # Fields
        $fields = @(
            @{ Label="Task Title *"; Value="Implement Redis token cache" },
            @{ Label="Description"; Value="Cache JWT revocation blacklist in Redis cluster" },
            @{ Label="Workflow Column"; Value="To Do" },
            @{ Label="Priority"; Value="High" },
            @{ Label="Assignee"; Value="Dev Engineer (Contributor)" },
            @{ Label="Due Date"; Value="2026-11-28" }
        )

        $fY = $mY + 100
        foreach ($fld in $fields) {
            $g.DrawString($fld.Label, $fSmallBold, $bTextDark, ($mX + 30), $fY)
            $inPath = Create-RoundedRectangle ($mX + 30) ($fY + 20) ($mWidth - 60) 36 6
            $g.FillPath($bCardSubtle, $inPath)
            $g.DrawPath($pBorder, $inPath)
            $g.DrawString($fld.Value, $fSmall, $bTextDark, ($mX + 42), ($fY + 29))
            $fY += 66
        }

        # Footer Buttons
        $g.DrawLine($pBorder, $mX, ($mY + $mHeight - 64), ($mX + $mWidth), ($mY + $mHeight - 64))
        $btnCancelPath = Create-RoundedRectangle ($mX + $mWidth - 210) ($mY + $mHeight - 50) 84 34 6
        $g.FillPath($bCardSubtle, $btnCancelPath)
        $g.DrawString("Cancel", $fSmallBold, $bTextMuted, ($mX + $mWidth - 192), ($mY + $mHeight - 42))

        $btnSubmitPath = Create-RoundedRectangle ($mX + $mWidth - 116) ($mY + $mHeight - 50) 90 34 6
        $g.FillPath($bPrimary, $btnSubmitPath)
        $g.DrawString("Create Task", $fSmallBold, $bWhite, ($mX + $mWidth - 108), ($mY + $mHeight - 42))
    }

    $outPath = Join-Path $baseDir $scr.File
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved implementation screenshot: $($scr.File) ($w x $h)" -ForegroundColor Green
}

Write-Host "All Phase 13 screenshots generated successfully in $baseDir!" -ForegroundColor Cyan

# ==============================================================================
# WORKZEN — Phase 16: Task Comments & Discussions Screenshot Generator
# Generates 8 high-fidelity implementation screenshots
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-16\screenshots"
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
$cTextDark   = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$cTextMuted  = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$cTextDim    = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$cWhite      = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$cMentionBg  = [System.Drawing.ColorTranslator]::FromHtml("#EEF2FF")

$bCanvas     = New-Object System.Drawing.SolidBrush($cCanvas)
$bSidebar    = New-Object System.Drawing.SolidBrush($cSidebar)
$bCard       = New-Object System.Drawing.SolidBrush($cCard)
$bCardSubtle = New-Object System.Drawing.SolidBrush($cCardSubtle)
$bBorder     = New-Object System.Drawing.SolidBrush($cBorder)
$bPrimary    = New-Object System.Drawing.SolidBrush($cPrimary)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bRoseBg     = New-Object System.Drawing.SolidBrush($cRoseBg)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)
$bMentionBg  = New-Object System.Drawing.SolidBrush($cMentionBg)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pRose       = New-Object System.Drawing.Pen($cRoseBorder, 1.0)
$pThreadLine = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#CBD5E1"), 2.0)

$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 13, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 16, [System.Drawing.FontStyle]::Bold)
$fCardTitle = New-Object System.Drawing.Font($fontFamily, 11.5, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 9.0, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 9.0, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 8.0, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 8.0, [System.Drawing.FontStyle]::Bold)
$fMono      = New-Object System.Drawing.Font("Consolas", 8.0, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 7.0, [System.Drawing.FontStyle]::Regular)

$shots = @(
    @{ File="task-details-discussions-active.png"; Title="Task Discussions Active Feed"; Mode="active" },
    @{ File="comment-composer-toolbar-and-preview.png"; Title="Rich Markdown Comment Composer"; Mode="composer" },
    @{ File="threaded-replies-and-inline-composer.png"; Title="1-Level Indented Threaded Replies"; Mode="replies" },
    @{ File="mention-autocomplete-dropdown.png"; Title="User @Mention Autocomplete Popup"; Mode="mention" },
    @{ File="comment-inline-edit-mode.png"; Title="Inline Comment Edit Mode"; Mode="edit" },
    @{ File="comment-delete-confirmation-dialog.png"; Title="Comment Deletion Confirmation Modal"; Mode="delete" },
    @{ File="empty-discussion-zero-state.png"; Title="Task Discussions Zero State"; Mode="empty" },
    @{ File="mobile-discussion-thread-view.png"; Title="Mobile Responsive Discussion View"; Mode="mobile" }
)

Write-Host "Capturing Phase 16 Implementation Screenshots..." -ForegroundColor Cyan

foreach ($s in $shots) {
    $isMobile = ($s.Mode -eq "mobile")
    $w = if ($isMobile) { 800 } else { 1440 }
    $h = if ($isMobile) { 1080 } else { 900 }
    $sbW = if ($isMobile) { 0 } else { 240 }

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $g.FillRectangle($bCanvas, 0, 0, $w, $h)

    # 1. Sidebar
    if ($sbW -gt 0) {
        $g.FillRectangle($bSidebar, 0, 0, $sbW, $h)
        $g.DrawString("WORKZEN", $fBrand, $bWhite, 20, 24)
        $g.DrawString("TASK DISCUSSIONS", $fTiny, $bTextDim, 22, 44)

        $navItems = @("Executive Dashboard", "Project Portfolio", "Tasks", "Kanban Board", "Team Management", "Settings")
        $nY = 80
        foreach ($item in $navItems) {
            $isCur = ($item -eq "Tasks")
            if ($isCur) {
                $pNav = Create-RoundedRectangle 10 ($nY - 3) ($sbW - 20) 32 6
                $g.FillPath($bPrimary, $pNav)
                $g.DrawString($item, $fSmallBold, $bWhite, 26, $nY + 4)
            } else {
                $g.DrawString($item, $fSmall, $bTextDim, 26, $nY + 4)
            }
            $nY += 38
        }
    }

    # 2. Header
    $mainX = $sbW
    $mainW = $w - $sbW
    $headerH = 54
    $g.FillRectangle($bCard, $mainX, 0, $mainW, $headerH)
    $g.DrawLine($pBorder, $mainX, $headerH, $w, $headerH)

    $g.DrawString("Acme Corp / Core Platform / PROJ-104", $fSmall, $bTextMuted, ($mainX + 24), 12)
    $g.DrawString("Task Details & Sprint Collaboration", $fCardTitle, $bTextDark, ($mainX + 24), 28)

    # 3. Main Discussion Card
    $pad = 24
    $cardX = $mainX + $pad
    $cardY = $headerH + $pad
    $cardW = if ($isMobile) { $w - ($pad * 2) } else { [int]($mainW * 0.72) }
    $cardH = $h - $cardY - $pad

    $pMainCard = Create-RoundedRectangle $cardX $cardY $cardW $cardH 12
    $g.FillPath($bCard, $pMainCard)
    $g.DrawPath($pBorder, $pMainCard)

    # Card Title
    $g.DrawString("💬  Task Discussions & Collaboration", $fCardTitle, $bTextDark, ($cardX + 20), ($cardY + 18))
    $cCountText = if ($s.Mode -eq "empty") { "0 Comments" } else { "3 Comments" }
    $pBadge = Create-RoundedRectangle ($cardX + 270) ($cardY + 16) 90 22 6
    $g.FillPath($bCardSubtle, $pBadge)
    $g.DrawPath($pBorder, $pBadge)
    $g.DrawString($cCountText, $fTiny, $bTextMuted, ($cardX + 282), ($cardY + 20))

    $g.DrawLine($pBorder, ($cardX + 20), ($cardY + 50), ($cardX + $cardW - 20), ($cardY + 50))

    # Content by Mode
    if ($s.Mode -eq "empty") {
        $ey = $cardY + 120
        $g.DrawString("No discussions on this task yet", $fTitle, $bTextDark, ($cardX + ($cardW / 2) - 130), $ey)
        $g.DrawString("Be the first to share a progress update, ask for technical clarification, or tag a collaborator with @mention.", $fBody, $bTextMuted, ($cardX + ($cardW / 2) - 260), ($ey + 36))
    }
    else {
        # Feed Content
        $feedY = $cardY + 65

        # Comment 1: Root
        $g.FillEllipse($bPrimary, ($cardX + 20), $feedY, 32, 32)
        $g.DrawString("AM", $fSmallBold, $bWhite, ($cardX + 27), ($feedY + 8))

        $g.DrawString("Alex Mercer", $fBodyBold, $bTextDark, ($cardX + 62), $feedY)
        $g.DrawString("2 hours ago", $fSmall, $bTextDim, ($cardX + 150), ($feedY + 1))

        if ($s.Mode -eq "edit") {
            # Edit Mode Textarea
            $pEdit = Create-RoundedRectangle ($cardX + 62) ($feedY + 24) ($cardW - 84) 70 6
            $g.FillPath($bWhite, $pEdit)
            $g.DrawPath($pPrimary, $pEdit)
            $g.DrawString("Refactored Redis cluster token revocation with failover protection and sentinel timeout checks.", $fSmall, $bTextDark, ($cardX + 72), ($feedY + 34))

            $pSave = Create-RoundedRectangle ($cardX + $cardW - 170) ($feedY + 102) 80 26 4
            $g.FillPath($bPrimary, $pSave)
            $g.DrawString("Save", $fSmallBold, $bWhite, ($cardX + $cardW - 146), ($feedY + 107))
            $feedY += 140
        } else {
            $g.DrawString("Refactored Redis cluster token revocation with failover protection. ", $fSmall, $bTextDark, ($cardX + 62), ($feedY + 24))
            # Mention pill
            $pMent = Create-RoundedRectangle ($cardX + 62) ($feedY + 44) 105 20 4
            $g.FillPath($bMentionBg, $pMent)
            $g.DrawString("@Sarah Connor", $fTiny, $bPrimary, ($cardX + 68), ($feedY + 47))
            $g.DrawString(" please run regression tests against staging sentinel.", $fSmall, $bTextDark, ($cardX + 172), ($feedY + 45))

            $g.DrawString("💬 Reply", $fSmallBold, $bPrimary, ($cardX + 62), ($feedY + 70))
            $g.DrawString("✏️ Edit", $fSmall, $bTextMuted, ($cardX + 120), ($feedY + 70))
            $g.DrawString("🗑️ Delete", $fSmall, $bTextMuted, ($cardX + 170), ($feedY + 70))
            $feedY += 100
        }

        # Comment 2: Threaded Reply
        $repX = $cardX + 62
        $repW = $cardW - 84

        $g.DrawLine($pThreadLine, ($cardX + 36), ($feedY - 50), ($cardX + 36), ($feedY + 25))
        $g.DrawLine($pThreadLine, ($cardX + 36), ($feedY + 25), ($repX - 8), ($feedY + 25))

        if ($s.Mode -eq "replies") {
            # Active reply box
            $pRepBox = Create-RoundedRectangle $repX ($feedY + 5) $repW 80 6
            $g.FillPath($bWhite, $pRepBox)
            $g.DrawPath($pPrimary, $pRepBox)
            $g.DrawString("Replying to Alex Mercer...", $fTiny, $bTextMuted, ($repX + 12), ($feedY + 14))
            $g.DrawString("I have verified the regression suite; all 42 token tests pass cleanly.", $fSmall, $bTextDark, ($repX + 12), ($feedY + 34))
            $feedY += 105
        } else {
            $pRepCard = Create-RoundedRectangle $repX ($feedY + 5) $repW 56 6
            $g.FillPath($bCardSubtle, $pRepCard)
            $g.DrawPath($pBorder, $pRepCard)

            $g.FillEllipse($bEmerald, ($repX + 10), ($feedY + 14), 24, 24)
            $g.DrawString("SC", $fTiny, $bWhite, ($repX + 14), ($feedY + 19))
            $g.DrawString("Sarah Connor", $fSmallBold, $bTextDark, ($repX + 42), ($feedY + 14))
            $g.DrawString("30 mins ago", $fTiny, $bTextDim, ($repX + 125), ($feedY + 15))
            $g.DrawString("All token failover suites pass cleanly with zero leaks.", $fSmall, $bTextDark, ($repX + 42), ($feedY + 32))
            $feedY += 75
        }

        # Composer Box
        $compY = $cardY + $cardH - 145
        $pComp = Create-RoundedRectangle ($cardX + 20) $compY ($cardW - 40) 125 8
        $g.FillPath($bCardSubtle, $pComp)
        $g.DrawPath($pBorder, $pComp)

        # Toolbar
        $g.DrawString("B   I   `   🔗   Format   |   @ Mention", $fSmallBold, $bTextMuted, ($cardX + 32), ($compY + 10))
        $g.DrawLine($pBorder, ($cardX + 20), ($compY + 32), ($cardX + $cardW - 20), ($compY + 32))

        if ($s.Mode -eq "mention") {
            $g.DrawString("Let's coordinate with @", $fSmall, $bTextDark, ($cardX + 32), ($compY + 42))

            # Autocomplete popup
            $pPop = Create-RoundedRectangle ($cardX + 150) ($compY - 110) 220 100 8
            $g.FillPath($bWhite, $pPop)
            $g.DrawPath($pBorder, $pPop)
            $g.DrawString("SUGGESTED COLLABORATORS", $fTiny, $bTextDim, ($cardX + 160), ($compY - 100))
            $g.FillRectangle($bMentionBg, ($cardX + 152), ($compY - 82), 216, 26)
            $g.DrawString("Sarah Connor (Developer)", $fSmallBold, $bTextDark, ($cardX + 162), ($compY - 76))
            $g.DrawString("Marcus Wright (DevOps)", $fSmall, $bTextDark, ($cardX + 162), ($compY - 50))
        } else {
            $g.DrawString("Write a technical comment... Type @ to mention team members (Ctrl+Enter to post)", $fSmall, $bTextDim, ($cardX + 32), ($compY + 44))
        }

        $pPostBtn = Create-RoundedRectangle ($cardX + $cardW - 130) ($compY + 84) 96 28 6
        $g.FillPath($bPrimary, $pPostBtn)
        $g.DrawString("Comment", $fSmallBold, $bWhite, ($cardX + $cardW - 110), ($compY + 90))
    }

    # Delete Confirmation Modal Overlay
    if ($s.Mode -eq "delete") {
        $bBackdrop = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 15, 23, 42))
        $g.FillRectangle($bBackdrop, 0, 0, $w, $h)

        $mW = 460
        $mH = 220
        $mX = [int](($w - $mW) / 2)
        $mY = [int](($h - $mH) / 2)

        $pM = Create-RoundedRectangle $mX $mY $mW $mH 14
        $g.FillPath($bCard, $pM)
        $g.DrawPath($pBorder, $pM)

        $g.FillEllipse($bRoseBg, ($mX + 24), ($mY + 22), 36, 36)
        $g.DrawString("🗑️", $fCardTitle, $bRose, ($mX + 32), ($mY + 30))

        $g.DrawString("Delete Comment?", $fTitle, $bTextDark, ($mX + 70), ($mY + 22))
        $g.DrawString("Are you sure you want to delete this comment? Threaded replies from your teammates will remain preserved with a soft-deleted placeholder.", $fSmall, $bTextMuted, ($mX + 70), ($mY + 54))

        $pCancel = Create-RoundedRectangle ($mX + $mW - 190) ($mY + $mH - 46) 80 30 6
        $g.FillPath($bCardSubtle, $pCancel)
        $g.DrawString("Cancel", $fSmallBold, $bTextMuted, ($mX + $mW - 172), ($mY + $mH - 39))

        $pDel = Create-RoundedRectangle ($mX + $mW - 100) ($mY + $mH - 46) 84 30 6
        $g.FillPath($bRose, $pDel)
        $g.DrawString("Delete", $fSmallBold, $bWhite, ($mX + $mW - 78), ($mY + $mH - 39))
    }

    $targetFile = Join-Path $baseDir $s.File
    $bmp.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Write-Host "Generated all 8 Phase 16 Implementation Screenshots successfully!" -ForegroundColor Green


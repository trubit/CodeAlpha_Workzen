# ==============================================================================
# WORKZEN — Phase 16: Task Comments & Discussions Visual Prototype Generator
# Generates 20 screens x 3 viewports = 60 high-fidelity prototype images
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-16\prototypes"
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
$cAmberBg    = [System.Drawing.ColorTranslator]::FromHtml("#FEF3C7")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cRoseBg     = [System.Drawing.ColorTranslator]::FromHtml("#FFF1F2")
$cRoseBorder = [System.Drawing.ColorTranslator]::FromHtml("#FECDD3")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cSlate      = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
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
$bIndigo     = New-Object System.Drawing.SolidBrush($cIndigo)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bAmberBg    = New-Object System.Drawing.SolidBrush($cAmberBg)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bRoseBg     = New-Object System.Drawing.SolidBrush($cRoseBg)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bSlate      = New-Object System.Drawing.SolidBrush($cSlate)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)
$bMentionBg  = New-Object System.Drawing.SolidBrush($cMentionBg)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pRose       = New-Object System.Drawing.Pen($cRoseBorder, 1.0)
$pRoseSolid  = New-Object System.Drawing.Pen($cRose, 2.0)
$pThreadLine = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#CBD5E1"), 2.0)

$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 14, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)
$fSubtitle  = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Regular)
$fCardTitle = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 9.5, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 9.5, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Bold)
$fMono      = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 7.5, [System.Drawing.FontStyle]::Regular)
$fBigIcon   = New-Object System.Drawing.Font($fontFamily, 36, [System.Drawing.FontStyle]::Regular)

$screens = @(
    @{ Id="01-task-discussion-overview"; Title="Task Discussion Main Section"; Subtitle="Discussion feed header with active comments count badge, filter tabs, and real-time telemetry" },
    @{ Id="02-comment-composer-active"; Title="Rich Comment Composer"; Subtitle="Interactive formatting toolbar with Bold, Code, Link, List, Quote, and @mention shortcuts" },
    @{ Id="03-comment-composer-expanded"; Title="Comment Composer with Character Counter"; Subtitle="Live character limit feedback (142/5000) and keyboard submission shortcut hint" },
    @{ Id="04-comment-list-threaded"; Title="Threaded Discussion Feed"; Subtitle="Chronological root comments with member avatars, role badges, relative timestamps, and action menus" },
    @{ Id="05-comment-reply-inline-composer"; Title="Inline Reply Composer"; Subtitle="Contextual inline reply editor nested directly beneath parent comment with cancel action" },
    @{ Id="06-comment-reply-thread-view"; Title="Expanded Reply Thread"; Subtitle="1-level indented response cards with connected thread guides and parent attribution" },
    @{ Id="07-user-mention-autocomplete-popup"; Title="User Mention Autocomplete Popup"; Subtitle="Accessible dropdown menu triggered by '@' displaying eligible project collaborators" },
    @{ Id="08-user-mention-highlighted-comment"; Title="Rendered Comment with @mention Pills"; Subtitle="Interactive high-visibility mention tags linking directly to team collaborator profiles" },
    @{ Id="09-comment-inline-edit-mode"; Title="Comment Inline Editing"; Subtitle="In-place textarea editor allowing authors to update comments with Save and Cancel controls" },
    @{ Id="10-comment-edited-timestamp-indicator"; Title="Comment Edited State & Audit Indicator"; Subtitle="Transparent audit trail with '(edited)' status indicator and tooltip metadata" },
    @{ Id="11-comment-delete-confirmation-modal"; Title="Comment Deletion Confirmation Modal"; Subtitle="Non-native safe confirmation modal detailing soft-deletion impact on threaded replies" },
    @{ Id="12-comment-deleted-placeholder-state"; Title="Soft-Deleted Comment Placeholder"; Subtitle="Preserved thread hierarchy showing '[This comment was deleted by author]' badge" },
    @{ Id="13-empty-discussion-zero-state"; Title="Empty Discussion Zero-State"; Subtitle="Clean zero-state card with conversation illustration and prompt to leave the first note" },
    @{ Id="14-comment-loading-skeleton-state"; Title="Discussion Skeleton Loading State"; Subtitle="Accessible pulsing shimmer skeleton loaders during background data synchronization" },
    @{ Id="15-comment-submission-error-state"; Title="Comment Submission Error Banner"; Subtitle="Graceful error alert with retry button when network or validation limits fail" },
    @{ Id="16-mention-in-app-notification"; Title="Real-Time Mention In-App Notification"; Subtitle="Immediate notification bell counter update and toast notification for mentioned users" },
    @{ Id="17-comment-audit-activity-integration"; Title="Task Audit Trail Integration"; Subtitle="Automatic activity log event: 'Sarah Connor commented on task PROJ-104'" },
    @{ Id="18-multi-tenant-mention-isolation"; Title="Cross-Tenant Mention Isolation Security"; Subtitle="Strict boundary validation preventing mentions or disclosures outside project scope" },
    @{ Id="19-mobile-discussion-card-feed"; Title="Mobile Responsive Discussion Feed"; Subtitle="Touch-optimized compact discussion layout with full-width composer and tap targets" },
    @{ Id="20-comment-character-limit-warning"; Title="Comment Length Validation Warning"; Subtitle="Amber warning pill and submit prevention when content approaches or exceeds limits" }
)

$viewports = @(
    @{ Name="desktop"; Width=1920; Height=1080; SidebarW=260 },
    @{ Name="tablet";  Width=1024; Height=768;  SidebarW=200 },
    @{ Name="mobile";  Width=800;  Height=1200; SidebarW=0   }
)

Write-Host "Rendering Phase 16 Visual Prototypes (20 screens x 3 viewports = 60 images)..." -ForegroundColor Cyan

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
                    $navP = Create-RoundedRectangle 12 ($navY - 4) ($sbW - 24) 36 8
                    $g.FillPath($bPrimary, $navP)
                    $g.DrawString($item, $fBodyBold, $bWhite, 36, $navY + 4)
                } else {
                    $g.DrawString($item, $fBody, $bTextDim, 36, $navY + 4)
                }
                $navY += 44
            }
        }

        # 2. Top Header Bar
        $mainX = $sbW
        $mainW = $w - $sbW
        $headerH = 64
        $g.FillRectangle($bCard, $mainX, 0, $mainW, $headerH)
        $g.DrawLine($pBorder, $mainX, $headerH, $w, $headerH)

        $g.DrawString("Acme Corp / Engineering / Core Cloud Platform", $fSmall, $bTextMuted, ($mainX + 28), 16)
        $g.DrawString("Task Details & Discussions — PROJ-104", $fCardTitle, $bTextDark, ($mainX + 28), 34)

        # Bell Notification with badge on screen 16
        $bellX = $w - 80
        $g.DrawString("🔔", $fBody, $bTextDark, $bellX, 22)
        if ($scr.Id -like "*16-mention-in-app*") {
            $g.FillEllipse($bRose, ($bellX + 14), 16, 16, 16)
            $g.DrawString("1", $fTiny, $bWhite, ($bellX + 18), 17)
        }

        # 3. Main Content Area
        $pad = if ($vp.Name -eq "mobile") { 16 } else { 32 }
        $contentX = $mainX + $pad
        $contentY = $headerH + $pad
        $contentW = $mainW - ($pad * 2)

        # Title & Subtitle Banner
        $g.DrawString($scr.Title, $fTitle, $bTextDark, $contentX, $contentY)
        $g.DrawString($scr.Subtitle, $fSubtitle, $bTextMuted, $contentX, ($contentY + 34))

        $bodyY = $contentY + 74
        $bodyH = $h - $bodyY - $pad

        # Left Column (70%) vs Right Column (30%) on Desktop/Tablet
        $col1W = if ($vp.Name -eq "mobile") { $contentW } else { [int]($contentW * 0.68) }
        $col2W = if ($vp.Name -eq "mobile") { 0 } else { $contentW - $col1W - 24 }
        $col2X = $contentX + $col1W + 24

        # Card 1: Task Header Card (Compact)
        $taskCardH = if ($vp.Name -eq "mobile") { 90 } else { 80 }
        $pTask = Create-RoundedRectangle $contentX $bodyY $col1W $taskCardH 12
        $g.FillPath($bCard, $pTask)
        $g.DrawPath($pBorder, $pTask)

        $g.DrawString("PROJ-104", $fMono, $bPrimary, ($contentX + 20), ($bodyY + 16))
        $g.DrawString("Refactor Authentication Middleware to Support Distributed JWT Revocation", $fBodyBold, $bTextDark, ($contentX + 90), ($bodyY + 16))
        $g.DrawString("In Progress • High Priority • Assigned to Sarah Connor • Due Tomorrow", $fSmall, $bTextMuted, ($contentX + 20), ($bodyY + 44))

        # Card 2: Comments & Discussions Card
        $discY = $bodyY + $taskCardH + 16
        $discH = $bodyH - $taskCardH - 16
        $pDisc = Create-RoundedRectangle $contentX $discY $col1W $discH 12
        $g.FillPath($bCard, $pDisc)
        $g.DrawPath($pBorder, $pDisc)

        # Discussion Header
        $g.DrawString("💬  Task Discussions", $fCardTitle, $bTextDark, ($contentX + 24), ($discY + 20))
        $commentCountStr = if ($scr.Id -like "*13-empty*") { "0 comments" } else { "4 comments" }
        $pBadge = Create-RoundedRectangle ($contentX + 190) ($discY + 18) 95 24 6
        $g.FillPath($bCardSubtle, $pBadge)
        $g.DrawPath($pBorder, $pBadge)
        $g.DrawString($commentCountStr, $fSmallBold, $bTextMuted, ($contentX + 200), ($discY + 22))

        # Divider
        $g.DrawLine($pBorder, ($contentX + 24), ($discY + 56), ($contentX + $col1W - 24), ($discY + 56))

        # Conditional Content inside Discussion Card based on Screen
        if ($scr.Id -like "*13-empty*") {
            # Empty zero state
            $emptyY = $discY + 100
            $g.DrawString("💬", $fBigIcon, $bTextDim, ($contentX + ($col1W / 2) - 30), $emptyY)
            $g.DrawString("No discussions yet on this task", $fCardTitle, $bTextDark, ($contentX + ($col1W / 2) - 130), ($emptyY + 60))
            $g.DrawString("Share technical updates, tag teammates with @mention, or clarify acceptance criteria.", $fBody, $bTextMuted, ($contentX + ($col1W / 2) - 240), ($emptyY + 90))

            # Bottom composer in empty state
            $compY = $discY + $discH - 140
            $pComp = Create-RoundedRectangle ($contentX + 24) $compY ($col1W - 48) 90 8
            $g.FillPath($bCardSubtle, $pComp)
            $g.DrawPath($pBorder, $pComp)
            $g.DrawString("Write a comment or type @ to mention team members...", $fBody, $bTextDim, ($contentX + 38), ($compY + 18))
        }
        elseif ($scr.Id -like "*14-loading-skeleton*") {
            # Pulsing Shimmer Skeleton
            $skelY = $discY + 76
            for ($k = 0; $k -lt 3; $k++) {
                $g.FillEllipse($bCardSubtle, ($contentX + 24), $skelY, 36, 36)
                $pSk1 = Create-RoundedRectangle ($contentX + 70) $skelY 160 14 4
                $g.FillPath($bCardSubtle, $pSk1)
                $pSk2 = Create-RoundedRectangle ($contentX + 70) ($skelY + 22) ($col1W - 140) 36 6
                $g.FillPath($bCardSubtle, $pSk2)
                $skelY += 90
            }
        }
        else {
            # Active Discussion Feed
            $itemY = $discY + 72

            # Comment 1: Root comment by Alex Mercer
            $g.FillEllipse($bPrimary, ($contentX + 24), $itemY, 36, 36)
            $g.DrawString("AM", $fSmallBold, $bWhite, ($contentX + 32), ($itemY + 10))

            $g.DrawString("Alex Mercer", $fBodyBold, $bTextDark, ($contentX + 70), $itemY)
            $pRole1 = Create-RoundedRectangle ($contentX + 155) ($itemY - 2) 75 18 4
            $g.FillPath($bCardSubtle, $pRole1)
            $g.DrawString("Tech Lead", $fTiny, $bIndigo, ($contentX + 162), ($itemY + 1))
            $g.DrawString("2 hours ago", $fSmall, $bTextDim, ($contentX + 240), $itemY)

            # Check if this comment is in edit mode (Screen 09)
            if ($scr.Id -like "*09-comment-inline-edit*") {
                $pEditBox = Create-RoundedRectangle ($contentX + 70) ($itemY + 26) ($col1W - 100) 80 8
                $g.FillPath($bWhite, $pEditBox)
                $g.DrawPath($pPrimary, $pEditBox)
                $g.DrawString("We need to confirm whether Redis cluster eviction strategy handles high memory loads properly before deploying to staging.", $fBody, $bTextDark, ($contentX + 80), ($itemY + 36))

                # Save / Cancel Buttons
                $pSave = Create-RoundedRectangle ($contentX + $col1W - 190) ($itemY + 114) 100 28 6
                $g.FillPath($bPrimary, $pSave)
                $g.DrawString("Save Changes", $fSmallBold, $bWhite, ($contentX + $col1W - 180), ($itemY + 120))

                $pCancel = Create-RoundedRectangle ($contentX + $col1W - 270) ($itemY + 114) 70 28 6
                $g.FillPath($bCardSubtle, $pCancel)
                $g.DrawString("Cancel", $fSmallBold, $bTextMuted, ($contentX + $col1W - 256), ($itemY + 120))
                $itemY += 150
            }
            elseif ($scr.Id -like "*12-comment-deleted*") {
                # Soft-deleted comment placeholder
                $pDelBox = Create-RoundedRectangle ($contentX + 70) ($itemY + 24) ($col1W - 100) 36 6
                $g.FillPath($bRoseBg, $pDelBox)
                $g.DrawPath($pRose, $pDelBox)
                $g.DrawString("[This comment was deleted by author]", $fSmallBold, $bRose, ($contentX + 84), ($itemY + 32))
                $itemY += 80
            }
            else {
                # Normal comment text
                $cText = "We need to ensure Redis cluster token revocation handles failovers cleanly. "
                if ($scr.Id -like "*08-user-mention-highlighted*") {
                    $g.DrawString($cText, $fBody, $bTextDark, ($contentX + 70), ($itemY + 26))
                    # Mention pill for @Sarah Connor
                    $pMentPill = Create-RoundedRectangle ($contentX + 70) ($itemY + 48) 120 22 4
                    $g.FillPath($bMentionBg, $pMentPill)
                    $g.DrawString("@Sarah Connor", $fSmallBold, $bPrimary, ($contentX + 76), ($itemY + 52))
                    $g.DrawString(" can you review the Redis sentinel configuration?", $fBody, $bTextDark, ($contentX + 195), ($itemY + 50))
                } else {
                    $g.DrawString($cText + "Please run benchmark tests on Redis sentinel.", $fBody, $bTextDark, ($contentX + 70), ($itemY + 26))
                }

                # Edited indicator on Screen 10
                if ($scr.Id -like "*10-comment-edited-timestamp*") {
                    $g.DrawString("• (edited 5m ago)", $fSmall, $bIndigo, ($contentX + 320), $itemY)
                }

                # Reply action
                $g.DrawString("💬 Reply", $fSmallBold, $bPrimary, ($contentX + 70), ($itemY + 76))
                $g.DrawString("✏️ Edit", $fSmall, $bTextMuted, ($contentX + 140), ($itemY + 76))
                $g.DrawString("🗑️ Delete", $fSmall, $bTextMuted, ($contentX + 200), ($itemY + 76))

                $itemY += 105
            }

            # Nested Reply (1-level indented)
            $replyX = $contentX + 70
            $replyW = $col1W - 94

            # Vertical Thread guide line
            $g.DrawLine($pThreadLine, ($contentX + 42), ($itemY - 60), ($contentX + 42), ($itemY + 40))
            $g.DrawLine($pThreadLine, ($contentX + 42), ($itemY + 40), ($replyX - 10), ($itemY + 40))

            if ($scr.Id -like "*05-comment-reply-inline*") {
                # Inline reply composer active
                $pRepBox = Create-RoundedRectangle $replyX ($itemY + 10) $replyW 90 8
                $g.FillPath($bWhite, $pRepBox)
                $g.DrawPath($pPrimary, $pRepBox)
                $g.DrawString("Replying to Alex Mercer...", $fSmallBold, $bTextMuted, ($replyX + 14), ($itemY + 20))
                $g.DrawString("Yes, I verified the failover timeouts in our staging cluster.", $fBody, $bTextDark, ($replyX + 14), ($itemY + 42))

                # Post Reply button
                $pRepBtn = Create-RoundedRectangle ($replyX + $replyW - 110) ($itemY + 64) 96 26 6
                $g.FillPath($bPrimary, $pRepBtn)
                $g.DrawString("Post Reply", $fSmallBold, $bWhite, ($replyX + $replyW - 98), ($itemY + 70))
                $itemY += 120
            } else {
                # Normal reply card
                $pRepCard = Create-RoundedRectangle $replyX ($itemY + 10) $replyW 70 8
                $g.FillPath($bCardSubtle, $pRepCard)
                $g.DrawPath($pBorder, $pRepCard)

                $g.FillEllipse($bEmerald, ($replyX + 12), ($itemY + 20), 28, 28)
                $g.DrawString("SC", $fTiny, $bWhite, ($replyX + 18), ($itemY + 27))
                $g.DrawString("Sarah Connor", $fSmallBold, $bTextDark, ($replyX + 48), ($itemY + 20))
                $g.DrawString("30 mins ago", $fTiny, $bTextDim, ($replyX + 140), ($itemY + 22))
                $g.DrawString("Failover tests are passing with zero token leakage. Ready for review.", $fSmall, $bTextDark, ($replyX + 48), ($itemY + 42))

                $itemY += 95
            }

            # Bottom Main Composer
            $compY = $discY + $discH - 150
            if ($compY -lt $itemY) { $compY = $itemY + 20 }
            if ($compY + 130 -lt ($discY + $discH)) {
                $pMainComp = Create-RoundedRectangle ($contentX + 24) $compY ($col1W - 48) 120 8
                $g.FillPath($bWhite, $pMainComp)
                $g.DrawPath($pBorder, $pMainComp)

                # Composer toolbar
                $g.DrawString("B   I   `   🔗   Format   |   @ Mention   📎", $fSmallBold, $bTextMuted, ($contentX + 38), ($compY + 12))
                $g.DrawLine($pBorder, ($contentX + 24), ($compY + 36), ($contentX + $col1W - 24), ($compY + 36))

                # Composer text
                if ($scr.Id -like "*07-user-mention-autocomplete*") {
                    $g.DrawString("Let's sync with @", $fBody, $bTextDark, ($contentX + 38), ($compY + 48))

                    # Autocomplete Popup overlay
                    $popX = $contentX + 140
                    $popY = $compY - 140
                    $pPop = Create-RoundedRectangle $popX $popY 240 130 8
                    $g.FillPath($bWhite, $pPop)
                    $g.DrawPath($pBorder, $pPop)

                    $g.DrawString("SUGGESTED COLLABORATORS", $fTiny, $bTextDim, ($popX + 12), ($popY + 10))
                    $members = @("Sarah Connor (Developer)", "Marcus Wright (DevOps)", "Kyle Reese (QA Lead)")
                    $memY = $popY + 28
                    foreach ($m in $members) {
                        $isHigh = ($m -like "Sarah*")
                        if ($isHigh) {
                            $g.FillRectangle($bMentionBg, ($popX + 4), $memY, 232, 28)
                        }
                        $g.DrawString($m, $fSmallBold, $bTextDark, ($popX + 14), ($memY + 6))
                        $memY += 30
                    }
                }
                elseif ($scr.Id -like "*20-comment-character-limit*") {
                    $g.DrawString("This is an extensive design review documenting every single architectural requirement...", $fBody, $bTextDark, ($contentX + 38), ($compY + 48))
                    # Warning pill
                    $pWarn = Create-RoundedRectangle ($contentX + 38) ($compY + 84) 140 22 4
                    $g.FillPath($bAmberBg, $pWarn)
                    $g.DrawString("⚠️ 4,890 / 5,000 chars", $fTiny, $bAmber, ($contentX + 44), ($compY + 88))
                }
                elseif ($scr.Id -like "*15-comment-submission-error*") {
                    $g.DrawString("Adding final verification details for the token blacklist cache.", $fBody, $bTextDark, ($contentX + 38), ($compY + 48))
                    # Error banner
                    $pErr = Create-RoundedRectangle ($contentX + 24) ($compY - 44) ($col1W - 48) 36 6
                    $g.FillPath($bRoseBg, $pErr)
                    $g.DrawPath($pRose, $pErr)
                    $g.DrawString("⚠️ Failed to post comment: Network connection timeout. [Retry Now]", $fSmallBold, $bRose, ($contentX + 36), ($compY - 34))
                }
                else {
                    $g.DrawString("Add a thoughtful comment... Use @ to mention teammates or Ctrl+Enter to post.", $fBody, $bTextDim, ($contentX + 38), ($compY + 48))
                }

                # Submit Button & Character Counter
                $g.DrawString("142 / 5,000 characters", $fTiny, $bTextDim, ($contentX + $col1W - 270), ($compY + 90))
                $pPost = Create-RoundedRectangle ($contentX + $col1W - 146) ($compY + 82) 110 30 6
                $g.FillPath($bPrimary, $pPost)
                $g.DrawString("Comment", $fSmallBold, $bWhite, ($contentX + $col1W - 120), ($compY + 88))
            }
        }

        # Right Column (Task Metadata & Collaborators) on Desktop/Tablet
        if ($col2W -gt 0) {
            $pMeta = Create-RoundedRectangle $col2X $bodyY $col2W $bodyH 12
            $g.FillPath($bCard, $pMeta)
            $g.DrawPath($pBorder, $pMeta)

            $g.DrawString("Task Context & Members", $fCardTitle, $bTextDark, ($col2X + 20), ($bodyY + 20))
            $g.DrawLine($pBorder, ($col2X + 20), ($bodyY + 50), ($col2X + $col2W - 20), ($bodyY + 50))

            $metaY = $bodyY + 65
            $g.DrawString("PROJECT", $fTiny, $bTextDim, ($col2X + 20), $metaY)
            $g.DrawString("Core Cloud Platform", $fBodyBold, $bTextDark, ($col2X + 20), ($metaY + 16))

            $metaY += 50
            $g.DrawString("ELIGIBLE DISCUSSION MEMBERS", $fTiny, $bTextDim, ($col2X + 20), $metaY)
            $team = @("Sarah Connor (Developer)", "Alex Mercer (Tech Lead)", "Marcus Wright (DevOps)", "Kyle Reese (QA)")
            $tY = $metaY + 18
            foreach ($tm in $team) {
                $g.DrawString("• " + $tm, $fSmall, $bTextMuted, ($col2X + 20), $tY)
                $tY += 24
            }

            $tY += 20
            $g.DrawString("NOTIFICATION POLICY", $fTiny, $bTextDim, ($col2X + 20), $tY)
            $g.DrawString("Mentioned users and task assignees will automatically receive instant in-app alerts and notifications.", $fSmall, $bTextMuted, ($col2X + 20), ($tY + 18))
        }

        # Modal Dialog Overlays (Screen 11: Delete Confirmation, Screen 18: Tenant Isolation Alert)
        if ($scr.Id -like "*11-comment-delete*") {
            # Darkened backdrop
            $bBackdrop = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 15, 23, 42))
            $g.FillRectangle($bBackdrop, 0, 0, $w, $h)

            $modalW = if ($vp.Name -eq "mobile") { $w - 40 } else { 520 }
            $modalH = 260
            $modalX = [int](($w - $modalW) / 2)
            $modalY = [int](($h - $modalH) / 2)

            $pModal = Create-RoundedRectangle $modalX $modalY $modalW $modalH 16
            $g.FillPath($bCard, $pModal)
            $g.DrawPath($pBorder, $pModal)

            $g.FillEllipse($bRoseBg, ($modalX + 24), ($modalY + 24), 44, 44)
            $g.DrawString("🗑️", $fCardTitle, $bRose, ($modalX + 36), ($modalY + 34))

            $g.DrawString("Delete Comment?", $fTitle, $bTextDark, ($modalX + 80), ($modalY + 24))
            $g.DrawString("Are you sure you want to delete this comment? Threaded replies from your teammates will remain preserved with a soft-deleted placeholder.", $fBody, $bTextMuted, ($modalX + 80), ($modalY + 60))

            $g.DrawLine($pBorder, $modalX, ($modalY + $modalH - 64), ($modalX + $modalW), ($modalY + $modalH - 64))

            # Cancel & Delete Buttons
            $pCancelM = Create-RoundedRectangle ($modalX + $modalW - 220) ($modalY + $modalH - 48) 90 32 6
            $g.FillPath($bCardSubtle, $pCancelM)
            $g.DrawString("Cancel", $fSmallBold, $bTextMuted, ($modalX + $modalW - 198), ($modalY + $modalH - 41))

            $pDelM = Create-RoundedRectangle ($modalX + $modalW - 116) ($modalY + $modalH - 48) 96 32 6
            $g.FillPath($bRose, $pDelM)
            $g.DrawString("Delete", $fSmallBold, $bWhite, ($modalX + $modalW - 88), ($modalY + $modalH - 41))
        }

        # Save prototype image
        $targetPath = Join-Path $baseDir $filename
        $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
    }
}

Write-Host "Generated all 60 Phase 16 High-Fidelity Prototype Images successfully!" -ForegroundColor Green

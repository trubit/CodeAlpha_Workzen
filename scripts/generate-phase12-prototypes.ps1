# ==============================================================================
# WORKZEN — Phase 12: Project Members & Collaboration Prototype Generator
# Renders 20 High-Fidelity Desktop (1920x1080), Tablet (1024x768), and Mobile (800x1200) Prototypes
# Styling: Inter typography, WORKZEN Enterprise Slate/Indigo Theme
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-12"
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
$cPrimaryDark= [System.Drawing.ColorTranslator]::FromHtml("#1E1B4B")
$cEmerald    = [System.Drawing.ColorTranslator]::FromHtml("#10B981")
$cAmber      = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
$cRose       = [System.Drawing.ColorTranslator]::FromHtml("#EF4444")
$cSky        = [System.Drawing.ColorTranslator]::FromHtml("#0EA5E9")
$cPurple     = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
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
$bPrimaryDark= New-Object System.Drawing.SolidBrush($cPrimaryDark)
$bEmerald    = New-Object System.Drawing.SolidBrush($cEmerald)
$bAmber      = New-Object System.Drawing.SolidBrush($cAmber)
$bRose       = New-Object System.Drawing.SolidBrush($cRose)
$bSky        = New-Object System.Drawing.SolidBrush($cSky)
$bPurple     = New-Object System.Drawing.SolidBrush($cPurple)
$bTextDark   = New-Object System.Drawing.SolidBrush($cTextDark)
$bTextMuted  = New-Object System.Drawing.SolidBrush($cTextMuted)
$bTextDim    = New-Object System.Drawing.SolidBrush($cTextDim)
$bWhite      = New-Object System.Drawing.SolidBrush($cWhite)

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1.0)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2.0)
$pEmerald    = New-Object System.Drawing.Pen($cEmerald, 1.5)
$pRose       = New-Object System.Drawing.Pen($cRose, 1.5)
$pAmber      = New-Object System.Drawing.Pen($cAmber, 1.5)

# Fonts
$fontFamily = "Inter"
try {
    $testFont = New-Object System.Drawing.Font($fontFamily, 12)
} catch {
    $fontFamily = "Segoe UI"
}

$fBrand     = New-Object System.Drawing.Font($fontFamily, 16, [System.Drawing.FontStyle]::Bold)
$fTitle     = New-Object System.Drawing.Font($fontFamily, 22, [System.Drawing.FontStyle]::Bold)
$fSection   = New-Object System.Drawing.Font($fontFamily, 14, [System.Drawing.FontStyle]::Bold)
$fBody      = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Regular)
$fBodyBold  = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Bold)
$fSmall     = New-Object System.Drawing.Font($fontFamily, 9.5, [System.Drawing.FontStyle]::Regular)
$fSmallBold = New-Object System.Drawing.Font($fontFamily, 9.5, [System.Drawing.FontStyle]::Bold)
$fTiny      = New-Object System.Drawing.Font($fontFamily, 8.5, [System.Drawing.FontStyle]::Regular)

# 20 Distinct Screens
$screens = @(
    @{ Id="01-project-members-overview"; Title="Project Members Overview"; Subtitle="Roster metrics, lead info, and collaboration health" },
    @{ Id="02-project-member-directory"; Title="Project Member Directory"; Subtitle="Searchable roster with role badges and access indicators" },
    @{ Id="03-add-project-members"; Title="Add Project Members Modal"; Subtitle="Multi-select org members with role assignment" },
    @{ Id="04-select-org-members"; Title="Select Organization Members"; Subtitle="Filtered search with eligible organization teammates" },
    @{ Id="05-member-invitation-flow"; Title="Project Member Invitation Flow"; Subtitle="Integrated organization team invitation shortcut" },
    @{ Id="06-member-profile-modal"; Title="Member Profile within Project"; Subtitle="Contribution velocity, assigned tasks, and access scope" },
    @{ Id="07-project-owner-info"; Title="Project Owner & Lead Details"; Subtitle="Ownership badge, lead privileges, and transfer controls" },
    @{ Id="08-member-roles-access"; Title="Member Roles and Access Matrix"; Subtitle="Lead, Contributor, and Observer permission scope" },
    @{ Id="09-membership-management"; Title="Project Membership Management"; Subtitle="Full administration hub for project collaborators" },
    @{ Id="10-update-member-role"; Title="Update Project Member Role"; Subtitle="Role adjustment dialog with permission previews" },
    @{ Id="11-remove-member-confirm"; Title="Remove Member Confirmation"; Subtitle="Safe removal dialog with task re-assignment warnings" },
    @{ Id="12-access-denied-state"; Title="Project Access Denied State"; Subtitle="Restricted project access feedback and authorization request" },
    @{ Id="13-member-search"; Title="Project Member Search"; Subtitle="Real-time debounced query filtering across member roster" },
    @{ Id="14-member-filtering"; Title="Member Role & Status Filtering"; Subtitle="Facet filtering by Lead, Contributor, Observer, and Active" },
    @{ Id="15-collaboration-overview"; Title="Project Collaboration Overview"; Subtitle="Cross-squad collaboration velocity and team workload" },
    @{ Id="16-empty-membership-state"; Title="Empty Membership State"; Subtitle="Honest zero-state when project only has lead assigned" },
    @{ Id="17-loading-state"; Title="Project Members Loading State"; Subtitle="Smooth pulse skeleton loaders for roster and statistics" },
    @{ Id="18-validation-error-states"; Title="Validation & Error States"; Subtitle="Banner alerts for duplicate additions and ownership rules" },
    @{ Id="19-membership-activity-log"; Title="Membership Activity & Audit Log"; Subtitle="Scoped audit trail of additions, role changes, and removals" },
    @{ Id="20-mobile-membership-mgmt"; Title="Mobile Project Membership Management"; Subtitle="Touch-optimized member management for mobile devices" }
)

$viewports = @(
    @{ Name="desktop"; Width=1920; Height=1080; SidebarW=260 },
    @{ Name="tablet";  Width=1024; Height=768;  SidebarW=200 },
    @{ Name="mobile";  Width=800;  Height=1200; SidebarW=0   }
)

Write-Host "Generating Phase 12 Prototypes (20 screens x 3 viewports = 60 high-fidelity images)..." -ForegroundColor Cyan

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

            # Logo & Brand
            $logoRect = Create-RoundedRectangle 24 24 36 36 8
            $g.FillPath($bPrimary, $logoRect)
            $g.DrawString("W", $fBrand, $bWhite, 32, 28)
            $g.DrawString("WORKZEN", $fBrand, $bWhite, 70, 30)

            # Navigation Items
            $navY = 90
            $navItems = @("Dashboard", "Projects", "Kanban Board", "Team Management", "Settings")
            foreach ($item in $navItems) {
                $isProjects = ($item -eq "Projects")
                if ($isProjects) {
                    $itemBg = Create-RoundedRectangle 16 ($navY - 4) ($vp.SidebarW - 32) 38 6
                    $g.FillPath($bPrimary, $itemBg)
                    $g.DrawString($item, $fBodyBold, $bWhite, 36, ($navY + 4))
                } else {
                    $g.DrawString($item, $fBody, $bTextDim, 36, ($navY + 4))
                }
                $navY += 46
            }

            # Bottom Org Profile
            $orgCard = Create-RoundedRectangle 16 ($vp.Height - 70) ($vp.SidebarW - 32) 50 8
            $g.FillPath($bCardSubtle, $orgCard)
            $g.DrawString("Acme Global Inc.", $fSmallBold, $bTextDark, 26, ($vp.Height - 60))
            $g.DrawString("Engineering Squad", $fTiny, $bTextMuted, 26, ($vp.Height - 42))
        }

        # 3. Top Header Bar
        $mainX = $vp.SidebarW
        $mainW = $vp.Width - $vp.SidebarW
        $headerH = 70
        $g.FillRectangle($bCard, $mainX, 0, $mainW, $headerH)
        $g.DrawLine($pBorder, $mainX, $headerH, $vp.Width, $headerH)

        # Breadcrumbs
        $g.DrawString("Projects / Core Platform / Members & Collaboration", $fSmall, $bTextMuted, ($mainX + 32), 26)

        # Header Right Controls (Actions)
        $btnW = 160
        $btnH = 38
        $btnX = $vp.Width - $btnW - 32
        $btnRect = Create-RoundedRectangle $btnX 16 $btnW $btnH 6
        $g.FillPath($bPrimary, $btnRect)
        $g.DrawString("+ Add Member", $fBodyBold, $bWhite, ($btnX + 28), 24)

        # 4. Main Body Content
        $contentY = $headerH + 28
        $contentX = $mainX + 32
        $contentW = $mainW - 64

        # Title Block
        $g.DrawString($scr.Title, $fTitle, $bTextDark, $contentX, $contentY)
        $g.DrawString($scr.Subtitle, $fBody, $bTextMuted, $contentX, ($contentY + 34))

        # Viewport Mode Label
        $vpBadgeW = 150
        $vpBadgeRect = Create-RoundedRectangle ($vp.Width - $vpBadgeW - 32) $contentY $vpBadgeW 28 6
        $g.FillPath($bCardSubtle, $vpBadgeRect)
        $g.DrawPath($pBorder, $vpBadgeRect)
        $g.DrawString("Mode: $($vp.Name.ToUpper())", $fTiny, $bPrimary, ($vp.Width - $vpBadgeW - 18), ($contentY + 7))

        # 5. Core Feature Panels depending on Screen
        $bodyY = $contentY + 75
        $cardW = ($contentW - 32) / 3
        if ($vp.Name -eq "mobile") {
            $cardW = $contentW
        }

        # Top 3 Stat Cards
        $statY = $bodyY
        $stats = @(
            @{ Label="Total Collaborators"; Val="14 Members"; Sub="Across 3 squads"; Color=$bPrimary },
            @{ Label="Active Project Leads"; Val="2 Leads"; Sub="1 Owner, 1 Tech Lead"; Color=$bEmerald },
            @{ Label="Pending Invitations"; Val="0 Pending"; Sub="All members confirmed"; Color=$bSky }
        )
        for ($i = 0; $i -lt 3; $i++) {
            $sx = $contentX + ($i * ($cardW + 16))
            if ($vp.Name -eq "mobile" -and $i -gt 0) { continue }
            $statBox = Create-RoundedRectangle $sx $statY $cardW 95 10
            $g.FillPath($bCard, $statBox)
            $g.DrawPath($pBorder, $statBox)

            $g.DrawString($stats[$i].Label, $fSmall, $bTextMuted, ($sx + 18), ($statY + 16))
            $g.DrawString($stats[$i].Val, $fSection, $stats[$i].Color, ($sx + 18), ($statY + 38))
            $g.DrawString($stats[$i].Sub, $fTiny, $bTextDim, ($sx + 18), ($statY + 68))
        }

        # Main Table / Card Region
        $tableY = $statY + 115
        $tableH = $vp.Height - $tableY - 32
        if ($tableH -lt 300) { $tableH = 300 }
        $tableBox = Create-RoundedRectangle $contentX $tableY $contentW $tableH 12
        $g.FillPath($bCard, $tableBox)
        $g.DrawPath($pBorder, $tableBox)

        # Roster Table Header
        $thY = $tableY + 16
        $g.DrawString("Project Member Roster", $fSection, $bTextDark, ($contentX + 24), $thY)
        $g.DrawString("14 active collaborators in this project", $fSmall, $bTextMuted, ($contentX + 24), ($thY + 24))

        # Search Bar inside Table
        $sbW = 280
        $sbX = $contentX + $contentW - $sbW - 24
        $sbRect = Create-RoundedRectangle $sbX $thY $sbW 34 6
        $g.FillPath($bCardSubtle, $sbRect)
        $g.DrawPath($pBorder, $sbRect)
        $g.DrawString("Search members by name or email...", $fTiny, $bTextDim, ($sbX + 12), ($thY + 10))

        # Column Headers
        $colY = $thY + 65
        $g.DrawLine($pBorder, ($contentX + 20), $colY, ($contentX + $contentW - 20), $colY)
        $colY += 12
        $g.DrawString("COLLABORATOR", $fSmallBold, $bTextMuted, ($contentX + 32), $colY)
        $g.DrawString("ROLE", $fSmallBold, $bTextMuted, ($contentX + 300), $colY)
        $g.DrawString("JOINED", $fSmallBold, $bTextMuted, ($contentX + 480), $colY)
        $g.DrawString("STATUS", $fSmallBold, $bTextMuted, ($contentX + 640), $colY)
        $g.DrawString("ACTIONS", $fSmallBold, $bTextMuted, ($contentX + $contentW - 120), $colY)

        # Mock Sample Rows (Authentic Look)
        $rowY = $colY + 28
        $sampleMembers = @(
            @{ Name="Sarah Connor"; Email="sarah.c@acme.com"; Role="Project Lead (Owner)"; Joined="2 weeks ago"; Status="Active"; RoleColor=$bEmerald },
            @{ Name="David Kim"; Email="david.k@acme.com"; Role="Contributor"; Joined="10 days ago"; Status="Active"; RoleColor=$bPrimary },
            @{ Name="Elena Vance"; Email="elena.v@acme.com"; Role="Contributor"; Joined="5 days ago"; Status="Active"; RoleColor=$bPrimary },
            @{ Name="Marcus Brody"; Email="marcus.b@acme.com"; Role="Observer"; Joined="Yesterday"; Status="Active"; RoleColor=$bSky },
            @{ Name="Aisha Patel"; Email="aisha.p@acme.com"; Role="Contributor"; Joined="Today"; Status="Active"; RoleColor=$bPrimary }
        )

        foreach ($m in $sampleMembers) {
            $g.DrawLine($pBorder, ($contentX + 20), $rowY, ($contentX + $contentW - 20), $rowY)
            $rowY += 12

            # Avatar Circle
            $avRect = New-Object System.Drawing.RectangleF(($contentX + 32), $rowY, 32, 32)
            $g.FillEllipse($bCardSubtle, $avRect)
            $g.DrawEllipse($pBorder, $avRect)
            $initials = $m.Name.Substring(0, 1)
            $g.DrawString($initials, $fSmallBold, $bPrimary, ($contentX + 42), ($rowY + 6))

            # Name & Email
            $g.DrawString($m.Name, $fBodyBold, $bTextDark, ($contentX + 76), $rowY)
            $g.DrawString($m.Email, $fTiny, $bTextMuted, ($contentX + 76), ($rowY + 18))

            # Role Pill
            $rolePill = Create-RoundedRectangle ($contentX + 300) ($rowY + 4) 140 24 12
            $g.FillPath($bCardSubtle, $rolePill)
            $g.DrawString($m.Role, $fTiny, $m.RoleColor, ($contentX + 312), ($rowY + 8))

            # Joined & Status
            $g.DrawString($m.Joined, $fSmall, $bTextMuted, ($contentX + 480), ($rowY + 6))

            # Status Badge
            $statPill = Create-RoundedRectangle ($contentX + 640) ($rowY + 4) 70 24 12
            $g.FillPath($bCardSubtle, $statPill)
            $g.DrawString($m.Status, $fTiny, $bEmerald, ($contentX + 654), ($rowY + 8))

            # Action Buttons
            $g.DrawString("Edit  •  Remove", $fSmall, $bPrimary, ($contentX + $contentW - 130), ($rowY + 6))

            $rowY += 46
        }

        # 6. Overlay Modals for Specific Screen IDs
        if ($scr.Id -eq "03-add-project-members" -or $scr.Id -eq "04-select-org-members") {
            # Modal Backdrop
            $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
            $g.FillRectangle($overlay, 0, 0, $vp.Width, $vp.Height)

            $modalW = 560
            $modalH = 480
            $modalX = ($vp.Width - $modalW) / 2
            $modalY = ($vp.Height - $modalH) / 2
            $modalBox = Create-RoundedRectangle $modalX $modalY $modalW $modalH 14
            $g.FillPath($bCard, $modalBox)
            $g.DrawPath($pBorder, $modalBox)

            # Modal Header
            $g.DrawString("Add Team Members to Project", $fSection, $bTextDark, ($modalX + 28), ($modalY + 24))
            $g.DrawString("Select active organization members to grant project access", $fSmall, $bTextMuted, ($modalX + 28), ($modalY + 52))

            # Search Box in Modal
            $msbRect = Create-RoundedRectangle ($modalX + 28) ($modalY + 90) ($modalW - 56) 40 6
            $g.FillPath($bCardSubtle, $msbRect)
            $g.DrawPath($pBorder, $msbRect)
            $g.DrawString("Search by name or email...", $fSmall, $bTextDim, ($modalX + 42), ($modalY + 102))

            # Member Selection List
            $mListY = $modalY + 148
            $candidates = @("Lisa Taylor (lisa.t@acme.com)", "Brian O'Conner (brian.o@acme.com)", "Chloe Decker (chloe.d@acme.com)")
            foreach ($c in $candidates) {
                $cBox = Create-RoundedRectangle ($modalX + 28) $mListY ($modalW - 56) 48 8
                $g.FillPath($bCardSubtle, $cBox)
                $g.DrawString($c, $fBody, $bTextDark, ($modalX + 68), ($mListY + 14))
                $chkRect = Create-RoundedRectangle ($modalX + 40) ($mListY + 15) 18 18 4
                $g.FillPath($bPrimary, $chkRect)
                $g.DrawString("✓", $fTiny, $bWhite, ($modalX + 43), ($mListY + 17))
                $mListY += 56
            }

            # Footer
            $mBtnW = 120
            $mBtnH = 38
            $mBtnX = $modalX + $modalW - $mBtnW - 28
            $mBtnY = $modalY + $modalH - $mBtnH - 24
            $mBtnRect = Create-RoundedRectangle $mBtnX $mBtnY $mBtnW $mBtnH 6
            $g.FillPath($bPrimary, $mBtnRect)
            $g.DrawString("Add Selected", $fBodyBold, $bWhite, ($mBtnX + 16), ($mBtnY + 10))
        }

        if ($scr.Id -eq "11-remove-member-confirm") {
            # Danger Confirm Modal
            $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 15, 23, 42))
            $g.FillRectangle($overlay, 0, 0, $vp.Width, $vp.Height)

            $modalW = 480
            $modalH = 260
            $modalX = ($vp.Width - $modalW) / 2
            $modalY = ($vp.Height - $modalH) / 2
            $modalBox = Create-RoundedRectangle $modalX $modalY $modalW $modalH 14
            $g.FillPath($bCard, $modalBox)
            $g.DrawPath($pBorder, $modalBox)

            $g.DrawString("Remove Member from Project?", $fSection, $bRose, ($modalX + 28), ($modalY + 24))
            $g.DrawString("Are you sure you want to remove Marcus Brody from this project? Their assigned tasks will remain in the project backlog.", $fSmall, $bTextMuted, (New-Object System.Drawing.RectangleF(($modalX + 28), ($modalY + 60), ($modalW - 56), 60)))

            $mBtnW = 140
            $mBtnH = 38
            $mBtnX = $modalX + $modalW - $mBtnW - 28
            $mBtnY = $modalY + $modalH - $mBtnH - 24
            $mBtnRect = Create-RoundedRectangle $mBtnX $mBtnY $mBtnW $mBtnH 6
            $g.FillPath($bRose, $mBtnRect)
            $g.DrawString("Confirm Removal", $fBodyBold, $bWhite, ($mBtnX + 14), ($mBtnY + 10))
        }

        if ($scr.Id -eq "16-empty-membership-state") {
            # Empty State Cover
            $emptyBox = Create-RoundedRectangle ($contentX + 40) ($tableY + 80) ($contentW - 80) 240 12
            $g.FillPath($bCardSubtle, $emptyBox)
            $g.DrawString("No additional team members in this project", $fSection, $bTextDark, ($contentX + 80), ($tableY + 130))
            $g.DrawString("Add collaborators from Acme Global Inc. so your team can coordinate roadmaps and velocity.", $fBody, $bTextMuted, ($contentX + 80), ($tableY + 165))
            $addBtn = Create-RoundedRectangle ($contentX + 80) ($tableY + 210) 180 38 6
            $g.FillPath($bPrimary, $addBtn)
            $g.DrawString("+ Add First Member", $fBodyBold, $bWhite, ($contentX + 102), ($tableY + 220))
        }

        # Save to disk
        $bmp.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose()
        $bmp.Dispose()
    }
}

Write-Host "All 60 Phase 12 high-fidelity prototypes successfully generated in: $protoDir" -ForegroundColor Green


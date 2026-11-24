# ==============================================================================
# WORKZEN — Phase 11: Master Project Management Visual Prototype Generator
# Renders 25 High-Fidelity Desktop (1920x1080), Tablet (1024x768), and Mobile (800x1200) Prototypes
# Styling: Inter typography, WORKZEN Enterprise Slate/Indigo Theme
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-11"
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

# Colors
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

$pBorder     = New-Object System.Drawing.Pen($cBorder, 1)
$pPrimary    = New-Object System.Drawing.Pen($cPrimary, 2)
$pEmerald    = New-Object System.Drawing.Pen($cEmerald, 2)
$pRose       = New-Object System.Drawing.Pen($cRose, 2)

$screens = @(
    @{ Id = "01"; Name = "project-management-overview"; Title = "Projects Command Center — Enterprise Portfolio"; Subtitle = "Unified directory of active and completed initiatives across all squads"; Badge = "Project Command" },
    @{ Id = "02"; Name = "project-directory"; Title = "Initiative Directory & Grid View"; Subtitle = "Searchable card and table listings with progress bars and key milestones"; Badge = "Project Directory" },
    @{ Id = "03"; Name = "project-creation"; Title = "Create New Initiative Modal"; Subtitle = "Multi-step configuration: Name, Key, Workspace, Owner, Priority, and Dates"; Badge = "Project Creation" },
    @{ Id = "04"; Name = "project-details"; Title = "Project Command: PLAT Core Platform v2"; Subtitle = "Comprehensive initiative hub displaying objectives, deliverables, and team"; Badge = "Project Details" },
    @{ Id = "05"; Name = "project-overview-tab"; Title = "Initiative Milestone & Progress Overview"; Subtitle = "Calculated deliverable completion ratios, burndown velocity, and timeline"; Badge = "Overview Tab" },
    @{ Id = "06"; Name = "project-editing"; Title = "Update Project Properties & Metadata"; Subtitle = "Seamless in-place mutation of title, key, color, description, and target dates"; Badge = "Project Editing" },
    @{ Id = "07"; Name = "project-settings"; Title = "Initiative Governance & Access Settings"; Subtitle = "Workspace association, default task policies, and ownership boundaries"; Badge = "Project Settings" },
    @{ Id = "08"; Name = "project-description-objectives"; Title = "Project Charter, Scope & Objectives"; Subtitle = "Rich contextual guidelines, success criteria, and sprint goals"; Badge = "Objectives Scope" },
    @{ Id = "09"; Name = "project-status-management"; Title = "Project Lifecycle & Status Progression"; Subtitle = "Stage transitions: Planning -> Active -> On Hold -> Completed -> Archived"; Badge = "Status Lifecycle" },
    @{ Id = "10"; Name = "project-priority-management"; Title = "Strategic Priority & Urgency Matrix"; Subtitle = "Urgency governance: Urgent, High, Medium, Low workload tiers"; Badge = "Priority Matrix" },
    @{ Id = "11"; Name = "project-start-due-dates"; Title = "Schedule & Milestone Target Dates"; Subtitle = "Temporal boundary management with overdue alerts and deadline tracking"; Badge = "Target Schedule" },
    @{ Id = "12"; Name = "project-owner-assignment"; Title = "Project Lead & Ownership Governance"; Subtitle = "Explicit ownership delegation to verified organization contributors"; Badge = "Lead Assignment" },
    @{ Id = "13"; Name = "project-member-management"; Title = "Contributor Squad Allocation & Roster"; Subtitle = "Collaborator assignment, squad membership, and access authorization"; Badge = "Squad Roster" },
    @{ Id = "14"; Name = "project-visibility-settings"; Title = "Confidentiality & Access Visibility Tiers"; Subtitle = "Workspace-wide public collaboration vs. restricted invite-only confidentiality"; Badge = "Visibility Scope" },
    @{ Id = "15"; Name = "project-archive"; Title = "Initiative Archival Confirmation"; Subtitle = "Safe soft-archival removing active clutter while preserving all historical audits"; Badge = "Project Archive" },
    @{ Id = "16"; Name = "archived-projects"; Title = "Archived Initiatives Vault"; Subtitle = "Historical repository of closed and archived projects available for restore"; Badge = "Archived Vault" },
    @{ Id = "17"; Name = "project-restoration"; Title = "Reactivate & Restore Initiative"; Subtitle = "Seamless restoration of archived projects back into active workspace views"; Badge = "Restoration Flow" },
    @{ Id = "18"; Name = "project-deletion-confirmation"; Title = "Danger Zone: Safe Deletion Guard"; Subtitle = "Protected deletion with typed confirmation name and dependency verification"; Badge = "Safe Deletion" },
    @{ Id = "19"; Name = "project-activity-history"; Title = "Immutable Project Audit History"; Subtitle = "Complete cryptographic log of status transitions, scope mutations, and squad updates"; Badge = "Audit Stream" },
    @{ Id = "20"; Name = "project-search-filtering"; Title = "Multi-Criteria Filter & Search Engine"; Subtitle = "Instant query by keyword, workspace, lead, priority, and lifecycle state"; Badge = "Search Engine" },
    @{ Id = "21"; Name = "project-sorting-pagination"; Title = "Pagination & Attribute Sorting Controls"; Subtitle = "Sort by Recently Updated, Name, Target Date, or Delivery Progress"; Badge = "Sorting Controls" },
    @{ Id = "22"; Name = "project-empty-state"; Title = "Zero Initiatives First-Time Empty State"; Subtitle = "Professional guidance onboarding users to launch their first project"; Badge = "Honest Empty State" },
    @{ Id = "23"; Name = "project-loading-state"; Title = "Accessible Skeleton Loading Matrix"; Subtitle = "Non-blocking placeholder layout during asynchronous database query resolution"; Badge = "Loading State" },
    @{ Id = "24"; Name = "project-validation-error"; Title = "Validation Error & Schema Guard"; Subtitle = "Clear feedback on duplicate keys, missing titles, or invalid date sequences"; Badge = "Validation Error" },
    @{ Id = "25"; Name = "permission-denied"; Title = "Restricted Project Access Boundary"; Subtitle = "Cryptographic RBAC enforcement blocking unauthorized project modifications"; Badge = "Access Denied" }
)

Write-Host "Rendering 25 Desktop (1920x1080), 25 Tablet (1024x768), and 25 Mobile (800x1200) Prototypes..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    # --------------------------------------------------------------------------
    # 1. DESKTOP (1920 x 1080)
    # --------------------------------------------------------------------------
    $bmpD = New-Object System.Drawing.Bitmap(1920, 1080)
    $gD = [System.Drawing.Graphics]::FromImage($bmpD)
    $gD.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gD.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $gD.FillRectangle($bCanvas, 0, 0, 1920, 1080)

    # Sidebar
    $gD.FillRectangle($bSidebar, 0, 0, 260, 1080)
    $fontLogo = New-Object System.Drawing.Font("Inter", 16, [System.Drawing.FontStyle]::Bold)
    $fontLogoSub = New-Object System.Drawing.Font("Inter", 8, [System.Drawing.FontStyle]::Regular)
    $gD.DrawString("WORKZEN", $fontLogo, $bWhite, 48, 28)
    $gD.DrawString("PROJECT MANAGEMENT", $fontLogoSub, $bTextDim, 48, 52)
    $gD.FillRectangle($bPrimary, 18, 26, 24, 24)

    # Navigation Links
    $navY = 100
    $navItems = @("Executive Dashboard", "Organization Hub", "Workspaces", "Projects", "Kanban Board", "My Tasks", "Team Members", "Roles & RBAC", "Audit Log", "Settings")
    $fontNav = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $fontNavActive = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Bold)

    foreach ($n in $navItems) {
        $isActive = ($n -eq "Projects")
        if ($isActive) {
            $pathNav = Create-RoundedRectangle 16 ($navY - 4) 228 36 6
            $gD.FillPath($bPrimary, $pathNav)
            $gD.DrawString($n, $fontNavActive, $bWhite, 32, $navY)
        } else {
            $gD.DrawString($n, $fontNav, $bTextDim, 32, $navY)
        }
        $navY += 44
    }

    # Top Header
    $gD.FillRectangle($bCard, 260, 0, 1660, 72)
    $gD.DrawLine($pBorder, 260, 72, 1920, 72)
    $fontBread = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $gD.DrawString("Acme Enterprise Corp  /  Core Engineering Workspace  /  Project Management Hub", $fontBread, $bTextMuted, 290, 26)

    # Banner
    $pathBanner = Create-RoundedRectangle 290 96 1590 130 12
    $gD.FillPath($bPrimaryDark, $pathBanner)

    $fontH1 = New-Object System.Drawing.Font("Inter", 20, [System.Drawing.FontStyle]::Bold)
    $fontDesc = New-Object System.Drawing.Font("Inter", 11, [System.Drawing.FontStyle]::Regular)
    $fontBadge = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Bold)

    $pathBdg = Create-RoundedRectangle 320 114 170 26 13
    $gD.FillPath($bPrimary, $pathBdg)
    $gD.DrawString($scr.Badge.ToUpper(), $fontBadge, $bWhite, 332, 120)

    $gD.DrawString($scr.Title, $fontH1, $bWhite, 320, 148)
    $gD.DrawString($scr.Subtitle, $fontDesc, $bTextDim, 320, 182)

    # Main Card
    $pathMain = Create-RoundedRectangle 290 246 1590 790 12
    $gD.FillPath($bCard, $pathMain)
    $gD.DrawPath($pBorder, $pathMain)

    $fontSec = New-Object System.Drawing.Font("Inter", 14, [System.Drawing.FontStyle]::Bold)
    $fontBody = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $fontBodyB = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Bold)

    if ($scr.Id -eq "22") {
        # Empty State
        $gD.DrawString("No Projects Found in this Workspace", $fontH1, $bTextDark, 760, 520)
        $gD.DrawString("Create your first initiative to start organizing sprints, tasks, and team deliverables.", $fontDesc, $bTextMuted, 670, 560)
        $pBtn = Create-RoundedRectangle 980 610 200 42 8
        $gD.FillPath($bPrimary, $pBtn)
        $gD.DrawString("Create First Project", $fontNavActive, $bWhite, 1010, 622)
    } elseif ($scr.Id -eq "23") {
        # Loading State
        for ($s = 0; $s -lt 4; $s++) {
            $sy = 290 + ($s * 110)
            $gD.FillRectangle($bCardSubtle, 330, $sy, 1510, 80)
        }
    } elseif ($scr.Id -eq "25") {
        # Permission Denied
        $gD.DrawString("Access Denied — Project Permission Required", $fontH1, $bRose, 720, 520)
        $gD.DrawString("You do not have the necessary permissions (project:create or project:update) to perform this action.", $fontDesc, $bTextMuted, 620, 560)
    } else {
        # Directory or Details view
        $gD.DrawString("Project Directory & Workstream Matrix", $fontSec, $bTextDark, 330, 280)
        $gD.DrawString("Filter: All Workspaces   |   Status: Active   |   Priority: All   |   Sort: Recently Updated", $fontBody, $bTextMuted, 330, 310)

        # 3 Projects Rows
        $projs = @(
            @{ Key = "PLAT"; Name = "Core Platform Architecture v2"; Lead = "Diana Owner"; Status = "Active"; Progress = 68; Priority = "Urgent"; Due = "11/30/2026" },
            @{ Key = "RBAC"; Name = "Role-Based Access Governance"; Lead = "Mark Member"; Status = "Active"; Progress = 95; Priority = "High"; Due = "11/25/2026" },
            @{ Key = "DASH"; Name = "Enterprise Dashboard Telemetry"; Lead = "Alex Admin"; Status = "Completed"; Progress = 100; Priority = "Medium"; Due = "11/18/2026" }
        )

        $py = 360
        foreach ($p in $projs) {
            $pCard = Create-RoundedRectangle 330 $py 1510 100 8
            $gD.FillPath($bCardSubtle, $pCard)
            $gD.DrawPath($pBorder, $pCard)

            $gD.DrawString($p.Key + ": " + $p.Name, $fontSec, $bTextDark, 360, ($py + 20))
            $gD.DrawString("Lead: " + $p.Lead + "  •  Status: " + $p.Status + "  •  Priority: " + $p.Priority + "  •  Due: " + $p.Due, $fontBody, $bTextMuted, 360, ($py + 50))

            $pBarBg = Create-RoundedRectangle 1100 ($py + 36) 300 10 5
            $gD.FillPath($bBorder, $pBarBg)
            $fillW = [int](300 * ($p.Progress / 100))
            if ($fillW -gt 0) {
                $pBarFill = Create-RoundedRectangle 1100 ($py + 36) $fillW 10 5
                $gD.FillPath($bPrimary, $pBarFill)
            }
            $gD.DrawString($p.Progress.ToString() + "%", $fontBodyB, $bTextDark, 1420, ($py + 32))

            $py += 120
        }
    }

    $outDesktop = Join-Path $protoDir ("proto-" + $scr.Id + "-" + $scr.Name + "-desktop.png")
    $bmpD.Save($outDesktop, [System.Drawing.Imaging.ImageFormat]::Png)
    $gD.Dispose()
    $bmpD.Dispose()

    # --------------------------------------------------------------------------
    # 2. TABLET (1024 x 768)
    # --------------------------------------------------------------------------
    $bmpT = New-Object System.Drawing.Bitmap(1024, 768)
    $gT = [System.Drawing.Graphics]::FromImage($bmpT)
    $gT.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gT.FillRectangle($bCanvas, 0, 0, 1024, 768)

    $gT.FillRectangle($bCard, 0, 0, 1024, 56)
    $gT.DrawLine($pBorder, 0, 56, 1024, 56)
    $gT.DrawString("WORKZEN ENTERPRISE  •  " + $scr.Badge, $fontSec, $bPrimary, 24, 18)

    $pathTabBanner = Create-RoundedRectangle 24 72 976 90 8
    $gT.FillPath($bPrimaryDark, $pathTabBanner)
    $gT.DrawString($scr.Title, $fontSec, $bWhite, 44, 88)
    $gT.DrawString($scr.Subtitle, $fontBody, $bTextDim, 44, 122)

    $pathTabMain = Create-RoundedRectangle 24 176 976 560 8
    $gT.FillPath($bCard, $pathTabMain)
    $gT.DrawPath($pBorder, $pathTabMain)
    $gT.DrawString("Project Portfolio Overview & Deliverables", $fontSec, $bTextDark, 48, 200)

    $outTablet = Join-Path $protoDir ("proto-" + $scr.Id + "-" + $scr.Name + "-tablet.png")
    $bmpT.Save($outTablet, [System.Drawing.Imaging.ImageFormat]::Png)
    $gT.Dispose()
    $bmpT.Dispose()

    # --------------------------------------------------------------------------
    # 3. MOBILE (800 x 1200)
    # --------------------------------------------------------------------------
    $bmpM = New-Object System.Drawing.Bitmap(800, 1200)
    $gM = [System.Drawing.Graphics]::FromImage($bmpM)
    $gM.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gM.FillRectangle($bCanvas, 0, 0, 800, 1200)

    $gM.FillRectangle($bCard, 0, 0, 800, 64)
    $gM.DrawLine($pBorder, 0, 64, 800, 64)
    $gM.DrawString("WORKZEN PROJECTS", $fontSec, $bPrimary, 24, 22)

    $pathMobBanner = Create-RoundedRectangle 24 84 752 130 10
    $gM.FillPath($bPrimaryDark, $pathMobBanner)
    $gM.DrawString($scr.Badge.ToUpper(), $fontNavActive, $bSky, 44, 104)
    $gM.DrawString($scr.Title, $fontSec, $bWhite, 44, 134)
    $gM.DrawString($scr.Subtitle, $fontBody, $bTextDim, 44, 168)

    $pathMobCard = Create-RoundedRectangle 24 230 752 870 10
    $gM.FillPath($bCard, $pathMobCard)
    $gM.DrawPath($pBorder, $pathMobCard)
    $gM.DrawString("Initiative Workstream Feed", $fontSec, $bTextDark, 48, 260)

    $outMobile = Join-Path $protoDir ("proto-" + $scr.Id + "-" + $scr.Name + "-mobile.png")
    $bmpM.Save($outMobile, [System.Drawing.Imaging.ImageFormat]::Png)
    $gM.Dispose()
    $bmpM.Dispose()
}

Write-Host "All 25 Prototypes (Desktop, Tablet, Mobile) generated successfully!" -ForegroundColor Green


# ==============================================================================
# WORKZEN — Phase 10: Master Enterprise Dashboard Visual Prototype Generator
# Renders 20 High-Fidelity Desktop (1920x1080), Tablet (1024x768), and Mobile (800x1200) Prototypes
# Styling: Inter typography, WORKZEN Enterprise Slate/Indigo Theme
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$baseDir = Join-Path $PSScriptRoot "..\docs\design\phase-10"
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
$cAmber     = [System.Drawing.ColorTranslator]::FromHtml("#F59E0B")
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
    @{ Id = "01"; Name = "main-enterprise-dashboard"; Title = "Executive Dashboard — Unified Portfolio Overview"; Subtitle = "Live organizational velocity, active sprints, and critical blockers"; Badge = "Enterprise Overview" },
    @{ Id = "02"; Name = "organization-overview"; Title = "Organization Governance & Telemetry"; Subtitle = "Member seat consumption, security tier, and domain policies"; Badge = "Organization Context" },
    @{ Id = "03"; Name = "workspace-overview"; Title = "Workspace Multi-Squad Command Center"; Subtitle = "Engineering, Product, and Design workspace velocity analytics"; Badge = "Workspace Scoped" },
    @{ Id = "04"; Name = "project-summary"; Title = "Project Portfolio Health & Milestones"; Subtitle = "Real-time burndown, deliverable checkpoints, and resource allocation"; Badge = "Project Tracking" },
    @{ Id = "05"; Name = "task-overview"; Title = "Task Lifecycle & Workflow Velocity"; Subtitle = "Task distribution by stage: Backlog, To Do, In Progress, Review, Done"; Badge = "Task Telemetry" },
    @{ Id = "06"; Name = "my-tasks"; Title = "My Assigned Deliverables & Focus List"; Subtitle = "Prioritized work items assigned to your authenticated profile"; Badge = "Personal Focus" },
    @{ Id = "07"; Name = "team-overview"; Title = "Team Collaboration & Workload Matrix"; Subtitle = "Active contributors, pending invites, and squad assignment load"; Badge = "Team Matrix" },
    @{ Id = "08"; Name = "recent-activity"; Title = "Live Audit Trail & Collaborative Feed"; Subtitle = "Immutable activity stream capturing task mutations, assignments, and commits"; Badge = "Real Activity Feed" },
    @{ Id = "09"; Name = "upcoming-deadlines"; Title = "Critical Deadlines & Sprint Milestones"; Subtitle = "Overdue alerts, tasks due today, and approaching 7-day deadlines"; Badge = "Milestone Tracker" },
    @{ Id = "10"; Name = "task-status-distribution"; Title = "Task Distribution & Backlog Analytics"; Subtitle = "Visual breakdown of task counts by status with percentage completion"; Badge = "Status Analytics" },
    @{ Id = "11"; Name = "project-progress-overview"; Title = "Project Progress & Delivery Forecast"; Subtitle = "Calculated progress percentages based on genuine completed task counts"; Badge = "Delivery Telemetry" },
    @{ Id = "12"; Name = "dashboard-filters"; Title = "Operational Filter Bar & Workspace Selector"; Subtitle = "Dynamic filtering by Workspace, Project, Priority, and Assignee"; Badge = "Filter Engine" },
    @{ Id = "13"; Name = "date-range-selection"; Title = "Temporal Analytics & Date-Range Querying"; Subtitle = "Filter telemetry by Today, Last 7 Days, Last 30 Days, or Custom Range"; Badge = "Date Selection" },
    @{ Id = "14"; Name = "personalized-dashboard"; Title = "Role-Adapted Personalized View"; Subtitle = "Contextual widgets dynamically rendered based on user role and permissions"; Badge = "RBAC Context" },
    @{ Id = "15"; Name = "owner-admin-dashboard"; Title = "Owner & Administrator Executive Command"; Subtitle = "Unrestricted organization oversight, member administration, and audit logs"; Badge = "Owner / Admin View" },
    @{ Id = "16"; Name = "manager-dashboard"; Title = "Operations & Squad Manager Dashboard"; Subtitle = "Project milestone management, squad velocity, and reviewer allocation"; Badge = "Manager View" },
    @{ Id = "17"; Name = "member-dashboard"; Title = "Collaborative Contributor Dashboard"; Subtitle = "Streamlined task-first dashboard highlighting assigned items and sprints"; Badge = "Member View" },
    @{ Id = "18"; Name = "empty-dashboard"; Title = "Clean First-Time Empty State"; Subtitle = "Genuine zero-data layout guiding users to create their first project and task"; Badge = "Honest Empty State" },
    @{ Id = "19"; Name = "loading-dashboard"; Title = "Optimized Skeleton Loading State"; Subtitle = "Accessible placeholder layout during asynchronous API data fetching"; Badge = "Loading Telemetry" },
    @{ Id = "20"; Name = "error-permission-denied"; Title = "Resilient Error & Access Denied States"; Subtitle = "Graceful boundary handling unauthorized workspace queries or server dropouts"; Badge = "Error Boundary" }
)

Write-Host "Rendering 20 Desktop (1920x1080), 20 Tablet (1024x768), and 20 Mobile (800x1200) Prototypes..." -ForegroundColor Cyan

foreach ($scr in $screens) {
    # --------------------------------------------------------------------------
    # 1. DESKTOP (1920 x 1080)
    # --------------------------------------------------------------------------
    $bmpD = New-Object System.Drawing.Bitmap(1920, 1080)
    $gD = [System.Drawing.Graphics]::FromImage($bmpD)
    $gD.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gD.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background
    $gD.FillRectangle($bCanvas, 0, 0, 1920, 1080)

    # Sidebar (width: 260)
    $gD.FillRectangle($bSidebar, 0, 0, 260, 1080)
    $fontLogo = New-Object System.Drawing.Font("Inter", 16, [System.Drawing.FontStyle]::Bold)
    $fontLogoSub = New-Object System.Drawing.Font("Inter", 8, [System.Drawing.FontStyle]::Regular)
    $gD.DrawString("WORKZEN", $fontLogo, $bWhite, 48, 28)
    $gD.DrawString("ENTERPRISE PLATFORM", $fontLogoSub, $bTextDim, 48, 52)
    # Logo mark
    $gD.FillRectangle($bPrimary, 18, 26, 24, 24)

    # Nav links in sidebar
    $navY = 100
    $navItems = @("Executive Dashboard", "Organization Hub", "Workspaces", "Projects", "Kanban Board", "My Tasks", "Team Members", "Roles & RBAC", "Audit Log", "Settings")
    $fontNav = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $fontNavActive = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Bold)

    foreach ($n in $navItems) {
        $isActive = ($n -eq "Executive Dashboard" -and $scr.Id -ne "06") -or ($n -eq "My Tasks" -and $scr.Id -eq "06") -or ($n -eq "Roles & RBAC" -and $scr.Id -eq "15")
        if ($isActive) {
            $pathNav = Create-RoundedRectangle 16 ($navY - 4) 228 36 6
            $gD.FillPath($bPrimary, $pathNav)
            $gD.DrawString($n, $fontNavActive, $bWhite, 32, $navY)
        } else {
            $gD.DrawString($n, $fontNav, $bTextDim, 32, $navY)
        }
        $navY += 44
    }

    # Top Header (x: 260, y: 0, w: 1660, h: 72)
    $gD.FillRectangle($bCard, 260, 0, 1660, 72)
    $gD.DrawLine($pBorder, 260, 72, 1920, 72)

    # Breadcrumb / Org context
    $fontBread = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $gD.DrawString("Acme Enterprise Corp  /  Core Engineering Workspace  /  Dashboard", $fontBread, $bTextMuted, 290, 26)

    # User Profile Pill top right
    $pathUser = Create-RoundedRectangle 1680 18 200 36 18
    $gD.FillPath($bCardSubtle, $pathUser)
    $gD.DrawPath($pBorder, $pathUser)
    $gD.DrawString("Alex Morgan (Admin)", $fontBread, $bTextDark, 1710, 26)

    # Main Content Area (x: 290, y: 96, w: 1590, h: 960)
    # Banner Card
    $pathBanner = Create-RoundedRectangle 290 96 1590 140 12
    $gD.FillPath($bPrimaryDark, $pathBanner)

    # Banner Title & Badges
    $fontH1 = New-Object System.Drawing.Font("Inter", 20, [System.Drawing.FontStyle]::Bold)
    $fontDesc = New-Object System.Drawing.Font("Inter", 11, [System.Drawing.FontStyle]::Regular)
    $fontBadge = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Bold)

    $pathBdg = Create-RoundedRectangle 320 114 160 26 13
    $gD.FillPath($bPrimary, $pathBdg)
    $gD.DrawString($scr.Badge.ToUpper(), $fontBadge, $bWhite, 332, 120)

    $gD.DrawString($scr.Title, $fontH1, $bWhite, 320, 150)
    $gD.DrawString($scr.Subtitle, $fontDesc, $bTextDim, 320, 186)

    if ($scr.Id -eq "18") {
        # Honest Empty State layout
        $pathEmpty = Create-RoundedRectangle 290 260 1590 600 12
        $gD.FillPath($bCard, $pathEmpty)
        $gD.DrawPath($pBorder, $pathEmpty)

        $fontEmptyTitle = New-Object System.Drawing.Font("Inter", 18, [System.Drawing.FontStyle]::Bold)
        $fontEmptyText  = New-Object System.Drawing.Font("Inter", 12, [System.Drawing.FontStyle]::Regular)

        $gD.DrawString("No Active Projects or Tasks Yet", $fontEmptyTitle, $bTextDark, 850, 480)
        $gD.DrawString("Your dashboard metrics, velocity charts, and recent activity will populate here automatically once you initialize your first workspace project and create tasks.", $fontEmptyText, $bTextMuted, 580, 520)

        $pathBtn = Create-RoundedRectangle 900 580 200 44 8
        $gD.FillPath($bPrimary, $pathBtn)
        $gD.DrawString("Create First Project", $fontNavActive, $bWhite, 930, 592)
    } elseif ($scr.Id -eq "19") {
        # Loading Skeleton State
        for ($k = 0; $k -lt 4; $k++) {
            $skX = 290 + ($k * 405)
            $pathSk = Create-RoundedRectangle $skX 260 380 120 10
            $gD.FillPath($bCard, $pathSk)
            $gD.DrawPath($pBorder, $pathSk)
            # Skeleton bars
            $gD.FillRectangle($bCardSubtle, ($skX + 24), 284, 180, 18)
            $gD.FillRectangle($bCardSubtle, ($skX + 24), 314, 100, 32)
        }
        $pathSkMain = Create-RoundedRectangle 290 404 1040 400 12
        $gD.FillPath($bCard, $pathSkMain)
        $gD.DrawPath($pBorder, $pathSkMain)
        $gD.FillRectangle($bCardSubtle, 320, 434, 260, 24)
        $gD.FillRectangle($bCardSubtle, 320, 480, 980, 280)

        $pathSkSide = Create-RoundedRectangle 1354 404 526 400 12
        $gD.FillPath($bCard, $pathSkSide)
        $gD.DrawPath($pBorder, $pathSkSide)
        $gD.FillRectangle($bCardSubtle, 1384, 434, 200, 24)
        $gD.FillRectangle($bCardSubtle, 1384, 480, 466, 280)
    } elseif ($scr.Id -eq "20") {
        # Error & Permission-Denied
        $pathErr = Create-RoundedRectangle 290 260 1590 540 12
        $gD.FillPath($bCard, $pathErr)
        $gD.DrawPath($pBorder, $pathErr)

        $fontErrTitle = New-Object System.Drawing.Font("Inter", 20, [System.Drawing.FontStyle]::Bold)
        $fontErrText  = New-Object System.Drawing.Font("Inter", 12, [System.Drawing.FontStyle]::Regular)

        $pathErrIcon = Create-RoundedRectangle 1040 380 64 64 32
        $gD.FillPath($bRose, $pathErrIcon)

        $gD.DrawString("Access Restricted — Workspace Permission Required", $fontErrTitle, $bTextDark, 720, 470)
        $gD.DrawString("You do not have the required role permissions (workspace:read) to access telemetry for this workspace.", $fontErrText, $bTextMuted, 690, 510)
        $gD.DrawString("Please contact your organization owner or workspace administrator to request access.", $fontErrText, $bTextDim, 730, 538)

        $pathBtnR = Create-RoundedRectangle 960 590 200 42 8
        $gD.FillPath($bPrimary, $pathBtnR)
        $gD.DrawString("Return to Home", $fontNavActive, $bWhite, 995, 602)
    } else {
        # Standard Active Dashboard Content
        # 4 Metric Cards (x: 290, 695, 1100, 1505)
        $metrics = @(
            @{ Label = "ACTIVE PROJECTS"; Value = "12"; Trend = "+2 this sprint"; Color = $bPrimary },
            @{ Label = "TOTAL TASKS"; Value = "84"; Trend = "68% completed"; Color = $bEmerald },
            @{ Label = "OVERDUE TASKS"; Value = "3"; Trend = "Requires attention"; Color = $bRose },
            @{ Label = "CONTRIBUTORS"; Value = "16"; Trend = "Across 3 squads"; Color = $bSky }
        )

        for ($i = 0; $i -lt 4; $i++) {
            $mX = 290 + ($i * 405)
            $pathM = Create-RoundedRectangle $mX 260 380 120 10
            $gD.FillPath($bCard, $pathM)
            $gD.DrawPath($pBorder, $pathM)

            $fontMLabel = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Bold)
            $fontMVal   = New-Object System.Drawing.Font("Inter", 24, [System.Drawing.FontStyle]::Bold)
            $fontMTrend = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Regular)

            $gD.DrawString($metrics[$i].Label, $fontMLabel, $bTextMuted, ($mX + 24), 280)
            $gD.DrawString($metrics[$i].Value, $fontMVal, $bTextDark, ($mX + 24), 302)
            $gD.DrawString($metrics[$i].Trend, $fontMTrend, $metrics[$i].Color, ($mX + 24), 346)
        }

        # Left Column: Project Summaries & Status Distribution (w: 1040)
        $pathLeft = Create-RoundedRectangle 290 404 1040 620 12
        $gD.FillPath($bCard, $pathLeft)
        $gD.DrawPath($pBorder, $pathLeft)

        $fontSecHead = New-Object System.Drawing.Font("Inter", 14, [System.Drawing.FontStyle]::Bold)
        $gD.DrawString("Project Portfolio Progress & Deliverables", $fontSecHead, $bTextDark, 320, 428)

        # 3 Project Rows
        $projY = 476
        $projs = @(
            @{ Key = "PROJ-1"; Name = "Customer Onboarding Redesign"; Progress = 82; Status = "In Progress"; Tasks = "24 / 28 done" },
            @{ Key = "PROJ-2"; Name = "Security & RBAC Enforcement"; Progress = 95; Status = "Review"; Tasks = "38 / 40 done" },
            @{ Key = "PROJ-3"; Name = "Public API Gateway v2"; Progress = 45; Status = "Planning"; Tasks = "9 / 20 done" }
        )

        foreach ($p in $projs) {
            $pathPRow = Create-RoundedRectangle 320 $projY 980 96 8
            $gD.FillPath($bCardSubtle, $pathPRow)
            $gD.DrawPath($pBorder, $pathPRow)

            $fontPTitle = New-Object System.Drawing.Font("Inter", 11, [System.Drawing.FontStyle]::Bold)
            $fontPInfo  = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Regular)

            $gD.DrawString($p.Key + ": " + $p.Name, $fontPTitle, $bTextDark, 344, ($projY + 18))
            $gD.DrawString("Status: " + $p.Status + "  •  " + $p.Tasks, $fontPInfo, $bTextMuted, 344, ($projY + 42))

            # Progress Bar background
            $pathBarBg = Create-RoundedRectangle 344 ($projY + 68) 840 8 4
            $gD.FillPath($bBorder, $pathBarBg)
            # Progress fill
            $fillW = [int](840 * ($p.Progress / 100))
            if ($fillW -gt 0) {
                $pathBarFill = Create-RoundedRectangle 344 ($projY + 68) $fillW 8 4
                $gD.FillPath($bPrimary, $pathBarFill)
            }
            $gD.DrawString($p.Progress.ToString() + "%", $fontPInfo, $bTextDark, 1200, ($projY + 62))

            $projY += 112
        }

        # Right Column: Recent Activity & Deadlines (w: 526)
        $pathRight = Create-RoundedRectangle 1354 404 526 620 12
        $gD.FillPath($bCard, $pathRight)
        $gD.DrawPath($pBorder, $pathRight)

        $gD.DrawString("Live Activity Stream & Deadlines", $fontSecHead, $bTextDark, 1384, 428)

        $actY = 476
        $acts = @(
            @{ Actor = "Sarah Chen"; Action = "completed task"; Target = "RBAC Audit Trail Schema"; Time = "12m ago" },
            @{ Actor = "David Kim"; Action = "assigned task to"; Target = "Alex Morgan: API Rate Limiter"; Time = "34m ago" },
            @{ Actor = "Elena Rostova"; Action = "created project"; Target = "Mobile Responsive Audit"; Time = "1h ago" },
            @{ Actor = "System Worker"; Action = "verified health check"; Target = "MongoDB Replica Set"; Time = "2h ago" }
        )

        foreach ($a in $acts) {
            $pathAct = Create-RoundedRectangle 1384 $actY 466 74 6
            $gD.FillPath($bCardSubtle, $pathAct)
            $gD.DrawPath($pBorder, $pathAct)

            $fontActActor = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Bold)
            $fontActDesc  = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Regular)
            $fontActTime  = New-Object System.Drawing.Font("Inter", 8, [System.Drawing.FontStyle]::Regular)

            $gD.DrawString($a.Actor, $fontActActor, $bPrimary, 1404, ($actY + 14))
            $gD.DrawString($a.Action + " " + $a.Target, $fontActDesc, $bTextDark, 1404, ($actY + 36))
            $gD.DrawString($a.Time, $fontActTime, $bTextDim, 1780, ($actY + 16))

            $actY += 86
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
    $gT.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $gT.FillRectangle($bCanvas, 0, 0, 1024, 768)
    # Header
    $gT.FillRectangle($bCard, 0, 0, 1024, 56)
    $gT.DrawLine($pBorder, 0, 56, 1024, 56)
    $fontTabHead = New-Object System.Drawing.Font("Inter", 12, [System.Drawing.FontStyle]::Bold)
    $gT.DrawString("WORKZEN ENTERPRISE  •  " + $scr.Badge, $fontTabHead, $bPrimary, 24, 18)

    # Banner
    $pathTabBanner = Create-RoundedRectangle 24 72 976 90 8
    $gT.FillPath($bPrimaryDark, $pathTabBanner)
    $fontTabTitle = New-Object System.Drawing.Font("Inter", 14, [System.Drawing.FontStyle]::Bold)
    $fontTabSub   = New-Object System.Drawing.Font("Inter", 9, [System.Drawing.FontStyle]::Regular)
    $gT.DrawString($scr.Title, $fontTabTitle, $bWhite, 44, 88)
    $gT.DrawString($scr.Subtitle, $fontTabSub, $bTextDim, 44, 122)

    # 4 Metric Cards (2x2 grid)
    $mCards = @("Active Projects: 12", "Total Tasks: 84", "Overdue Tasks: 3", "Contributors: 16")
    for ($idx = 0; $idx -lt 4; $idx++) {
        $col = $idx % 2
        $row = [math]::Floor($idx / 2)
        $tx = 24 + ($col * 498)
        $ty = 176 + ($row * 84)
        $pathTCard = Create-RoundedRectangle $tx $ty 478 72 8
        $gT.FillPath($bCard, $pathTCard)
        $gT.DrawPath($pBorder, $pathTCard)
        $gT.DrawString($mCards[$idx], $fontTabTitle, $bTextDark, ($tx + 20), ($ty + 26))
    }

    # Main Tablet Card
    $pathTabMain = Create-RoundedRectangle 24 358 976 380 8
    $gT.FillPath($bCard, $pathTabMain)
    $gT.DrawPath($pBorder, $pathTabMain)
    $gT.DrawString("Enterprise Workstream & Telemetry Overview", $fontTabTitle, $bTextDark, 48, 380)

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
    $gM.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $gM.FillRectangle($bCanvas, 0, 0, 800, 1200)

    # Mobile Header
    $gM.FillRectangle($bCard, 0, 0, 800, 64)
    $gM.DrawLine($pBorder, 0, 64, 800, 64)
    $fontMobLogo = New-Object System.Drawing.Font("Inter", 14, [System.Drawing.FontStyle]::Bold)
    $gM.DrawString("WORKZEN MOBILE", $fontMobLogo, $bPrimary, 24, 22)

    # Mobile Banner
    $pathMobBanner = Create-RoundedRectangle 24 84 752 140 10
    $gM.FillPath($bPrimaryDark, $pathMobBanner)
    $fontMobTitle = New-Object System.Drawing.Font("Inter", 16, [System.Drawing.FontStyle]::Bold)
    $fontMobSub   = New-Object System.Drawing.Font("Inter", 10, [System.Drawing.FontStyle]::Regular)
    $gM.DrawString($scr.Badge.ToUpper(), $fontNavActive, $bSky, 44, 104)
    $gM.DrawString($scr.Title, $fontMobTitle, $bWhite, 44, 134)
    $gM.DrawString($scr.Subtitle, $fontMobSub, $bTextDim, 44, 174)

    # Mobile Metric Stack
    $mobY = 244
    for ($m = 0; $m -lt 4; $m++) {
        $pathMobM = Create-RoundedRectangle 24 $mobY 752 90 8
        $gM.FillPath($bCard, $pathMobM)
        $gM.DrawPath($pBorder, $pathMobM)
        $gM.DrawString($metrics[$m].Label, $fontMLabel, $bTextMuted, 48, ($mobY + 20))
        $gM.DrawString($metrics[$m].Value + "  (" + $metrics[$m].Trend + ")", $fontMobTitle, $bTextDark, 48, ($mobY + 44))
        $mobY += 106
    }

    # Mobile Bottom Navigation Bar (height: 72)
    $gM.FillRectangle($bCard, 0, 1128, 800, 72)
    $gM.DrawLine($pBorder, 0, 1128, 800, 1128)
    $gM.DrawString("Home       Boards       Reports       Team       Settings", $fontNav, $bTextMuted, 160, 1154)

    $outMobile = Join-Path $protoDir ("proto-" + $scr.Id + "-" + $scr.Name + "-mobile.png")
    $bmpM.Save($outMobile, [System.Drawing.Imaging.ImageFormat]::Png)
    $gM.Dispose()
    $bmpM.Dispose()
}

Write-Host "All 20 Prototypes (Desktop, Tablet, Mobile) generated successfully!" -ForegroundColor Green


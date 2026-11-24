import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { workzenTheme } from './theme/theme.js';
import { useWorkzenStore } from './store/useWorkzenStore.js';
import { apiClient } from './api/client.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage.js';
import { FeaturesPage } from './pages/public/FeaturesPage.js';
import { SolutionsPage } from './pages/public/SolutionsPage.js';
import { PricingPage } from './pages/public/PricingPage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { FAQPage } from './pages/public/FAQPage.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage.js';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.js';
import { AccountVerificationSuccessPage } from './pages/auth/AccountVerificationSuccessPage.js';
import { PasswordResetSuccessPage } from './pages/auth/PasswordResetSuccessPage.js';
import { AcceptInvitationPage } from './pages/auth/AcceptInvitationPage.js';
import { EnterpriseDashboard } from './pages/EnterpriseDashboard.js';
import { OrganisationDashboard } from './pages/OrganisationDashboard.js';
import { OrganisationOnboardingPage } from './pages/OrganisationOnboardingPage.js';
import { OrganisationSelectPage } from './pages/OrganisationSelectPage.js';
import { OrganisationSettingsPage } from './pages/OrganisationSettingsPage.js';
import { OrganisationMembersPage } from './pages/OrganisationMembersPage.js';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage.js';
import { WorkspaceDashboard } from './pages/WorkspaceDashboard.js';
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage.js';
import { WorkspaceSelectPage } from './pages/WorkspaceSelectPage.js';
import { WorkspaceOnboardingPage } from './pages/WorkspaceOnboardingPage.js';
import { ProjectOverview } from './pages/ProjectOverview.js';
import { TaskListPage } from './pages/TaskListPage.js';
import { KanbanBoard } from './pages/KanbanBoard.js';
import { TaskDetailsPage } from './pages/TaskDetailsPage.js';
import { TeamManagementPage } from './pages/TeamManagementPage.js';
import { NotificationCentre } from './pages/NotificationCentre.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { DevSetupPrototype } from './pages/DevSetupPrototype.js';
import { CreateOrganisationModal } from './components/modals/CreateOrganisationModal.js';
import { TransferOwnershipModal } from './components/modals/TransferOwnershipModal.js';
import { DeleteOrganisationModal } from './components/modals/DeleteOrganisationModal.js';
import { CreateWorkspaceModal } from './components/modals/CreateWorkspaceModal.js';
import { ArchiveWorkspaceModal } from './components/modals/ArchiveWorkspaceModal.js';
import { CreateRoleModal } from './components/modals/CreateRoleModal.js';
import { EditRoleModal } from './components/modals/EditRoleModal.js';
import { DeleteRoleModal } from './components/modals/DeleteRoleModal.js';
import { AssignRoleModal } from './components/modals/AssignRoleModal.js';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { activeView, setActiveView, authToken, setCurrentUser } = useWorkzenStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/accept-invitation') {
        setActiveView('accept_invitation');
      }
    }
  }, []);

  useEffect(() => {
    apiClient
      .getCurrentUser()
      .then((res) => {
        if (res.success && res.data?.user) {
          setCurrentUser(res.data.user);
        }
      })
      .catch(() => {});
  }, [authToken]);

  const renderActiveScreen = () => {
    switch (activeView) {
      case 'landing':
        return <LandingPage />;
      case 'features':
        return <FeaturesPage />;
      case 'solutions':
        return <SolutionsPage />;
      case 'pricing':
        return <PricingPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'verify_email':
      case 'verify_otp':
        return <EmailVerificationPage />;
      case 'forgot_password':
        return <ForgotPasswordPage />;
      case 'reset_password':
        return <ResetPasswordPage />;
      case 'account_verified':
        return <AccountVerificationSuccessPage />;
      case 'password_reset_success':
        return <PasswordResetSuccessPage />;
      case 'accept_invitation':
        return <AcceptInvitationPage />;
      case 'enterprise_dashboard':
        return (
          <AppLayout>
            <EnterpriseDashboard />
          </AppLayout>
        );
      case 'org_dashboard':
        return (
          <AppLayout>
            <OrganisationDashboard />
          </AppLayout>
        );
      case 'org_settings':
      case 'org_branding':
      case 'org_ownership':
        return (
          <AppLayout>
            <OrganisationSettingsPage />
          </AppLayout>
        );
      case 'org_members':
        return (
          <AppLayout>
            <OrganisationMembersPage />
          </AppLayout>
        );
      case 'roles_permissions':
        return (
          <AppLayout>
            <RolesPermissionsPage />
          </AppLayout>
        );
      case 'org_onboarding':
        return <OrganisationOnboardingPage />;
      case 'org_select':
        return <OrganisationSelectPage />;
      case 'workspace_dashboard':
        return (
          <AppLayout>
            <WorkspaceDashboard />
          </AppLayout>
        );
      case 'workspace_settings':
        return (
          <AppLayout>
            <WorkspaceSettingsPage />
          </AppLayout>
        );
      case 'workspace_select':
        return (
          <AppLayout>
            <WorkspaceSelectPage />
          </AppLayout>
        );
      case 'workspace_onboarding':
        return <WorkspaceOnboardingPage />;
      case 'project_overview':
        return (
          <AppLayout>
            <ProjectOverview />
          </AppLayout>
        );
      case 'tasks':
        return (
          <AppLayout>
            <TaskListPage />
          </AppLayout>
        );
      case 'kanban':
        return (
          <AppLayout>
            <KanbanBoard />
          </AppLayout>
        );
      case 'task_details':
        return (
          <AppLayout>
            <TaskDetailsPage />
          </AppLayout>
        );
      case 'team':
        return (
          <AppLayout>
            <TeamManagementPage />
          </AppLayout>
        );
      case 'notifications':
        return (
          <AppLayout>
            <NotificationCentre />
          </AppLayout>
        );
      case 'calendar':
        return (
          <AppLayout>
            <CalendarPage />
          </AppLayout>
        );
      case 'analytics':
        return (
          <AppLayout>
            <ReportsAnalyticsPage />
          </AppLayout>
        );
      case 'settings':
        return (
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        );
      case 'dev_setup':
        return (
          <AppLayout>
            <DevSetupPrototype />
          </AppLayout>
        );
      default:
        return (
          <AppLayout>
            <EnterpriseDashboard />
          </AppLayout>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={workzenTheme}>
        {renderActiveScreen()}
        <CreateOrganisationModal />
        <TransferOwnershipModal />
        <DeleteOrganisationModal />
        <CreateWorkspaceModal />
        <ArchiveWorkspaceModal />
        <CreateRoleModal />
        <EditRoleModal />
        <DeleteRoleModal />
        <AssignRoleModal />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;


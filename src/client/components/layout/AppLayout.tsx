import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { CreateTaskModal } from '../modals/CreateTaskModal.js';
import { CreateProjectModal } from '../modals/CreateProjectModal.js';
import { InviteMemberModal } from '../modals/InviteMemberModal.js';
import { MobileNav } from '../../design-system/layouts/MobileNav.js';
import { useWorkzenStore } from '../../store/useWorkzenStore.js';
import { apiClient } from '../../api/client.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentOrg, currentWorkspace, setProjects } = useWorkzenStore();

  useEffect(() => {
    if (currentOrg?._id) {
      apiClient
        .listProjects({ workspaceId: currentWorkspace?._id || undefined })
        .then((res) => {
          if (res.success && res.data?.projects) {
            setProjects(res.data.projects);
          }
        })
        .catch(() => {});
    }
  }, [currentOrg?._id, currentWorkspace?._id, setProjects]);

  return (
    <div className="d-flex vh-100 overflow-hidden bg-light position-relative">
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <div className="d-none d-lg-flex">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Header />
        <main className="flex-grow-1 overflow-auto p-3 p-md-4 bg-slate-50 pb-5 pb-lg-4">
          <div className="container-fluid p-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <CreateTaskModal />
      <CreateProjectModal />
      <InviteMemberModal />
    </div>
  );
};

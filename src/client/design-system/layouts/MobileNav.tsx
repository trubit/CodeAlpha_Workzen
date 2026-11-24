import React from 'react';
import { useWorkzenStore, ActiveView } from '../../store/useWorkzenStore.js';
import {
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  Users,
  Plus
} from 'lucide-react';
import { colors } from '../tokens/colors.js';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, setCreateTaskModalOpen } = useWorkzenStore();

  const items: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'enterprise_dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'kanban', label: 'Board', icon: <KanbanSquare size={20} /> },
    { id: 'analytics', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'team', label: 'Team', icon: <Users size={20} /> }
  ];

  return (
    <nav
      className="d-lg-none fixed-bottom bg-white border-top shadow-lg px-3 py-2"
      style={{ zIndex: 1040, height: 64 }}
      aria-label="Mobile Navigation"
    >
      <div className="d-flex justify-content-around align-items-center h-100">
        {/* First 2 navigation items */}
        {items.slice(0, 2).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center"
              style={{
                color: isActive ? colors.primary[600] : colors.slate[400],
                fontSize: '0.68rem',
                fontWeight: isActive ? 600 : 500
              }}
              onClick={() => setActiveView(item.id)}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Center Quick Action Button */}
        <div className="position-relative" style={{ top: -14 }}>
          <button
            type="button"
            className="btn rounded-circle d-flex align-items-center justify-content-center text-white shadow-md border-2 border-white"
            style={{
              width: 46,
              height: 46,
              backgroundColor: colors.primary[600],
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)'
            }}
            onClick={() => setCreateTaskModalOpen(true)}
            aria-label="Create New Task"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Second 2 navigation items */}
        {items.slice(2, 4).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center"
              style={{
                color: isActive ? colors.primary[600] : colors.slate[400],
                fontSize: '0.68rem',
                fontWeight: isActive ? 600 : 500
              }}
              onClick={() => setActiveView(item.id)}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


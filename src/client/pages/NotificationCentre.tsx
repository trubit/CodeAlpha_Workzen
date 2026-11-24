import React, { useState } from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { Bell, CheckCheck, Clock, CheckSquare, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';

export const NotificationCentre: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setActiveView, setSelectedTaskId } = useWorkzenStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckSquare size={16} className="text-primary" />;
      case 'mention':
        return <MessageSquare size={16} className="text-info" />;
      case 'deadline':
        return <AlertCircle size={16} className="text-warning" />;
      default:
        return <Bell size={16} className="text-secondary" />;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="wz-card p-4 d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold m-0 text-dark">Notification Centre</h3>
          <p className="text-muted small m-0 mt-0.5">
            Real-time activity alerts, task assignments, and mentions across your workspaces
          </p>
        </div>

        <button
          className="btn btn-outline-secondary d-flex align-items-center fw-medium rounded-3 px-3 py-1.5"
          onClick={markAllNotificationsAsRead}
        >
          <CheckCheck size={16} className="me-1.5 text-primary" /> Mark All as Read
        </button>
      </div>

      {/* Notifications Stream */}
      <div className="wz-card p-4">
        {/* Filter Tabs */}
        <div className="d-flex gap-2 border-bottom pb-3 mb-3">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-light'} fw-semibold px-3 rounded-pill`}
            style={filter === 'all' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setFilter('all')}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-light'} fw-semibold px-3 rounded-pill`}
            style={filter === 'unread' ? { backgroundColor: '#4F46E5', borderColor: '#4F46E5' } : {}}
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>

        <div className="d-flex flex-column gap-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              <Bell size={28} className="text-secondary opacity-50 mb-2" />
              <div>No notifications to display.</div>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 rounded-3 border d-flex justify-content-between align-items-center transition-all ${
                  !notif.isRead ? 'bg-primary-subtle border-primary-subtle' : 'bg-white'
                }`}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-white shadow-xs mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark small">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="badge rounded-pill bg-primary" style={{ fontSize: '0.65rem' }}>
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-secondary small m-0 mt-0.5">{notif.message}</p>
                    <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      {notif.createdAt}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {notif.entityType === 'task' && (
                    <button
                      className="btn btn-sm btn-outline-primary rounded-3 fw-medium"
                      onClick={() => {
                        markNotificationAsRead(notif._id);
                        setSelectedTaskId(notif.entityId);
                        setActiveView('task_details');
                      }}
                    >
                      View Task <ArrowRight size={13} className="ms-1" />
                    </button>
                  )}
                  {!notif.isRead && (
                    <button
                      className="btn btn-sm btn-light rounded-circle p-1 text-muted"
                      onClick={() => markNotificationAsRead(notif._id)}
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


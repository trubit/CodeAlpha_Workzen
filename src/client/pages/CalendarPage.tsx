import React from 'react';
import { useWorkzenStore } from '../store/useWorkzenStore.js';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckSquare } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { tasks, setSelectedTaskId, setActiveView } = useWorkzenStore();

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Match real task dueDate against the day number of current month
  const getDayTasks = (day: number) => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const date = new Date(t.dueDate);
      return !isNaN(date.getTime()) && date.getDate() === day;
    });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Calendar Header */}
      <div className="wz-card p-4 d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold m-0 text-dark">Sprint & Deadline Calendar</h3>
          <p className="text-muted small m-0 mt-0.5">
            Deliverable deadlines and sprint milestones
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm p-2" aria-label="Previous Month"><ChevronLeft size={16} /></button>
            <button className="btn btn-outline-secondary btn-sm fw-bold px-3">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </button>
            <button className="btn btn-outline-secondary btn-sm p-2" aria-label="Next Month"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="wz-card p-4">
        {/* Days of week */}
        <div className="row g-2 text-center text-secondary small fw-bold text-uppercase border-bottom pb-2 mb-2">
          <div className="col">Sun</div>
          <div className="col">Mon</div>
          <div className="col">Tue</div>
          <div className="col">Wed</div>
          <div className="col">Thu</div>
          <div className="col">Fri</div>
          <div className="col">Sat</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="row row-cols-7 g-2">
          {days.map((day) => {
            const dayTasks = getDayTasks(day);
            const isToday = new Date().getDate() === day;

            return (
              <div key={day} className="col">
                <div
                  className={`p-2 rounded-3 border h-100 ${
                    isToday ? 'bg-indigo-subtle border-primary' : 'bg-white'
                  }`}
                  style={{ minHeight: '105px' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className={`fw-bold small rounded-circle d-flex align-items-center justify-content-center ${
                        isToday ? 'bg-primary text-white' : 'text-dark'
                      }`}
                      style={{ width: 22, height: 22, fontSize: '0.75rem' }}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="badge rounded-pill bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-1">
                    {dayTasks.map((t) => (
                      <div
                        key={t._id}
                        className="p-1 rounded bg-light border text-truncate hover-shadow"
                        style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                        title={t.title}
                        onClick={() => {
                          setSelectedTaskId(t._id);
                          setActiveView('task_details');
                        }}
                      >
                        <span className="fw-bold text-primary me-1">{t.taskKey}</span>
                        <span>{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';

export default function Dashboard() {
  const { data: dashboard, isLoading } = useQuery(['dashboard'], getDashboard);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex page-transition text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-violet" size={32} />
          </div>
        </div>
      </div>
    );
  }

  const myTasksCount = dashboard?.myTasks?.length || 0;
  const overdueCount = dashboard?.overdueCount || 0;
  const projectCount = dashboard?.projectCount || 0;
  const completedToday = dashboard?.myTasks?.filter(t => t.status === 'DONE' && new Date(t.updatedAt || t.createdAt).toDateString() === new Date().toDateString()).length || 0;

  const tasksByStatus = dashboard?.tasksByStatus || {};
  const todoCount = tasksByStatus['TODO'] || 0;
  const inProgressCount = tasksByStatus['IN_PROGRESS'] || 0;
  const reviewCount = tasksByStatus['IN_REVIEW'] || 0;
  const doneCount = tasksByStatus['DONE'] || 0;
  const totalByStatus = todoCount + inProgressCount + reviewCount + doneCount || 1; // avoid div/0

  const recentActivity = dashboard?.recentActivity || [];

  return (
    <div className="min-h-screen bg-black flex page-transition text-white selection:bg-violet-dim selection:text-violet-light">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 lg:py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 card-hover">
                <div className="text-[11px] font-medium text-[#777] uppercase tracking-[0.2em]">Total Projects</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-[36px] lg:text-[44px] font-light text-white leading-none tracking-tighter">{projectCount}</div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 card-hover">
                <div className="text-[11px] font-medium text-[#777] uppercase tracking-[0.2em]">My Tasks</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-[36px] lg:text-[44px] font-light text-white leading-none tracking-tighter">{myTasksCount}</div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 card-hover">
                <div className="text-[11px] font-medium text-[#777] uppercase tracking-[0.2em]">Completed Today</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-[36px] lg:text-[44px] font-light text-white leading-none tracking-tighter">{completedToday}</div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 card-hover">
                <div className="text-[11px] font-medium text-[#777] uppercase tracking-[0.2em]">Overdue</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-[36px] lg:text-[44px] font-light text-white leading-none tracking-tighter">{overdueCount}</div>
                  {overdueCount > 0 && <div className="text-[12px] text-red">needs attention</div>}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 lg:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-[18px] font-medium text-white">Task overview</h3>
                  <p className="text-[12px] text-[#777] mt-1">Current workload by status.</p>
                </div>
                <button className="flex items-center gap-1 text-[12px] font-medium text-[#bbb] hover:text-white transition-colors">
                  This week <ChevronDown size={14} />
                </button>
              </div>

              <div className="h-[2px] w-full bg-[rgba(255,255,255,0.06)] overflow-hidden rounded-full">
                <div className="bg-[#666] float-left h-full" style={{ width: `${(todoCount/totalByStatus)*100}%` }} />
                <div className="bg-white float-left h-full" style={{ width: `${(inProgressCount/totalByStatus)*100}%` }} />
                <div className="bg-amber float-left h-full" style={{ width: `${(reviewCount/totalByStatus)*100}%` }} />
                <div className="bg-green float-left h-full" style={{ width: `${(doneCount/totalByStatus)*100}%` }} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] px-4 py-3 card-hover">
                  <div className="text-[10px] font-medium text-[#777] uppercase tracking-[0.1em]">Todo</div>
                  <div className="mt-2 text-[14px] text-white">{todoCount}</div>
                </div>
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] px-4 py-3 card-hover">
                  <div className="text-[10px] font-medium text-white uppercase tracking-[0.1em]">In progress</div>
                  <div className="mt-2 text-[14px] text-white">{inProgressCount}</div>
                </div>
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] px-4 py-3 card-hover">
                  <div className="text-[10px] font-medium text-amber uppercase tracking-[0.1em]">Review</div>
                  <div className="mt-2 text-[14px] text-white">{reviewCount}</div>
                </div>
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] px-4 py-3 card-hover">
                  <div className="text-[10px] font-medium text-green uppercase tracking-[0.1em]">Done</div>
                  <div className="mt-2 text-[14px] text-white">{doneCount}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 lg:p-6">
              <h3 className="text-[12px] font-medium text-[#777] uppercase tracking-[0.2em] mb-5">Recent activity</h3>
              <div className="w-full text-[13px]">
                {recentActivity.length === 0 ? (
                  <div className="text-[#666] py-4">No recent activity.</div>
                ) : recentActivity.map((activity, idx) => {
                  const isTask = activity.type === 'task';
                  const label = isTask ? activity.data.title : activity.data.content;
                  const name = isTask ? (activity.data.createdBy?.name || 'Unknown') : (activity.data.author?.name || 'Unknown');
                  const initials = name.charAt(0).toUpperCase();

                  return (
                    <div key={idx} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] gap-4 items-center py-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-300 rounded-md px-2">
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="font-medium text-white text-[13px] truncate">{label}</span>
                        <span className="text-[#666] text-[11px] truncate">{isTask ? 'New Task' : 'New Comment'}</span>
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-[20px] h-[20px] rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[9px] font-medium text-white shrink-0">
                          {initials}
                        </div>
                        <span className="text-[#888] text-[12px] truncate">{name}</span>
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-medium text-[#666]">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

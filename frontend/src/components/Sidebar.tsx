import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Inbox, Plus, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { logout as logoutApi } from '../api/auth';
import { listProjects, type Project } from '../api/projects';

function getProjectColorClass(id: string) {
  const colors = [
    { bg: 'bg-violet', shadow: 'rgba(124,58,237,0.5)' },
    { bg: 'bg-green', shadow: 'rgba(16,185,129,0.5)' },
    { bg: 'bg-amber', shadow: 'rgba(245,158,11,0.5)' },
    { bg: 'bg-blue-500', shadow: 'rgba(59,130,246,0.5)' },
    { bg: 'bg-rose-500', shadow: 'rgba(244,63,94,0.5)' },
  ];
  // naive pseudo-random based on id
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = hash + id.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { clear, user } = useAuthStore();
  const { data: projects = [] } = useQuery<Project[]>(['projects'], listProjects, {
    enabled: Boolean(user)
  });

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    clear();
    navigate('/login');
  };

  const mainNav = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Inbox', icon: Inbox, path: '/inbox' },
  ];

  return (
    <aside className="w-[216px] flex-shrink-0 h-screen bg-black border-r border-[rgba(255,255,255,0.02)] flex flex-col pt-[32px] pb-[24px]">
      <div className="px-6 mb-12 flex items-center gap-3">
        <div className="w-[12px] h-[12px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <span className="text-[14px] font-medium text-white tracking-wide">Taskflow</span>
      </div>

      <div className="px-3 mb-10">
        <h3 className="heading-section px-3 mb-4">Menu</h3>
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              <span>{item.name}</span>
              {item.count && (
                <span className="ml-auto text-[10px] text-[#888]">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-4">
          <h3 className="heading-section">Projects</h3>
          <Link to="/projects" className="text-[#444] hover:text-white transition-colors">
            <Plus size={14} />
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          {projects.slice(0, 8).map((proj) => {
            const colorTheme = getProjectColorClass(proj.id);
            return (
              <NavLink key={proj.id} to={`/projects/${proj.id}`} className={({ isActive }) => `nav-item cursor-pointer ${isActive ? 'active' : ''}`}>
                <div className={`w-[8px] h-[8px] rounded-full ${colorTheme.bg}`} style={{ boxShadow: `0 0 6px ${colorTheme.shadow}` }} />
                <span className="truncate">{proj.name}</span>
              </NavLink>
            )
          })}
          {projects.length === 0 && (
            <div className="px-3 text-[12px] text-[#666] italic">No projects yet</div>
          )}
        </div>
      </div>

      <div className="px-6 pt-6 mt-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white flex items-center justify-center text-[10px] font-medium shrink-0 group-hover:border-white transition-colors duration-300 uppercase">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-medium text-white truncate">{user?.name || 'User'}</span>
            <span className="text-[10px] text-[#666] truncate capitalize">{user?.role?.toLowerCase() || 'Member'}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.03)] rounded transition-colors duration-200"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

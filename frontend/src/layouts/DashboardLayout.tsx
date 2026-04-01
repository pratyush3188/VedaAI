import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ActivitySquare, GitCompare, LogOut, Moon, Sun, User as UserIcon, Settings, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

export function DashboardLayout() {
  const { profile, setSession, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkSet = document.documentElement.classList.contains('dark');
      setIsDark(isDarkSet);
    }
    
    // Check click outside dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Analyzer', icon: ActivitySquare, path: '/analyzer' },
    { label: 'Compare', icon: GitCompare, path: '/compare' },
  ];

  return (
    <div className="h-dvh flex overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-[width] duration-300 ease-in-out shrink-0 h-full",
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
        !isSidebarOpen && isCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
        <div className={clsx("h-16 flex items-center border-b border-slate-200 dark:border-slate-700 transition-all duration-300 relative", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
          <div className="flex items-center gap-2 overflow-hidden">
            <ActivitySquare className="h-8 w-8 text-[#0d5d67] dark:text-[#2dd4bf] shrink-0" />
            <span className={clsx("text-xl font-black tracking-tight text-slate-800 dark:text-white transition-opacity duration-200 whitespace-nowrap", isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto")}>
              Veda AI
            </span>
          </div>

          <button className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0 mr-2" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Non-scrolling navigation container */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 group shrink-0",
                isCollapsed ? "justify-center px-0 w-12 mx-auto" : "px-4",
                isActive 
                  ? "bg-teal-50 text-[#0d5d67] dark:bg-[#0a454a]/30 dark:text-[#2dd4bf]" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <item.icon className={clsx("h-5 w-5 shrink-0 transition-transform duration-300", isCollapsed ? "group-hover:scale-110" : "")} />
              <div className={clsx("transition-[max-width,opacity] duration-300 ease-in-out overflow-hidden whitespace-nowrap", isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100")}>
                 {item.label}
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Settings Footer Fixed Block (with Collapse Toggle) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
           
           <NavLink 
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              title={isCollapsed ? "Settings" : undefined}
              className={({ isActive }) => clsx(
                  "flex items-center gap-3 py-3 text-sm font-bold rounded-xl transition-colors duration-200 group shrink-0",
                  isCollapsed ? "justify-center px-0 w-12 mx-auto" : "px-4 w-full",
                  isActive 
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white" 
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              )}
            >
               <Settings className={clsx("h-5 w-5 shrink-0 transition-transform duration-500", isCollapsed ? "group-hover:rotate-90" : "group-hover:rotate-45")} />
               <div className={clsx("transition-[max-width,opacity] duration-300 ease-in-out overflow-hidden whitespace-nowrap", isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100")}>
                 Settings & Config
               </div>
           </NavLink>

           {/* Collapse Toggle Button - at the very bottom component */}
           <button 
             className={clsx("w-12 h-12 mx-auto hidden lg:flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0d5d67] hover:bg-slate-100 dark:hover:text-[#2dd4bf] dark:hover:bg-slate-800 transition-colors border border-transparent shadow-sm shrink-0 overflow-hidden", isCollapsed ? "mt-2" : "w-full px-4 mt-2 font-bold text-sm")}
             onClick={() => setIsCollapsed(!isCollapsed)}
             title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
           >
             <div className="flex items-center gap-3">
               {isCollapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <ChevronLeft className="h-5 w-5 shrink-0" />}
               <div className={clsx("transition-[max-width,opacity] duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left", isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100")}>
                 Collapse
               </div>
             </div>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="h-9 w-9 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                  {profile?.full_name?.charAt(0) || <UserIcon className="h-5 w-5" />}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold truncate dark:text-white flex items-center gap-2">
                       {profile?.full_name || 'User'}
                    </p>
                  </div>
                  <NavLink to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                    <Settings className="h-4 w-4" /> Settings
                  </NavLink>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

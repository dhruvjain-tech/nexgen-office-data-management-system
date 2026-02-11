
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊', adminOnly: false },
    { label: 'Inventory', path: '/inventory', icon: '📦', adminOnly: false },
    { label: 'Sales Orders', path: '/sales', icon: '📝', adminOnly: false },
    { label: 'Reports', path: '/reports', icon: '📈', adminOnly: false },
    { label: 'Users', path: '/users', icon: '👥', adminOnly: true },
    { label: 'Architecture & Docs', path: '/docs', icon: '📝', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || user.role === UserRole.ADMIN);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="font-bold tracking-tight">NexGen Office</span>
        </div>
        <button 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          className="p-2 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar / Mobile Menu Overlay */}
      <aside 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl border-r border-slate-800 transition-transform duration-300 transform md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">N</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">NexGen Office</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Data Control</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6 flex-grow overflow-y-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500/50 ${
                location.pathname === item.path 
                  ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg opacity-80" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold border border-slate-700 text-blue-400" aria-hidden="true">
              {user.username[0].toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-200">{user.username}</p>
              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                user.role === UserRole.ADMIN ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 py-2.5 rounded-lg text-xs font-bold transition-all border border-slate-700 focus:ring-2 focus:ring-red-500/50 outline-none active:scale-95"
          >
            Terminal Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden w-full">
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 flex-shrink-0 items-center px-8 z-10">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            {navItems.find(i => i.path === location.pathname)?.label || 'System Core'}
          </h2>
          <div className="ml-auto flex items-center space-x-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">System Status</span>
              <span className="text-xs font-semibold text-slate-600">PRODUCTION_STABLE_v1.5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-700">ONLINE</span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto h-full scroll-smooth focus:outline-none" tabIndex={-1}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

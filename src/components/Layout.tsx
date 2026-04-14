import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI';
import { LayoutDashboard, MapPinPlus, ListChecks, LogOut, MapPin,  X, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

import IconLogo from '../assets/logos/logo.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/my-contributions', label: 'Places', icon: ListChecks },
    { path: '/add-place', label: 'Add', icon: MapPinPlus },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mobile-container relative flex flex-col pb-20">
        {/* Header */}
        <header className="sticky top-0 z-998 border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl">
                <img src={IconLogo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-zinc-900">Medan Sports Area</h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Contributor App</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
         {/* Logout Confirmation Modal */}
                  {isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                      <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-red-50 text-red-500">
                            <AlertTriangle size={32} />
                          </div>
                          
                          <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-zinc-900">
                            Wait a minute!
                          </h3>
                          <p className="mb-8 text-sm font-medium text-zinc-400">
                            Are you sure you want to log out? You'll need to sign back in to contribute more places.
                          </p>

                          <div className="flex flex-col gap-3">
                            <button
                              onClick={handleSignOut}
                              className="w-full rounded-2xl bg-zinc-900 py-4 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800"
                            >
                              Yes, Log Me Out
                            </button>
                            <button
                              onClick={() => setIsLogoutModalOpen(false)}
                              className="w-full rounded-2xl bg-zinc-50 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              No, Keep Me Signed In
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-zinc-100 bg-white/90 px-8 py-4 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-1.5 transition-all',
                    isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                    isActive ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'bg-transparent'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

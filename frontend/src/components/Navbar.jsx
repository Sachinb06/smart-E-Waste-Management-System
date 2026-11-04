import React, { useState } from 'react';
import { 
  Recycle, 
  Camera, 
  MapPin, 
  Truck, 
  Search, 
  Activity, 
  BarChart3, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Recycle },
    { id: 'detect', label: 'AI Detection', icon: Camera, highlight: true },
    { id: 'centers', label: 'Collection Centers', icon: MapPin },
    { id: 'request', label: 'Schedule Pickup', icon: Truck },
    { id: 'track', label: 'Track Request', icon: Search },
    { id: 'iot', label: 'Smart IoT Bins', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNav = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">Smart</span>
                <span className="font-extrabold text-xl bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">E-Waste</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">AI Camera & IoT System</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2' 
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>{item.label}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs' 
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User / Auth Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 pr-3">
                <button
                  onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')}
                  className="flex items-center gap-2 hover:opacity-80 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      {user.full_name.split(' ')[0]}
                      {isAdmin && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">Dashboard</span>
                  </div>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1"></div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition-all shadow-emerald-700/20"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    {user.full_name} ({isAdmin ? 'Admin' : 'User'})
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">Go to Dashboard →</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 rounded-xl"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

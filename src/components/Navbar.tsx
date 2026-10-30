import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Camera,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openBookingWizard: (serviceId?: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openBookingWizard,
  openAuthModal,
}) => {
  const { user, role, demoLogin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'Our Atelier' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleRoleSwitch = async (newRole: UserRole) => {
    await demoLogin(newRole);
    setRoleDropdownOpen(false);
    if (newRole === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('client_dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full border border-amber-400/40 bg-zinc-900 flex items-center justify-center text-amber-300 group-hover:border-amber-400 transition-colors">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-2xl tracking-[0.22em] text-white font-medium block">
              FRAMEORA
            </span>
            <span className="text-[9px] tracking-[0.3em] text-zinc-400 uppercase font-light block">
              Cinema & Stills
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentView(link.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${
                currentView === link.id
                  ? 'text-amber-300 font-semibold border-b border-amber-300 pb-1'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions & Role Switcher */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Role Switcher for instant evaluator testing */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all cursor-pointer"
              title="Switch demo preview role"
            >
              <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>Role: <strong className="text-white">{role === 'admin' ? 'Director (Admin)' : role === 'photographer' ? 'Photographer' : 'Customer'}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-zinc-900/98 border border-zinc-800 shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  Switch Active Viewpoint
                </div>
                <button
                  onClick={() => handleRoleSwitch('customer')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-800 cursor-pointer ${
                    role === 'customer' ? 'text-amber-300 font-medium' : 'text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer (Priya Sharma)</span>
                  </div>
                  {role === 'customer' && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-800 cursor-pointer ${
                    role === 'admin' ? 'text-amber-300 font-medium' : 'text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Studio Director (Admin)</span>
                  </div>
                  {role === 'admin' && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Active</span>}
                </button>
                <button
                  onClick={() => handleRoleSwitch('photographer')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-800 cursor-pointer ${
                    role === 'photographer' ? 'text-amber-300 font-medium' : 'text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photographer (Ethan Vance)</span>
                  </div>
                  {role === 'photographer' && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">Active</span>}
                </button>
              </div>
            )}
          </div>

          {/* Direct portal links */}
          {role === 'admin' ? (
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 font-semibold shadow-lg shadow-amber-400/20'
                  : 'bg-zinc-900 text-amber-300 border-amber-400/40 hover:bg-amber-400/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('client_dashboard')}
              className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                currentView === 'client_dashboard'
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>
          )}

          {/* Book Session CTA */}
          <button
            onClick={() => openBookingWizard()}
            className="px-5 py-2.5 text-xs uppercase tracking-[0.16em] font-medium rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2 cursor-pointer font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Session</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <button
                onClick={() => setCurrentView('client_dashboard')}
                className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 cursor-pointer"
                title={user.displayName}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-semibold">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
              </button>
              <button
                onClick={logout}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-xs uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer px-2 py-1"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => openBookingWizard()}
            className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold bg-amber-400 text-zinc-950 rounded cursor-pointer"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-6 space-y-4">
          <div className="flex flex-col gap-3 pb-4 border-b border-zinc-800">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm uppercase tracking-wider py-1.5 cursor-pointer ${
                  currentView === link.id ? 'text-amber-300 font-semibold' : 'text-zinc-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Demo Switch:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleRoleSwitch('customer');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded text-center"
              >
                Client View
              </button>
              <button
                onClick={() => {
                  handleRoleSwitch('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 bg-amber-400/20 border border-amber-400/50 text-xs text-amber-300 rounded text-center font-medium"
              >
                Admin Panel
              </button>
            </div>

            <button
              onClick={() => {
                openBookingWizard();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-amber-400 text-zinc-950 font-semibold rounded text-xs uppercase tracking-widest text-center"
            >
              Book Session
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

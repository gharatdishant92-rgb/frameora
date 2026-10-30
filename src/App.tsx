/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingWizardModal } from './components/BookingWizardModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { PortfolioPage } from './pages/PortfolioPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

function AppContent() {
  const { user, role, demoLogin } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [bookingWizardOpen, setBookingWizardOpen] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const handleOpenBookingWizard = (serviceId?: string) => {
    setPreselectedServiceId(serviceId);
    setBookingWizardOpen(true);
  };

  const handleBookingSuccess = () => {
    setCurrentView('client_dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <div>
        {/* Navigation */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          openBookingWizard={handleOpenBookingWizard}
          openAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Dynamic Pages */}
        <main className="animate-in fade-in duration-300">
          {currentView === 'home' && (
            <HomePage
              setCurrentView={setCurrentView}
              openBookingWizard={handleOpenBookingWizard}
            />
          )}

          {currentView === 'services' && (
            <ServicesPage openBookingWizard={handleOpenBookingWizard} />
          )}

          {currentView === 'portfolio' && (
            <PortfolioPage openBookingWizard={() => handleOpenBookingWizard()} />
          )}

          {currentView === 'about' && (
            <AboutPage openBookingWizard={() => handleOpenBookingWizard()} />
          )}

          {currentView === 'contact' && <ContactPage />}

          {currentView === 'client_dashboard' && (
            <CustomerDashboard openBookingWizard={() => handleOpenBookingWizard()} />
          )}

          {currentView === 'admin' && (
            role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div className="max-w-xl mx-auto my-24 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-white font-medium">Studio Director Authorization Required</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The Admin Command Center is reserved for verified studio directors. To evaluate the admin panel immediately, switch your role below.
                </p>
                <div className="pt-2">
                  <button
                    onClick={async () => {
                      await demoLogin('admin');
                      setCurrentView('admin');
                    }}
                    className="px-6 py-2.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-300 cursor-pointer"
                  >
                    Switch to Studio Director (Admin)
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer
        setCurrentView={setCurrentView}
        openBookingWizard={() => handleOpenBookingWizard()}
      />

      {/* Floating Concierge Chat Button */}
      <a
        href="https://wa.me/919820012345?text=Hello%20FRAMEORA%20Studio%2C%20I%20would%20like%20to%20inquire%20about%20a%20photography%20session."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
        title="Direct WhatsApp Concierge"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap pl-1">
          WhatsApp Concierge
        </span>
      </a>

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={bookingWizardOpen}
        onClose={() => setBookingWizardOpen(false)}
        preselectedServiceId={preselectedServiceId}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

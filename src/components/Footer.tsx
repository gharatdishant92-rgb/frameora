import React from 'react';
import { Camera, Mail, Phone, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  openBookingWizard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, openBookingWizard }) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-zinc-900">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-amber-400/40 bg-zinc-900 flex items-center justify-center text-amber-300">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-2xl tracking-[0.22em] text-white font-medium block">
                  FRAMEORA
                </span>
                <span className="text-[9px] tracking-[0.3em] text-zinc-500 uppercase font-light block">
                  Photography & Cinematography
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              We capture what matters. Dedicated to fine-art luxury wedding documentation, editorial portraiture, and cinematic storytelling crafted for discerning clients worldwide.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/919820012345?text=Hello%20FRAMEORA%20Studio%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20photography%20session."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-900/40 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">
              The Studio
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Bespoke Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('portfolio')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Curated Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Our Philosophy & Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => openBookingWizard()}
                  className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Book Appointment</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>Royal Wedding Stills</li>
              <li>Anamorphic Cinema 4K</li>
              <li>Destination Pre-Weddings</li>
              <li>Editorial Portraits</li>
              <li>Commercial Products</li>
              <li>Acoustic Cyclorama Studio</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">
              Visit Atelier
            </h4>
            <ul className="space-y-3 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Atelier Suite 402, Sea Face Promenade, Marine Drive, Mumbai 400020</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 98200 12345</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>concierge@frameora.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} FRAMEORA Studios. All rights reserved.</p>
          <p className="font-serif italic text-zinc-500">"We Capture What Matters."</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Charter</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Commission</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

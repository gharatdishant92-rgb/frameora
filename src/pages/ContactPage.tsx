import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState('Wedding Photography');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
          Connect with Concierge
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal">
          Inquire or Visit Our Atelier
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed font-light">
          We welcome inquiries for bespoke wedding commissions, cinematography projects, and private studio appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-8 bg-zinc-900/60 border border-zinc-800 p-8 rounded-2xl">
          <div className="space-y-3">
            <h3 className="font-serif text-2xl text-white font-medium">FRAMEORA Atelier</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Located on Mumbai's iconic Marine Drive with direct seaside views. Consultations are by appointment to ensure undivided creative focus.
            </p>
          </div>

          <div className="space-y-5 text-xs text-zinc-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Studio Atelier Location</strong>
                <span className="text-zinc-400">Atelier Suite 402, Sea Face Promenade, Marine Drive, Mumbai 400020</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Direct Telephone</strong>
                <span className="text-zinc-400">+91 98200 12345 / +91 98200 54321</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Direct Concierge Email</strong>
                <span className="text-zinc-400">concierge@frameora.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Atelier Hours</strong>
                <span className="text-zinc-400">Monday &ndash; Saturday: 10:00 AM &ndash; 7:30 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Connect */}
          <div className="pt-4 border-t border-zinc-800">
            <a
              href="https://wa.me/919820012345?text=Hello%20FRAMEORA%20Studio%2C%20I%20would%20like%20to%20inquire%20about%20a%20photography%20shoot."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900/50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 p-8 sm:p-10 rounded-2xl">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl text-white font-medium">Inquiry Dispatched</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Thank you, {name}. Our Studio Director has received your commission brief. We will contact you at {email} within 24 business hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-amber-400 hover:underline pt-4"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-serif text-2xl text-white font-medium">Send an Artistic Brief</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Natasha Kapoor"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="natasha@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Discipline of Interest
                  </label>
                  <select
                    value={serviceOfInterest}
                    onChange={(e) => setServiceOfInterest(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Wedding Photography">Wedding Photography</option>
                    <option value="Pre-Wedding Photography">Pre-Wedding Shoot</option>
                    <option value="Cinematography">Cinematography & Films</option>
                    <option value="Event Photography">Corporate Gala / Event</option>
                    <option value="Portrait Photography">Portrait & Headshots</option>
                    <option value="Product Photography">Product & Commercial</option>
                    <option value="Studio Photography">Acoustic Cyclorama Studio</option>
                    <option value="Custom Shoots">Custom Commission</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Your Vision, Expected Dates, & Location
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the dates, venue destination, aesthetic mood, estimated guest count, or bespoke requirements..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/10"
              >
                <Send className="w-4 h-4" />
                <span>Submit Commission Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

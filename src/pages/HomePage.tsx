import React, { useState, useEffect } from 'react';
import { Service, PortfolioItem, ReviewItem } from '../types.ts';
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Check,
  Shield,
  Clock,
  Camera,
  Film,
  MapPin,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';

interface HomePageProps {
  setCurrentView: (view: string) => void;
  openBookingWizard: (serviceId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentView, openBookingWizard }) => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeLightbox, setActiveLightbox] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    // Load services
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setFeaturedServices(data.slice(0, 4)))
      .catch((e) => console.error(e));

    // Load portfolio
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => setPortfolioItems(data.filter((p: PortfolioItem) => p.isFeatured).slice(0, 6)))
      .catch((e) => console.error(e));

    // Load reviews
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-28">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background cinematic image with editorial dark gradient overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90"
            alt="FRAMEORA Cinematic Masterpiece"
            className="w-full h-full object-cover object-center brightness-60 scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-[#0c0c0e]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c0c0e_80%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-[0.25em] font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fine Art Cinematography & Photography</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[1.08]">
            We Capture <br />
            <span className="italic font-light text-amber-200">What Matters.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            From regal palace weddings to intimate cinema narratives, FRAMEORA transforms fleeting human emotion into enduring visual poetry with masterclass direction and timeless color science.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openBookingWizard()}
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Book Your Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('portfolio')}
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-zinc-900/90 border border-zinc-700/80 text-white font-medium text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 hover:border-zinc-500 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Explore Our Work</span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-zinc-800/60">
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-white font-medium">450+</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">Weddings Documented</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-white font-medium">4K</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">Cinema Prime Optics</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-white font-medium">18+</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">Global Destinations</div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-white font-medium">4.98</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mt-1 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Client Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PORTFOLIO HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-800">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
              Curated Gallery
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-wide">
              Selected Works & Stills
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('portfolio')}
            className="text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-amber-300 flex items-center gap-2 cursor-pointer font-medium"
          >
            <span>View Full Portfolio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightbox(item)}
              className="group relative h-96 rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-900 cursor-pointer"
            >
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                    {item.category}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl text-white font-medium">{item.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-1">{item.description}</p>
                {item.location && (
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{item.location} &bull; {item.clientName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BESPOKE SERVICES PREVIEW */}
      <section className="bg-zinc-950 py-24 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              Our Disciplines
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
              Tailored Photography & Cinema Services
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Each commission receives dedicated visual direction, specialized prime optics, and signature hand-graded tone curves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-52 w-full overflow-hidden relative">
                    <img
                      src={srv.imageUrl}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-amber-300 border border-zinc-700">
                      {srv.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-serif text-2xl text-white font-medium">{srv.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {srv.shortDescription}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800/80">
                      <span className="text-zinc-500">Starting from</span>
                      <span className="font-semibold text-white">₹{srv.startingPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => openBookingWizard(srv.id)}
                    className="w-full py-2.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-amber-400 hover:text-zinc-950 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Reserve Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setCurrentView('services')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
            >
              <span>Explore All 10 Studio Disciplines</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE FRAMEORA (Editorial Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              The Atelier Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal leading-tight">
              Artistry Crafted Without Compromise.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              In an era of fleeting social feeds and automated presets, FRAMEORA stands firmly for classic fine-art craftsmanship. We treat light as sculpture, time as a sacred canvas, and every commission as a legacy archival artifact.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white font-medium">Fine Art Precision</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every frame is meticulously balanced for skin tone fidelity, negative space harmony, and authentic connection.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Film className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white font-medium">4K Cinema Optics</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We employ Sony FX cinema systems and vintage anamorphic glass to deliver footage with unmatched organic texture.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white font-medium">Triple Archival Redundancy</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dual SD card recording on set, followed by immediate encrypted cloud replication and Cold-Storage SSD archiving.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-white font-medium">Guaranteed Turnaround</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Receive your 48-hour social highlight selects followed by your completed bespoke gallery strictly on schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
                alt="Editorial Portraiture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-zinc-900/95 border border-zinc-700/80 p-6 rounded-lg shadow-2xl max-w-xs backdrop-blur-md">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif italic text-sm text-white">
                "They didn't just document our wedding; they gave us a piece of cinema our children will cherish."
              </p>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-2 font-medium">
                Priya & Siddharth &bull; Udaipur
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLIENT TESTIMONIALS */}
      <section className="bg-zinc-950 py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              Kind Words
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
              Stories from Our Discerning Clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-xl flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="font-serif italic text-base text-zinc-300 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  {rev.avatarUrl && (
                    <img
                      src={rev.avatarUrl}
                      alt={rev.customerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{rev.customerName}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {rev.eventDate || 'Verified Commission'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-8 sm:p-16 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
            Limited Annual Commissions
          </span>
          <h2 className="font-serif text-3xl sm:text-6xl text-white font-normal max-w-2xl mx-auto">
            Ready to Create Something Timeless?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
            Our atelier accepts a curated number of weddings and commercial shoots each calendar season to preserve our bespoke standard. Reserve your date now.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBookingWizard()}
              className="px-8 py-4 rounded-md bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-[0.2em] hover:bg-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Book Your Session Online
            </button>
            <button
              onClick={() => setCurrentView('contact')}
              className="px-8 py-4 rounded-md bg-transparent border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-medium text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
            >
              Schedule Atelier Consultation
            </button>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL FOR PORTFOLIO */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute right-4 top-4 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-[60vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeLightbox.mediaUrl}
                alt={activeLightbox.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                  {activeLightbox.category} &bull; {activeLightbox.location}
                </span>
                <h3 className="font-serif text-2xl text-white font-medium">{activeLightbox.title}</h3>
                <p className="text-xs text-zinc-400">{activeLightbox.description}</p>
              </div>

              <button
                onClick={() => {
                  setActiveLightbox(null);
                  openBookingWizard();
                }}
                className="px-6 py-2.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0 cursor-pointer"
              >
                Inquire Similar Shoot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

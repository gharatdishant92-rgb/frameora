import React, { useState, useEffect } from 'react';
import { Service, ServicePackage } from '../types.ts';
import { Sparkles, Clock, CheckCircle2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface ServicesPageProps {
  openBookingWizard: (serviceId?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ openBookingWizard }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
      })
      .catch((err) => console.error('Failed to load services:', err));
  }, []);

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'wedding', label: 'Weddings & Pre-Weddings' },
    { id: 'cinematography', label: 'Cinematography' },
    { id: 'portrait', label: 'Portraits & Maternity' },
    { id: 'product', label: 'Commercial & Studio' },
    { id: 'event', label: 'Events & Galas' },
  ];

  const filteredServices = services.filter((s) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'wedding') return s.category === 'wedding' || s.category === 'pre-wedding';
    if (activeFilter === 'cinematography') return s.category === 'cinematography';
    if (activeFilter === 'portrait') return s.category === 'portrait';
    if (activeFilter === 'product') return s.category === 'product' || s.category === 'studio';
    if (activeFilter === 'event') return s.category === 'event';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
          Bespoke Disciplines
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal">
          Photography & Cinematography Services
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed font-light">
          Each commission is directed by seasoned artists equipped with state-of-the-art cinema systems, acoustic studio lighting, and fine-art color grading.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${
                activeFilter === cat.id
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-md shadow-amber-400/10'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List in Luxury Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              {/* Media banner */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold text-amber-300 border border-zinc-700">
                  {service.category}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                      {service.title}
                    </h2>
                    <span className="text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{service.durationHours} Hours Session Base</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Starting from</span>
                    <span className="font-serif text-2xl text-amber-300 font-semibold">
                      ₹{service.startingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Features */}
              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {service.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    What's Included in Every Commission
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Packages accordion / preview */}
                {service.packages && service.packages.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Available Commission Packages ({service.packages.length})</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm text-white font-medium">{pkg.name}</span>
                            <span className="text-xs font-semibold text-amber-300">
                              ₹{pkg.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Duration: <strong>{pkg.duration}</strong> &bull; Advance: ₹{pkg.advanceAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-zinc-500 line-clamp-1">
                            {pkg.deliverables.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 sm:p-8 pt-0 flex items-center gap-3">
              <button
                onClick={() => openBookingWizard(service.id)}
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book This Discipline Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

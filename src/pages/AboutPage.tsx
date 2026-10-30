import React, { useState, useEffect } from 'react';
import { Photographer } from '../types.ts';
import { Camera, Film, Star, Award, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  openBookingWizard: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ openBookingWizard }) => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);

  useEffect(() => {
    fetch('/api/photographers')
      .then((res) => res.json())
      .then((data) => setPhotographers(data))
      .catch((err) => console.error('Failed to load photographers:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* 1. Atelier Story Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
            Our Atelier & Genesis
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal leading-[1.1]">
            Documenting the Poetry of the Human Experience.
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed font-light">
            Founded in Mumbai with an uncompromising dedication to visual refinement, FRAMEORA was born out of frustration with formulaic photography studios. We sought to bring the timeless elegance of Italian cinema, classic Vogue editorial lighting, and raw documentarian intimacy under one roof.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">
            Over the past decade, our visual directors have chronicled monumental royal celebrations across Rajasthan, intimate coastal vows in Goa, executive campaigns in London, and high-fashion spreads in Paris.
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs text-zinc-400 border-t border-zinc-800">
            <div>
              <strong className="font-serif text-2xl text-white block">12+ Years</strong>
              <span>Artistic Provenance</span>
            </div>
            <div>
              <strong className="font-serif text-2xl text-white block">100%</strong>
              <span>Bespoke Retouching</span>
            </div>
            <div>
              <strong className="font-serif text-2xl text-white block">Global</strong>
              <span>Destination Mobility</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
              alt="FRAMEORA Atelier Vision"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 2. Creative Philosophy */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 sm:p-14 space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
            Creative Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Light as Sculpture. Time as an Heirloom.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-amber-400 font-serif text-3xl">01</div>
            <h3 className="font-serif text-xl text-white font-medium">Unobtrusive Presence</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The most profound frames happen when subjects forget the camera exists. We observe silently, allowing raw chemistry and spontaneous tears to unfold unhindered.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-amber-400 font-serif text-3xl">02</div>
            <h3 className="font-serif text-xl text-white font-medium">Anamorphic Depth</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We shoot moving pictures with true anamorphic lenses, yielding subtle lens flares, organic skin softness, and widescreen cinematic proportions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-amber-400 font-serif text-3xl">03</div>
            <h3 className="font-serif text-xl text-white font-medium">Archival Handcrafting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We partner with Milanese bookbinders for our flush-mount leather coffee table volumes, printed on heavyweight archival Hahnemühle cotton rag paper.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The Photographers & Directors Team */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
            The Collective
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
            Meet the Visual Directors
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Each photographer brings specialized mastery across cinematic lighting, candid photojournalism, and studio precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {photographers.map((ph) => (
            <div
              key={ph.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden p-6 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-60 w-full rounded-lg overflow-hidden bg-zinc-950">
                  <img
                    src={ph.avatarUrl}
                    alt={ph.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-white font-medium">{ph.name}</h3>
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold block mt-0.5">
                    {ph.specialization}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {ph.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold text-white">{ph.rating}</span>
                </div>
                <span>{ph.completedShoots}+ Commissions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Atelier Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t border-zinc-900">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
            The Studio Atelier
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            State-of-the-Art Acoustic Cyclorama in Mumbai
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Our premier studio space on Marine Drive features a 1,800 sq ft white infinity cyclorama, soundproof acoustic wall baffles, Profoto B10X and Pro-11 strobe systems, motorized seamless paper backdrops, and a private VIP dressing lounge.
          </p>

          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Full motorized Profoto C-stand and overhead boom grid</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>4K live tethered color-calibrated EIZO monitors</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Private bridal vanity room with professional daylight mirrors</span>
            </li>
          </ul>

          <button
            onClick={openBookingWizard}
            className="px-6 py-3 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Commission Studio Session
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border border-zinc-800 h-52">
            <img
              src="https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=600&q=80"
              alt="Studio Cyclorama"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-800 h-52 mt-6">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
              alt="Lighting Rig"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

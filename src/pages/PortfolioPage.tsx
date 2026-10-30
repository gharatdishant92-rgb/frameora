import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types.ts';
import { Play, Maximize2, X, MapPin, Sparkles, Filter } from 'lucide-react';

interface PortfolioPageProps {
  openBookingWizard: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ openBookingWizard }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Failed to load portfolio:', err));
  }, []);

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'pre-wedding', label: 'Pre-Wedding' },
    { id: 'cinematography', label: 'Cinematography' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'product', label: 'Product' },
    { id: 'studio', label: 'Studio' },
    { id: 'event', label: 'Event' },
  ];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
          Visual Archive
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal">
          Curated Portfolio & Films
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed font-light">
          An exploration of light, intimacy, and grand architecture documented across historic palaces, coastal frontiers, and controlled atelier studios.
        </p>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-md shadow-amber-400/10'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.mediaType === 'video') {
                setVideoModalUrl(item.mediaUrl);
              } else {
                setLightboxItem(item);
              }
            }}
            className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 h-[28rem] cursor-pointer shadow-lg"
          >
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Video badge if video */}
            {item.mediaType === 'video' && (
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
              </div>
            )}

            {/* Category tag */}
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider text-amber-300 font-medium border border-zinc-800">
              {item.category}
            </div>

            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <h3 className="font-serif text-2xl text-white font-medium leading-tight">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/80">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{item.location || 'Atelier Studio'}</span>
                </span>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <span>{item.mediaType === 'video' ? 'Watch Film' : 'Inspect Still'}</span>
                  <Maximize2 className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute right-4 top-4 z-10 p-2.5 bg-black/60 text-white hover:bg-black rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-[65vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxItem.mediaUrl}
                alt={lightboxItem.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold block">
                  {lightboxItem.category} &bull; {lightboxItem.location} &bull; {lightboxItem.clientName}
                </span>
                <h2 className="font-serif text-2xl text-white font-medium">{lightboxItem.title}</h2>
                <p className="text-xs text-zinc-400 max-w-2xl mt-1">{lightboxItem.description}</p>
              </div>

              <button
                onClick={() => {
                  setLightboxItem(null);
                  openBookingWizard();
                }}
                className="px-6 py-2.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0 cursor-pointer"
              >
                Book This Style
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Cinema Reel Player Modal */}
      {videoModalUrl && (
        <div
          onClick={() => setVideoModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setVideoModalUrl(null)}
              className="absolute right-4 top-4 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-zinc-950 ml-1" />
              </div>
              <h3 className="font-serif text-2xl text-white font-medium">4K Master Cinema Showcase</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                All cinema projects are recorded in 4K 10-bit 4:2:2 high-bitrate log color, graded in DaVinci Resolve, and delivered in DCP / ProRes and web-optimized masters.
              </p>
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 relative">
                <img
                  src={videoModalUrl}
                  alt="Cinema Reel Preview"
                  className="w-full h-full object-cover brightness-70"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-amber-300 bg-black/80 px-4 py-2 rounded-full border border-zinc-700">
                    4K Anamorphic Audio Stream Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

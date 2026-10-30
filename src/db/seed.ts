import { db } from './index.ts';
import {
  profiles,
  services,
  packages,
  photographers,
  photographerAvailability,
  portfolio,
  reviews,
  bookings,
  projects,
  projectTasks,
  payments,
  notifications,
} from './schema.ts';
import { count } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    const existingServices = await db.select({ count: count() }).from(services);
    if (Number(existingServices[0]?.count) > 0) {
      console.log('Database already seeded. Skipping initial seed.');
      return;
    }

    console.log('Seeding FRAMEORA database...');

    // 1. Profiles
    const adminProfileId = 'prof_admin_default';
    const clientProfileId = 'prof_client_default';

    await db.insert(profiles).values([
      {
        id: adminProfileId,
        uid: 'admin_master_uid',
        email: 'gharatdishant92@gmail.com',
        displayName: 'Dishant Gharat (Studio Director)',
        phoneNumber: '+91 98200 12345',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        address: 'FRAMEORA Atelier, Marine Drive, Mumbai',
      },
      {
        id: clientProfileId,
        uid: 'client_demo_uid',
        email: 'priya.sharma@example.com',
        displayName: 'Priya Sharma',
        phoneNumber: '+91 98765 43210',
        role: 'customer',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        address: 'Worli Sea Face, Mumbai',
      },
    ]);

    // 2. Photographers
    const p1 = 'ph_ethan_vance';
    const p2 = 'ph_maya_sen';
    const p3 = 'ph_aarav_kapoor';
    const p4 = 'ph_liam_hughes';

    await db.insert(photographers).values([
      {
        id: p1,
        name: 'Ethan Vance',
        email: 'ethan@frameora.com',
        phone: '+91 98111 22334',
        specialization: 'Creative Director & Lead Cinematographer',
        bio: 'Award-winning filmmaker with 12+ years documenting grand weddings, commercial narratives, and cinematic luxury films across 18 countries.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: 4.98,
        completedShoots: 142,
        isActive: true,
      },
      {
        id: p2,
        name: 'Maya Sen',
        email: 'maya@frameora.com',
        phone: '+91 98222 33445',
        specialization: 'Fine Art Wedding & Editorial Specialist',
        bio: 'Known for her painterly natural light portraits, emotive storytelling, and editorial bridal compositions that have graced Vogue Weddings and Harper’s Bazaar.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        rating: 4.95,
        completedShoots: 98,
        isActive: true,
      },
      {
        id: p3,
        name: 'Aarav Kapoor',
        email: 'aarav@frameora.com',
        phone: '+91 98333 44556',
        specialization: 'Studio Portrait & Commercial Product Artist',
        bio: 'Master of studio sculpting, dramatic strobe balance, high-fashion styling, and luxury commercial campaigns with immaculate detail.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        rating: 4.92,
        completedShoots: 115,
        isActive: true,
      },
      {
        id: p4,
        name: 'Liam Hughes',
        email: 'liam@frameora.com',
        phone: '+91 98444 55667',
        specialization: 'Drone Pilot & Documentary Videographer',
        bio: 'Licensed commercial drone operator capturing sweepingly majestic aerial compositions and raw unscripted candid event moments.',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
        rating: 4.94,
        completedShoots: 84,
        isActive: true,
      },
    ]);

    // 3. Services
    const sWedding = 'srv_wedding';
    const sPreWedding = 'srv_pre_wedding';
    const sCinema = 'srv_cinematography';
    const sEvent = 'srv_event';
    const sBirthday = 'srv_birthday';
    const sPortrait = 'srv_portrait';
    const sProduct = 'srv_product';
    const sMaternity = 'srv_maternity';
    const sStudio = 'srv_studio';
    const sCustom = 'srv_custom';

    await db.insert(services).values([
      {
        id: sWedding,
        title: 'Wedding Photography',
        slug: 'wedding-photography',
        category: 'wedding',
        shortDescription: 'Timeless, romantic, and emotion-driven royal wedding documentation crafted with fine art mastery.',
        description: 'Your wedding is a monumental once-in-a-lifetime tapestry of rituals, fleeting glances, and heartfelt joy. We capture intimate tears, regal bridal entries, and joyful revelry with fine art precision and cinematic grace.',
        startingPrice: 55000,
        durationHours: 8,
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Full-day multi-camera coverage',
          'Fine art candid & traditional portraits',
          'Signature tone color grading',
          'Private online gallery with instant cloud access',
          'Premium archival handcrafted photo book',
        ]),
        isActive: true,
      },
      {
        id: sPreWedding,
        title: 'Pre-Wedding Photography',
        slug: 'pre-wedding-photography',
        category: 'pre-wedding',
        shortDescription: 'Cinematic destination couple sessions that celebrate your intimate chemistry in bespoke landscapes.',
        description: 'From romantic sea clifftops to royal heritage fortresses, our pre-wedding shoots combine high-fashion styling with cinematic storytelling to capture the genuine poetry of your love before the vows.',
        startingPrice: 32000,
        durationHours: 5,
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Location scouting & mood-board consultation',
          '2 to 3 outfit look changes',
          'High-resolution retouched master frames',
          'Cinematic 60-second teaser for social invite',
          'Same-week preview deliverable',
        ]),
        isActive: true,
      },
      {
        id: sCinema,
        title: 'Cinematography & Films',
        slug: 'cinematography',
        category: 'cinematography',
        shortDescription: 'Hollywood-grade 4K cinematic storytelling featuring bespoke musical scores and aerial drone cinematography.',
        description: 'Moving pictures that stir your soul. We employ anamorphic cinema primes, high-bitrate color science, aerial drone compositions, and intimate sound design to produce a feature film that feels like a festival masterpiece.',
        startingPrice: 65000,
        durationHours: 8,
        imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          '4K cinema camera rigs & gimbal stabilization',
          'Licensed aerial drone captures',
          'Original sound mixing and emotional audio recordings',
          '3-minute highlight trailer + 20-minute feature cut',
          'Delivered on bespoke wooden laser-etched USB drive',
        ]),
        isActive: true,
      },
      {
        id: sEvent,
        title: 'Event Photography',
        slug: 'event-photography',
        category: 'event',
        shortDescription: 'High-energy coverage for corporate galas, fashion runways, award ceremonies, and exhibitions.',
        description: 'Immaculate event coverage that reflects the grandeur of your milestone. We capture key speakers, candid guest moments, architectural lighting, and VIP interactions with prompt media turnarounds.',
        startingPrice: 25000,
        durationHours: 4,
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Same-day press/social media preview',
          'High-speed candid capture',
          'Step-and-repeat VIP backdrop portraits',
          'Full digital rights for marketing & PR',
        ]),
        isActive: true,
      },
      {
        id: sBirthday,
        title: 'Birthday & Milestone Celebrations',
        slug: 'birthday-photography',
        category: 'event',
        shortDescription: 'Joyous, vibrant memories of birthday milestones, anniversaries, and family celebrations.',
        description: 'Every birthday milestone deserves to be remembered with unscripted laughs, heartfelt hugs, cake-cutting cheers, and family warmth in vivid color.',
        startingPrice: 18000,
        durationHours: 3,
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Candid guest interactions',
          'Cake ceremony highlights',
          'Group family portraits',
          'Next-day highlight album preview',
        ]),
        isActive: true,
      },
      {
        id: sPortrait,
        title: 'Portrait Photography',
        slug: 'portrait-photography',
        category: 'portrait',
        shortDescription: 'Fine-art editorial portraits, corporate executive headshots, and creative actor portfolios.',
        description: 'An evocative portrait is more than a photograph; it reveals your identity, poise, and confidence. We sculpt flattering studio or environmental light to create portraits that command respect and captivate viewers.',
        startingPrice: 12000,
        durationHours: 2,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Creative direction & styling guidance',
          'Magazine-quality natural skin retouching',
          'High-resolution commercial & personal licensing',
          'Multiple backdrop and wardrobe setups',
        ]),
        isActive: true,
      },
      {
        id: sProduct,
        title: 'Product & Commercial Photography',
        slug: 'product-photography',
        category: 'product',
        shortDescription: 'Conversion-driven commercial imagery for luxury brands, e-commerce, and editorial campaigns.',
        description: 'Elevate your brand presence. We specialize in jewelry, cosmetics, watches, apparel, and beverage styling, highlighting textures and reflections that stimulate desire and drive conversions.',
        startingPrice: 22000,
        durationHours: 4,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Precision studio lighting & focus stacking',
          'Ghost mannequin and flat-lay styling',
          'Color accurate calibration for web & print',
          'Commercial copyright clearance',
        ]),
        isActive: true,
      },
      {
        id: sMaternity,
        title: 'Maternity & Newborn Photography',
        slug: 'maternity-photography',
        category: 'portrait',
        shortDescription: 'Elegantly intimate maternity sessions celebrating the divine beauty of motherhood.',
        description: 'Honor the miraculous journey of bringing new life into the world with serene, ethereal, and artistic maternity portraits in our private, comfortable studio or outdoor sunset setting.',
        startingPrice: 20000,
        durationHours: 2,
        imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Access to luxury studio maternity gowns',
          'Couple & family inclusion',
          'Gentle, relaxed pacing for maximum comfort',
          'Fine art digital prints & album inclusion',
        ]),
        isActive: true,
      },
      {
        id: sStudio,
        title: 'Studio Photography',
        slug: 'studio-photography',
        category: 'studio',
        shortDescription: 'Controlled studio environment with state-of-the-art Profoto lighting and cyclorama backdrops.',
        description: 'Our soundproof, climate-controlled studio in Mumbai is equipped with Profoto B10 lights, motorized backdrops, private dressing lounges, and high-speed tethered viewing for creators and agencies.',
        startingPrice: 15000,
        durationHours: 3,
        imageUrl: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Unlimited access to color paper sweeps',
          'Tethered live display for instant review',
          'Hair & makeup vanity station',
          'Assisting technician on floor',
        ]),
        isActive: true,
      },
      {
        id: sCustom,
        title: 'Custom Shoots & Brand Campaigns',
        slug: 'custom-shoots',
        category: 'custom',
        shortDescription: 'Tailored productions, destination expeditions, lookbooks, and bespoke visual art commissions.',
        description: 'Have an extraordinary vision that defies standard packages? We assemble bespoke crews, permit logistics, drone teams, and art directors to produce unmatched cinematic campaigns anywhere globally.',
        startingPrice: 40000,
        durationHours: 6,
        imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
        features: JSON.stringify([
          'Bespoke production planning & mood boards',
          'Multi-disciplinary creative team',
          'Custom equipment & lighting setup',
          'Dedicated creative director supervision',
        ]),
        isActive: true,
      },
    ]);

    // 4. Packages
    await db.insert(packages).values([
      // Wedding packages
      {
        id: 'pkg_wed_silver',
        serviceId: sWedding,
        name: 'Silver Essential',
        price: 55000,
        advanceAmount: 18000,
        duration: '6 Hours',
        deliverables: JSON.stringify([
          '1 Lead Candid Photographer',
          '1 Traditional Photographer',
          '250 Master Color-Graded Photos',
          'Online High-Res Client Gallery',
          'Delivery within 3 weeks',
        ]),
        isPopular: false,
      },
      {
        id: 'pkg_wed_gold',
        serviceId: sWedding,
        name: 'Gold Signature',
        price: 95000,
        advanceAmount: 30000,
        duration: 'Full Day (10 Hours)',
        deliverables: JSON.stringify([
          '2 Lead Photographers',
          '1 Lead 4K Cinematographer',
          '450 Color-Graded Art Photos',
          '3-4 Minute 4K Cinematic Highlights Film',
          'Bespoke Handcrafted Leather Photo Album',
          'Delivery within 2 weeks',
        ]),
        isPopular: true,
      },
      {
        id: 'pkg_wed_plat',
        serviceId: sWedding,
        name: 'Platinum Royal',
        price: 160000,
        advanceAmount: 50000,
        duration: 'Multi-Day / Unlimited',
        deliverables: JSON.stringify([
          'Full Production Crew (3 Photographers + 2 Cinematographers)',
          'Aerial 4K Drone Pilot',
          'Unlimited Edited Fine Art Stills',
          '15-20 Min Feature Film + 60s Social Teaser',
          'Two Deluxe Italian Leather Albums',
          'Raw footage & stills on customized archive SSD',
        ]),
        isPopular: false,
      },

      // Pre-Wedding packages
      {
        id: 'pkg_prewed_classic',
        serviceId: sPreWedding,
        name: 'Classic Romance',
        price: 32000,
        advanceAmount: 10000,
        duration: '4 Hours',
        deliverables: JSON.stringify([
          '1 Scenic Location',
          '2 Wardrobe Changes',
          '50 Fine-Art Retouched Images',
          'High-Resolution Online Gallery',
        ]),
        isPopular: false,
      },
      {
        id: 'pkg_prewed_cinematic',
        serviceId: sPreWedding,
        name: 'Cinematic Grandeur',
        price: 58000,
        advanceAmount: 20000,
        duration: '8 Hours (Full Day)',
        deliverables: JSON.stringify([
          '2 Iconic Locations or Heritage Site',
          '3-4 Wardrobe Changes',
          '80 Master Retouched Frames',
          '60-90 Second 4K Cinematic Love Story Video',
          'Aerial Drone Coverage',
        ]),
        isPopular: true,
      },

      // Cinematography packages
      {
        id: 'pkg_cine_highlight',
        serviceId: sCinema,
        name: 'Cinematic Highlight',
        price: 65000,
        advanceAmount: 20000,
        duration: '6 Hours',
        deliverables: JSON.stringify([
          '2 Cinema Cameras (Sony FX6 / FX3)',
          '3-5 Minute 4K Cinematic Highlight Reel',
          'Licensed Original Soundtrack',
          'Digital Master 4K Delivery',
        ]),
        isPopular: false,
      },
      {
        id: 'pkg_cine_feature',
        serviceId: sCinema,
        name: 'Feature Narrative & Drone',
        price: 110000,
        advanceAmount: 35000,
        duration: 'Full Day (10 Hours)',
        deliverables: JSON.stringify([
          '3 Cinema Operators + Drone Pilot',
          '15-20 Minute Docu-Feature Film',
          '1 Minute Vertical Teaser for Instagram',
          'Professional Audio Mastering & Speech Capture',
          'Hard drive with all raw rushes',
        ]),
        isPopular: true,
      },

      // Portrait packages
      {
        id: 'pkg_port_exec',
        serviceId: sPortrait,
        name: 'Executive Headshots',
        price: 12000,
        advanceAmount: 4000,
        duration: '90 Minutes',
        deliverables: JSON.stringify([
          'Studio or Office Environment',
          '5 Magazine-grade Retouched Images',
          'LinkedIn & Press Release Dimensions',
          '48-Hour Rapid Delivery',
        ]),
        isPopular: false,
      },
      {
        id: 'pkg_port_editorial',
        serviceId: sPortrait,
        name: 'Editorial & Fashion Portfolio',
        price: 24000,
        advanceAmount: 8000,
        duration: '3.5 Hours',
        deliverables: JSON.stringify([
          '4 Distinct Stylized Lighting Looks',
          '18 Retouched High-Fashion Deliverables',
          'Agency Comp-Card Ready Formats',
          'Wardrobe & Posing Consultation',
        ]),
        isPopular: true,
      },

      // Event packages
      {
        id: 'pkg_event_standard',
        serviceId: sEvent,
        name: 'Corporate Half-Day',
        price: 25000,
        advanceAmount: 8000,
        duration: '4 Hours',
        deliverables: JSON.stringify([
          '1 Senior Event Photographer',
          '150 High-Res Edited Photos',
          'Next-day Express Preview for PR',
          'Full Commercial Usage Rights',
        ]),
        isPopular: true,
      },

      // Studio packages
      {
        id: 'pkg_studio_half',
        serviceId: sStudio,
        name: 'Half-Day Studio Session',
        price: 15000,
        advanceAmount: 5000,
        duration: '3 Hours',
        deliverables: JSON.stringify([
          'Full Access to Cyclorama and Backdrops',
          'Profoto Lighting System Included',
          'Tethered Monitor Preview',
          'Assistant on Floor',
        ]),
        isPopular: true,
      },
    ]);

    // 5. Portfolio Items
    await db.insert(portfolio).values([
      {
        id: 'port_1',
        title: 'Royal Udaipur Palace Vows',
        category: 'wedding',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        description: 'An ethereal palace wedding overlooking Lake Pichola with golden hour bridal portraits.',
        clientName: 'Aditya & Ananya',
        location: 'Udaipur, Rajasthan',
        isFeatured: true,
        orderIndex: 1,
      },
      {
        id: 'port_2',
        title: 'Sunset Coastline Cinema Film',
        category: 'cinematography',
        mediaType: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
        description: 'A 4K anamorphic love story filmed across coastal cliffs and golden shores of Goa.',
        clientName: 'Kabir & Tara',
        location: 'Goa',
        isFeatured: true,
        orderIndex: 2,
      },
      {
        id: 'port_3',
        title: 'Minimalist Architectural Romance',
        category: 'pre-wedding',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        description: 'Modern lines, quiet intimacy, and monochromatic elegance in a heritage pavilion.',
        clientName: 'Rohan & Sanjana',
        location: 'Jaipur',
        isFeatured: true,
        orderIndex: 3,
      },
      {
        id: 'port_4',
        title: 'The Director’s Monochrome Portrait',
        category: 'portrait',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        description: 'Chiaroscuro studio lighting capturing depth, character, and silent intensity.',
        clientName: 'Natasha Mehta',
        location: 'FRAMEORA Studio, Mumbai',
        isFeatured: true,
        orderIndex: 4,
      },
      {
        id: 'port_5',
        title: 'Chronograph Luxury Campaign',
        category: 'product',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        description: 'Precision macro lighting for Swiss timepieces with obsidian stone reflections.',
        clientName: 'Atelier Horology',
        location: 'Studio A',
        isFeatured: false,
        orderIndex: 5,
      },
      {
        id: 'port_6',
        title: 'Annual Forbes Leadership Gala',
        category: 'event',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
        description: 'Grand ballroom lighting and candid leadership moments captured in dynamic motion.',
        clientName: 'Global Leaders Summit',
        location: 'The Taj Mahal Palace, Mumbai',
        isFeatured: false,
        orderIndex: 6,
      },
      {
        id: 'port_7',
        title: 'Golden Sunset Silhouette',
        category: 'pre-wedding',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
        description: 'Intimate sunset glow on the dunes with desert winds shaping the bride’s silk veil.',
        clientName: 'Vikram & Radhika',
        location: 'Jaisalmer',
        isFeatured: true,
        orderIndex: 7,
      },
      {
        id: 'port_8',
        title: 'Editorial High-Fashion Lookbook',
        category: 'studio',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
        description: 'Studio color gel experiments creating futuristic editorial aesthetics for Autumn 2026 collection.',
        clientName: 'Maison Noir',
        location: 'FRAMEORA Studio B',
        isFeatured: false,
        orderIndex: 8,
      },
    ]);

    // 6. Reviews
    await db.insert(reviews).values([
      {
        id: 'rev_1',
        customerId: clientProfileId,
        customerName: 'Priya & Siddharth Malhotra',
        serviceId: sWedding,
        rating: 5,
        comment: 'FRAMEORA exceeded every wild expectation we had. Ethan and Maya did not just take photos; they created cinematic works of art. Watching our wedding teaser made our entire family cry joyful tears. Truly world-class artistry.',
        eventDate: 'February 2026',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        isPublished: true,
      },
      {
        id: 'rev_2',
        customerId: null,
        customerName: 'Devika Singhania',
        serviceId: sPreWedding,
        rating: 5,
        comment: 'From styling advice to making us laugh naturally in front of anamorphic cinema lenses, the team was extraordinary. The photographs look like stills straight out of a Criterion film. Worth every single penny!',
        eventDate: 'January 2026',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isPublished: true,
      },
      {
        id: 'rev_3',
        customerId: null,
        customerName: 'Rajesh Vardhan, VP Marketing',
        serviceId: sEvent,
        rating: 5,
        comment: 'We booked FRAMEORA for our annual global leadership summit in Mumbai. Their speed, discipline, unobtrusive shooting style, and high-res media turnaround in under 24 hours was the best corporate experience we have had.',
        eventDate: 'March 2026',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isPublished: true,
      },
    ]);

    // 7. Seed Sample Booking & Project
    const sampleBookingId = 'bk_sample_001';
    const sampleBookingCode = 'FRM-2026-8910';

    await db.insert(bookings).values({
      id: sampleBookingId,
      bookingCode: sampleBookingCode,
      customerId: clientProfileId,
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 98765 43210',
      serviceId: sWedding,
      packageId: 'pkg_wed_gold',
      photographerId: p1,
      date: '2026-11-15',
      timeSlot: '14:00 - 18:00',
      locationType: 'outdoor',
      locationAddress: 'Taj Lands End, Bandra West, Mumbai',
      specialRequirements: 'Sunset ceremony on seaside lawn. Please focus on emotional moments with grandparents and grand floral entry.',
      totalAmount: 95000,
      advanceAmount: 30000,
      paidAmount: 30000,
      paymentStatus: 'advance_paid',
      status: 'confirmed',
      adminNotes: 'Assigned Ethan Vance as lead director. Drone clearance approved.',
    });

    // 8. Sample Payment
    await db.insert(payments).values({
      id: 'pay_sample_001',
      bookingId: sampleBookingId,
      amount: 30000,
      currency: 'INR',
      paymentType: 'advance',
      paymentMethod: 'razorpay',
      transactionId: 'txn_rzp_9847129581',
      razorpayOrderId: 'order_P9K1j0a9L8b7',
      razorpayPaymentId: 'pay_P9K2x9Z1L8a4',
      status: 'successful',
      receiptUrl: '/receipts/FRM-2026-8910-ADV.pdf',
    });

    // 9. Sample Project with Post-Production Stages
    const sampleProjectId = 'proj_sample_001';
    await db.insert(projects).values({
      id: sampleProjectId,
      bookingId: sampleBookingId,
      title: 'Priya & Siddharth Royal Wedding Film & Stills',
      stage: 'photo_editing',
      assignedPhotographerId: p1,
      deliveryDueDate: '2026-11-30',
      clientGalleryUrl: 'https://gallery.frameora.com/u/priya-siddharth-2026',
      rawFilesCount: 2840,
      editedFilesCount: 380,
      notes: 'Initial selects completed. Colorist grading 4K teaser footage.',
    });

    // 10. Sample Tasks
    await db.insert(projectTasks).values([
      {
        id: 'task_1',
        projectId: sampleProjectId,
        title: 'Culling & Raw Image Ingestion',
        assignedTo: 'Maya Sen',
        status: 'completed',
        dueDate: '2026-11-17',
      },
      {
        id: 'task_2',
        projectId: sampleProjectId,
        title: 'Color Grading & Exposure Balancing (450 frames)',
        assignedTo: 'Ethan Vance',
        status: 'in_progress',
        dueDate: '2026-11-22',
      },
      {
        id: 'task_3',
        projectId: sampleProjectId,
        title: '4K Film Sound Design & Teaser Cut',
        assignedTo: 'Liam Hughes',
        status: 'pending',
        dueDate: '2026-11-26',
      },
    ]);

    // 11. Sample Notification
    await db.insert(notifications).values({
      id: 'notif_sample_001',
      userId: clientProfileId,
      recipientEmail: 'priya.sharma@example.com',
      type: 'booking_confirmation',
      title: 'Booking Confirmed - FRM-2026-8910',
      message: 'Your booking for Wedding Photography (Gold Signature) on Nov 15, 2026 has been confirmed with Lead Director Ethan Vance.',
      status: 'sent',
    });

    console.log('FRAMEORA initial seed completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

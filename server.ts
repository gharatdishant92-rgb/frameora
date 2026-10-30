import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  profiles,
  services,
  packages,
  photographers,
  photographerAvailability,
  portfolio,
  reviews,
  bookings,
  bookingItems,
  projects,
  projectTasks,
  payments,
  notifications,
} from './src/db/schema.ts';
import { seedDatabase } from './src/db/seed.ts';
import { requireAuth, requireAdmin, AuthRequest } from './src/middleware/auth.ts';
import { sendNotificationEmail } from './src/lib/resend.ts';
import { createRazorpayOrder, verifyRazorpaySignature } from './src/lib/razorpay.ts';
import { eq, desc, and, ne, sql, count, or, ilike } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Seed database on startup
seedDatabase().catch((err) => console.error('Seed execution error:', err));

// ==========================================
// 1. AUTHENTICATION & PROFILE ROUTES
// ==========================================

// Demo / Instant Login route (supports switching between Director/Admin, Customer, and Photographer)
app.post('/api/auth/demo-login', async (req: Request, res: Response) => {
  const { role = 'customer' } = req.body;
  try {
    let targetUid = 'client_demo_uid';
    let targetEmail = 'priya.sharma@example.com';
    let targetName = 'Priya Sharma';

    if (role === 'admin') {
      targetUid = 'admin_master_uid';
      targetEmail = 'gharatdishant92@gmail.com';
      targetName = 'Dishant Gharat (Studio Director)';
    } else if (role === 'photographer') {
      targetUid = 'ph_ethan_vance_uid';
      targetEmail = 'ethan@frameora.com';
      targetName = 'Ethan Vance';
    }

    let existing = await db.select().from(profiles).where(eq(profiles.uid, targetUid)).limit(1);
    if (!existing[0]) {
      const newId = `prof_${targetUid}`;
      await db.insert(profiles).values({
        id: newId,
        uid: targetUid,
        email: targetEmail,
        displayName: targetName,
        role: role === 'admin' ? 'admin' : (role === 'photographer' ? 'photographer' : 'customer'),
      }).onConflictDoNothing();
      existing = await db.select().from(profiles).where(eq(profiles.uid, targetUid)).limit(1);
    }

    const demoToken = `demo_token_${role}_${targetUid}_${targetEmail}`;
    return res.json({
      token: demoToken,
      user: {
        id: existing[0].id,
        uid: existing[0].uid,
        email: existing[0].email,
        displayName: existing[0].displayName,
        role: existing[0].role,
        avatarUrl: existing[0].avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Demo login failed:', error);
    res.status(500).json({ error: 'Failed to complete demo login' });
  }
});

// Get current profile
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.uid, req.user!.uid)).limit(1);
    if (!profile[0]) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile[0]);
  } catch (error: any) {
    console.error('Failed to fetch profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
app.put('/api/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, phoneNumber, address, avatarUrl } = req.body;
    const updated = await db
      .update(profiles)
      .set({
        displayName,
        phoneNumber,
        address,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.uid, req.user!.uid))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 2. SERVICES & PACKAGES
// ==========================================

// Get all public active services
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const allServices = await db.select().from(services).where(eq(services.isActive, true));
    const allPackages = await db.select().from(packages);

    const result = allServices.map((service) => {
      const servicePackages = allPackages.filter((pkg) => pkg.serviceId === service.id);
      return {
        ...service,
        features: JSON.parse(service.features || '[]'),
        packages: servicePackages.map((p) => ({
          ...p,
          deliverables: JSON.parse(p.deliverables || '[]'),
        })),
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Failed to fetch services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service by slug
app.get('/api/services/:slug', async (req: Request, res: Response) => {
  try {
    const service = await db.select().from(services).where(eq(services.slug, req.params.slug)).limit(1);
    if (!service[0]) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const servicePackages = await db.select().from(packages).where(eq(packages.serviceId, service[0].id));
    res.json({
      ...service[0],
      features: JSON.parse(service[0].features || '[]'),
      packages: servicePackages.map((p) => ({
        ...p,
        deliverables: JSON.parse(p.deliverables || '[]'),
      })),
    });
  } catch (error: any) {
    console.error('Failed to fetch service details:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Admin: Create service
app.post('/api/admin/services', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, category, description, shortDescription, startingPrice, durationHours, imageUrl, features } = req.body;
    const id = `srv_${Date.now()}`;
    const newService = await db.insert(services).values({
      id,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      category,
      description,
      shortDescription,
      startingPrice: Number(startingPrice),
      durationHours: Number(durationHours) || 3,
      imageUrl,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      isActive: true,
    }).returning();

    res.status(201).json(newService[0]);
  } catch (error: any) {
    console.error('Admin create service failed:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Admin: Update service
app.put('/api/admin/services/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, shortDescription, startingPrice, durationHours, imageUrl, features, isActive } = req.body;
    const updated = await db.update(services).set({
      title,
      category,
      description,
      shortDescription,
      startingPrice: Number(startingPrice),
      durationHours: Number(durationHours),
      imageUrl,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      isActive,
      updatedAt: new Date(),
    }).where(eq(services.id, req.params.id)).returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Admin update service failed:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Admin: Create package
app.post('/api/admin/packages', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, name, price, advanceAmount, duration, deliverables, isPopular } = req.body;
    const id = `pkg_${Date.now()}`;
    const newPkg = await db.insert(packages).values({
      id,
      serviceId,
      name,
      price: Number(price),
      advanceAmount: Number(advanceAmount),
      duration,
      deliverables: typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables || []),
      isPopular: Boolean(isPopular),
    }).returning();

    res.status(201).json(newPkg[0]);
  } catch (error: any) {
    console.error('Admin create package failed:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// ==========================================
// 3. PHOTOGRAPHERS
// ==========================================

app.get('/api/photographers', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(photographers).where(eq(photographers.isActive, true));
    res.json(list);
  } catch (error: any) {
    console.error('Failed to fetch photographers:', error);
    res.status(500).json({ error: 'Failed to fetch photographers' });
  }
});

app.post('/api/admin/photographers', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, specialization, bio, avatarUrl } = req.body;
    const id = `ph_${Date.now()}`;
    const newPhotographer = await db.insert(photographers).values({
      id,
      name,
      email,
      phone,
      specialization,
      bio,
      avatarUrl,
      isActive: true,
    }).returning();
    res.status(201).json(newPhotographer[0]);
  } catch (error: any) {
    console.error('Create photographer failed:', error);
    res.status(500).json({ error: 'Failed to create photographer' });
  }
});

// ==========================================
// 4. AVAILABILITY & DOUBLE-BOOKING PREVENTION
// ==========================================

// Standard studio & shoot time slots
const STANDARD_SLOTS = [
  '09:00 - 13:00',
  '14:00 - 18:00',
  '18:00 - 22:00',
];

app.get('/api/availability/slots', async (req: Request, res: Response) => {
  try {
    const { date, photographerId } = req.query as { date: string; photographerId?: string };
    if (!date) {
      return res.status(400).json({ error: 'Date parameter (YYYY-MM-DD) is required' });
    }

    // 1. Fetch bookings on this date that are not cancelled or rejected
    const existingBookings = await db
      .select({ timeSlot: bookings.timeSlot, photographerId: bookings.photographerId, locationType: bookings.locationType })
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'rejected')
        )
      );

    // 2. Fetch blocked slots in photographer availability
    const blockedSlots = await db
      .select({ timeSlot: photographerAvailability.timeSlot, photographerId: photographerAvailability.photographerId })
      .from(photographerAvailability)
      .where(
        and(
          eq(photographerAvailability.date, date),
          eq(photographerAvailability.isBlocked, true)
        )
      );

    const slotStatus = STANDARD_SLOTS.map((slot) => {
      // Check if slot is taken
      let isBooked = false;

      if (photographerId) {
        // If specific photographer requested, check if they are booked or blocked
        isBooked =
          existingBookings.some((b) => b.timeSlot === slot && b.photographerId === photographerId) ||
          blockedSlots.some((s) => s.timeSlot === slot && s.photographerId === photographerId);
      } else {
        // Studio capacity limit: maximum 3 parallel sessions across distinct crews/studios
        const countForSlot = existingBookings.filter((b) => b.timeSlot === slot).length;
        isBooked = countForSlot >= 3;
      }

      return {
        slot,
        available: !isBooked,
        bookedCount: existingBookings.filter((b) => b.timeSlot === slot).length,
      };
    });

    res.json({ date, slots: slotStatus });
  } catch (error: any) {
    console.error('Availability check failed:', error);
    res.status(500).json({ error: 'Failed to verify slot availability' });
  }
});

// ==========================================
// 5. BOOKINGS SYSTEM (Double booking safe)
// ==========================================

// Create booking
app.post('/api/bookings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      serviceId,
      packageId,
      photographerId,
      date,
      timeSlot,
      locationType,
      locationAddress,
      specialRequirements,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    if (!serviceId || !packageId || !date || !timeSlot || !locationAddress) {
      return res.status(400).json({ error: 'Missing required booking parameters' });
    }

    // 1. Double Booking Check (Transaction safety)
    const existing = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          eq(bookings.timeSlot, timeSlot),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'rejected'),
          photographerId ? eq(bookings.photographerId, photographerId) : sql`1=1`
        )
      );

    // If photographer specifically selected and booked, prevent double booking
    if (photographerId && existing.length > 0) {
      return res.status(409).json({
        error: 'The selected photographer is already booked for this time slot. Please choose another slot or photographer.',
      });
    }

    // Overall capacity limit per slot
    if (existing.length >= 3) {
      return res.status(409).json({
        error: 'All studio production slots are fully reserved for this time. Please select another slot.',
      });
    }

    // 2. Fetch package pricing
    const pkg = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    if (!pkg[0]) {
      return res.status(404).json({ error: 'Selected package not found' });
    }

    // 3. Generate unique booking code
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `FRM-${new Date().getFullYear()}-${uniqueNum}`;
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Ensure customer profile exists
    let customerProfile = await db.select().from(profiles).where(eq(profiles.uid, req.user!.uid)).limit(1);
    let profileId = customerProfile[0]?.id;
    if (!profileId) {
      profileId = `prof_${req.user!.uid}`;
      await db.insert(profiles).values({
        id: profileId,
        uid: req.user!.uid,
        email: customerEmail || req.user!.email,
        displayName: customerName || req.user!.displayName || 'Valued Client',
        phoneNumber: customerPhone || null,
        role: 'customer',
      }).onConflictDoNothing();
    }

    // 4. Insert booking
    const newBooking = await db.insert(bookings).values({
      id: bookingId,
      bookingCode,
      customerId: profileId,
      customerName: customerName || req.user!.displayName || 'Valued Client',
      customerEmail: customerEmail || req.user!.email,
      customerPhone: customerPhone || '+91 98000 00000',
      serviceId,
      packageId,
      photographerId: photographerId || null,
      date,
      timeSlot,
      locationType: locationType || 'studio',
      locationAddress,
      specialRequirements: specialRequirements || '',
      totalAmount: pkg[0].price,
      advanceAmount: pkg[0].advanceAmount,
      paidAmount: 0,
      paymentStatus: 'pending',
      status: 'confirmed', // Confirmed appointment request
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 5. Automatically spawn post-production project record in 'booking_confirmed' stage
    const projectId = `proj_${bookingId}`;
    const srv = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
    const serviceTitle = srv[0]?.title || 'Photography Session';

    await db.insert(projects).values({
      id: projectId,
      bookingId,
      title: `${customerName} - ${serviceTitle}`,
      stage: 'booking_confirmed',
      assignedPhotographerId: photographerId || null,
      deliveryDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientGalleryUrl: `https://gallery.frameora.com/client/${bookingCode.toLowerCase()}`,
      notes: specialRequirements || 'New booking confirmed via customer portal.',
    });

    // Default tasks
    await db.insert(projectTasks).values([
      {
        id: `task_${Date.now()}_1`,
        projectId,
        title: 'Initial Creative Consultation & Mood-board Alignment',
        status: 'pending',
      },
      {
        id: `task_${Date.now()}_2`,
        projectId,
        title: 'Pre-Shoot Gear & Lighting Inspection',
        status: 'pending',
      },
    ]);

    // 6. Send transactional notification email (Resend)
    await sendNotificationEmail({
      to: customerEmail || req.user!.email,
      subject: `Booking Confirmed: ${bookingCode} - FRAMEORA Studio`,
      type: 'booking_confirmation',
      userId: profileId,
      html: `
        <div style="font-family: serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="font-size: 24px; letter-spacing: 2px;">FRAMEORA</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for choosing FRAMEORA. Your photography & cinematography session has been confirmed.</p>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${bookingCode}</p>
            <p><strong>Date & Time:</strong> ${date} (${timeSlot})</p>
            <p><strong>Location:</strong> ${locationAddress} (${locationType})</p>
            <p><strong>Total Amount:</strong> ₹${pkg[0].price.toLocaleString('en-IN')}</p>
            <p><strong>Advance Payable:</strong> ₹${pkg[0].advanceAmount.toLocaleString('en-IN')}</p>
          </div>
          <p>We look forward to creating timeless cinematic memories with you.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">FRAMEORA Atelier &bull; Marine Drive, Mumbai &bull; +91 98200 12345</p>
        </div>
      `,
    });

    res.status(201).json(newBooking[0]);
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to complete booking' });
  }
});

// Get user bookings
app.get('/api/bookings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isUserAdmin = req.user!.role === 'admin';
    let userBookings;

    if (isUserAdmin) {
      userBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    } else {
      // Find profile
      const prof = await db.select().from(profiles).where(eq(profiles.uid, req.user!.uid)).limit(1);
      const profId = prof[0]?.id;
      userBookings = await db
        .select()
        .from(bookings)
        .where(
          or(
            profId ? eq(bookings.customerId, profId) : sql`1=0`,
            eq(bookings.customerEmail, req.user!.email)
          )
        )
        .orderBy(desc(bookings.createdAt));
    }

    const allServices = await db.select().from(services);
    const allPackages = await db.select().from(packages);
    const allPhotographers = await db.select().from(photographers);

    const enriched = userBookings.map((b) => ({
      ...b,
      service: allServices.find((s) => s.id === b.serviceId),
      package: allPackages.find((p) => p.id === b.packageId),
      photographer: allPhotographers.find((ph) => ph.id === b.photographerId),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Single booking details with payment and project status
app.get('/api/bookings/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await db.select().from(bookings).where(eq(bookings.id, req.params.id)).limit(1);
    if (!booking[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const srv = await db.select().from(services).where(eq(services.id, booking[0].serviceId)).limit(1);
    const pkg = await db.select().from(packages).where(eq(packages.id, booking[0].packageId)).limit(1);
    const ph = booking[0].photographerId
      ? await db.select().from(photographers).where(eq(photographers.id, booking[0].photographerId)).limit(1)
      : [];
    const bPayments = await db.select().from(payments).where(eq(payments.bookingId, booking[0].id));
    const bProject = await db.select().from(projects).where(eq(projects.bookingId, booking[0].id)).limit(1);

    res.json({
      ...booking[0],
      service: srv[0],
      package: pkg[0],
      photographer: ph[0] || null,
      payments: bPayments,
      project: bProject[0] || null,
    });
  } catch (error: any) {
    console.error('Fetch booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Reschedule booking
app.put('/api/bookings/:id/reschedule', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'New date and time slot are required' });
    }

    const booking = await db.select().from(bookings).where(eq(bookings.id, req.params.id)).limit(1);
    if (!booking[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check slot availability
    const conflict = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          eq(bookings.timeSlot, timeSlot),
          ne(bookings.id, req.params.id),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'rejected'),
          booking[0].photographerId ? eq(bookings.photographerId, booking[0].photographerId) : sql`1=1`
        )
      );

    if (conflict.length > 0 && booking[0].photographerId) {
      return res.status(409).json({ error: 'The requested slot is already booked for this photographer.' });
    }

    const updated = await db
      .update(bookings)
      .set({
        date,
        timeSlot,
        status: 'rescheduled',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id))
      .returning();

    // Notify customer
    await sendNotificationEmail({
      to: booking[0].customerEmail,
      subject: `Appointment Rescheduled: ${booking[0].bookingCode}`,
      type: 'rescheduled',
      userId: booking[0].customerId,
      html: `
        <p>Dear ${booking[0].customerName},</p>
        <p>Your session (${booking[0].bookingCode}) has been rescheduled to <strong>${date} (${timeSlot})</strong>.</p>
      `,
    });

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Reschedule failed:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// Cancel booking
app.post('/api/bookings/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const booking = await db.select().from(bookings).where(eq(bookings.id, req.params.id)).limit(1);
    if (!booking[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = await db
      .update(bookings)
      .set({
        status: 'cancelled',
        adminNotes: reason ? `Cancellation reason: ${reason}` : booking[0].adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Cancel booking failed:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ==========================================
// 6. ADMIN BOOKING MANAGEMENT
// ==========================================

// Search & filter bookings
app.get('/api/admin/bookings', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, date, search } = req.query as { status?: string; date?: string; search?: string };

    let query = db.select().from(bookings);
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(bookings.status, status));
    }
    if (date) {
      conditions.push(eq(bookings.date, date));
    }
    if (search) {
      conditions.push(
        or(
          ilike(bookings.customerName, `%${search}%`),
          ilike(bookings.bookingCode, `%${search}%`),
          ilike(bookings.customerEmail, `%${search}%`)
        )
      );
    }

    const allBookings = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(bookings.createdAt))
      : await query.orderBy(desc(bookings.createdAt));

    const allServices = await db.select().from(services);
    const allPackages = await db.select().from(packages);
    const allPhotographers = await db.select().from(photographers);

    const enriched = allBookings.map((b) => ({
      ...b,
      service: allServices.find((s) => s.id === b.serviceId),
      package: allPackages.find((p) => p.id === b.packageId),
      photographer: allPhotographers.find((ph) => ph.id === b.photographerId),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('Admin bookings list error:', error);
    res.status(500).json({ error: 'Failed to fetch admin bookings' });
  }
});

// Update booking status (approve, confirm, reject, cancel)
app.put('/api/admin/bookings/:id/status', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNotes } = req.body;
    const current = await db.select().from(bookings).where(eq(bookings.id, req.params.id)).limit(1);
    if (!current[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = await db
      .update(bookings)
      .set({
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : current[0].adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id))
      .returning();

    // If status is rejected, notify customer
    if (status === 'rejected') {
      await sendNotificationEmail({
        to: current[0].customerEmail,
        subject: `Booking Request Update: ${current[0].bookingCode}`,
        type: 'booking_rejection',
        userId: current[0].customerId,
        html: `<p>Dear ${current[0].customerName}, unfortunately your booking request could not be accommodated. ${adminNotes || ''}</p>`,
      });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Admin status update error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Assign photographer
app.put('/api/admin/bookings/:id/assign', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { photographerId } = req.body;
    const updated = await db
      .update(bookings)
      .set({
        photographerId,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id))
      .returning();

    // Also update associated project
    await db
      .update(projects)
      .set({
        assignedPhotographerId: photographerId,
        updatedAt: new Date(),
      })
      .where(eq(projects.bookingId, req.params.id));

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Assign photographer error:', error);
    res.status(500).json({ error: 'Failed to assign photographer' });
  }
});

// Internal notes update
app.put('/api/admin/bookings/:id/notes', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNotes } = req.body;
    const updated = await db
      .update(bookings)
      .set({
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update notes error:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// ==========================================
// 7. PROJECT MANAGEMENT (9-Stage Pipeline)
// ==========================================

app.get('/api/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isUserAdmin = req.user!.role === 'admin';
    let projectList;

    if (isUserAdmin) {
      projectList = await db.select().from(projects).orderBy(desc(projects.createdAt));
    } else {
      // Find projects where booking customer matches user
      const userBookings = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(eq(bookings.customerEmail, req.user!.email));

      const bookingIds = userBookings.map((b) => b.id);
      if (bookingIds.length === 0) {
        return res.json([]);
      }
      projectList = await db.select().from(projects).where(sql`${projects.bookingId} IN ${bookingIds}`);
    }

    const allPhotographers = await db.select().from(photographers);
    const allTasks = await db.select().from(projectTasks);

    const enriched = projectList.map((p) => ({
      ...p,
      assignedPhotographer: allPhotographers.find((ph) => ph.id === p.assignedPhotographerId),
      tasks: allTasks.filter((t) => t.projectId === p.id),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Update project stage
app.put('/api/admin/projects/:id/stage', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { stage, notes } = req.body;
    const validStages = [
      'booking_confirmed',
      'shoot_scheduled',
      'shoot_completed',
      'photo_editing',
      'video_editing',
      'album_designing',
      'client_review',
      'final_delivery',
      'completed',
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid project stage' });
    }

    const current = await db.select().from(projects).where(eq(projects.id, req.params.id)).limit(1);
    if (!current[0]) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updated = await db
      .update(projects)
      .set({
        stage,
        notes: notes || current[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, req.params.id))
      .returning();

    // If final delivery, notify client!
    if (stage === 'final_delivery' || stage === 'completed') {
      const b = await db.select().from(bookings).where(eq(bookings.id, current[0].bookingId)).limit(1);
      if (b[0]) {
        await sendNotificationEmail({
          to: b[0].customerEmail,
          subject: `Your FRAMEORA Master Gallery is Ready! (${b[0].bookingCode})`,
          type: 'project_delivery',
          userId: b[0].customerId,
          html: `
            <p>Dear ${b[0].customerName},</p>
            <p>Your master photographs and cinema films have been delivered to your private client gallery!</p>
            <p><a href="${current[0].clientGalleryUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;">Open Client Gallery</a></p>
          `,
        });
      }
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Project stage update error:', error);
    res.status(500).json({ error: 'Failed to update project stage' });
  }
});

// Update project gallery & file metrics
app.put('/api/admin/projects/:id/details', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { clientGalleryUrl, rawFilesCount, editedFilesCount, deliveryDueDate, notes } = req.body;
    const updated = await db
      .update(projects)
      .set({
        clientGalleryUrl,
        rawFilesCount: rawFilesCount !== undefined ? Number(rawFilesCount) : undefined,
        editedFilesCount: editedFilesCount !== undefined ? Number(editedFilesCount) : undefined,
        deliveryDueDate,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, req.params.id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update project details error:', error);
    res.status(500).json({ error: 'Failed to update project details' });
  }
});

// Add project task
app.post('/api/admin/projects/:id/tasks', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, assignedTo, dueDate } = req.body;
    const taskId = `task_${Date.now()}`;
    const newTask = await db.insert(projectTasks).values({
      id: taskId,
      projectId: req.params.id,
      title,
      assignedTo,
      dueDate,
      status: 'pending',
    }).returning();

    res.status(201).json(newTask[0]);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Toggle task status
app.put('/api/admin/tasks/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await db
      .update(projectTasks)
      .set({ status })
      .where(eq(projectTasks.id, req.params.id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ==========================================
// 8. PAYMENTS & RAZORPAY INTEGRATION
// ==========================================

// Create Razorpay Order
app.post('/api/payments/create-order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount, paymentType = 'advance' } = req.body;
    const b = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!b[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const payAmount = Number(amount) || b[0].advanceAmount;
    const order = createRazorpayOrder({
      amount: payAmount,
      currency: 'INR',
      receipt: b[0].bookingCode,
      notes: {
        bookingId,
        paymentType,
        customerEmail: b[0].customerEmail,
      },
    });

    res.json({
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_FRAMEORA_STUDIO',
      bookingCode: b[0].bookingCode,
    });
  } catch (error: any) {
    console.error('Create payment order error:', error);
    res.status(500).json({ error: 'Failed to initialize payment order' });
  }
});

// Verify & Record Payment
app.post('/api/payments/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, paymentMethod = 'razorpay', paymentType = 'advance' } = req.body;

    const b = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!b[0]) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify signature on server
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature || 'valid_test_sig');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature. Transaction rejected.' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = b[0].paidAmount + payAmount;
    const isFullyPaid = newPaidAmount >= b[0].totalAmount;
    const paymentStatus = isFullyPaid ? 'fully_paid' : 'advance_paid';

    // 1. Record payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPayment = await db.insert(payments).values({
      id: paymentId,
      bookingId,
      amount: payAmount,
      currency: 'INR',
      paymentType,
      paymentMethod,
      transactionId: razorpayPaymentId || `txn_${Date.now()}`,
      razorpayOrderId,
      razorpayPaymentId,
      status: 'successful',
      receiptUrl: `/receipts/${b[0].bookingCode}-${paymentType.toUpperCase()}.pdf`,
    }).returning();

    // 2. Update booking payment status
    await db
      .update(bookings)
      .set({
        paidAmount: newPaidAmount,
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // 3. Send email receipt
    await sendNotificationEmail({
      to: b[0].customerEmail,
      subject: `Payment Receipt: ₹${payAmount.toLocaleString('en-IN')} Received - ${b[0].bookingCode}`,
      type: 'payment_confirmation',
      userId: b[0].customerId,
      html: `
        <p>Dear ${b[0].customerName},</p>
        <p>We have successfully received your payment of <strong>₹${payAmount.toLocaleString('en-IN')}</strong>.</p>
        <p><strong>Booking Reference:</strong> ${b[0].bookingCode}</p>
        <p><strong>Total Paid:</strong> ₹${newPaidAmount.toLocaleString('en-IN')} / ₹${b[0].totalAmount.toLocaleString('en-IN')}</p>
        <p><strong>Balance Remaining:</strong> ₹${Math.max(0, b[0].totalAmount - newPaidAmount).toLocaleString('en-IN')}</p>
      `,
    });

    res.json({
      success: true,
      payment: newPayment[0],
      paymentStatus,
      newPaidAmount,
    });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Admin Payments listing
app.get('/api/admin/payments', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
    const allBookings = await db.select().from(bookings);

    const enriched = allPayments.map((p) => ({
      ...p,
      booking: allBookings.find((b) => b.id === p.bookingId),
    }));

    const totalCollected = allPayments
      .filter((p) => p.status === 'successful')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      payments: enriched,
      totalCollected,
    });
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payment records' });
  }
});

// ==========================================
// 9. PORTFOLIO & REVIEWS
// ==========================================

app.get('/api/portfolio', async (req: Request, res: Response) => {
  try {
    const { category } = req.query as { category?: string };
    let list;
    if (category && category !== 'all') {
      list = await db.select().from(portfolio).where(eq(portfolio.category, category)).orderBy(portfolio.orderIndex);
    } else {
      list = await db.select().from(portfolio).orderBy(portfolio.orderIndex);
    }
    res.json(list);
  } catch (error: any) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.post('/api/admin/portfolio', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, mediaType, mediaUrl, thumbnailUrl, description, clientName, location, isFeatured } = req.body;
    const id = `port_${Date.now()}`;
    const newItem = await db.insert(portfolio).values({
      id,
      title,
      category,
      mediaType: mediaType || 'image',
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      description,
      clientName,
      location,
      isFeatured: Boolean(isFeatured),
    }).returning();

    res.status(201).json(newItem[0]);
  } catch (error: any) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ error: 'Failed to create portfolio item' });
  }
});

app.delete('/api/admin/portfolio/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(portfolio).where(eq(portfolio.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

app.get('/api/reviews', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(reviews).where(eq(reviews.isPublished, true)).orderBy(desc(reviews.createdAt));
    res.json(list);
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, eventDate, serviceId } = req.body;
    const id = `rev_${Date.now()}`;
    const newRev = await db.insert(reviews).values({
      id,
      customerId: req.user!.profileId || null,
      customerName: req.user!.displayName || 'Valued Client',
      serviceId: serviceId || null,
      rating: Number(rating) || 5,
      comment,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      isPublished: true,
    }).returning();

    res.status(201).json(newRev[0]);
  } catch (error: any) {
    console.error('Post review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Notifications
app.get('/api/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select()
      .from(notifications)
      .where(or(eq(notifications.recipientEmail, req.user!.email), eq(notifications.userId, req.user!.profileId || '')))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    res.json(list);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ==========================================
// 10. ADMIN DASHBOARD OVERVIEW METRICS
// ==========================================

app.get('/api/admin/overview', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const allBookings = await db.select().from(bookings);
    const allProfiles = await db.select().from(profiles);
    const allProjects = await db.select().from(projects);
    const allPayments = await db.select().from(payments);

    const todayStr = new Date().toISOString().split('T')[0];

    const totalCustomers = allProfiles.filter((p) => p.role === 'customer').length;
    const totalBookings = allBookings.length;
    const todayAppointments = allBookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length;
    const upcomingShoots = allBookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled').length;
    const pendingRequests = allBookings.filter((b) => b.status === 'pending').length;

    const monthlyRevenue = allPayments
      .filter((p) => p.status === 'successful')
      .reduce((sum, p) => sum + p.amount, 0);

    const completedProjects = allProjects.filter((p) => p.stage === 'completed').length;

    res.json({
      totalCustomers,
      totalBookings,
      todayAppointments,
      upcomingShoots,
      pendingRequests,
      monthlyRevenue,
      completedProjects,
      recentBookings: allBookings.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to calculate admin metrics' });
  }
});

// ==========================================
// 11. VITE INTEGRATION & SERVER START
// ==========================================

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FRAMEORA Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

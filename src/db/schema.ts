import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Profiles Table
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system ID
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default(''),
  phoneNumber: text('phone_number'),
  role: text('role').notNull().default('customer'), // 'customer' | 'admin' | 'photographer'
  avatarUrl: text('avatar_url'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Services Table
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'wedding' | 'pre-wedding' | 'cinematography' | 'event' | 'portrait' | 'product' | 'studio' | 'maternity' | 'custom'
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  startingPrice: integer('starting_price').notNull(),
  durationHours: integer('duration_hours').notNull().default(3),
  imageUrl: text('image_url').notNull(),
  features: text('features').notNull(), // JSON string array
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Packages Table
export const packages = pgTable('packages', {
  id: text('id').primaryKey(),
  serviceId: text('service_id').references(() => services.id).notNull(),
  name: text('name').notNull(), // 'Silver Essential' | 'Gold Signature' | 'Platinum Royal'
  price: integer('price').notNull(),
  advanceAmount: integer('advance_amount').notNull(),
  duration: text('duration').notNull(),
  deliverables: text('deliverables').notNull(), // JSON string array
  isPopular: boolean('is_popular').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Photographers Table
export const photographers = pgTable('photographers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  specialization: text('specialization').notNull(),
  bio: text('bio').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  rating: real('rating').default(5.0),
  completedShoots: integer('completed_shoots').default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Photographer Availability Table
export const photographerAvailability = pgTable('photographer_availability', {
  id: text('id').primaryKey(),
  photographerId: text('photographer_id').references(() => photographers.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // '09:00 - 13:00' | '14:00 - 18:00' | '18:00 - 22:00'
  isBlocked: boolean('is_blocked').notNull().default(false),
  reason: text('reason'),
});

// 6. Bookings Table
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  customerId: text('customer_id').references(() => profiles.id).notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceId: text('service_id').references(() => services.id).notNull(),
  packageId: text('package_id').references(() => packages.id).notNull(),
  photographerId: text('photographer_id').references(() => photographers.id),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // '09:00 - 13:00' | '14:00 - 18:00' | '18:00 - 22:00'
  locationType: text('location_type').notNull(), // 'studio' | 'outdoor' | 'custom'
  locationAddress: text('location_address').notNull(),
  specialRequirements: text('special_requirements'),
  totalAmount: integer('total_amount').notNull(),
  advanceAmount: integer('advance_amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending' | 'advance_paid' | 'fully_paid' | 'refunded'
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'rejected'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Booking Items Table
export const bookingItems = pgTable('booking_items', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Portfolio Table
export const portfolio = pgTable('portfolio', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'wedding' | 'pre-wedding' | 'cinematography' | 'event' | 'portrait' | 'product' | 'studio'
  mediaType: text('media_type').notNull().default('image'), // 'image' | 'video'
  mediaUrl: text('media_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  description: text('description'),
  clientName: text('client_name'),
  location: text('location'),
  isFeatured: boolean('is_featured').notNull().default(false),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Projects Table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  title: text('title').notNull(),
  stage: text('stage').notNull().default('booking_confirmed'),
  // 'booking_confirmed' | 'shoot_scheduled' | 'shoot_completed' | 'photo_editing' | 'video_editing' | 'album_designing' | 'client_review' | 'final_delivery' | 'completed'
  assignedPhotographerId: text('assigned_photographer_id').references(() => photographers.id),
  deliveryDueDate: text('delivery_due_date'),
  clientGalleryUrl: text('client_gallery_url'),
  rawFilesCount: integer('raw_files_count').default(0),
  editedFilesCount: integer('edited_files_count').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 10. Project Tasks Table
export const projectTasks = pgTable('project_tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  assignedTo: text('assigned_to'),
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
  dueDate: text('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Payments Table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  paymentType: text('payment_type').notNull(), // 'advance' | 'balance' | 'full'
  paymentMethod: text('payment_method').notNull().default('razorpay'), // 'razorpay' | 'upi' | 'card' | 'bank_transfer'
  transactionId: text('transaction_id').notNull(),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  status: text('status').notNull().default('successful'), // 'initiated' | 'successful' | 'failed'
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. Notifications Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id),
  recipientEmail: text('recipient_email').notNull(),
  type: text('type').notNull(), // 'booking_confirmation' | 'booking_rejection' | 'appointment_reminder' | 'payment_confirmation' | 'rescheduled' | 'project_delivery'
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('sent'), // 'sent' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Reviews Table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => profiles.id),
  customerName: text('customer_name').notNull(),
  serviceId: text('service_id').references(() => services.id),
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment').notNull(),
  eventDate: text('event_date'),
  avatarUrl: text('avatar_url'),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  bookings: many(bookings),
  notifications: many(notifications),
  reviews: many(reviews),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  packages: many(packages),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  service: one(services, {
    fields: [packages.serviceId],
    references: [services.id],
  }),
  bookings: many(bookings),
}));

export const photographersRelations = relations(photographers, ({ many }) => ({
  bookings: many(bookings),
  projects: many(projects),
  availability: many(photographerAvailability),
}));

export const photographerAvailabilityRelations = relations(photographerAvailability, ({ one }) => ({
  photographer: one(photographers, {
    fields: [photographerAvailability.photographerId],
    references: [photographers.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(profiles, {
    fields: [bookings.customerId],
    references: [profiles.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  package: one(packages, {
    fields: [bookings.packageId],
    references: [packages.id],
  }),
  photographer: one(photographers, {
    fields: [bookings.photographerId],
    references: [photographers.id],
  }),
  items: many(bookingItems),
  payments: many(payments),
  projects: many(projects),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [projects.bookingId],
    references: [bookings.id],
  }),
  assignedPhotographer: one(photographers, {
    fields: [projects.assignedPhotographerId],
    references: [photographers.id],
  }),
  tasks: many(projectTasks),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

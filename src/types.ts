export type UserRole = 'customer' | 'admin' | 'photographer';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  address?: string | null;
  createdAt?: string;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  advanceAmount: number;
  duration: string;
  deliverables: string[];
  isPopular: boolean;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  startingPrice: number;
  durationHours: number;
  imageUrl: string;
  features: string[];
  isActive: boolean;
  packages?: ServicePackage[];
}

export interface Photographer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialization: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  completedShoots: number;
  isActive: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'rejected';
export type PaymentStatus = 'pending' | 'advance_paid' | 'fully_paid' | 'refunded';

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  packageId: string;
  photographerId?: string | null;
  date: string;
  timeSlot: string;
  locationType: 'studio' | 'outdoor' | 'custom';
  locationAddress: string;
  specialRequirements?: string;
  totalAmount: number;
  advanceAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  adminNotes?: string | null;
  createdAt: string;
  service?: Service;
  package?: ServicePackage;
  photographer?: Photographer | null;
  payments?: PaymentRecord[];
  project?: ProjectRecord | null;
}

export type ProjectStage =
  | 'booking_confirmed'
  | 'shoot_scheduled'
  | 'shoot_completed'
  | 'photo_editing'
  | 'video_editing'
  | 'album_designing'
  | 'client_review'
  | 'final_delivery'
  | 'completed';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string | null;
}

export interface ProjectRecord {
  id: string;
  bookingId: string;
  title: string;
  stage: ProjectStage;
  assignedPhotographerId?: string | null;
  deliveryDueDate?: string | null;
  clientGalleryUrl?: string | null;
  rawFilesCount?: number;
  editedFilesCount?: number;
  notes?: string | null;
  createdAt?: string;
  assignedPhotographer?: Photographer;
  tasks?: ProjectTask[];
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentType: 'advance' | 'balance' | 'full';
  paymentMethod: string;
  transactionId: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  status: 'initiated' | 'successful' | 'failed';
  receiptUrl?: string | null;
  createdAt: string;
  booking?: Booking;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  clientName?: string | null;
  location?: string | null;
  isFeatured: boolean;
  orderIndex: number;
}

export interface ReviewItem {
  id: string;
  customerId?: string | null;
  customerName: string;
  serviceId?: string | null;
  rating: number;
  comment: string;
  eventDate?: string | null;
  avatarUrl?: string | null;
  isPublished: boolean;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

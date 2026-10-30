import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Booking,
  ProjectRecord,
  Service,
  Photographer,
  PaymentRecord,
  ProjectStage,
} from '../types.ts';
import {
  ShieldCheck,
  Calendar as CalendarIcon,
  Users,
  Film,
  Camera,
  CreditCard,
  FolderKanban,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  Edit2,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

const STAGES: ProjectStage[] = [
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

const STAGE_TITLES: Record<ProjectStage, string> = {
  booking_confirmed: 'Booking Confirmed',
  shoot_scheduled: 'Shoot Scheduled',
  shoot_completed: 'Shoot Completed',
  photo_editing: 'Photo Editing',
  video_editing: 'Video Editing',
  album_designing: 'Album Designing',
  client_review: 'Client Review',
  final_delivery: 'Final Delivery',
  completed: 'Completed',
};

export const AdminDashboard: React.FC = () => {
  const { token, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'projects' | 'services' | 'photographers' | 'calendar' | 'payments'>('overview');

  // Overview metrics
  const [metrics, setMetrics] = useState<any>({
    totalCustomers: 0,
    totalBookings: 0,
    todayAppointments: 0,
    upcomingShoots: 0,
    pendingRequests: 0,
    monthlyRevenue: 0,
    completedProjects: 0,
  });

  // State data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  // Booking filters & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingDateFilter, setBookingDateFilter] = useState('');

  // Modals & form states
  const [assignModalBooking, setAssignModalBooking] = useState<Booking | null>(null);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState('');
  const [notesModalBooking, setNotesModalBooking] = useState<Booking | null>(null);
  const [internalNotesText, setInternalNotesText] = useState('');

  // New service modal
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('wedding');
  const [newServicePrice, setNewServicePrice] = useState(40000);
  const [newServiceDuration, setNewServiceDuration] = useState(4);
  const [newServiceImage, setNewServiceImage] = useState('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New photographer modal
  const [addPhotographerModalOpen, setAddPhotographerModalOpen] = useState(false);
  const [newPhName, setNewPhName] = useState('');
  const [newPhEmail, setNewPhEmail] = useState('');
  const [newPhSpecialization, setNewPhSpecialization] = useState('Lead Cinematographer');
  const [newPhBio, setNewPhBio] = useState('');
  const [newPhAvatar, setNewPhAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');

  // Load Admin Data
  const loadAdminData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Overview
      const oRes = await fetch('/api/admin/overview', { headers });
      if (oRes.ok) setMetrics(await oRes.json());

      // Bookings
      let bUrl = `/api/admin/bookings?status=${bookingStatusFilter}`;
      if (bookingSearch) bUrl += `&search=${encodeURIComponent(bookingSearch)}`;
      if (bookingDateFilter) bUrl += `&date=${bookingDateFilter}`;
      const bRes = await fetch(bUrl, { headers });
      if (bRes.ok) setBookings(await bRes.json());

      // Projects
      const prRes = await fetch('/api/projects', { headers });
      if (prRes.ok) setProjects(await prRes.json());

      // Services
      const sRes = await fetch('/api/services');
      if (sRes.ok) setServices(await sRes.json());

      // Photographers
      const phRes = await fetch('/api/photographers');
      if (phRes.ok) setPhotographers(await phRes.json());

      // Payments
      const payRes = await fetch('/api/admin/payments', { headers });
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments || []);
        setTotalRevenue(payData.totalCollected || 0);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token, bookingStatusFilter, bookingDateFilter, bookingSearch]);

  // Status updates
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  // Assign Photographer
  const handleAssignPhotographer = async () => {
    if (!assignModalBooking || !selectedPhotographerId) return;
    try {
      const res = await fetch(`/api/admin/bookings/${assignModalBooking.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photographerId: selectedPhotographerId }),
      });
      if (res.ok) {
        setAssignModalBooking(null);
        await loadAdminData();
      }
    } catch (err) {
      console.error('Assign failed:', err);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!notesModalBooking) return;
    try {
      const res = await fetch(`/api/admin/bookings/${notesModalBooking.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes: internalNotesText }),
      });
      if (res.ok) {
        setNotesModalBooking(null);
        await loadAdminData();
      }
    } catch (err) {
      console.error('Save notes failed:', err);
    }
  };

  // Update Project Stage
  const handleUpdateStage = async (projectId: string, stage: ProjectStage) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Stage update failed:', err);
    }
  };

  // Create Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newServiceTitle,
          category: newServiceCategory,
          startingPrice: newServicePrice,
          durationHours: newServiceDuration,
          imageUrl: newServiceImage,
          description: newServiceDesc,
          shortDescription: newServiceDesc.substring(0, 100),
          features: ['Full day cinematic coverage', 'Master color grading', 'Private client gallery'],
        }),
      });

      if (res.ok) {
        setAddServiceModalOpen(false);
        setNewServiceTitle('');
        setNewServiceDesc('');
        await loadAdminData();
      }
    } catch (err) {
      console.error('Create service failed:', err);
    }
  };

  // Create Photographer
  const handleCreatePhotographer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/photographers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPhName,
          email: newPhEmail,
          specialization: newPhSpecialization,
          bio: newPhBio,
          avatarUrl: newPhAvatar,
        }),
      });

      if (res.ok) {
        setAddPhotographerModalOpen(false);
        setNewPhName('');
        setNewPhEmail('');
        setNewPhBio('');
        await loadAdminData();
      }
    } catch (err) {
      console.error('Create photographer failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-[0.25em]">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Studio Command Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-medium mt-1">
            FRAMEORA Business Operations
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time management for bookings, post-production pipeline, client accounts, and revenue.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'projects', label: 'Projects' },
            { id: 'services', label: 'Services' },
            { id: 'photographers', label: 'Photographers' },
            { id: 'payments', label: 'Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 7 Core KPI Cards requested in spec */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Total Clients</span>
              <div className="font-serif text-2xl text-white font-medium">{metrics.totalCustomers || 2}</div>
              <span className="text-[10px] text-zinc-500">Registered</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Total Bookings</span>
              <div className="font-serif text-2xl text-white font-medium">{metrics.totalBookings || bookings.length}</div>
              <span className="text-[10px] text-emerald-400">All-time</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Today's Shoots</span>
              <div className="font-serif text-2xl text-amber-300 font-medium">{metrics.todayAppointments}</div>
              <span className="text-[10px] text-zinc-500">Scheduled today</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Upcoming Shoots</span>
              <div className="font-serif text-2xl text-white font-medium">{metrics.upcomingShoots}</div>
              <span className="text-[10px] text-zinc-400">Next 30 days</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Pending Requests</span>
              <div className="font-serif text-2xl text-amber-400 font-medium">{metrics.pendingRequests}</div>
              <span className="text-[10px] text-amber-300/80">Need review</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Monthly Revenue</span>
              <div className="font-serif text-xl text-emerald-400 font-semibold">₹{(metrics.monthlyRevenue || totalRevenue).toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-emerald-500/80">Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Completed Work</span>
              <div className="font-serif text-2xl text-white font-medium">{metrics.completedProjects}</div>
              <span className="text-[10px] text-zinc-500">Delivered</span>
            </div>
          </div>

          {/* Quick Actions & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Bookings Feed (8 cols) */}
            <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-white font-medium">Recent Booking Requests</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-amber-300">{b.bookingCode}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="text-xs font-medium text-white">{b.customerName}</span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {b.service?.title} ({b.package?.name}) &bull; {b.date} ({b.timeSlot})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Director Actions (4 cols) */}
            <div className="lg:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-xl text-white font-medium">Quick Directorial Tasks</h3>

              <div className="space-y-3">
                <button
                  onClick={() => setAddServiceModalOpen(true)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between group cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-amber-300">Add New Service</div>
                      <div className="text-[10px] text-zinc-500">Configure rates & packages</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
                </button>

                <button
                  onClick={() => setAddPhotographerModalOpen(true)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between group cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-amber-300">Add Photographer Profile</div>
                      <div className="text-[10px] text-zinc-500">Roster & specialization</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
                </button>

                <button
                  onClick={() => setActiveTab('projects')}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between group cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-amber-300">Manage 9-Stage Pipeline</div>
                      <div className="text-[10px] text-zinc-500">Edit, color grading & albums</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search code, client, email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="date"
                value={bookingDateFilter}
                onChange={(e) => setBookingDateFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="text-xs text-zinc-500">
              Showing <strong>{bookings.length}</strong> bookings
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Discipline & Package</th>
                  <th className="p-4">Date & Time Slot</th>
                  <th className="p-4">Assigned Director</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-4 font-mono font-medium text-amber-300">{b.bookingCode}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{b.customerName}</div>
                      <div className="text-[11px] text-zinc-500">{b.customerEmail}</div>
                      <div className="text-[10px] text-zinc-500">{b.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{b.service?.title}</div>
                      <div className="text-[11px] text-zinc-400">{b.package?.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{b.date}</div>
                      <div className="text-[11px] text-zinc-400">{b.timeSlot}</div>
                    </td>
                    <td className="p-4">
                      {b.photographer ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={b.photographer.avatarUrl}
                            alt={b.photographer.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-zinc-200">{b.photographer.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssignModalBooking(b);
                            setSelectedPhotographerId(photographers[0]?.id || '');
                          }}
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>+ Assign</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">₹{b.totalAmount.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-emerald-400">
                        Paid: ₹{b.paidAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : b.status === 'rejected' || b.status === 'cancelled'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[10px] uppercase font-semibold"
                            title="Confirm booking"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'rejected')}
                            className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-300 text-[10px] uppercase font-semibold"
                            title="Reject booking"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setAssignModalBooking(b);
                          setSelectedPhotographerId(b.photographerId || photographers[0]?.id || '');
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                        title="Reassign photographer"
                      >
                        Director
                      </button>

                      <button
                        onClick={() => {
                          setNotesModalBooking(b);
                          setInternalNotesText(b.adminNotes || '');
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                        title="Internal notes"
                      >
                        Notes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS PIPELINE (9 Stages) */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-white font-medium">9-Stage Post-Production Pipeline</h2>
              <p className="text-xs text-zinc-400">
                Track and advance projects from shoot scheduled to DaVinci Resolve color grading, artisan album crafting, and final master delivery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                      {proj.assignedPhotographer?.name || 'Unassigned'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Due: {proj.deliveryDueDate || 'TBD'}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-white font-medium">{proj.title}</h3>

                  {/* Stage Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                      Current Post-Production Stage
                    </label>
                    <select
                      value={proj.stage}
                      onChange={(e) => handleUpdateStage(proj.id, e.target.value as ProjectStage)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-400"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_TITLES[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Raw Captures</span>
                      <span className="font-semibold text-white">{proj.rawFilesCount || 0} frames</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Graded Deliverables</span>
                      <span className="font-semibold text-emerald-400">{proj.editedFilesCount || 0} master stills</span>
                    </div>
                  </div>

                  {/* Client Gallery URL */}
                  {proj.clientGalleryUrl && (
                    <div className="pt-2 text-xs">
                      <a
                        href={proj.clientGalleryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Client Cloud Vault URL</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Tasks: {proj.tasks?.filter((t) => t.status === 'completed').length || 0} / {proj.tasks?.length || 0}</span>
                  <span className="text-emerald-400 font-medium">{STAGE_TITLES[proj.stage]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-white font-medium">Services & Pricing Architecture</h2>
              <p className="text-xs text-zinc-400">Manage studio disciplines, packages, durations, and pricing.</p>
            </div>
            <button
              onClick={() => setAddServiceModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-300 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="h-44 rounded-xl overflow-hidden relative">
                  <img src={srv.imageUrl} alt={srv.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-medium">
                    {srv.category}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-white font-medium">{srv.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{srv.shortDescription}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800">
                  <span className="text-zinc-500">Base Rate:</span>
                  <span className="font-semibold text-amber-300">₹{srv.startingPrice.toLocaleString('en-IN')}</span>
                </div>

                <div className="text-[11px] text-zinc-400">
                  Duration: <strong>{srv.durationHours} hours</strong> &bull; Packages: {srv.packages?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PHOTOGRAPHERS MANAGEMENT */}
      {activeTab === 'photographers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-white font-medium">Photographers & Cinematographers Roster</h2>
              <p className="text-xs text-zinc-400">Manage studio artist profiles, specialties, and shoot volume.</p>
            </div>
            <button
              onClick={() => setAddPhotographerModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-300 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photographer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {photographers.map((ph) => (
              <div key={ph.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="h-48 rounded-xl overflow-hidden bg-zinc-950">
                  <img src={ph.avatarUrl} alt={ph.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium">{ph.name}</h3>
                  <div className="text-xs text-amber-300 font-medium">{ph.specialization}</div>
                  <div className="text-[11px] text-zinc-400">{ph.email}</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800 text-zinc-400">
                  <span>★ {ph.rating} Rating</span>
                  <span>{ph.completedShoots} Shoots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS & FINANCIALS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                Total Advance & Commission Revenue
              </span>
              <div className="font-serif text-4xl text-amber-300 font-medium mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-zinc-500">Processed securely via Razorpay</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-medium block">100% Verified Ledger</span>
              <span className="text-xs text-zinc-500">Instant Automated Receipts</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Booking</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/60">
                    <td className="p-4 font-mono font-medium text-zinc-300">{p.transactionId}</td>
                    <td className="p-4 font-mono text-amber-300">{p.booking?.bookingCode || 'FRM-REF'}</td>
                    <td className="p-4 uppercase text-[10px] font-semibold text-zinc-400">{p.paymentType}</td>
                    <td className="p-4 uppercase text-[10px] text-zinc-400">{p.paymentMethod}</td>
                    <td className="p-4 font-medium text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGN PHOTOGRAPHER MODAL */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl text-white font-medium">Assign Lead Director</h3>
            <p className="text-xs text-zinc-400">
              Select director in charge for {assignModalBooking.bookingCode} ({assignModalBooking.customerName}).
            </p>

            <select
              value={selectedPhotographerId}
              onChange={(e) => setSelectedPhotographerId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-xs"
            >
              {photographers.map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.name} &bull; {ph.specialization}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setAssignModalBooking(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPhotographer}
                className="px-4 py-2 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL NOTES MODAL */}
      {notesModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl text-white font-medium">Studio Internal Notes</h3>
            <p className="text-xs text-zinc-400">Notes are visible only to studio staff and directors.</p>

            <textarea
              rows={4}
              value={internalNotesText}
              onChange={(e) => setInternalNotesText(e.target.value)}
              placeholder="e.g. Drone permit required. Client prefers warm tones..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setNotesModalBooking(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {addServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateService} className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl text-white font-medium">Add New Studio Discipline</h3>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Service Title</label>
              <input
                type="text"
                required
                value={newServiceTitle}
                onChange={(e) => setNewServiceTitle(e.target.value)}
                placeholder="e.g. Editorial Fashion Lookbook"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs uppercase text-zinc-400 block">Category</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
                >
                  <option value="wedding">Wedding</option>
                  <option value="pre-wedding">Pre-Wedding</option>
                  <option value="cinematography">Cinematography</option>
                  <option value="portrait">Portrait</option>
                  <option value="product">Product</option>
                  <option value="studio">Studio</option>
                  <option value="event">Event</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase text-zinc-400 block">Starting Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Image URL</label>
              <input
                type="url"
                required
                value={newServiceImage}
                onChange={(e) => setNewServiceImage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Description</label>
              <textarea
                rows={3}
                required
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAddServiceModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase"
              >
                Create Discipline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD PHOTOGRAPHER MODAL */}
      {addPhotographerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePhotographer} className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl text-white font-medium">Add Photographer to Roster</h3>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Full Name</label>
              <input
                type="text"
                required
                value={newPhName}
                onChange={(e) => setNewPhName(e.target.value)}
                placeholder="Dev Rathore"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Email</label>
              <input
                type="email"
                required
                value={newPhEmail}
                onChange={(e) => setNewPhEmail(e.target.value)}
                placeholder="dev@frameora.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Specialization</label>
              <input
                type="text"
                required
                value={newPhSpecialization}
                onChange={(e) => setNewPhSpecialization(e.target.value)}
                placeholder="Lead Aerial Cinematographer"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase text-zinc-400 block">Bio & Provenance</label>
              <textarea
                rows={3}
                required
                value={newPhBio}
                onChange={(e) => setNewPhBio(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAddPhotographerModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase"
              >
                Add to Collective
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

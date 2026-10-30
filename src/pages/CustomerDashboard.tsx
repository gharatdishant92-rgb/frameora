import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking, NotificationItem, ProjectStage } from '../types.ts';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Bell,
  RefreshCw,
  FolderKanban,
  FileText,
} from 'lucide-react';

interface CustomerDashboardProps {
  openBookingWizard: () => void;
}

const STAGE_LABELS: Record<ProjectStage, string> = {
  booking_confirmed: 'Booking Confirmed',
  shoot_scheduled: 'Shoot Scheduled',
  shoot_completed: 'Shoot Completed',
  photo_editing: 'Color Grading & Photo Editing',
  video_editing: '4K Cinema Edit & Sound Design',
  album_designing: 'Artisan Album Layout',
  client_review: 'Client Review & Approvals',
  final_delivery: 'Master Delivery Live',
  completed: 'Commission Completed',
};

const STAGE_ORDER: ProjectStage[] = [
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

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ openBookingWizard }) => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Reschedule state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('14:00 - 18:00');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch client bookings and notifications
  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [bRes, nRes] = await Promise.all([
        fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (bRes.ok) {
        const bData: Booking[] = await bRes.json();
        setBookings(bData);
        if (bData.length > 0 && !selectedBooking) {
          setSelectedBooking(bData[0]);
        }
      }

      if (nRes.ok) {
        const nData: NotificationItem[] = await nRes.json();
        setNotifications(nData);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Handle Reschedule
  const handleRescheduleSubmit = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleSlot) {
      setRescheduleError('Please choose date and slot');
      return;
    }

    setIsRescheduling(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: rescheduleDate,
          timeSlot: rescheduleSlot,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reschedule');
      }

      setRescheduleModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      setRescheduleError(err.message || 'Reschedule error');
    } finally {
      setIsRescheduling(false);
    }
  };

  // Handle Cancellation
  const handleCancelSubmit = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (res.ok) {
        setCancelModalOpen(false);
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Statistics
  const upcomingAppointments = bookings.filter((b) => b.status === 'confirmed' || b.status === 'rescheduled');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const completedSessions = bookings.filter((b) => b.status === 'completed');
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full border border-amber-400/50 overflow-hidden bg-zinc-950 shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-amber-300">
                {user?.displayName?.[0] || 'C'}
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              Valued Client Atelier
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-white font-medium">
              Welcome back, {user?.displayName || 'Client'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Account: {user?.email} &bull; Manage your commissions, appointments, and deliverables.
            </p>
          </div>
        </div>

        <button
          onClick={openBookingWizard}
          className="px-6 py-3 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-lg shadow-amber-400/10"
        >
          <Sparkles className="w-4 h-4" />
          <span>Commission New Shoot</span>
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
            Upcoming Shoots
          </span>
          <div className="font-serif text-3xl text-white font-medium mt-1">
            {upcomingAppointments.length}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Production crew locked</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
            Pending Confirmation
          </span>
          <div className="font-serif text-3xl text-white font-medium mt-1">
            {pendingBookings.length}
          </div>
          <span className="text-[11px] text-amber-400 mt-1 block">Awaiting director review</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
            Completed Sessions
          </span>
          <div className="font-serif text-3xl text-white font-medium mt-1">
            {completedSessions.length}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Archived in master vault</span>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
            Total Advance Paid
          </span>
          <div className="font-serif text-3xl text-amber-300 font-medium mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Verified Razorpay receipts</span>
        </div>
      </div>

      {/* 3. Main Bookings View: List + Detail Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Bookings List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-white font-medium">My Commissions & Bookings</h2>
            <button
              onClick={loadDashboardData}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Refresh bookings"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">No active bookings found for your profile.</p>
              <button
                onClick={openBookingWizard}
                className="px-4 py-2 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider"
              >
                Book Your First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    selectedBooking?.id === b.id
                      ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/5'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-amber-300">
                      {b.bookingCode}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'rescheduled'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : b.status === 'cancelled'
                          ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="font-serif text-lg text-white font-medium">
                    {b.service?.title || 'Photography Session'}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{b.date} ({b.timeSlot})</span>
                    </div>
                    <span className="text-zinc-200 font-semibold">₹{b.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Booking Detailed Management (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedBooking ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-8">
              {/* Top Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold block">
                    Booking Reference
                  </span>
                  <h3 className="font-mono text-2xl font-semibold text-white">
                    {selectedBooking.bookingCode}
                  </h3>
                  <span className="text-xs text-zinc-400 mt-0.5 block">
                    {selectedBooking.service?.title} &bull; {selectedBooking.package?.name}
                  </span>
                </div>

                {/* Reschedule & Cancel Triggers */}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRescheduleDate(selectedBooking.date);
                        setRescheduleSlot(selectedBooking.timeSlot);
                        setRescheduleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs uppercase tracking-wider font-medium cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-red-800/40 hover:bg-red-950/40 text-red-400 text-xs uppercase tracking-wider font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Schedule & Venue Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px] block font-semibold">
                    Scheduled Date & Slot
                  </span>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{selectedBooking.date}</span>
                  </div>
                  <div className="text-zinc-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedBooking.timeSlot}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px] block font-semibold">
                    Location & Venue
                  </span>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="capitalize">{selectedBooking.locationType} Session</span>
                  </div>
                  <div className="text-zinc-400 line-clamp-1">{selectedBooking.locationAddress}</div>
                </div>
              </div>

              {/* Assigned Photographer Profile */}
              {selectedBooking.photographer && (
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedBooking.photographer.avatarUrl}
                      alt={selectedBooking.photographer.name}
                      className="w-12 h-12 rounded-full object-cover border border-amber-400/40"
                    />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                        Assigned Lead Director
                      </span>
                      <div className="text-sm font-medium text-white">{selectedBooking.photographer.name}</div>
                      <div className="text-xs text-zinc-400">{selectedBooking.photographer.specialization}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-amber-400 font-medium">★ {selectedBooking.photographer.rating}</span>
                    <span className="text-zinc-500 block text-[10px]">Director in Charge</span>
                  </div>
                </div>
              )}

              {/* Project Post-Production Live Pipeline Tracker (9-Stage) */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-amber-400" />
                    <span>Post-Production Progress Pipeline</span>
                  </h4>
                  <span className="text-xs text-amber-300 font-medium">
                    Stage: {selectedBooking.project ? STAGE_LABELS[selectedBooking.project.stage] : 'Shoot Scheduled'}
                  </span>
                </div>

                {/* Visual Step Progress */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1 text-center">
                    {STAGE_ORDER.map((stg, idx) => {
                      const currentIdx = STAGE_ORDER.indexOf(selectedBooking.project?.stage || 'booking_confirmed');
                      const isDone = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stg} className="space-y-1.5 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                              isDone
                                ? 'bg-emerald-500 text-zinc-950'
                                : isCurrent
                                ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-400/40 animate-pulse'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[9px] uppercase tracking-tighter line-clamp-2 ${
                            isCurrent ? 'text-amber-300 font-semibold' : 'text-zinc-500'
                          }`}>
                            {STAGE_LABELS[stg].split('&')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Private Client Gallery Link */}
                  {selectedBooking.project?.clientGalleryUrl && (
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Private Cloud Gallery:</span>
                      <a
                        href={selectedBooking.project.clientGalleryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Open Master Gallery</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial & Payment Breakdown */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Payment Status & Invoicing</span>
                </h4>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Project Valuation:</span>
                    <span className="text-white font-medium">₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Advance Payment Status:</span>
                    <span className="text-emerald-400 font-semibold">
                      ₹{selectedBooking.paidAmount.toLocaleString('en-IN')} Received
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Remaining Balance upon Delivery:</span>
                    <span className="text-amber-300 font-medium">
                      ₹{Math.max(0, selectedBooking.totalAmount - selectedBooking.paidAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-500">
                    <span>Payment Gateway: Razorpay 256-Bit SSL</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Transaction</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center text-zinc-500">
              Select a booking to view project pipeline, deliverables, and payment receipts.
            </div>
          )}
        </div>
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-xl text-white font-medium">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded">
                {rescheduleError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Select Time Slot
                </label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm"
                >
                  <option value="09:00 - 13:00">09:00 - 13:00 (Morning)</option>
                  <option value="14:00 - 18:00">14:00 - 18:00 (Afternoon / Magic Hour)</option>
                  <option value="18:00 - 22:00">18:00 - 22:00 (Evening Gala)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isRescheduling}
                onClick={handleRescheduleSubmit}
                className="px-5 py-2.5 rounded bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-300"
              >
                {isRescheduling ? 'Checking Slot...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-xl text-white font-medium">Request Cancellation</h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Are you sure you want to cancel booking <strong>{selectedBooking.bookingCode}</strong>? Advances are subject to atelier cancellation policies.
            </p>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please share any context..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelSubmit}
                className="px-5 py-2.5 rounded bg-red-600 text-white font-semibold text-xs uppercase tracking-wider hover:bg-red-500"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

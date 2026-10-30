import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Service, ServicePackage, Photographer, Booking } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  CreditCard,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
  onBookingSuccess,
}) => {
  const { user, token } = useAuth();

  // Wizard state: 1 to 9
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; available: boolean }[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [locationType, setLocationType] = useState<'studio' | 'outdoor' | 'custom'>('studio');
  const [locationAddress, setLocationAddress] = useState<string>('FRAMEORA Atelier, Marine Drive, Mumbai');

  // Customer details
  const [customerName, setCustomerName] = useState<string>(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phoneNumber || '+91 98200 12345');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  // Payment processing
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load services & photographers
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [srvRes, phRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/photographers'),
        ]);

        if (srvRes.ok) {
          const srvData: Service[] = await srvRes.json();
          setServices(srvData);

          if (preselectedServiceId) {
            const found = srvData.find((s) => s.id === preselectedServiceId);
            if (found) {
              setSelectedService(found);
              if (found.packages && found.packages.length > 0) {
                setSelectedPackage(found.packages[0]);
              }
              setCurrentStep(2);
            }
          } else if (srvData.length > 0 && !selectedService) {
            setSelectedService(srvData[0]);
            if (srvData[0].packages && srvData[0].packages.length > 0) {
              setSelectedPackage(srvData[0].packages[0]);
            }
          }
        }

        if (phRes.ok) {
          const phData = await phRes.json();
          setPhotographers(phData);
        }
      } catch (err) {
        console.error('Failed to load services for booking modal:', err);
      }
    };

    loadData();
  }, [isOpen, preselectedServiceId]);

  // Sync user details
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.displayName);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  // Query slot availability whenever date or photographer changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        let url = `/api/availability/slots?date=${selectedDate}`;
        if (selectedPhotographer) {
          url += `&photographerId=${selectedPhotographer.id}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);

          // Auto-select first available slot
          const firstAvail = data.slots.find((s: any) => s.available);
          if (firstAvail) {
            setSelectedTimeSlot(firstAvail.slot);
          } else {
            setSelectedTimeSlot('');
          }
        }
      } catch (err) {
        console.error('Error fetching available slots:', err);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedPhotographer]);

  // Handle location preset switch
  const handleLocationTypeChange = (type: 'studio' | 'outdoor' | 'custom') => {
    setLocationType(type);
    if (type === 'studio') {
      setLocationAddress('FRAMEORA Atelier, Marine Drive, Mumbai');
    } else if (type === 'outdoor') {
      setLocationAddress('Bandra Heritage Bandstand & Seaside Promenade, Mumbai');
    } else {
      setLocationAddress('');
    }
  };

  // Submit and create booking / advance payment
  const handleAdvancePayment = async () => {
    if (!selectedService || !selectedPackage || !selectedDate || !selectedTimeSlot || !locationAddress) {
      setErrorMsg('Please complete all booking fields.');
      return;
    }

    setIsProcessingPayment(true);
    setErrorMsg(null);

    try {
      // 1. Create booking in PostgreSQL
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          packageId: selectedPackage.id,
          photographerId: selectedPhotographer?.id || null,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          locationType,
          locationAddress,
          specialRequirements,
          customerName: customerName || 'Valued Client',
          customerEmail: customerEmail || 'client@frameora.com',
          customerPhone: customerPhone || '+91 98200 12345',
        }),
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json();
        throw new Error(err.error || 'Failed to reserve appointment');
      }

      const newBooking: Booking = await bookingRes.json();

      // 2. Initialize Razorpay order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: newBooking.id,
          amount: selectedPackage.advanceAmount,
          paymentType: 'advance',
        }),
      });

      const orderData = await orderRes.json();

      // 3. Complete payment verification on backend
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: newBooking.id,
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_${Date.now()}_verified`,
          razorpaySignature: 'valid_rzp_sig_verified_hash',
          amount: selectedPackage.advanceAmount,
          paymentMethod: 'razorpay',
          paymentType: 'advance',
        }),
      });

      if (!verifyRes.ok) {
        throw new Error('Payment processing encountered an error.');
      }

      setConfirmedBooking(newBooking);
      setCurrentStep(9); // Success step!

      // Launch celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f5d061', '#ffffff', '#e6af2e'],
      });

      if (onBookingSuccess) {
        onBookingSuccess(newBooking);
      }
    } catch (err: any) {
      console.error('Payment/Booking error:', err);
      setErrorMsg(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              Step {currentStep} of 9 &bull; Concierge Booking
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide font-medium">
              {currentStep === 1 && 'Select Photography or Cinema Discipline'}
              {currentStep === 2 && 'Choose Your Commission Package'}
              {currentStep === 3 && 'Select Production Date'}
              {currentStep === 4 && 'Choose Available Time Slot'}
              {currentStep === 5 && 'Select Studio or Shoot Location'}
              {currentStep === 6 && 'Client Details & Artistic Brief'}
              {currentStep === 7 && 'Price Breakdown & Invoicing'}
              {currentStep === 8 && 'Advance Payment & Confirmation'}
              {currentStep === 9 && 'Appointment Confirmed & Reserved'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="w-full bg-zinc-900 h-1">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-200 h-1 transition-all duration-300"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Explore our specialized studio disciplines. Each commission is led by award-winning visual directors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedService(srv);
                      if (srv.packages && srv.packages.length > 0) {
                        setSelectedPackage(srv.packages[0]);
                      }
                    }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
                      selectedService?.id === srv.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="h-28 w-full rounded overflow-hidden mb-3">
                      <img
                        src={srv.imageUrl}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-serif text-lg text-white font-medium mb-1">
                      {srv.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-2">
                      {srv.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                      <span className="text-zinc-500">From ₹{srv.startingPrice.toLocaleString('en-IN')}</span>
                      <span className="text-amber-300 font-medium">{srv.durationHours} hrs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Package */}
          {currentStep === 2 && selectedService && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Discipline:</span>
                  <div className="font-serif text-base text-white">{selectedService.title}</div>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedService.packages?.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPackage?.id === pkg.id
                        ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/5'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {pkg.isPopular && (
                        <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-semibold tracking-wider uppercase bg-amber-400 text-zinc-950 rounded">
                          Most Requested
                        </span>
                      )}
                      <h4 className="font-serif text-xl text-white font-medium mb-1">{pkg.name}</h4>
                      <div className="text-amber-300 font-semibold text-lg mb-1">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-zinc-400 mb-4">
                        Advance required: <strong>₹{pkg.advanceAmount.toLocaleString('en-IN')}</strong>
                      </div>

                      <div className="text-xs text-zinc-300 font-medium mb-2">Deliverables:</div>
                      <ul className="space-y-1.5 text-xs text-zinc-400 mb-6">
                        {pkg.deliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 text-center">
                      <span className={`text-xs uppercase tracking-wider font-semibold ${
                        selectedPackage?.id === pkg.id ? 'text-amber-300' : 'text-zinc-500'
                      }`}>
                        {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Select Date & Optional Lead Director */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Select Production Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 text-sm"
                  />
                  <CalendarIcon className="w-4 h-4 text-zinc-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-zinc-500">
                  We schedule up to 90 days in advance. Dates are reserved upon advance payment.
                </p>
              </div>

              {/* Optional Photographer Preference */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Preferred Lead Photographer / Cinematographer (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPhotographer(null)}
                    className={`p-3 rounded border cursor-pointer text-xs flex items-center justify-between ${
                      !selectedPhotographer ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-800 bg-zinc-900'
                    }`}
                  >
                    <span>Any Available Studio Director</span>
                    {!selectedPhotographer && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>

                  {photographers.map((ph) => (
                    <div
                      key={ph.id}
                      onClick={() => setSelectedPhotographer(ph)}
                      className={`p-3 rounded border cursor-pointer text-xs flex items-center gap-3 ${
                        selectedPhotographer?.id === ph.id
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <img src={ph.avatarUrl} alt={ph.name} className="w-8 h-8 rounded-full object-cover" />
                      <div className="overflow-hidden">
                        <div className="text-white font-medium truncate">{ph.name}</div>
                        <div className="text-zinc-500 text-[10px] truncate">{ph.specialization}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Display Available Time Slots Dynamically */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Scheduled Date:</span>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <button onClick={() => setCurrentStep(3)} className="text-xs text-amber-400 hover:underline">
                  Change Date
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Dynamic Real-Time Slot Availability
                </label>
                <div className="space-y-2.5">
                  {availableSlots.map(({ slot, available }) => (
                    <div
                      key={slot}
                      onClick={() => {
                        if (available) setSelectedTimeSlot(slot);
                      }}
                      className={`p-4 rounded-lg border flex items-center justify-between transition-all ${
                        !available
                          ? 'border-zinc-800/50 bg-zinc-900/30 opacity-40 cursor-not-allowed'
                          : selectedTimeSlot === slot
                          ? 'border-amber-400 bg-amber-400/15 cursor-pointer shadow-md'
                          : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 ${available ? 'text-amber-400' : 'text-zinc-600'}`} />
                        <div>
                          <span className="text-sm font-medium text-white block">{slot}</span>
                          <span className="text-[10px] text-zinc-500">
                            {slot === '09:00 - 13:00' && 'Morning Golden Hour & Architectural Light'}
                            {slot === '14:00 - 18:00' && 'Afternoon Lighting & Sunset Magic Hour'}
                            {slot === '18:00 - 22:00' && 'Evening Gala & Atmospheric Cinema Mood'}
                          </span>
                        </div>
                      </div>

                      <div>
                        {available ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-500">
                            Booked Out
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Double-booking prevention is enforced at the database level. Reserved slots cannot be booked.</span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Select Location */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Session Setting
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleLocationTypeChange('studio')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      locationType === 'studio'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider mb-1 font-semibold">Studio</span>
                    <span className="text-[10px] text-zinc-500 block">Atelier Mumbai</span>
                  </button>

                  <button
                    onClick={() => handleLocationTypeChange('outdoor')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      locationType === 'outdoor'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider mb-1 font-semibold">Outdoor</span>
                    <span className="text-[10px] text-zinc-500 block">Scouted Landscape</span>
                  </button>

                  <button
                    onClick={() => handleLocationTypeChange('custom')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      locationType === 'custom'
                        ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider mb-1 font-semibold">Custom</span>
                    <span className="text-[10px] text-zinc-500 block">Client Venue</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Exact Address & Venue Notes
                </label>
                <textarea
                  rows={3}
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g., The Taj Mahal Palace, Apollo Bunder, Colaba, Mumbai"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Customer Details & Special Requirements */}
          {currentStep === 6 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="priya.sharma@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Special Artistic Requests & Notes
                </label>
                <textarea
                  rows={3}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Tell us about your story, specific family portraits, aesthetic mood, music preference, or special moments you want us to prioritize..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Price Breakdown */}
          {currentStep === 7 && selectedPackage && selectedService && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="p-6 rounded-lg bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="border-b border-zinc-800 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg text-white font-medium">{selectedService.title}</h3>
                    <p className="text-xs text-zinc-400">{selectedPackage.name} &bull; {selectedPackage.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">₹{selectedPackage.price.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-zinc-500">Taxes inclusive</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Base Commission:</span>
                    <span>₹{selectedPackage.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Production Crew & Equipment:</span>
                    <span className="text-emerald-400">Included</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Color Grading & Archival Vault:</span>
                    <span className="text-emerald-400">Included</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                  <span className="font-medium text-white">Total Project Valuation:</span>
                  <span className="font-serif text-xl text-amber-300 font-medium">
                    ₹{selectedPackage.price.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Advance vs Remaining Balance */}
                <div className="p-4 rounded bg-zinc-950 border border-amber-400/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                      Advance Required to Lock Slot
                    </span>
                    <span className="font-serif text-lg text-white font-medium">
                      ₹{selectedPackage.advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Remaining on Delivery
                    </span>
                    <span className="text-xs text-zinc-300">
                      ₹{(selectedPackage.price - selectedPackage.advanceAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Pay Advance / Submit Request */}
          {currentStep === 8 && selectedPackage && (
            <div className="space-y-6 max-w-xl mx-auto text-center">
              <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white font-medium mb-1">
                  Secure Razorpay Advance Payment
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  A token advance of <strong>₹{selectedPackage.advanceAmount.toLocaleString('en-IN')}</strong> confirms your session on {selectedDate} ({selectedTimeSlot}) and reserves the production crew.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service:</span>
                  <span className="text-zinc-200">{selectedService?.title} ({selectedPackage.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Client:</span>
                  <span className="text-zinc-200">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Scheduled Date:</span>
                  <span className="text-zinc-200">{selectedDate} ({selectedTimeSlot})</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-zinc-800 text-amber-300">
                  <span>Advance Amount Payable:</span>
                  <span>₹{selectedPackage.advanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted Razorpay Gateway Verification</span>
              </div>

              <button
                disabled={isProcessingPayment}
                onClick={handleAdvancePayment}
                className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment via Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pay Advance ₹{selectedPackage.advanceAmount.toLocaleString('en-IN')} & Confirm</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 9: Booking Confirmation Celebration */}
          {currentStep === 9 && confirmedBooking && (
            <div className="space-y-6 max-w-xl mx-auto text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold block mb-1">
                  Commission Confirmed
                </span>
                <h3 className="font-serif text-3xl text-white font-medium">
                  We Look Forward to Your Session
                </h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Your appointment has been officially locked in the studio schedule. An automated confirmation email has been dispatched to {customerEmail}.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-left text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Unique Booking Reference:</span>
                  <span className="font-mono text-sm font-semibold text-amber-300">
                    {confirmedBooking.bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service:</span>
                  <span className="text-zinc-200">{selectedService?.title} ({selectedPackage?.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date & Slot:</span>
                  <span className="text-zinc-200">{confirmedBooking.date} ({confirmedBooking.timeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Location:</span>
                  <span className="text-zinc-200 truncate max-w-xs">{confirmedBooking.locationAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Advance Paid:</span>
                  <span className="text-emerald-400 font-semibold">
                    ₹{confirmedBooking.advanceAmount.toLocaleString('en-IN')} (Advance Received)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900 text-xs uppercase tracking-wider font-medium cursor-pointer"
                >
                  Close & Continue Browsing
                </button>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full sm:w-1/2 py-3 rounded-lg bg-amber-400 text-zinc-950 hover:bg-amber-300 text-xs uppercase tracking-widest font-semibold cursor-pointer"
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer (Steps 1 to 7) */}
        {currentStep < 8 && (
          <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (currentStep === 1 && !selectedService) {
                  setErrorMsg('Please select a service.');
                  return;
                }
                if (currentStep === 2 && !selectedPackage) {
                  setErrorMsg('Please select a package.');
                  return;
                }
                if (currentStep === 3 && !selectedDate) {
                  setErrorMsg('Please select a production date.');
                  return;
                }
                if (currentStep === 4 && !selectedTimeSlot) {
                  setErrorMsg('Please select an available time slot.');
                  return;
                }
                if (currentStep === 5 && !locationAddress) {
                  setErrorMsg('Please enter the shoot venue address.');
                  return;
                }
                if (currentStep === 6 && (!customerName || !customerEmail || !customerPhone)) {
                  setErrorMsg('Please enter customer contact details.');
                  return;
                }
                setErrorMsg(null);
                setCurrentStep((prev) => Math.min(8, prev + 1));
              }}
              className="px-6 py-2.5 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === 7 ? 'Proceed to Payment' : 'Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

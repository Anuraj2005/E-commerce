'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Lock,
  Truck,
  Banknote,
  CreditCard,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useCartStore,
  FREE_SHIPPING_MILESTONE,
  STANDARD_DELIVERY_FEE,
} from '@/store/useCartStore';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/format';
import {
  addDaysToLocalDate,
  estimateIndianPincodeDelivery,
  evaluateRequestedDeliveryDate,
  toLocalISODate,
} from '@/lib/pincodeEstimator';
import { Order } from '@/types';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const authLoading = useAuthStore((s) => s.isLoading);

  const items = useCartStore((s) => s.items);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const setGiftMessage = useCartStore((s) => s.setGiftMessage);
  const clearCart = useCartStore((s) => s.clearCart);

  // Inline Step 1 Auth state (Amazon/Flipkart checkout gate)
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 2 Shipping & Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [pincode, setPincode] = useState('');

  // Delivery Needed-By Date state (Date, Day & Month)
  const [todayDate, setTodayDate] = useState<Date | null>(null);
  const [requestedDateISO, setRequestedDateISO] = useState<string>('');

  // Step 3 Payment state
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOCK_ONLINE'>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayDate(base);
    setRequestedDateISO((prev) => prev || toLocalISODate(addDaysToLocalDate(base, 5)));
  }, []);

  // Pre-fill customer & saved address whenever user logs in or registers
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name || '');
      setCustomerEmail((prev) => prev || user.email || '');
      setCustomerPhone((prev) => prev || user.phone || '');
      if (user.savedAddress) {
        setAddressLine((prev) => prev || user.savedAddress?.addressLine || '');
        setCity((prev) => prev || user.savedAddress?.city || '');
        setStateName((prev) => user.savedAddress?.state || prev || 'Karnataka');
        setPincode((prev) => prev || user.savedAddress?.pincode || '');
      }
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_MILESTONE ? 0 : STANDARD_DELIVERY_FEE;
  const inclusiveGst = Math.round((subtotal * 0.12) / 1.12);
  const grandTotal = subtotal + shippingFee;

  const livePincodeEstimate =
    pincode.length === 6 ? estimateIndianPincodeDelivery(pincode, 2) : null;

  const tomorrowDate = useMemo(
    () => (todayDate ? addDaysToLocalDate(todayDate, 1) : null),
    [todayDate]
  );
  const tomorrowISO = tomorrowDate ? toLocalISODate(tomorrowDate) : '';

  const monthOptions = useMemo(() => {
    if (!todayDate) return [];
    const fmt = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
    return Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(todayDate.getFullYear(), todayDate.getMonth() + idx, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return {
        value: `${y}-${String(m).padStart(2, '0')}`,
        label: fmt.format(d),
        year: y,
        month: m,
      };
    });
  }, [todayDate]);

  const parsedSelected = useMemo(() => {
    const parts = requestedDateISO.split('-').map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      return { year: parts[0], month: parts[1], day: parts[2] };
    }
    if (tomorrowDate) {
      return {
        year: tomorrowDate.getFullYear(),
        month: tomorrowDate.getMonth() + 1,
        day: tomorrowDate.getDate(),
      };
    }
    return null;
  }, [requestedDateISO, tomorrowDate]);

  const dayOptions = useMemo(() => {
    if (!parsedSelected || !tomorrowDate) return [];
    const daysInMonth = new Date(parsedSelected.year, parsedSelected.month, 0).getDate();
    const weekdayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
    return Array.from({ length: daysInMonth }, (_, idx) => {
      const dayNum = idx + 1;
      const dt = new Date(parsedSelected.year, parsedSelected.month - 1, dayNum);
      const isPastOrToday = dt.getTime() < tomorrowDate.getTime();
      return {
        day: dayNum,
        weekdayShort: weekdayFmt.format(dt),
        disabled: isPastOrToday,
      };
    });
  }, [parsedSelected, tomorrowDate]);

  const handleMonthSelect = (yearMonth: string) => {
    if (!parsedSelected || !tomorrowDate) return;
    const [y, m] = yearMonth.split('-').map(Number);
    const maxDay = new Date(y, m, 0).getDate();
    const clampedDay = Math.min(parsedSelected.day, maxDay);
    let candidate = new Date(y, m - 1, clampedDay);
    if (candidate.getTime() < tomorrowDate.getTime()) {
      candidate = tomorrowDate;
    }
    setRequestedDateISO(toLocalISODate(candidate));
  };

  const handleDaySelect = (dayStr: string) => {
    if (!parsedSelected) return;
    const dayNum = Number(dayStr);
    const candidate = new Date(parsedSelected.year, parsedSelected.month - 1, dayNum);
    setRequestedDateISO(toLocalISODate(candidate));
  };

  const handleQuickPresetDays = (daysFromToday: number) => {
    if (!todayDate) return;
    setRequestedDateISO(toLocalISODate(addDaysToLocalDate(todayDate, daysFromToday)));
  };

  const deliverySchedule = useMemo(
    () => (requestedDateISO ? evaluateRequestedDeliveryDate(requestedDateISO, pincode, 2) : null),
    [requestedDateISO, pincode]
  );

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authTab === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register({
          name: authName,
          email: authEmail,
          phone: authPhone,
          password: authPassword,
        });
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setOrderError('Please sign in or create your account in Step 1 to place your order.');
      return;
    }
    setOrderError(null);
    setSubmitting(true);

    try {
      const payload = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        shippingAddress: {
          addressLine,
          city,
          state: stateName,
          pincode,
        },
        items: items.map((item) => ({
          product: item.productId,
          slug: item.slug,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          customization: item.customization,
        })),
        giftMessage,
        addGiftCardUpsell: false,
        requestedDeliveryDate: deliverySchedule?.formattedRequestedDate || '',
        estimatedDeliveryWindow: deliverySchedule?.estimatedDeliveryWindow || '',
        paymentMethod,
      };

      const res = await apiRequest<{ success: boolean; order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clearCart();
      router.push(`/order-success/${res.order.orderNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : 'Could not place order');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal">
          No Items to Checkout
        </h1>
        <p className="text-xs text-brand-muted">
          Add a handcrafted hamper, memory album, or bouquet to your bag first.
        </p>
        <Link
          href="/collections/all"
          className="inline-block px-7 py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <p className="font-serif italic text-sm text-brand-gold">
          Secure Studio Checkout · Artistic Fusion
        </p>
        <h1 className="font-serif uppercase tracking-widest text-2xl md:text-3xl text-brand-charcoal">
          Complete Your Handcrafted Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Steps Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Amazon / Flipkart Style Account Gate */}
          <div className="bg-white border border-brand-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-charcoal text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
                  Account & Order Tracking Identity
                </h2>
              </div>
              {user && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>

            {user ? (
              <div className="mt-4 pl-9 text-xs space-y-1">
                <p className="text-brand-charcoal font-medium">
                  Signed in as <strong>{user.name}</strong> ({user.email})
                </p>
                <p className="text-brand-muted">
                  Your handcrafted order updates and live fulfillment status will be linked to your
                  account.
                </p>
              </div>
            ) : (
              <div className="mt-5 pl-0 sm:pl-9 space-y-4">
                <div className="p-3 bg-brand-blush border border-brand-gold/40 text-xs text-brand-charcoal">
                  Sign in or create an account in seconds to place your order and track handcrafting
                  progress live.
                </div>

                <div className="inline-flex border border-brand-border text-xs font-semibold uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError(null);
                    }}
                    className={`px-4 py-2 ${
                      authTab === 'register'
                        ? 'bg-brand-charcoal text-white'
                        : 'bg-brand-surface text-brand-muted'
                    }`}
                  >
                    New Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError(null);
                    }}
                    className={`px-4 py-2 ${
                      authTab === 'login'
                        ? 'bg-brand-charcoal text-white'
                        : 'bg-brand-surface text-brand-muted'
                    }`}
                  >
                    Existing Customer Sign In
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-brand-crimson">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleInlineAuth} className="space-y-3 max-w-md">
                  {authTab === 'register' && (
                    <>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Full Name *"
                        className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                      />
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="10-Digit Mobile Number *"
                        className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                      />
                    </>
                  )}
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password (min 6 chars) *"
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="px-6 py-2.5 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest transition-colors"
                    >
                      {authLoading
                        ? 'Verifying...'
                        : authTab === 'register'
                        ? 'Register & Unlock Delivery Step'
                        : 'Sign In & Continue'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setAuthEmail('customer@artisticfusion.com');
                        setAuthPassword('Customer@123');
                      }}
                      className="text-[11px] text-brand-muted underline hover:text-brand-charcoal"
                    >
                      Use Demo Customer Account
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* STEP 2 & STEP 3 Form */}
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* STEP 2: Delivery Address */}
            <div
              className={`bg-white border border-brand-border p-6 transition-opacity ${
                !user ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-brand-charcoal text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
                  Delivery Recipient & Pan-India Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    Recipient Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit Indian mobile"
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    House / Flat No., Building, Street & Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. 402 Roseate Residency, 12th Main Indiranagar"
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    State *
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    6-Digit Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 560038"
                    className="w-full sm:w-64 text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                  {livePincodeEstimate && (
                    <p
                      className={`mt-1.5 text-xs flex items-center gap-1.5 ${
                        livePincodeEstimate.valid ? 'text-emerald-700' : 'text-brand-crimson'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>{livePincodeEstimate.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* When Do You Need Your Order? (Date, Day & Month Selector + Dynamic Estimated Delivery) */}
              <div className="mt-6 pt-6 border-t border-brand-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>When Do You Need Your Order? (Date, Day & Month)</span>
                    </h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Choose your target occasion date to schedule handcrafting & see your estimated delivery window.
                    </p>
                  </div>
                </div>

                {/* Quick Timeline Presets */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Earliest Possible', days: 4 },
                    { label: 'In 5 Days', days: 5 },
                    { label: 'In 1 Week', days: 7 },
                    { label: 'In 2 Weeks', days: 14 },
                  ].map((preset) => {
                    const presetISO = todayDate
                      ? toLocalISODate(addDaysToLocalDate(todayDate, preset.days))
                      : '';
                    const isActive = presetISO !== '' && requestedDateISO === presetISO;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleQuickPresetDays(preset.days)}
                        className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider border transition-colors ${
                          isActive
                            ? 'bg-brand-charcoal text-white border-brand-charcoal'
                            : 'bg-brand-surface text-brand-charcoal border-brand-border hover:border-brand-gold'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Explicit Month, Date (with Day) & Calendar Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="needed-month-select"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1"
                    >
                      Month & Year *
                    </label>
                    <select
                      id="needed-month-select"
                      value={
                        parsedSelected
                          ? `${parsedSelected.year}-${String(parsedSelected.month).padStart(2, '0')}`
                          : ''
                      }
                      onChange={(e) => handleMonthSelect(e.target.value)}
                      className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                    >
                      {monthOptions.map((mOpt) => (
                        <option key={mOpt.value} value={mOpt.value}>
                          {mOpt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="needed-day-select"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1"
                    >
                      Date & Day *
                    </label>
                    <select
                      id="needed-day-select"
                      value={parsedSelected ? String(parsedSelected.day) : ''}
                      onChange={(e) => handleDaySelect(e.target.value)}
                      className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                    >
                      {dayOptions.map((dOpt) => (
                        <option key={dOpt.day} value={dOpt.day} disabled={dOpt.disabled}>
                          {dOpt.day} ({dOpt.weekdayShort}){dOpt.disabled ? ' — Past' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="needed-calendar-input"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1"
                    >
                      Or Pick On Calendar
                    </label>
                    <input
                      id="needed-calendar-input"
                      type="date"
                      required
                      min={tomorrowISO}
                      value={requestedDateISO}
                      onChange={(e) => setRequestedDateISO(e.target.value)}
                      className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                    />
                  </div>
                </div>

                {/* Selected Date, Day & Month Pill Summary + Dynamic Estimated Delivery Banner */}
                {deliverySchedule && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 bg-brand-surface border border-brand-border p-3 text-center">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-brand-muted">
                          Day
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-brand-charcoal">
                          {deliverySchedule.dayName}
                        </span>
                      </div>
                      <div className="border-x border-brand-border">
                        <span className="block text-[10px] uppercase tracking-widest text-brand-muted">
                          Date
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-brand-crimson">
                          {deliverySchedule.dayOfMonth}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-brand-muted">
                          Month
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-brand-charcoal">
                          {deliverySchedule.monthName} {deliverySchedule.year}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-4 border space-y-2 ${
                        deliverySchedule.status === 'ON_TIME'
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : deliverySchedule.status === 'PRIORITY_RUSH'
                          ? 'bg-amber-50/80 border-amber-200'
                          : 'bg-brand-blush border-brand-crimson/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${
                            deliverySchedule.status === 'ON_TIME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : deliverySchedule.status === 'PRIORITY_RUSH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-brand-crimson text-white'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{deliverySchedule.statusLabel}</span>
                        </span>
                        <span className="text-[11px] text-brand-muted flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-gold" />
                          <span>{deliverySchedule.zoneLabel}</span>
                        </span>
                      </div>

                      <div className="text-xs">
                        <p className="text-[11px] uppercase tracking-wider text-brand-muted font-medium">
                          Estimated Delivery Window
                        </p>
                        <p className="text-sm sm:text-base font-bold text-brand-charcoal mt-0.5">
                          {deliverySchedule.estimatedDeliveryWindow}
                        </p>
                      </div>

                      <p className="text-xs text-brand-muted leading-relaxed">
                        {deliverySchedule.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: Payment Mode (COD + Mock Online / Razorpay Ready) */}
            <div
              className={`bg-white border border-brand-border p-6 space-y-4 transition-opacity ${
                !user ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-charcoal text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3.5 p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-brand-crimson bg-brand-blush/60'
                      : 'border-brand-border bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-brand-crimson focus:ring-brand-gold"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-brand-charcoal">
                      <span className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-brand-gold" />
                        Cash on Delivery (COD) / Pay via UPI on Arrival
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5">
                        Recommended
                      </span>
                    </div>
                    <p className="text-brand-muted mt-1">
                      Pay in cash or scan courier UPI QR when your handcrafted box arrives. Zero COD
                      convenience fee.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'MOCK_ONLINE'
                      ? 'border-brand-crimson bg-brand-blush/60'
                      : 'border-brand-border bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'MOCK_ONLINE'}
                    onChange={() => setPaymentMethod('MOCK_ONLINE')}
                    className="mt-1 text-brand-crimson focus:ring-brand-gold"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-brand-charcoal">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-gold" />
                        Instant Prepaid Sandbox (UPI / Cards / NetBanking)
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-brand-gold-light text-brand-charcoal px-2 py-0.5">
                        Razorpay Ready
                      </span>
                    </div>
                    <p className="text-brand-muted mt-1">
                      Simulates an instant prepaid confirmation (`PAID`) for testing order workflows
                      prior to switching on live Razorpay keys.
                    </p>
                  </div>
                </label>
              </div>

              {orderError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-brand-crimson font-medium">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={!user || submitting}
                className="w-full py-4 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Confirming Handcrafted Order...'
                    : `Place Order · ${formatINR(grandTotal)} (${
                        paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Sandbox'
                      })`}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-brand-border p-6 space-y-5 sticky top-40">
            <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal pb-3 border-b border-brand-border">
              Craft Bag Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            {/* Items List */}
            <div className="divide-y divide-brand-border max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartLineId} className="py-3 first:pt-0 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-16 object-cover border border-brand-border shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-medium text-brand-charcoal truncate">{item.title}</p>
                    <p className="text-brand-muted mt-0.5">Qty: {item.quantity}</p>
                    {item.customization && (
                      <p className="text-[11px] text-brand-gold truncate mt-0.5">
                        {item.customization.selectedRibbon} · {item.customization.selectedTag}
                        {item.customization.customerUploadedPhotos?.length
                          ? ` · ${item.customization.customerUploadedPhotos.length} photo(s)`
                          : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Complimentary Recipient Note */}
            <div className="pt-3 border-t border-brand-border space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal">
                Complimentary Recipient Greeting Note
              </label>
              <textarea
                rows={2}
                maxLength={220}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Optional personal greeting message for the recipient..."
                className="w-full text-xs border-brand-border bg-brand-surface focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            {/* Delivery Schedule Summary */}
            {deliverySchedule && (
              <div className="pt-3 border-t border-brand-border space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-brand-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span>Needed By (Day, Date, Month)</span>
                  </span>
                  <span className="text-brand-charcoal font-semibold text-right">
                    {deliverySchedule.formattedRequestedDate}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-brand-muted flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span>Estimated Delivery</span>
                  </span>
                  <span
                    className={`font-semibold text-right ${
                      deliverySchedule.status === 'ON_TIME'
                        ? 'text-emerald-700'
                        : deliverySchedule.status === 'PRIORITY_RUSH'
                        ? 'text-amber-700'
                        : 'text-brand-crimson'
                    }`}
                  >
                    {deliverySchedule.estimatedDeliveryWindow}
                  </span>
                </div>
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="pt-3 border-t border-brand-border space-y-2 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="text-brand-charcoal font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Cushioned Express Delivery</span>
                <span className="text-emerald-700 font-medium">
                  {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-brand-charcoal">Total Payable</span>
                  <span className="block text-[10px] text-brand-muted">
                    Includes {formatINR(inclusiveGst)} GST
                  </span>
                </div>
                <span className="text-xl font-bold text-brand-charcoal">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-brand-surface border border-brand-border flex items-center gap-2.5 text-[11px] text-brand-muted">
              <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
              <span>
                Every hamper and frame is photographed before dispatch and covered by our 100%
                Damage-Free Replacement Guarantee.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

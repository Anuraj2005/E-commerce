export interface PincodeEstimateResult {
  valid: boolean;
  pincode: string;
  zoneLabel?: string;
  leadTimeDays?: number;
  transitMinDays?: number;
  transitMaxDays?: number;
  windowText?: string;
  codAvailable?: boolean;
  message: string;
}

export type DeliveryFeasibilityStatus = 'ON_TIME' | 'PRIORITY_RUSH' | 'EARLIEST_POSSIBLE';

export interface RequestedDeliverySchedule {
  requestedDateISO: string;
  dayName: string;
  dayOfMonth: string;
  monthName: string;
  year: number;
  formattedRequestedDate: string;
  estimatedDeliveryWindow: string;
  earliestWindow: string;
  zoneLabel: string;
  leadTimeDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  daysUntilNeeded: number;
  status: DeliveryFeasibilityStatus;
  statusLabel: string;
  headline: string;
  message: string;
}

const PIN_ZONE_MAP: Record<string, { region: string; minTransit: number; maxTransit: number }> = {
  '1': { region: 'North Metro / NCR Hub', minTransit: 2, maxTransit: 4 },
  '2': { region: 'Northern Plains Express Zone', minTransit: 3, maxTransit: 5 },
  '3': { region: 'Western & Rajasthan Priority Zone', minTransit: 3, maxTransit: 5 },
  '4': { region: 'West Metro (Mumbai / Pune Hub)', minTransit: 2, maxTransit: 4 },
  '5': { region: 'South Express Hub (Bengaluru / Hyderabad)', minTransit: 1, maxTransit: 3 },
  '6': { region: 'Southern Coastal Zone (Chennai / Kochi)', minTransit: 2, maxTransit: 4 },
  '7': { region: 'Eastern Express Zone (Kolkata Hub)', minTransit: 3, maxTransit: 5 },
  '8': { region: 'Central-East Delivery Zone', minTransit: 4, maxTransit: 6 },
};

export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToLocalDate(base: Date, days: number): Date {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateRangeWindow(start: Date, end: Date): string {
  const shortFmt = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const shortWithYearFmt = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (toLocalISODate(start) === toLocalISODate(end)) {
    return shortWithYearFmt.format(end);
  }

  return `${shortFmt.format(start)} – ${shortWithYearFmt.format(end)}`;
}

export function evaluateRequestedDeliveryDate(
  requestedDateISO: string,
  rawPincode = '',
  leadTimeDays = 2
): RequestedDeliverySchedule | null {
  const parts = String(requestedDateISO || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return null;
  }

  const [year, month, day] = parts;
  const requestedDate = new Date(year, month - 1, day);
  if (
    requestedDate.getFullYear() !== year ||
    requestedDate.getMonth() !== month - 1 ||
    requestedDate.getDate() !== day
  ) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilNeeded = Math.round(
    (requestedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cleanedPin = rawPincode.trim();
  const hasValidPin = /^[1-9][0-9]{5}$/.test(cleanedPin);
  const zone = hasValidPin
    ? PIN_ZONE_MAP[cleanedPin[0]] || {
        region: 'Pan-India Express Zone',
        minTransit: 2,
        maxTransit: 4,
      }
    : {
        region: 'Pan-India Express Zone (enter PIN to refine)',
        minTransit: 2,
        maxTransit: 4,
      };

  const minTotalDays = leadTimeDays + zone.minTransit;
  const maxTotalDays = leadTimeDays + zone.maxTransit;

  const earliestMinDate = addDaysToLocalDate(today, minTotalDays);
  const earliestMaxDate = addDaysToLocalDate(today, maxTotalDays);
  const earliestWindow = formatDateRangeWindow(earliestMinDate, earliestMaxDate);

  const dayName = new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(requestedDate);
  const monthName = new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(requestedDate);
  const dayOfMonth = String(day);
  const formattedRequestedDate = `${dayName}, ${dayOfMonth} ${monthName} ${year}`;

  const dispatchDateFmt = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (daysUntilNeeded >= minTotalDays) {
    const dayBeforeRequested = addDaysToLocalDate(requestedDate, -1);
    const arrivalStart =
      dayBeforeRequested.getTime() >= earliestMinDate.getTime()
        ? dayBeforeRequested
        : earliestMinDate;
    const estimatedDeliveryWindow = formatDateRangeWindow(arrivalStart, requestedDate);

    const idealDispatch = addDaysToLocalDate(requestedDate, -zone.minTransit);
    const earliestDispatch = addDaysToLocalDate(today, leadTimeDays);
    const plannedDispatch =
      idealDispatch.getTime() >= earliestDispatch.getTime() ? idealDispatch : earliestDispatch;

    return {
      requestedDateISO,
      dayName,
      dayOfMonth,
      monthName,
      year,
      formattedRequestedDate,
      estimatedDeliveryWindow,
      earliestWindow,
      zoneLabel: zone.region,
      leadTimeDays,
      transitMinDays: zone.minTransit,
      transitMaxDays: zone.maxTransit,
      daysUntilNeeded,
      status: 'ON_TIME',
      statusLabel: 'Guaranteed On-Time for Your Date',
      headline: `Scheduled to arrive ${estimatedDeliveryWindow}`,
      message: `Studio dispatch planned for ${dispatchDateFmt.format(
        plannedDispatch
      )} (${leadTimeDays}d handcrafting + ${zone.minTransit}–${
        zone.maxTransit
      }d ${hasValidPin ? `transit to PIN ${cleanedPin}` : 'Pan-India express transit'}) so your gift arrives in time for ${dayName}, ${dayOfMonth} ${monthName}.`,
    };
  }

  if (daysUntilNeeded >= leadTimeDays) {
    return {
      requestedDateISO,
      dayName,
      dayOfMonth,
      monthName,
      year,
      formattedRequestedDate,
      estimatedDeliveryWindow: earliestWindow,
      earliestWindow,
      zoneLabel: zone.region,
      leadTimeDays,
      transitMinDays: zone.minTransit,
      transitMaxDays: zone.maxTransit,
      daysUntilNeeded,
      status: 'PRIORITY_RUSH',
      statusLabel: 'Priority Express Dispatch',
      headline: `Estimated arrival: ${earliestWindow} (Priority Queue)`,
      message: `Handcrafting (${leadTimeDays}d) + ${zone.minTransit}–${zone.maxTransit}d transit usually requires ${minTotalDays}–${maxTotalDays} days. We will flag your order for Priority Express Dispatch toward ${dayName}, ${dayOfMonth} ${monthName}, with expected arrival ${earliestWindow}.`,
    };
  }

  return {
    requestedDateISO,
    dayName,
    dayOfMonth,
    monthName,
    year,
    formattedRequestedDate,
    estimatedDeliveryWindow: earliestWindow,
    earliestWindow,
    zoneLabel: zone.region,
    leadTimeDays,
    transitMinDays: zone.minTransit,
    transitMaxDays: zone.maxTransit,
    daysUntilNeeded,
    status: 'EARLIEST_POSSIBLE',
    statusLabel: 'Earliest Available Window',
    headline: `Earliest possible delivery: ${earliestWindow}`,
    message: `Each piece takes ${leadTimeDays} days of artisan handcrafting before ${zone.minTransit}–${zone.maxTransit}d transit. Selecting ${dayName}, ${dayOfMonth} ${monthName} will still dispatch on priority, with earliest delivery estimated between ${earliestWindow}.`,
  };
}

export function estimateIndianPincodeDelivery(
  rawPincode: string,
  leadTimeDays = 2
): PincodeEstimateResult {
  const cleaned = rawPincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return {
      valid: false,
      pincode: cleaned,
      message: 'Please enter a valid 6-digit Indian postal PIN code (e.g., 560038 or 400050).',
    };
  }

  const firstDigit = cleaned[0];
  const zone = PIN_ZONE_MAP[firstDigit] || {
    region: 'Pan-India Express Zone',
    minTransit: 3,
    maxTransit: 5,
  };

  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(now.getDate() + leadTimeDays + zone.minTransit);

  const maxDate = new Date(now);
  maxDate.setDate(now.getDate() + leadTimeDays + zone.maxTransit);

  const formatter = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const windowText = `${formatter.format(minDate)} – ${formatter.format(maxDate)}`;

  return {
    valid: true,
    pincode: cleaned,
    zoneLabel: zone.region,
    leadTimeDays,
    transitMinDays: zone.minTransit,
    transitMaxDays: zone.maxTransit,
    windowText,
    codAvailable: true,
    message: `Estimated arrival between ${windowText} (${leadTimeDays}d handcrafting + ${zone.minTransit}–${zone.maxTransit}d cushioned express transit).`,
  };
}

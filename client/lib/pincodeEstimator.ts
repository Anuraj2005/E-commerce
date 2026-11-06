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

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export const RIBBON_SWATCH_MAP: Record<string, { hex: string; border: string }> = {
  'Crimson Red': { hex: '#9E2A2B', border: '#7A1F20' },
  'Blush Rose': { hex: '#F4D9D0', border: '#D9B3A7' },
  Pink: { hex: '#F2B8C6', border: '#D994A5' },
  'Baby Pink': { hex: '#F7CFD8', border: '#DFA8B5' },
  'Royal Gold': { hex: '#C5A059', border: '#A3813E' },
  Gold: { hex: '#C5A059', border: '#A3813E' },
  Champagne: { hex: '#EFE1C6', border: '#D1BEA0' },
  Ivory: { hex: '#FAF6EE', border: '#DDD4C3' },
  White: { hex: '#FFFFFF', border: '#DCDCDC' },
  'Emerald Green': { hex: '#2E6F40', border: '#1E4D2B' },
  'Sage Green': { hex: '#9CAF88', border: '#7A8F66' },
  Mint: { hex: '#BFE3D0', border: '#95C2AB' },
  Lavender: { hex: '#C8B6E2', border: '#A590C4' },
  Lilac: { hex: '#D8C2E8', border: '#B69BC9' },
  'Midnight Navy': { hex: '#1D2951', border: '#111936' },
  'Sky Blue': { hex: '#A7C7E7', border: '#7FA6CC' },
  Peach: { hex: '#FAD1B8', border: '#DEB094' },
  Coral: { hex: '#E88D72', border: '#C76F55' },
  Burgundy: { hex: '#6E1E2A', border: '#4D121B' },
  Silver: { hex: '#C9CDD1', border: '#A5AAAF' },
  Black: { hex: '#222222', border: '#111111' },
};

/**
 * Parses a ribbon entry such as "Crimson Red" or custom admin entry "Dusty Blue|#6B8EAD"
 * into a clean display label and hex swatch.
 */
export function getRibbonSwatch(rawEntry: string): {
  raw: string;
  label: string;
  hex: string;
  border: string;
} {
  const trimmed = String(rawEntry || '').trim();
  if (trimmed.includes('|')) {
    const [namePart, hexPart] = trimmed.split('|');
    const cleanHex = hexPart?.trim() || '#C5A059';
    return {
      raw: trimmed,
      label: namePart.trim() || 'Custom Ribbon',
      hex: cleanHex,
      border: cleanHex,
    };
  }

  // Exact match or case-insensitive lookup
  const exact = RIBBON_SWATCH_MAP[trimmed];
  if (exact) {
    return { raw: trimmed, label: trimmed, ...exact };
  }

  const lower = trimmed.toLowerCase();
  const matchedKey = Object.keys(RIBBON_SWATCH_MAP).find((k) => k.toLowerCase() === lower);
  if (matchedKey) {
    return { raw: trimmed, label: trimmed, ...RIBBON_SWATCH_MAP[matchedKey] };
  }

  return {
    raw: trimmed,
    label: trimmed,
    hex: '#E6CCB2',
    border: '#C5A059',
  };
}

'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const MESSAGES = [
  'HANDCRAFTED TO ORDER BY STUDIO ARTISANS | CUSTOM RIBBONS & GIFT TAGS INCLUDED',
  'COMPLIMENTARY LUXURY GIFT WRAP & RIBBON ON ORDERS OVER ₹1,999',
  'PAN-INDIA EXPRESS DELIVERY AVAILABLE FOR CELEBRATION HAMPERS',
];

const DISMISS_KEY = 'af_announcement_dismissed_v1';

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(DISMISS_KEY);
      if (saved === 'true') setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  return (
    <div className="relative bg-brand-crimson text-white text-[11px] md:text-xs py-2.5 px-9 font-medium uppercase tracking-widest text-center overflow-hidden">
      <div className="max-w-5xl mx-auto min-h-[16px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="truncate"
          >
            {MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

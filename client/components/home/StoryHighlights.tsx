'use client';

import Link from 'next/link';
import { Category } from '@/types';

interface StoryHighlightsProps {
  categories: Category[];
  className?: string;
}

export default function StoryHighlights({ categories, className = '' }: StoryHighlightsProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section
      aria-label="Shop by Story Highlights"
      className={`bg-brand-canvas border-b border-brand-border py-4 md:py-7 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start md:justify-center gap-5 sm:gap-7 md:gap-9 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/collections/${cat.slug}`}
              className="group flex flex-col items-center shrink-0 w-[78px] md:w-[96px] text-center"
            >
              <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-full overflow-hidden ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-canvas group-hover:scale-105 group-hover:ring-brand-crimson transition-all duration-200 cursor-pointer shadow-xs">
                <img
                  src={cat.highlightCoverImage?.url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2.5 text-[11px] md:text-xs font-medium text-brand-charcoal group-hover:text-brand-crimson leading-tight line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

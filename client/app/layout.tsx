import type { Metadata } from 'next';
import './globals.css';
import LiveSyncProvider from '@/components/providers/LiveSyncProvider';
import StorefrontShell from '@/components/layout/StorefrontShell';

export const metadata: Metadata = {
  title: 'Artistic Fusion | Handcrafted Luxury Hampers, Albums & Keepsakes',
  description:
    'Artistic Fusion — something handmade is so much more beautiful. Shop bespoke celebration hampers, hand-stitched memory albums, bouquets, A5 frames, and wax-sealed invitations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LiveSyncProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </LiveSyncProvider>
      </body>
    </html>
  );
}

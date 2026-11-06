/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blush: '#FDF7F4',        // Soft pastel background
          canvas: '#FFFFFF',       // Card and modal surface
          surface: '#FBF9F7',      // Secondary surface fill
          petal: '#F4D9D0',        // Rose accent / secondary badge
          gold: '#C5A059',         // Metallic gold accent (ribbons, tags, hampers)
          'gold-light': '#F5EEDC', // Light gold badge / hover state
          crimson: '#9E2A2B',      // Bold ribbon red, discount badge, announcement bar
          charcoal: '#222222',     // Primary typography
          muted: '#7A7A7A',        // Secondary typography, MRP, borders
          border: '#EFEAE6',       // Component divider lines
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        product: '4 / 5',          // Joker & Witch signature product card ratio
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};

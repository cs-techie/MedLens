/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0EA5E9",
          secondary: "#14B8A6",
          success: "#22C55E",
          warning: "#F59E0B",
          alert: "#EF4444",
          card: "#1F2937",
        },
        med: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          cardHover: "#F1F5F9",
          border: "#E2E8F0",
          primary: "#0EA5E9",
          primaryHover: "#0284C7",
          secondary: "#14B8A6",
          accent: "#22C55E",
          low: "#0EA5E9",
          normal: "#22C55E",
          high: "#EF4444",
          unknown: "#64748B",
          user: "#8B5CF6",
          ai: "#0EA5E9",
          summary: "#F59E0B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'light-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
        'light-glow': 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(20,184,166,0.05) 40%, rgba(248,250,252,0) 70%)',
        'brand-btn': 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
      }
    },
  },
  plugins: [],
};

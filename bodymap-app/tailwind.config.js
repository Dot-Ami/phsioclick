/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "../BodyMapApp.jsx"],
  theme: {
    extend: {
      colors: {
        // Brand accent (replaces cyan); see stages/02a-ux-foundation/output/design-tokens.md §1.3
        brand: {
          DEFAULT: "#14b8a6",
          hover: "#0d9488",
        },
        // Semantic state palette; see design-tokens.md §1.2
        state: {
          tight: "#f59e0b",
          weak: "#818cf8",
          balanced: "#5eead4",
        },
      },
      borderRadius: {
        // Off-Tailwind values used by cards, sheets, modals; see design-tokens.md §4
        10: "10px",
        14: "14px",
        20: "20px",
      },
      fontSize: {
        display: ["40px", { lineHeight: "44px", fontWeight: "600" }],
        h1: ["28px", { lineHeight: "36px", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        micro: ["11px", { lineHeight: "14px", fontWeight: "600" }],
      },
      boxShadow: {
        // Elevation tokens; design-tokens.md §5
        "elev-1": "0 0 0 1px rgba(63, 63, 70, 0.6)",
        "elev-2":
          "0 0 0 1px rgba(63, 63, 70, 0.8), 0 8px 24px rgba(0,0,0,0.45)",
        "elev-3":
          "0 0 0 1px rgba(20, 184, 166, 0.4), 0 0 32px rgba(20, 184, 166, 0.18)",
        "elev-tight":
          "0 0 0 1px rgba(245, 158, 11, 0.35), 0 0 24px rgba(245, 158, 11, 0.15)",
        "elev-weak":
          "0 0 0 1px rgba(129, 140, 248, 0.35), 0 0 24px rgba(129, 140, 248, 0.15)",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
        celebration: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        400: "400ms",
        800: "800ms",
      },
    },
  },
  plugins: [],
};

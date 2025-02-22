/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      "2xl": {
        max: "1535px",
      },
      xl: {
        max: "1235px",
      },
      lg: {
        max: "1035px",
      },
      md: {
        max: "767px",
      },
      sm: {
        max: "650px",
      },
    },
    extend: {
      animation: {
        "slide-in": "slide-in 0.5s ease-in-out forwards",
        "slide-out": "slide-out 0.5s ease-in-out forwards",
      },
      keyframes: {
        "slide-in": {
          "0%": {
            opacity: "0",
            transform: "translate(-50%, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, -50%)",
          },
        },
        "slide-out": {
          "0%": {
            opacity: "1",
            transform: "translate(-50%, -50%)",
          },
          "100%": {
            opacity: "0",
            transform: "translate(-50%, 0)",
          },
        },
      },
      colors: {
        grayColor: "var(--grayColor)",
        primary: "var(--primary)",
        lightPrimary: "var(--lightPrimary)",
        "dark-primary": "var(--dark-primary)",
        "light-gray": "var(--light-gray)",
        "off-white": "var(--off-white)",
        danger: "var(--danger)",
        greenColor: "var(--greenColor)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
5;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      xl: { max: "1235px" },
      lg: { max: "1035px" },
      md: { max: "767px" },
      sm: { max: "650px" },
    },
    extend: {
      animation: {
        "slide-in": "slide-in 0.5s ease-in-out forwards",
        "slide-out": "slide-out 0.5s ease-in-out forwards",
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translate(-50%, 0)" },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, -50%)",
          },
        },
        "slide-out": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%)" },
          "100%": { opacity: "0", transform: "translate(-50%, 0)" },
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
      },
    },
  },
  plugins: [],
};
5;

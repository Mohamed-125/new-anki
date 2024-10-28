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
      colors: {
        grayColor: "var(--grayColor)",
        primary: "var(--primary)",
        "dark-primary": "var(--dark-primary)",
        "light-gray": "var(--light-gray)",
        "off-white": "var(--off-white)",
        primary: "var(--primary)",
        danger: "var(--danger)",
        greenColor: "var(--greenColor)",
      },
    },
  },
  plugins: [],
};

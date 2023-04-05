// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navbar: "#0269a6",
        button: {
          create: "#1e883e",
        },
        primary: {
          bg: "#f8fafc",
        },
      },
      fontFamily: {
        "roboto-mono": ["var(--font-roboto-mono)", ...fontFamily.mono],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

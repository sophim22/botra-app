module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,pug}", "./src/**/**/*.{js,ts,jsx,tsx,pug}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
  plugins: [require("tw-elements/dist/plugin")]
};

const tailwindcss = require("tailwindcss");
const NODE_ENV = process.NODE_ENV;

module.exports = {
  plugins: {
    tailwindcss,
    autoprefixer: {},
    ...(NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}

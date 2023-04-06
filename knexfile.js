const environment = process.env.NODE_ENV || "development";
const config = require("./src/config/database")[environment];

module.exports = config;

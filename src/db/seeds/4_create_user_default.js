const bycrypt = require("bcryptjs");

const salt = bycrypt.genSaltSync(10);
const hash = bycrypt.hashSync("123456789", salt);

exports.seed = async function(knex) {
  return knex("users").insert([
    {
      email: "system@gmail.com",
      password: hash,
      username: "System",
      phone: "012898473",
      profile: "8182391239123.jpg",
      status: "active",
      dob: "2020-01-01",
      is_system: true,
    },
  ]);
};
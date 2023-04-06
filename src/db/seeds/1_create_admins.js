const bcrypt = require("bcrypt");

const password = "123456789";
const hash = bcrypt.hashSync(password, 12);

exports.seed = async function(knex) {
  return knex("admins").insert([
    {
      username: "admin",
      email: "admin@gmail.com",
      password: hash,
    },
  ]);
};

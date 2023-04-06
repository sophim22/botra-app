import { checkSchema } from "express-validator";
import User from "../models/User";

export const errorSerialize = error => {
  const errors = {};
  Object.keys(error).map(key => {
    const newKey = key.replace("user.", "");
    errors[newKey] = error[key].map(obj => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "user.username": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "user.phone": {
    in: ["body"],
    custom: {
      options: async (value, { req }) => {
        if (req.body.user.provider == "phone" && !value.length) {
          return Promise.reject("is required");
        }
        const id = req.params.id;
        const condition = id ? `!= ${id}` : "IS NOT NULL";
        let userCount = await User.query().where("phone", value).whereRaw(`id ${condition}`).count();

        if (userCount.length && Number(userCount[0].count) > 0) {
          return Promise.reject("Phone Number already taken");
        }
        return value;
      },
    },
  },
  "user.email": {
    in: ["body"],
    custom: {
      options: async (value, { req }) => {
        if (value) {
          const id = req.params.id;
          const condition = id ? `!= ${id}` : "IS NOT NULL";
          let userCount = await User.query().where("email", value).whereRaw(`id ${condition}`).count();

          if (userCount.length && Number(userCount[0].count) > 0) {
            return Promise.reject("Email already taken");
          }
          return value;
        }
      },
    },
  },
  "user.password": {
    in: ["body"],
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        if (!id) {
          if (!value) {
            return Promise.reject("is required");
          }
          if (value.length < 6) {
            return Promise.reject("minimum length 6");
          }
          if (value != req.body.user.confirm_password) {
            return Promise.reject("password not match.");
          }
        }
        return value;
      },
    },
  },
  "user.status": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "user.confirm_password": {
    in: ["body"],
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        if (!id) {
          if (!value) {
            return Promise.reject("is required");
          }
          if (value.length < 6) {
            return Promise.reject("minimum length 6");
          }
        }
        return value;
      },
    },
  },
});

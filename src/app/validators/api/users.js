import { checkSchema } from "express-validator";
import User from "~/app/models/User";

export const errorSerialize = error => {
  const errors = {};
  Object.keys(error).map(key => {
    const newKey = key.replace("user.", "");
    errors[newKey] = error[key].map(obj => obj.msg).join(", ");
  });
  return errors;
};

export const changePassword = checkSchema({
  current_password: {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const user = await User.query().findById(req.decoded.id);
        const isValid = await user.validPassword(value || "");
        if (!isValid) {
          return Promise.reject("Invalid current password!");
        }
        return value;
      },
    },
  },
  password: {
    in: ["body"],
    notEmpty: true,
    isLength: {
      errorMessage: "Password should be at least 6 chars long",
      options: { min: 6 },
    },
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        if (req.body.password_confirmation != value) {
          return Promise.reject("Password not match");
        }
        return value;
      },
    },
  },
  password_confirmation: {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    isLength: {
      errorMessage: "Password should be at least 6 chars long",
      options: { min: 6 },
    },
  },
});

export const updateProfile = checkSchema({
  username: {
    in: ["body"],
    notEmpty: true,
    isLength: {
      errorMessage: "Username should be at least 3 chars long",
      options: { min: 3 },
    },
    errorMessage: "is required",
  },
  email: {
    in: ["body"],
    notEmpty: false,
    custom: {
      options: async (value, { req }) => {
        if (value) {
          const user = await User.query()
            .whereRaw(`lower(email) = lower('${value}')`)
            .whereNot({ id: req.decoded.id })
            .first();
          if (user) {
            return Promise.reject("Email Already in Use");
          }
        }
        return value;
      },
    },
  },
});

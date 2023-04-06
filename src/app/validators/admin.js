import { checkSchema } from "express-validator";
import Admin from "../models/Admin";

export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("member.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "member.email": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let admin = await Admin.query().where("email", value).whereRaw(`id ${condition}`).count();

        if (admin.length && Number(admin[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
  "member.password": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    isLength: {
      errorMessage: "minimum length 6",
      options: { min: 6 },
    },
    custom: {
      options: async (value, { req }) => {
        if (value != req.body.member.confirm_password) {
          return Promise.reject("password not match.");
        }
        return value;
      },
    },
  },
  "member.confirm_password": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    isLength: {
      errorMessage: "minimum length 6",
      options: { min: 6 },
    },
  },
});

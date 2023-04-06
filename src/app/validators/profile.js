import { checkSchema } from "express-validator";
import Admin from "../models/Admin";


export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("profile.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};


export default checkSchema({
  "profile.email": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let admin = await Admin.query().where("email", value).count();
        if (admin.length && Number(admin[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
  "profile.username": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let admin = await Admin.query().where("username", value).count();
        if (admin.length && Number(admin[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
})
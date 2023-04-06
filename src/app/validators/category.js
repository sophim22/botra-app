import { checkSchema } from "express-validator";
import Category from "../models/Category";

export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("category.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "category.name": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let category = await Category.query()
          .where("name", value)
          .whereRaw(`id ${condition}`)
          .count();

        if (category.length && Number(category[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
  "category.code": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "category.status": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
});

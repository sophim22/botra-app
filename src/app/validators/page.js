import { checkSchema } from "express-validator";
import Page from "../models/Page";

export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("page.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "page.title": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let page = await Page.query()
          .where("title", value)
          .whereRaw(`id ${condition}`)
          .count();
        console.log(page)
        if (page.length && Number(page[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
  "page.code": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let page = await Page.query()
          .where("code", value)
          .whereRaw(`id ${condition}`)
          .count();
        if (page.length && Number(page[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      },
    },
  },
  "page.content": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
})

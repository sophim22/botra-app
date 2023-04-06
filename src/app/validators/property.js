import { checkSchema } from "express-validator";

export const errorSerialize = error => {
  const errors = {};
  Object.keys(error).map(key => {
    const newKey = key.replace("property.", "");
    errors[newKey] = error[key].map(obj => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "property.name": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "property.status": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "property.category_id": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
});

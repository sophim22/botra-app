import { checkSchema } from "express-validator";

export const errorSerialize = error => {
  const errors = {};
  Object.keys(error).map(key => {
    const newKey = key.replace("contact.", "");
    errors[newKey] = error[key].map(obj => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  name: {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  email: {
    in: ["body"],
    isEmail: true,
    errorMessage: "is required or invalid email format"
  },
  message: {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
});

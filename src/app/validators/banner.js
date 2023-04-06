import { checkSchema } from "express-validator";
import Banner from "../models/Banner";


export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("banner.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
}
export default checkSchema({
  "banner.name": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required"
  },
  "banner.link": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "banner.status" : {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
});

import { checkSchema } from "express-validator";
import Coupon from "../models/Coupon";

export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("coupons.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};

export default checkSchema({
  "coupons.code": {
    in: ["body"],
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        if (!id) {
          let coupon = await Coupon.query()
            .where("code", value)
            .count();
          if (coupon.length && Number(coupon[0].count) > 0) {
            return Promise.reject("already taken");
          }

          if (value.length === 0) {
            return Promise.reject("is required")
          }

          if (value.length > 8) {
            return Promise.reject("Code should't more than 8.")
          }
        }
        return value;
      },
    },
  },
  "coupons.name": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.status": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.amount": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.discount_type": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.property_id": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.started_at": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "coupons.ended_at": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },

});

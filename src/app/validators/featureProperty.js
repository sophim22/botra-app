import { checkSchema } from "express-validator";
import FeatureProperty from "../models/FeatureProperty";
export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("user.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};


export default checkSchema({
    "feature.property": {
      in: ["body"],
      custom: {
        options: async (value, { req }) => {
            const id = req.params.id;
            let feature = await FeatureProperty.query().where("properties.id", value).count();
            if (feature.length && Number(feature[0].count) > 0) {
              return Promise.reject("already added");
            }
            return value;
        }
      }
    }
  })
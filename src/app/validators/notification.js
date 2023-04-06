import { checkSchema } from "express-validator";
import Notification from "../models/Notification";


export const errorSerialize = (error) => {
  const errors = {};
  Object.keys(error).map((key) => {
    const newKey = key.replace("notification.", "");
    errors[newKey] = error[key].map((obj) => obj.msg).join(", ");
  });
  return errors;
};


export default checkSchema({
  "notification.title": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
    custom: {
      options: async (value, { req }) => {
        const id = req.params.id;
        const condition = id ? `!= ${id}` : 'IS NOT NULL';
        let notification = await Notification.query().where("title", value).count();
        if (notification.length && Number(notification[0].count) > 0) {
          return Promise.reject("already taken");
        }
        return value;
      }
    }
  },
  "notification.content": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },

  "notification.status": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },
  "notification.publish_at": {
    in: ["body"],
    notEmpty: true,
    errorMessage: "is required",
  },

})
import { validationResult } from "express-validator";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import Page from "~/app/models/Page";
import Property from "~/app/models/Property";
import Favorite from "~/app/models/Favorite";
import ContactRequest from "~/app/models/ContactRequest";
import { errorSerialize } from "~/app/validators/api/users";
import { propertySerializer } from "~/app/serializer/property";
import Setting from "~/app/models/Setting";

export const configs = async (_req, res) => {
  const terms = await Page.query().findOne({ code: "terms" }).select("content", "code");
  const privacy = await Page.query().findOne({ code: "privacy" }).select("content", "code");
  const setting = await Setting.firstOrCreate();
  res.status(200).json({
    data: {
      terms,
      privacy,
      setting: {
        default_location: setting.default_location,
        locations: setting?.available_location?.data || "",
      },
    },
  });
};

export const contactRequest = async (req, res) => {
  try {
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);

    if (result.errors.length) {
      return res.status(400).json(errorsMessage);
    }
    await ContactRequest.query().insert(req.body);
    // TODO SEND EMAIL
    res
      .status(200)
      .json({ message: "Thank for your message.We will back to you as soon as possible please stay tune." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Oop, sorry something went wrong!" });
  }
};

export const recommends = async (req, res) => {
  const properties = await Property.query()
    .modify("approved")
    .withGraphFetched("[category, galleries, user]")
    .limit(10)
    .orderBy("created_at", "desc");
  const user = req.currentUser;
  if (user) {
    const favorites = await Favorite.query()
      .where({ user_id: user.id })
      .whereIn(
        "property_id",
        properties.map(obj => obj.id),
      );
    const favoriteById = keyBy(favorites, "property_id");
    properties.map(property => {
      property.is_like = !!favoriteById[property.id];
      return property;
    });
  }
  res.status(200).json({ data: properties.map(propertySerializer) });
};

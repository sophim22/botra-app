import Feature from "../../../models/Feature";
import Favorite from '../../../models/Favorite';
import { pagination, paging , keyBy} from "~/app/helper/utils";
import { featureSerializer } from "~/app/serializer/features";
import { propertySerializer } from "~/app/serializer/property";

import Property from "~/app/models/Property";


export const updateOrder = async (req, res) => {
  const {features}=  req.body
  try{
    const feature  = features.map(async (feature) => {
      await Feature.query().findById(feature.id).patch({order: feature.order});
    })
    await Promise.all(feature);
    req.flash("success", { message: "Update Order Success!" });
    res.redirect("/features");
  } catch (error) {
    req.flash("error", { message: "Something went wrong" });
    res.redirect("/features");
  }
}

export const list = async (req, res) => {
  const { perPage, page, query} = paging(req);
  const user = req.currentUser;
  try {
    let features = await Feature.query().withGraphFetched("properties.[galleries, category, user]").joinRelated('properties').distinct('features.*')
    const propertyIds = [...new Set(features.map(feature => feature.properties.map(property => property.id)).flat())];
    if (user) {
      const favorites = await Favorite.query()
        .where({ user_id: user.id })
        .whereIn(
          "property_id",
          propertyIds
        );
      const favoriteById = keyBy(favorites, "property_id");
      features = features.map(feature => {
        feature.properties = feature.properties.map(property => {
          property.is_like = !!favoriteById[property.id];
          return property
        })
        return feature;
      })
    }
    res.status(200).json({ data: features.map(featureSerializer)});
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "Something went wrong" });
  }
}

export const show = async (req, res) => {
  const {id} = req.params
  const { perPage, page, query} = paging(req);
  try {
    const properties = await Property.query().withGraphFetched("[category, galleries , user]").joinRelated("features").where("features.uuid", id).where("properties.status", "approved").page(page, perPage);
    const meta = pagination(properties.total, perPage, page);
    const user = req.currentUser;
    if (user) {
      const favorites = await Favorite.query()
        .where({ user_id: user.id })
        .whereIn(
          "property_id",
          properties.results.map((obj) => obj.id)
        );
      const favoriteById = keyBy(favorites, "property_id");
      properties.results.map((property) => {
        property.is_like = !!favoriteById[property.id];
        return property;
      });
    }
    res.status(200).json({ data: properties.results.map(propertySerializer), meta });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

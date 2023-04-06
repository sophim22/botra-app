import FeatureProperty from '../models/FeatureProperty';
import { validationResult } from 'express-validator';
import helper, { groupBy } from "../helper/utils";
import { errorSerialize } from '../validators/user';
import Property from '../models/Property';
import Feature from '../models/Feature';


class FeaturesProperties {

  addProperty = async (req, res) => {
    const properties = await Property.query().where("status", "approved")
    const {id} = req.params;
      const form = {
        property_id: null,
        feature_id: id,
      }
      res.render("features_properties/add_properties", {
        title: 'New Property',
        action: `/features/${id}/add_property`,
        form,
        properties,
        errors: {},
      });
    }
  delete = async (req, res) => {
    const {id, property_id} = req.params;
    console.log(id, property_id)
    try {
      const deleteProperty =  await FeatureProperty.query().where({feature_id: id, property_id: property_id}).first();
      if (!deleteProperty){
        req.flash("error", { message: "Directory not found" });
        return res.redirect(`/features`);
      }
      await deleteProperty.$query().delete();
      req.flash("success", { message: "Delete Directory Success!" });
      res.redirect(`/features/${id}`);
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Delete Directory Failed" });
      res.redirect(`/features`);
    }
  }
  postProperty = async (req, res) => {
    const {id} = req.params;
    const {property_ids} = req.body.feature;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      const propertyIds = typeof property_ids === "string" ? [property_ids] : property_ids;
      const properties = propertyIds.map((property_id) => {
        return {
          property_id,
          feature_id: id,
        };
      });
      const existingProperties = await FeatureProperty.query().whereIn("property_id", propertyIds).andWhere("feature_id", id);
      const remaind = properties.filter((property) => {
        return !existingProperties.find((existingProperty) => {
          const propertyIdAsString = existingProperty.property_id + ""
          return propertyIdAsString === property.property_id;
        })
      })
      if (remaind.length === 0) {
        req.flash("error", { message: "Property already exist" });
        return res.redirect(`/features/${id}`);
      }
      await FeatureProperty.query().insert(remaind);
      req.flash("success", { message: "Add Property Success!" });
      return  res.redirect(`/features/${id}`);
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something When Wrong" });
      res.redirect(`/features/${id}`);
    }
  }
}

export default new FeaturesProperties();


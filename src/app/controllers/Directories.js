import Property from "../models/Property";
import helper, { groupBy } from "../helper/utils";
import Category from "../models/Category";
import { validationResult } from "express-validator";
import { errorSerialize } from "../validators/property";
import Gallery from "../models/Gallery";
import Favorite from "../models/Favorite";
import User from "../models/User"

class PropertiesController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const { name, status, username, phone, category_id} = req.query;
    const params = { name, status, username, phone, category_id};
    const properties = await Property.list(null, params, page, perPage);
    const categories =  await Category.query();
    const pagination = helper.pagination(properties.total, perPage, page);
    res.render("directories/index", {
      title: "Directory List",
      properties,
      params,
      pagination,
      categories
    });
  };

  show = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const property = await Property.query()
      .withGraphFetched("category")
      .withGraphFetched("galleries")
      .withGraphFetched("user")
      .findById(req.params.id);
    const groupByType = groupBy(property.social_link, "social_type");
    const favorites = await Favorite.query().joinRelated("user")
      .withGraphFetched("user")
      .where({ property_id: property.id })
      .page(page, perPage);
    const pagination = helper.pagination(favorites.total, perPage, page);
    res.render("directories/show", {
      title: "Directory Detail",
      property,
      favorites,
      groupByType,
      pagination,
    });
  };
  new = async (req, res) => {
    const form = {
      name: "",
      open_close_time: "",
      price_rang: "",
      website: "",
      category_id: "",
      contact: "",
      address: "",
      latitude: "",
      longitude: "",
      social_link: [],
    };
    const categories = await Category.query().modify("actives");
    res.render("directories/new", {
      title: "New Directory",
      form,
      categories,
      errors: {},
      galleries: null,
    });
  };
  create = async (req, res) => {
    const params = req.body.property;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
        if (!result.errors.length) {
      const {
        name,
        category_id,
        status,
        price_range,
        website,
        open_close_time,
        description,
        address,
        latitude,
        longitude,
        contact,
      } = params;
      params.social_link = Object.values(params.social_link);
      const userSystem =  await User.query().findOne({is_system: true});
      console.log(userSystem.id)
      const property = await Property.query()
        .insert({
          name,
          category_id,
          status,
          price_range,
          website,
          open_close_time,
          description,
          address,
          contact,
          latitude,
          longitude,
          user_id: userSystem.id,
          social_link: JSON.stringify(params.social_link) || [],
        })
        .returning("*");
      const images =  req.files
      const galleryParams = [];
        for (let i = 0; i < images.length; i++) {
          const path = images[i].key || images[i].filename;
          galleryParams.push({ file: path,
            filable_type: "Property",
            filable_id: property.id,
            visible: true,})
        }
        await Gallery.query()
            .insert(galleryParams)
            .returning("*");
      req.flash("success", {
        message: "Property has been created successfully.",
      });
      return res.redirect(`/directories/${property.id}`);
    }
    const categories = await Category.query().modify("actives");
    req.flash("error", { message: "Create Failure" });
    res.render("directories/new", {
      title: "New Directory",
      form: params || {},
      errors: errorsMessage,
      categories,
      galleries: null,
    });
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: error.message });
    }
  
   
  };
  edit = async (req, res) => {
    const { id } = req.params;
    const property = await Property.query().withGraphFetched("galleries").findById(id);
    const categories = await Category.query().modify("actives");
    const form = {
      id: property.id,
      name: property.name,
      category_id: property.category_id,
      status: property.status,
      price_range: property.price_range,
      website: property.website,
      open_close_time: property.open_close_time,
      contact: property.contact,
      description: property.description,
      address: property.address,
      latitude: property.latitude,
      longitude: property.longitude,
      social_link: property.social_link || [],
    };
    res.render("directories/edit", {
      title: "Edit Directory",
      form,
      categories,
      errors: {},
      galleries: property.galleries,
    });
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const params = req.body.property;
      const result = validationResult(req);
      const errors = groupBy(result.errors, "param");
      const errorsMessage = errorSerialize(errors);
      const property = await Property.query().findById(id);
      if (!result.errors.length) {
        const {
          name,
          category_id,
          status,
          price_range,
          website,
          open_close_time,
          description,
          address,
          latitude,
          contact,
          longitude,
        } = params;
        params.social_link = Object.values(params.social_link);
        await property.$query().patch({
          name,
          category_id,
          status,
          price_range,
          website,
          open_close_time,
          description,
          address,
          latitude,
          longitude,
          contact,
          social_link: JSON.stringify(params.social_link) || [],
          updated_at: new Date(),
        });
        const images =  req.files
          const galleryParams = [];
          for (let i = 0; i < images.length; i++) {
            const path = images[i].key || images[i].filename;
            galleryParams.push({ file: path,
              filable_type: "Property",
              filable_id: property.id,
              visible: true,})
          }
          const  galleries = await Gallery.query().find({filable_id: property.id})
          if (!galleries){
            return res.status(404).json({ message: "Not found" });
          }
          await  galleries.$query().delete();
          await Gallery.query()
              .insert(galleryParams)
              .returning("*");
        req.flash("success", {
          message: "Property has been updated successfully.",
        });
        return res.redirect(`/directories/${property.id}`);
      }
      const form = {
        id,
        ...params,
      };
      const categories = await Category.query().modify("actives");
      req.flash("error", { message: "Create Failure" });
      res.render("directories/edit", {
        title: "Edit Directory",
        form: form || {},
        errors: errorsMessage,
        categories,
        galleries: property.galleries,
      });
    } catch (error) {
      console.log({ error });
    }
  };
  destroy = async (req, res) => {
    const property = await Property.query().findById(req.params.id);

    if (property) {
      await Property.query().deleteById(property.id);
      req.flash("success", {
        message: "Property has been deleted successfully.",
      });
    } else {
      req.flash("error", { message: "Delete Fail" });
    }

    res.redirect("/directories");
  };

  approve = async (req, res) => {
    const property = await Property.query().findById(req.params.id);
    if (property) {
      await property.$query().patch({
        status: "approved",
      });
      req.flash("success", { message: "Property has been approved successfully" });

      res.redirect(`/directories/${property.id}`);
    }
    req.flash("success", {
      message: "Property has been approved successfully",
    });
    req.flash("error", { message: "Property not found" });
    res.redirect(`/directories`);
  };

  reject = async (req, res) => {
    const property = await Property.query().findById(req.params.id);
    if (property) {
      await property.$query().patch({
        status: "rejected",
      });
      req.flash("success", { message: "Property has been rejected successfully" });
      return res.redirect(`/directories/${property.id}`);
    }

    req.flash("error", { message: "Property not found" });
    res.redirect(`/directories`);
  };
}
export default new PropertiesController();

import { validationResult } from 'express-validator';
import helper, { groupBy } from "../helper/utils";
import { errorSerialize } from '../validators/user';
import Feature from '../models/Feature';
import Property from '../models/Property';



class FeaturesController {

  index = async (req, res) => {
    const {page, perPage} = helper.paging(req);
    const{name, status} = req.query;
    const  params = {name, status};
    const features = await Feature.list(params, page, perPage);
    const pagination = helper.pagination(features.total, perPage, page);
    res.render("features/index", {
      title: 'Features',
      features,
      params,
      pagination,
    });
  }

  new = async (req, res) => {
    const properties = await Property.query();
    const form = {
      type: '',
      property_id: null,
      name : "",
      style: 'list'
    }
    res.render("features/new", {
      title: 'New Feature',
      action: '/features',
      form,
      properties,
      errors: {},
    });
  }
  
  show = async (req, res) => {
    const {id} = req.params;
    const {page, perPage} = helper.paging(req);
    try {
      const feature = await Feature.query().findById(id).withGraphFetched("properties");
      const properties = await Property.query().joinRelated("features").where("features.id", id).page(page, perPage).distinctOn("properties.id");
      const pagination = helper.pagination(properties.total, perPage, page);
      if(!feature) {
        req.flash("error", { message: "Feature not found" });
        return res.redirect("/features");
      }
      res.render("features/show", {
        title: 'Feature Detail',
        feature,
        properties,
        pagination
      });

    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/features");
    }
  }

  edit = async (req, res) => {
    const {id} = req.params;
    const feature = await Feature.query().findById(id);
    const form = {
      id: feature.id,
      name: feature.name,
      status: feature.status,
      style: feature.style,
    }
    res.render("features/edit", {
      title: 'Edit Feature',
      action: `/features/${id}`,
      form,
      errors: {},
    });
  }

  update = async (req, res) => {
    const {id} = req.params;
    const params = req.body.feature;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      if(!result.errors.length) {
        const {name, status, style} = params;
        const updateParams = {name, status, style};
        await Feature.query().findById(id).patch(updateParams);
        req.flash("success", { message: "Update Feature Success!"});
        return res.redirect("/features");
      }
      res.render("features/edit", {
        title: 'Edit Feature',
        form: params,
        errors: errorsMessage,
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/features");
    }
  }
  

  create = async (req, res) => {
     const params = req.body.feature;
     const result = validationResult(req);
      const errors = groupBy(result.errors, "param");
      const errorsMessage = errorSerialize(errors);
     try {
      if(!result.errors.length) {
        const {name, status, style} = params;
        const feature = await Feature.query()
        const length = feature.length;
        const createParams = {name , status, style, order: length + 1};
        await Feature.query().insert(createParams);
        req.flash("success", { message: "Create Feature Success!"});
        return res.redirect("/features");
      }
      res.render("features/new", {
        title: 'New Feature',
        form: params,
        errors: errorsMessage,
      });
      
     } catch (error) {
      console.log(error.message);
        req.flash("error", { message: "Something went wrong" });
        res.redirect("/features");
     }
  }

  destroy = async (req, res) => {
    const {id} = req.params;
    try {
      const feature = await Feature.query().findById(id);
      if(!feature) {
        req.flash("error", { message: "Feature not found" });
        return res.redirect("/features");
      }
      await feature.$query().delete();
      req.flash("success", { message: "Delete Feature Success!" });
      res.redirect("/features");
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/features");
    }
  }
}

export default new FeaturesController();
import { validationResult } from "express-validator";
import helper, { groupBy } from "../helper/utils";
import { errorSerialize } from "../validators/banner";
import Banners from "../models/Banner";
import sharp from "sharp";
class BannersController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const { name, code, status } = req.query;
    const params = { name, code, status };
    const banners = await Banners.list(params, page, perPage);
    const pagination = helper.pagination(banners.total, perPage, page);
    res.render("banners/index", {
      title: "Banners",
      banners,
      pagination,
      params,
    });
  };
  new = async (req, res) => {
    const form = {
      name: "",
      status: "",
      image: "",
    };

    res.render("banners/new", {
      title: "New Banner",
      action: "/banners",
      form,
      errors: {},
    });
  };
  create = async (req, res) => {
    try {
      const params = req.body.banner;
      const result = validationResult(req);
      const errors = groupBy(result.errors, "param");
      const errorsMessage = errorSerialize(errors);
      if (!req.file) {
        errorsMessage.image = "is required";
      }
      if (!result.errors.length && req.file) {
        const { name, status, link } = params;
        const image = req.file.key || req.file.filename;
        const createParams = { name, status, image, link };
        const banner = await Banners.query().insert(createParams).returning("*");
        req.flash("success", { message: "Create Banner Success!" });
        res.redirect(`/banners/${banner.id}`);
        return
      }
      res.render("banners/new", {
        title: "New Banner",
        action: "/banners",
        form: params,
        errors: errorsMessage,
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/banners");
    }
  };
  show = async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banners.query().findById(id);
      res.render("banners/show", {
        title: "Show Banner",
        banner,
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/banners");
    }
  };
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banners.query().deleteById(id);
      req.flash("success", { message: "Delete Banner Success!" });
      res.redirect("/banners");
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/banners");
    }
  };
  edit = async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await Banners.query().findById(id);

      res.render("banners/edit", {
        title: "Edit Banner",
        action: `/banners/${id}`,
        form: banner,
        errors: {},
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/banners");
    }
  };
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const params = req.body.banner;
      const result = validationResult(req);
      const errors = groupBy(result.errors, "param");
      const errorsMessage = errorSerialize(errors);
      if (!result.errors.length) {
        const { name, status, link } = params;
        const image = req.file ? req.file.key || req.file.filename : "";
        const updateParams = { name, status, link };
        if (image) {
          updateParams.image = image;
        }
        const banner = await Banners.query().findById(id).patch(updateParams).returning("*");
        req.flash("success", { message: "Update Banner Success!" });
        res.redirect(`/banners/${banner.id}`);
        return
      }
      res.render("banners/edit", {
        title: "Edit Banner",
        action: `/banners/${id}`,
        form: params,
        errors: errorsMessage,
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/banners");
    }
  };
}

export default new BannersController();

import Category from "../models/Category";
import helper, { groupBy } from "../helper/utils";
import { validationResult } from "express-validator";
import { errorSerialize } from "../validators/category";

class CategoryController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const { name, code, status } = req.query;
    const params = { name, code, status };
    const categories = await Category.list(params, page, perPage);
    const pagination = helper.pagination(categories.total, perPage, page);
    res.render("categories/index", {
      title: "Category List",
      params,
      categories,
      pagination,
    });
  };

  show = async (req, res) => {
    const category = await Category.query().findById(req.params.id);
    res.render("categories/show", {
      title: "Category Detail",
      category,
    });
  };

  new = async (req, res) => {
    const form = {
      name: "",
      code: "",
      status: "",
    };
    res.render("categories/new", {
      title: "New Category",
      form,
      errors: {},
    });
  };

  create = async (req, res) => {
    const params = req.body.category;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    if (!result.errors.length) {
      const { name, code, status } = params;
      const image = req.file.key || req.file.filename;
      await Category.query().insert({
        name,
        code,
        status,
        image,
      });

      req.flash("success", {
        message: "Category has been created successfully.",
      });
      return res.redirect("/categories");
    }
    req.flash("error", { message: "Create Failure" });
    res.render("categories/new", {
      title: "New Category",
      form: params || {},
      errors: errorsMessage,
    });
  };

  edit = async (req, res) => {
    const { id } = req.params;
    const category = await Category.query().findById(id);
    const form = {
      id: category.id,
      name: category.name,
      code: category.code,
      status: category.status,
      image: category.imageUrl,
    };
    res.render("categories/edit", {
      title: "Edit Category",
      form,
      errors: {},
    });
  };

  update = async (req, res) => {
    const { id } = req.params;
    const params = req.body.category;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    if (!result.errors.length) {
      const { name, code, status } = params;
      const image = req?.file?.key || req?.file?.filename;
      const category = await Category.query().findById(id);
      const categoryParams = {
        name,
        code,
        status,
        updated_at: new Date(),
      };
      if (image) {
        categoryParams.image = image;
      }
      await category.$query().patch(categoryParams);
      req.flash("success", {
        message: "Category has been updated successfully.",
      });
      return res.redirect("/categories");
    }
    const form = {
      id,
      ...params,
    };
    req.flash("error", { message: "Create Failure" });
    res.render("categories/edit", {
      title: "Edit category",
      form: form || {},
      errors: errorsMessage,
    });
  };

  destroy = async (req, res) => {
    const category = await Category.query().findById(req.params.id);

    if (category) {
      await Category.query().deleteById(category.id);
      req.flash("success", {
        message: "Category has been deleted successfully.",
      });
    } else {
      req.flash("error", { message: "Delete Fail" });
    }

    res.redirect("/categories");
  };
}
export default new CategoryController();

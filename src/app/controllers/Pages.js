import helper, { groupBy } from "../helper/utils";
import Page from "../models/Page";
import { validationResult } from "express-validator";
import { errorSerialize } from "../validators/page";


class PageTermController {
  
  index = async (req, res) => {
    try {
      const { page, perPage } = helper.paging(req);
      const { title, code } = req.query;
      const params = { title, code };
      const pages = await Page.query().page(page, perPage).modify("searchFilter", params);
      const pagination = helper.pagination(pages.total, perPage, page);
      res.render("pages/index", {
        title: "Page",
        pages,
        params,
        pagination
      });
    } catch (error) {
      req.flash("error", { message: "Something went wrong" });
    }
  
  }

  new = async (req, res) => {
    const form = {
      id: "",
      title: "",
      content: "",
      status: "",
    };
    res.render("pages/new", {
      title: "Create Page",
      action: "/pages",
      form: form,
      errors: {},
    });
  }
  create = async (req, res) => {
    const params = req.body.page;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
      try {
        if (!result.errors.length) {
          const { title, content, code } = params;
        const page = await Page.query().insert({
          title,
          content,
          code,
        });
        req.flash("success", { message: "Page created successfully" });
        res.redirect("/pages");
      }
        req.flash("error", { message: "Page create not Successfully" });
        res.render("pages/new", {
          title: "Create Page",
          action: "/pages",
          form: params || {},
          errors: errorsMessage,
        });
      } catch (error) {
        console.log(error.message);
        req.flash("error", { message: "Something went wrong" });
        res.redirect("/pages");
      }
  }
  destroy = async (req, res) => {
     try {
      const { id } = req.params;
      const page = await Page.query().findById(id);
      if (!page) {
        req.flash("error", { message: "Page not found" });
        res.redirect("/pages");
      }
      await page.$query().delete();
      req.flash("success", { message: "Page deleted successfully" });
      res.redirect("/pages");
     } catch (error) {
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/pages");
     }
  }
  edit = async (req, res) => {
      try {
        const { id } = req.params;
        const page = await Page.query().findById(id);
        if (!page) {
          req.flash("error", { message: "Page not found" });
          res.redirect("/pages");
        }
        const form = {
          id: page.id,
          title: page.title,
          content: page.content,
          code: page.code,
        };
        res.render("pages/edit", {
          title: "Edit Page",
          action: `/pages/${id}`,
          form: form,
          errors: {},
        });
      } catch (error) {
        
      }
  }
  update = async (req, res) => {
    const { id } = req.params;
    const params = req.body.page;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
      try {
        if (!result.errors.length) {
          const { title, content, code } = params;
          const updataParam = { title, content, code };
          const page = await Page.query().findById(id);
          if (!page) {
            req.flash("error", { message: "Page not found" });
            res.redirect("/pages");
          }
          await page.$query().patch(updataParam);
          req.flash("success", { message: "Page updated successfully" });
          res.redirect("/pages");
        }
        req.flash("error", { message: "Page update not Successfully" });
        res.render("pages/edit", {
          title: "Edit Page",
          action: `/pages/${id}`,
          form: params || {},
          errors: errorsMessage,
        });
      } catch (error) {
        req.flash("error", { message: "Something went wrong" });
        res.redirect("/pages");
      }
  }
}


export default new PageTermController();
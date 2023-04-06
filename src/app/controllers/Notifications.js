import Notification from "../models/Notification";
import helper, { groupBy } from "../helper/utils";
import notification, { errorSerialize } from "../validators/notification";
import { validationResult } from "express-validator";





class NotificationController {

  index = async (req, res) => {
    try {
      const { page, perPage } = helper.paging(req);
      const {title} = req.query;
      const params = {title};
      const notifications = await Notification.list(params, page, perPage);
      const pagination = helper.pagination(notifications.total, perPage, page);
      res.render("notifications/index", {
        title: "Notifications",
        notifications,
        pagination,
        params,
      });
    } catch (error) {
      return res.render("500", { message: error.message });
    }
  
  };

  new  = async (req, res) => {
    try {
      const form = {
        title: "",
        content: "",
        image: "",
        type: "",
        link: "",
        status: "",
        publish_at: "",
      };
      res.render("notifications/new", {
        title: "New Notification",
        action: "/notifications",
        form,
        errors: {},
      });
    } catch (error) {
      return res.render("500", { message: error.message });
    }
  }

  create = async (req, res) => {
    const params = req.body.notification;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      if (!result.errors.length) {
      const { title, content, status, publish_at, link } = params;
      const url = req.file ? req?.file?.key || req?.file?.filename : "";
      const createParams = {
        title: title,
        content: content,
        image: url,
        status: status,
        publish_date: publish_at,
        link: link,
      };
      await Notification.query().insert(createParams);
      req.flash("success", { message: "Notification created successfully" });
      return res.redirect("/notifications");
    }
    req.flash("error", { message: "Notification created failed" });
    return res.render("notifications/new", {
      title: "New Notification",
      action: "/notifications",
      form: params || {},
      errors: errorsMessage,
    });
    } catch (error) {
      console.log(error)
      return res.render("500", { message: error.message });
    }
  
  }

  edit = async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.query().findById(id);
    try {
      const form = {
        id: notification.id,
        title: notification.title,
        content: notification.content,
        image: notification.imageUrl,
        status: notification.status,
        publish_at: notification.publish_date,
        link: notification.link,
      };
      res.render("notifications/edit", {
        title: "Edit Notification",
        action: `/notifications/${id}`,
        form,
        errors: {},
      });
    } catch (error) {
      return res.render("500", { message: error.message });
    }

  }

  update = async (req, res) => {
    const {id} =  req.params;
    const params = req.body.notification;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      if(!result.errors.length){
        const { title, content, status, publish_at, link } = params;
        const url = req.file ? req?.file?.key || req?.file?.filename : "";
        const updateParams = {
          title: title,
          content: content,
          status: status,
          publish_date: publish_at,
          link: link,
        };
        if (url) {
          updateParams.image = url;
        }
        await Notification.query().patchAndFetchById(id, updateParams);
        req.flash("success", { message: "Notification updated successfully" });
        return res.redirect("/notifications");
      }
      req.flash("error", { message: "Notification updated failed" });
      return res.render("notifications/edit", {
        title: "Edit Notification",
        action: `/notifications/${id}`,
        form: params || {},
        errors: errorsMessage,
      });
    } catch (error) {
      return res.render("500", { message: error.message });
    }
  }

  show = async (req, res) => {
    const {id} = req.params;
    try {
      const notification = await Notification.query().findById(id);
      if(!notification){
        req.flash("error", { message: "Notification not found" });
        return res.redirect("/notifications");
      }
      res.render("notifications/show", {
        title: "Show Notification",
        notification,
      })
    } catch (error) {
        return res.render("500", { message: error.message });     
    }
  
  }

  destroy = async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await Notification.query().findById(id);
      if (!notification) {
        req.flash("error", { message: "Notification not found" });
        return res.redirect("/notifications");
      }
      await notification.$query().delete();
      req.flash("success", { message: "Notification deleted successfully" });
      return res.redirect("/notifications");
    } catch (error) {
      return res.render("500", { message: error.message });
    }
  
  }

}

export default new NotificationController();

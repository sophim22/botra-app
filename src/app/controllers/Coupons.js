import Coupon from "../models/Coupon";
import Property from "../models/Property";
import helper, { groupBy } from "../helper/utils";
import { validationResult } from "express-validator";
import { errorSerialize } from "../validators/coupon";

class CouponsController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const { code, status, property_id } = req.query;
    const params = { code, status, property_id };
    const coupons = await Coupon.list(params, page, perPage);
    const properties = await Property.query();
    const pagination = helper.pagination(coupons.total, perPage, page);

    res.render("coupons/index", {
      title: "Coupon List",
      coupons,
      params,
      pagination,
      properties,
    })
  };
  new = async (req, res) => {
    const properties = await Property.query();
    const form = {
      code: "",
      status: "",
      amount: null,
      discount_type: "",
      property_id: null,
      started_at: "",
      ended_at: "",
    }

    res.render("coupons/new", {
      title: "New Coupon",
      form,
      properties,
      errors: {},
    });
  }
  create = async (req, res) => {
    const params = req.body.coupons;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    const properties = await Property.query();
    if (!result.errors.length) {
      const { name, status, property_id, amount, discount_type, started_at, ended_at, code } = params;
      await Coupon.query().insert({
        code,
        name,
        status,
        amount,
        property_id,
        discount_type,
        started_at,
        ended_at,
      });

      req.flash("success", {
        message: "Coupon has been create successfully."
      });
      return res.redirect("/coupons");
    }
    req.flash("error", { message: "Create Failure" });
    res.render("coupons/new", {
      title: "New Coupon",
      form: params || {},
      errors: errorsMessage,
      properties,
    });
  };

  show = async (req, res) => {
    const coupon = await Coupon.query().findById(req.params.id);
    const {property_id} = coupon;
    const property = await Property.query().where('id', '=', `${property_id}`);
    res.render("coupons/show", {
      title: "Coupon Detail",
      coupon,
      property,
    });
  };

  edit = async (req, res) => {
    const { id } = req.params
    const properties = await Property.query();
    const coupon = await Coupon.query().findById(id);
    const form = {
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      status: coupon.status,
      amount: coupon.amount,
      property_id: coupon.property_id,
      discount_type: coupon.discount_type,
      started_at: coupon.started_at,
      ended_at: coupon.ended_at,
    };
    res.render("coupons/edit", {
      title: "Edit Coupon",
      form,
      errors: {},
      properties,
    });
  };

  update = async (req, res) => {
    const { id } = req.params
    const params = req.body.coupons;
    const result = validationResult(req);
    const properties = await Property.query();
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    const coupon = await Coupon.query().findById(id);
    if (!result.errors.length) {
      const { name, status, property_id, amount, discount_type, started_at, ended_at } = params;

      await coupon.$query().patch({
        name,
        status,
        property_id,
        amount,
        discount_type,
        started_at,
        ended_at,
      });
      req.flash("success", {
        message: "Coupon has been updated successfully.",
      });
      return res.redirect("/coupons");
    }
    const form = {
      id,
      code: coupon.code,
      ...params,
    }
    req.flash("error", {
      message: "Update Failure"
    });
    res.render("coupons/edit", {
      title: "Edit Coupon",
      form: form || {},
      errors: errorsMessage,
      properties,
    });
  }

  destroy = async (req, res) => {
    const coupon = await Coupon.query().findById(req.params.id);

    if (coupon) {
      await Coupon.query().deleteById(coupon.id);
      req.flash("success", {
        message: "Coupon has been deleted successfully.",
      });
    } else {
      req.flash("error", { message: "Opp, sorry. Coupon seem not exist or deleted." });
    }
    res.redirect("/coupons");
  };
}
export default new CouponsController();

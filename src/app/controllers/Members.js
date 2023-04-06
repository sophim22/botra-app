import { validationResult } from 'express-validator';
import Admin from '../models/Admin';
import { errorSerialize } from '../validators/admin';
import helper, { groupBy } from "../helper/utils";

class MembersController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    const { email } = req.query;
    const params = { email };
    const members = await Admin.list(params, page, perPage);
    const pagination = helper.pagination(members.total, perPage, page);

    res.render("members/index", {
      title: "Member List",
      members,
      params,
      pagination,
    });
  };

  show = async (req, res) => {
    member = await Admin.query().findById(req.params.id);
    res.render("members/show", {
      title: "Member Detail",
      member,
    });
  };

  new = async (req, res) => {
    const form = {
      email: "",
      password: "",
    };
    res.render("members/new", {
      title: "New Member",
      form,
      errors: {}
    });
  };

  create = async (req, res) => {
    const params = req.body.member;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    if (!result.errors.length) {
      const { password, email } = params;
      const hash = await Admin.generatePassword(password);
      await Admin.query().insert({
        email,
        password: hash,
      });

      req.flash("success", {
        message: "Member has been created successfully.",
      });
      return res.redirect("/members");
    }
    req.flash("error", { message: "Create Failure" });
    res.render("members/new", {
      title: "New Member",
      form: params || {},
      errors: errorsMessage,
    });
  };

  edit = async (req, res) => {
    const { id } = req.params;
    const member = await Admin.query().findById(id);
    const form = {
      id: member.id,
      email: member.email,
    };
    res.render("members/edit", {
      title: "Edit Member",
      form,
      errors: {},
    });
  };

  update = async (req, res) => {
    const { id } = req.params;
    const params = req.body.member;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    if (!result.errors.length) {
      const { password, email } = params;
      const member = await Admin.query().findById(id);
      const hash = await Admin.generatePassword(password);

      await member.$query().patch({
        email,
        password: hash,
        updated_at: new Date(),
      });
      req.flash("success", {
        message: "Member has been updated successfully.",
      });
      return res.redirect("/members");
    }
    const form = {
      id,
      ...params,
    };
    req.flash("error", { message: "Create Failure" });
    res.render("members/edit", {
      title: "Edit Member",
      form: form || {},
      errors: errorsMessage,
    });
  };

  destroy = async (req, res) => {
    const member = await Admin.query().findById(req.params.id);

    if (member) {
      await Admin.query().deleteById(member.id);
      req.flash("success", {
        message: "Member has been deleted successfully.",
      });
    } else {
      req.flash("error", { message: "Delete Fail" });
    }

    res.redirect("/members");
  };
}
export default new MembersController();

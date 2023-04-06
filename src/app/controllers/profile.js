import Admin from "../models/Admin";
import { param, validationResult } from "express-validator";
import helper, { groupBy } from "../helper/utils";
import { errorSerialize } from "../validators/profile";
import bcrypt from "bcrypt";


class ProfileController {
  edit = async (req, res) => {
    const {id} = req.params;
    try {
      const admin = await Admin.query().findById(id);
      const form = {
        id : admin.id,
        username: admin.username,
        email: admin.email,
      };
        res.render("profiles/edit", {
          title: "Edit Admin",
          action: `/admin/${id}/update_profile`,
          action_pass: `/admin/${id}/update_password`,
          form :form 
        });
    } catch (error) {
      req.flash("error", { message: error.message });
      res.redirect("/");
    }
  };
  updateProfile = async (req, res) => {
    const params = req.body.profile;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const {id} = req.params;
    const errorsMessage = errorSerialize(errors);
    try {
      if (!result.errors.length) {
        const {username, email} = params;
        const updateParams = {
          username: username,
          email: email,
        };
        await Admin.query().findById(id).patch(updateParams);
        req.flash("success", { message: "Update Admin Success!" });
        return res.redirect("/");
      }
      req.flash("error", { message: "Update Admin Not Success!" });
      res.render ("profiles/edit", {
        title: "Edit Admin",
        action: `/admin/${id}/update_profile`,
        form: params || {},
        errors: errorsMessage,
      });
    } catch (error) {
      req.flash("error", { message: error.message });
      res.redirect("/");
    }
  };
  updatePassword = async (req, res) => {
    const param = req.body.profile;
    const {id} = req.params;
    const {password, old_password} = param;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      if(!result.errors.length){
        const account  = await Admin.query().findById(id);
        const checkPassword = await bcrypt.compareSync(old_password, account.password);
        if(!checkPassword){
          req.flash("error", { message: "Old Password Not Correct!" });
          return res.redirect("/");
        }
        const hashPassword = await Admin.generatePassword(password);
        const updateParams = {
          password: hashPassword,
        };
        await Admin.query().findById(id).patch(updateParams);
        req.flash("success", { message: "Update Admin Success!" });
        return res.redirect("/");
      }
      req.flash("error", { message: "Update Admin Not Success!" });
      res.render ("profiles/edit", {
        title: "Edit Admin",
        action: `/admin/${id}/update_password`,
        form: param || {},
        errors: errorsMessage,
      });
    } catch (error) {
      req.flash("error", { message: error.message });
      res.redirect("/");
      
    }
  }
}

export default new ProfileController();
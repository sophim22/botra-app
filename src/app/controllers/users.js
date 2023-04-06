import { validationResult } from "express-validator";
import helper, { groupBy } from "../helper/utils";
import user, { errorSerialize } from "../validators/user";
import User from "../../app/models/User";
import Favorite from "../../app/models/Favorite";
import Property from "../models/Property";

class UsersController {
  index = async (req, res) => {
    try {
      const { page, perPage } = helper.paging(req);
      const { email, username, phone } = req.query;
      const params = { email, username, phone };
      const users = await User.list(params, page, perPage);
      const pagination = helper.pagination(users.total, perPage, page);
      res.render("users/index", {
        title: "User",
        users,
        pagination,
        params,
      });
    } catch (error) {
      console.log(error.message);
      req.flash("error", { message: "Something went wrong" });
      res.redirect("/users");
    }
  };
  new = async (req, res) => {
    const form = {
      id: "",
      email: "",
      name: "",
      password: "",
      dob: "",
      src: "",
      status: "",
      phone: "",
      provider: "phone",
      is_verify: false,
      country_code: "kh",
    };
    res.render("users/new", {
      title: "Create User",
      action: "/users",
      form: form,
      errors: {},
    });
  };
  create = async (req, res) => {
    const params = req.body.user;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      if (!result.errors.length) {
        const { username, email, password, phone, dob, status, country_code } = params;
        const isPhoneValid = helper.isPhoneValid(phone, country_code);
        if (!isPhoneValid) {
          errorsMessage.phone = "phone is invalid";
          return res.render("users/new", {
            title: "Create User",
            action: "/users",
            method: "POST",
            form: params || {},
            errors: errorsMessage,
          });
        }
        const phoneNumber = helper.formatPhoneNumber(phone, country_code);

        const url = req.file ? req?.file?.key || req?.file?.filename : "";
        const hashPassword = await User.generatePassword(password);
        const createParams = {
          username: username,
          email: email,
          password: hashPassword,
          phone: phoneNumber,
          status: status,
          profile: url,
          provider: "phone",
          uid: phoneNumber,
          is_verify: params.is_verify === "on",
        };
        if (dob) {
          createParams.dob = dob;
        }
        const user = await User.query().insert(createParams);
        req.flash("success", { message: "Create User Success!" });
        return res.redirect("/users");
      }
      req.flash("error", { message: "Create User Failed!" });
      return res.render("users/new", {
        title: "Create User",
        action: "/users",
        method: "POST",
        form: params || {},
        errors: errorsMessage,
      });
    } catch (error) {
      console.log(error);
      req.flash("error", { message: "Create User Failed!" });
      res.redirect("/users");
    }
  };
  show = async (req, res) => {
    try {
      const { id } = req.params;
      const { page, perPage } = helper.paging(req);
      const user = await User.query().findById(id);
      const properties = await Property.query()
        .where({ user_id: user.id })
        .orderBy("created_at", "desc")
        .page(page, perPage);
      const pagination = helper.pagination(properties.total, perPage, page);
      const favorites = await Favorite.query()
        .withGraphFetched("property")
        .where({ user_id: user.id })
        .page(page, perPage);
      const paginationFavorites = helper.pagination(favorites.total, perPage, page);
      res.render("users/show", {
        title: "User Detail",
        user,
        favorites,
        paginationFavorites,
        properties,
        pagination,
      });
    } catch (error) {
      req.flash("error", { message: "User not found!" });
      res.redirect("/users");
    }
  };
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.query().findById(id);
      if (!user) {
        req.flash("error", { message: "User not found!" });
        return res.redirect("/users");
      }
      await User.query().deleteById(user.id);
      req.flash("success", { message: "Delete User Success!" });
      return res.redirect("/users");
    } catch (error) {
      req.flash("error", { message: "Delete User Failed!" });
      res.redirect("/users");
    }
  };
  edit = async (req, res) => {
    const { id } = req.params;
    const user = await User.query().findById(id);
    const { countryCode } = helper.getCountryCode(user.phone);
    const phone = helper.displayPhoneNumber(user.phone, countryCode);

    const form = {
      id: user.id,
      email: user.email,
      username: user.username,
      src: user.profileUrl,
      phone: phone,
      status: user.status,
      dob: user.dob,
      is_verify: user.is_verify,
      country_code: countryCode,
      provider: user.provider,
    };
    res.render("users/edit", {
      title: "Edit User",
      action: `/users/${id}`,
      form: form,
      errors: {},
    });
  };

  update = async (req, res) => {
    const params = req.body.user;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    try {
      const { id } = req.params;
      const user = await User.query().findById(id);
      if (!result.errors.length) {
        const { username, email, dob, role, status, phone, country_code } = params;
        let phoneNumber = phone;
        if (phone) {
          const isPhoneValid = helper.isPhoneValid(phone, country_code);

          if (!isPhoneValid) {
            errorsMessage.phone = "phone is invalid";
            return res.render("users/edit", {
              title: "Edit User",
              action: `/users/${id}`,
              form: { ...params, src: user.profileUrl },
              errors: errorsMessage,
            });
          }
          phoneNumber = helper.formatPhoneNumber(phone, country_code);
        }

        const url = req.file ? req?.file?.key || req?.file?.filename : "";
        const updateParams = {
          username,
          phone: phoneNumber,
          email,
          role,
          status,
          updated_at: new Date(),
          is_verify: params.is_verify === "on",
        };
        if (dob) {
          updateParams.dob = dob;
        }
        if (url) {
          updateParams.profile = url;
        }
        await User.query().findById(id).patch(updateParams);
        req.flash("success", { message: "Update User Success!" });
        return res.redirect("/users");
      }
      req.flash("error", { message: "Update User Failed!" });

      const form = {
        id: params.id,
        email: params.email,
        username: params.username,
        src: params.profileUrl,
        phone: params.phone,
        status: params.status,
        dob: params.dob,
        provider: params.provider,
        country_code: params.country_code,
      };
      return res.render("users/edit", {
        title: "Edit User",
        action: `/users/${id}`,
        form: form,
        errors: errorsMessage,
      });
    } catch (error) {
      console.log(error);
      req.flash("error", { message: "Update User Failed!" });
      res.redirect("/users");
    }
  };
}

export default new UsersController();

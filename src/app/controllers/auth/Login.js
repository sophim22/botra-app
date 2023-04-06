import { clearSession, storeLoginSession } from '../../helper/utils';
import Admin from '../../models/Admin';

class LoginController {
  index = async (req, res) => {
    console.log("index");
    res.render("auth/login", {
      title: "Login",
    });
  };

  create = async (req, res) => {
    const params = req.parameters;
    let values = {};
    const error = "Invalid Email Or Password";
    try {
      values = params.require("auth").all();
      const { email, password } = values;
      const account = await Admin.query().whereRaw(`email = ?`, email).first();
      if (account) {
        const isValid = await account.validPassword(password);
        if (isValid) {
          storeLoginSession(res, account, true, false);
          req.flash("success", { message: "Login success!" });
          return res.redirect("/");
        }
      }
      req.flash("error", { message: error });
      res.render("auth/login", {
        title: "Login",
      });
    } catch (e) {
      req.flash("error", { message: error });
      return res.render("auth/login", {
        title: "Login",
      });
    }
  };

  destroy = async (req, res) => {
    clearSession(req, res);
    req.flash("info", { message: "Logout Success" });
    res.redirect("/auth/login");
  };
}

export default new LoginController();

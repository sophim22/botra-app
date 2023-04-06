import { generateAuthToken } from "../../helper/utils";
import { sendResetInstruction } from "../../mailer/reset_password";
import Admin from "../../models/Admin";

class ForgetPasswordController {
  index = async (req, res) => {
    res.render("auth/forget_password", {
      title: 'forget Password',
    });
  };

  create = async (req, res) => {
    const params = req.body.auth;
    if (!params.email) {
      req.flash("error", { message: 'Email is required!' });
      return this.index(req, res);
    }
    let admin = await Admin.query()
      .where({ email: params.email })
      .first();
    if (admin) {
      const token = generateAuthToken();
      admin = await admin.$query().patch({
        reset_password_token: token,
        reset_password_sent_at: new Date(),
      }).returning('*');

      sendResetInstruction(admin);
      req.flash("success", {
        message: "Please check your email for reset instruction",
      });
      return res.redirect("/auth/login");
    }
    req.flash("error", { message: "Email is invalid" });
    return this.index(req, res);
  }
}
export default new ForgetPasswordController();

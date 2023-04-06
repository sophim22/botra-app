import { differenceInHours } from "date-fns";
import Admin from "../../models/Admin";

class ResetPasswordController {
  index = async (req, res) => {
    const { token } = req.params;
    const admin = await Admin.query()
      .where({ reset_password_token: token })
      .whereNotNull("reset_password_sent_at")
      .first();
    let tokenExpired = false;
    if (admin) {
      const timeDiff = differenceInHours(
        new Date(),
        new Date(admin.reset_password_sent_at)
      );
      tokenExpired = timeDiff > 1;
    }
    if (!admin || tokenExpired) {
      req.flash("error", { message: "Token is invalid or expired" });
      return res.redirect("/auth/login");
    }

    res.render("auth/reset_password", {
      title: "Reset Password",
      resetToken: token,
    });
  };

  update = async (req, res) => {
    const params = req.parameters;
    const { token } = req.body;
    let values = {};
    try {
      values = params.require("auth").all();
    } catch (e) {
      req.flash("error", { message: "Password is required" });
      return res.redirect(`/auth/reset_password/${token}`);
    }
    const user = await Admin.query()
      .where({ reset_password_token: token })
      .whereNotNull("reset_password_sent_at")
      .first();

    const timeDiff = differenceInHours(
      new Date(),
      new Date(user.reset_password_sent_at)
    );
    if (timeDiff > 1) {
      req.flash("error", { message: "Token is invalid or expired" });
      return res.redirect("/auth/login");
    }
    if (values.password !== values.password_confirmation) {
      req.flash("error", { message: "Password not match" });
      return res.redirect(`/auth/reset_password/${token}`);
    }
    if (values.password.length < 6) {
      req.flash("error", {
        message: "Password should be at least 6 chars long",
      });
      return res.redirect(`/auth/reset_password/${token}`);
    }
    try {
      await user.resetPassword(values.password);
      req.flash("success", {
        message: "Your password has been successfully changed",
      });
      res.redirect("/auth/login");
    } catch (err) {
      req.flash("error", { message: err.message });
      return res.redirect(`/auth/reset_password/${token}`);
    }
  };
}
export default new ResetPasswordController();
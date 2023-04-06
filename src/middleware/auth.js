import redis from "../config/redis";
import { clearSession } from "../app/helper/utils";

const authToken = async cookie => {
  const token = await redis.get(`session:${cookie}`);
  return token;
};
export default async (req, res, next) => {
  const cookie = req.cookies["__property_list_store_auth__"];
  if (cookie) {
    const token = await authToken(cookie);
    if (token) {
      const user = JSON.parse(token);
      res.locals.isSignIn = true;
      res.locals.currentUser = user;
      if (user.allowPasswordChange) {
        res.locals.hideSideMenu = true;
        if (req.path !== "/change_credential")
          return res.redirect("/auth/change_credential");
      } else {
        if (req.path === "/change_credential") {
          return res.redirect("/");
        }
      }

      return next();
    } else {
      // clearSession(req, res);
    }
  }
  res.redirect("/auth/login");
};

export const authSession = async (req, res, next) => {
  const cookie = req.cookies["__property_list_store_auth__"];
  if (cookie && (await authToken(cookie))) {
    return res.redirect("/");
  }
  next();
};
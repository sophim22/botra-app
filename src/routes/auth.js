import express from 'express';
import Login from "../app/controllers/auth/Login";
import ResetPassword from "../app/controllers/auth/ResetPassword";
import ForgetPassword from "../app/controllers/auth/ForgetPassword";
import viewParser from '../middleware/view';
import auth, { authSession } from '../middleware/auth';

const authRouter = express.Router();

authRouter.route("/login").post(authSession, Login.create);
authRouter.route("/logout").delete(auth, Login.destroy);
authRouter
  .route("/login")
  .get(authSession, viewParser("login", "index"), Login.index);
authRouter
  .route("/forget_password")
  .get(authSession, viewParser("forget_password", "index"), ForgetPassword.index);
authRouter
  .route("/forget_password")
  .post(
    authSession,
    viewParser("forget_password", "create"),
    ForgetPassword.create
  );
authRouter
  .route("/reset_password")
  .post(
    authSession,
    viewParser("reset_password", "resets"),
    ResetPassword.update
  );
authRouter
  .route("/reset_password/:token")
  .get(
    authSession,
    viewParser("reset_password", "resets"),
    ResetPassword.index
  );

export default authRouter;
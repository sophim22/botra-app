import express from "express";
import authMiddleware from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/auth";
import * as passwords from "~/app/controllers/api/v1/passwords";

require("express-async-errors");

const authRouter = express.Router();

authRouter.route("/").post(controller.session);
authRouter.route("/register").post(controller.register);
authRouter.route("/facebook").post(controller.facebook);
authRouter.route("/google").post(controller.google);
authRouter.route("/apple").post(controller.apple);
authRouter.delete("/logout", authMiddleware, controller.logout);
authRouter.route("/passwords").post(passwords.requestReset);
authRouter.route("/passwords").put(passwords.resetPassword);
authRouter.route("/passwords/code").post(passwords.requestCode);

export default authRouter;

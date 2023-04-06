import express from "express";
import authMiddleware from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/users";
import uploader from '~/config/uploader';
import { changePassword, updateProfile } from "~/app/validators/api/users";

require("express-async-errors");

const userRouter = express.Router();

userRouter.route("/").get(authMiddleware, controller.profile);
userRouter.route('/').put(authMiddleware, uploader.single('profile'), updateProfile, controller.updateProfile);
userRouter.route("/devices").post(authMiddleware, controller.deviceToken);
userRouter.route("/passwords").post(authMiddleware, changePassword, controller.changePassword);
userRouter.route('/property').get(authMiddleware, controller.property);
userRouter.route('/facebook/delection').get(controller.facebookAccountDeletion);

export default userRouter;

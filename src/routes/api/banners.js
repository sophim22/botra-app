import express from "express";
import authMiddleware, { authAccess } from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/banners";

require("express-async-errors");


const bannerRouter = express.Router();

bannerRouter.route("/").get(authAccess, controller.list);

export default bannerRouter;


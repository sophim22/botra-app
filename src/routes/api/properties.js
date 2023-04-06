import express from "express";
import authMiddleware, { authAccess } from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/properties";
import * as likesController from "~/app/controllers/api/v1/likes";
import uploader from "../../config/uploader";
import propertyValidator from "~/app/validators/api/property";

require("express-async-errors");

const propertyRouter = express.Router();

propertyRouter.route("/").get(authAccess, controller.list);
propertyRouter.route("/").post(authMiddleware, uploader.array("images"), propertyValidator, controller.create);
propertyRouter.route("/:id").get(authAccess, controller.show);
propertyRouter.route("/:id/likes").post(authMiddleware, likesController.create);
propertyRouter.route("/:id").put(authMiddleware, uploader.array("images"), propertyValidator, controller.update);

export default propertyRouter;

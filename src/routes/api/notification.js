import express from "express";
import authMiddleware from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/notifications";


require("express-async-errors");

const notificationRouter = express.Router();

notificationRouter.route("/").get(controller.notifications);
notificationRouter.route("/:id").get(controller.notification);

export default notificationRouter;
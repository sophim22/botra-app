import express from "express";
import authMiddleware from "~/middleware/auth_api";
import * as controller from "~/app/controllers/api/v1/likes";

require("express-async-errors");

const likeRouter = express.Router();

likeRouter.route("/").get(authMiddleware, controller.list);

export default likeRouter;

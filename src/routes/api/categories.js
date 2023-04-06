import express from "express";
import * as controller from "~/app/controllers/api/v1/categories";

require("express-async-errors");

const userRouter = express.Router();

userRouter.route("/").get(controller.list);
userRouter.route("/:id").get(controller.show);

export default userRouter;

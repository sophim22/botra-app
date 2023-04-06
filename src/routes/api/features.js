import express from "express"
import * as controller from "~/app/controllers/api/v1/features";
import { authAccess } from "~/middleware/auth_api";

require("express-async-errors");

const featureRouter = express.Router()

featureRouter.get("/",authAccess, controller.list)
featureRouter.put("/:id/update_order", controller.updateOrder)
featureRouter.get("/:id", authAccess, controller.show)

export default featureRouter;

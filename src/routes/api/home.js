import express from "express";
import * as controller from "~/app/controllers/api/v1/home";
import validateContact from "~/app/validators/api/contact";
import { authAccess } from "~/middleware/auth_api";

const homeRouter = express.Router();

homeRouter.route("/configs").get(controller.configs);
homeRouter.route("/contact").post(validateContact, controller.contactRequest);
homeRouter.route("/recommends").get(authAccess, controller.recommends);

export default homeRouter;

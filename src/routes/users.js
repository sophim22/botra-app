import Users from "../app/controllers/users";
import viewParser from "../middleware/view";
import express from "express";
import uploader from "../config/uploader";
import userValidation from "../app/validators/user";
import auth from "../middleware/auth";

const userRouter = express.Router();
userRouter.get("/", auth, viewParser("users", "index"), Users.index);
userRouter.post("/", auth, viewParser("users", "new"), uploader.single("file"), userValidation, Users.create);
userRouter.get("/new", auth, viewParser("users", "new"), Users.new);
userRouter.get("/:id", auth, viewParser("users", "show"), Users.show);
userRouter.get("/:id/edit", auth, viewParser("users", "edit"), Users.edit);
userRouter.put("/:id", auth, uploader.single("file"), userValidation, viewParser("users", "update"), Users.update);
userRouter.delete("/:id", auth, Users.delete);

export default userRouter;

import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import categoriesRouter from "./categories";
import propertiesRouter from "./properties";
import likesRouter from "./likes";
import featureRouter from "./features";
import homeRouter from "./home";
import bannerRouter from "./banners";
import notificationRouter from "./notification";

require("express-async-errors");

export const routes = express.Router();
routes.use("/", homeRouter);
routes.use("/auth", authRouter);
routes.use("/accounts", userRouter);
routes.use("/categories", categoriesRouter);
routes.use("/properties", propertiesRouter);
routes.use('/likes', likesRouter);
routes.use('/features', featureRouter);
routes.use('/banners', bannerRouter);
routes.use('/notifications', notificationRouter);

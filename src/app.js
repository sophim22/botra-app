import express from "express";
import session from "express-session";
import sass from "node-sass-middleware";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import objection, { Model } from "objection";
import methodOverride from "method-override";
import flash from "express-flash";
import routes from './config/routes';
import knexCofig from "./config/database";
import params from "./packages/strong-params";
import compression from "compression";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import useragent from "express-useragent";
import paranoia from "objection-paranoia";
import multer from 'multer';

const app = express();
const environment = process.env.NODE_ENV || "development";
const db = require("knex")(knexCofig[environment]);
const env = process.env.NODE_ENV || "development";

export const port = process.env.PORT || 5000;

global.isProduction = env !== "development";

global.env = env;
global.ROOT_PATH = __dirname;
global.ADMIN_HOST = process.env.ADMIN_HOST;

let sessionOptions = {};
  sessionOptions = {
    secret: process.env.SECRET_KEY_BASE,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }
  };
// }
const logMode = app.get("env") === "development" ? "dev" : "combined";
app.use(useragent.express());
app.set("trust proxy", true);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(morgan(logMode));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(
  methodOverride((req, res, next) => {
    if ((req.body && "_method" in req.body) || (req.query && req.query._method == 'put')) {
      const method = req.body._method || req.query._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(express.json());
app.use(params.expressMiddleware());
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "pug");
app.use(session(sessionOptions));
app.use(cookieParser(process.env.SECRET_KEY_BASE));
app.use(flash());
// if (!isProduction) {
  app.use(
    sass({
      src: __dirname + "/app/assets",
      dest: path.join(__dirname, "../public"),
      debug: false,
      outputStyle: "compressed"
    })
  );
// }
app.use(express.static(path.join(__dirname, "../public")));
paranoia.register(objection);
Model.knex(db);
routes(app);

export default app;

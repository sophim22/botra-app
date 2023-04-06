export default (controller, action) => (_req, res, next) => {
  res.locals.pageName = `${controller}-${action}`;
  next();
}
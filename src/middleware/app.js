import {formatCurrency, dateFormat, unixToDate} from "../app/helper/utils";
import Property from "../app/models/Property";
const activeClass = (route, path, absolute = false) => {
  if (!absolute) {
    path = path.split("/")[1] || "dashboard";
  } else {
    return path.includes(route) ? "active" : "";
  }
  return route === path ? "active" : "";
};

const formatNumber = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const pagingUrl = (params, page) => {
  params.page = page
  const url = new URLSearchParams(params).toString();
  return url
};

export default async (req, res, next) => {
  const isIE = req.useragent.isIE;
  const isLocale = !!req.query.locale;
  const basePath = req.path;
  const filterParams = req.query;
  const countPendingProperty = await Property.query() 
    .modify("pending")
    .resultSize();
  const countRequestPreviewProperty = await Property.query().modify("requestPreview").resultSize();
  const countReview = countPendingProperty + countRequestPreviewProperty;

  if (!res.locals.isSignIn) res.locals.isSignIn = false;
  res.locals.hideSideMenu = false;
  if (req.csrfToken) res.locals.csrfToken = req.csrfToken();
  res.locals.routeName = basePath || "dashboard";
  res.locals.activeClass = activeClass;
  res.locals.formatNumber = formatNumber;
  res.locals.dateFormat = dateFormat;
  res.locals.unixToDate = unixToDate;
  res.locals.filterParams = filterParams;
  res.locals.isIE = isIE || false;
  res.locals.pagingUrl = pagingUrl;
  res.locals.countReview = countReview;
  next();
};
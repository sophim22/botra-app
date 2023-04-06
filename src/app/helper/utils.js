import crypto from "crypto";
import format from "date-fns/format";
import redis from "../../config/redis";
import path from "path";
import moment from "moment";

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

function includes(haystack, needle) {
  return haystack.indexOf(needle) !== -1;
}

const emailTester =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
export const formatCurrency = (amount, currency = "jpy") => {
  const converter = currency === "jpy" ? amount : amount / 100;
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency,
  }).format(converter);
};

export const unixToDate = unix => {
  const date = new Date(unix * 1000);
  const formater = `yyyy.MM.dd H:mm a`;
  return format(date, formater);
};

export function safeJSON(json, fallback = []) {
  var parsed = [];
  try {
    parsed = JSON.parse(json);
  } catch (e) {}

  return parsed;
}

export const errorSerialize = (error, prefix = "") => {
  const errors = {};
  Object.keys(error).map(key => {
    const newKey = key.replace(prefix, "");
    errors[newKey] = error[key].map(obj => obj.msg).join(", ");
  });
  return errors;
};

export const dateFormat = (date, formater = "yyyy.MM.dd", fallback) => {
  if (!date && fallback) {
    return fallback;
  }
  return moment(date).format(formater);
};

export function toASCII(chars) {
  var ascii = "";
  for (var i = 0, l = chars.length; i < l; i++) {
    var c = chars[i].charCodeAt(0);

    // make sure we only convert half-full width char
    if (c >= 0xff00 && c <= 0xffef) {
      c = 0xff & (c + 0x20);
    }

    ascii += String.fromCharCode(c);
  }

  return ascii;
}
export const groupBy = (array, type) => {
  if (!Array.isArray(array)) return array;
  return array.reduce((r, v, i, a, k = v[type]) => ((r[k] || (r[k] = [])).push(v), r), {});
};
export const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const isValidUsername = username => {
  return /^[a-z][a-z0-9_.]*$/i.test(username);
};

export const validateEmail = email => {
  if (!email) return false;
  if (email.length > 256) return false;
  if (!emailTester.test(email)) return false;
  var [account, address] = email.split("@");
  if (account.length > 64) return false;

  const domainParts = address.split(".");
  if (domainParts.some(part => part.length > 63)) return false;
  return true;
};

export const randomName = name => {
  for (var random = ""; random.length < 40; )
    random += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"[(Math.random() * 60) | 0];
  const start = Math.floor(Math.random() * 30 + 1);
  const end = Math.floor(Math.random() * 20 + 10);
  const prefix = random.slice(start, start + 7);
  const lastPrefix = random.slice(end, end + 3);
  return `bene_${prefix}${lastPrefix}`;
};
export const generateAuthToken = (length = 30) => {
  return crypto.randomBytes(length).toString("hex");
};

export const clearSession = (req, res) => {
  const token = req.cookies["__property_list_store_auth__"];
  res.clearCookie("__property_list_store_auth__");
  const key = `session:${token}`;
  redis.del(key);
};

export const storeLoginSession = (res, user, isRemember = false, tmp = false) => {
  const token = generateAuthToken();
  const expireInDay = isRemember ? 7 : 2;
  const extDate = tmp ? 3 : 24 * expireInDay;
  const expired = 60 * 60 * extDate;
  const key = `session:${token}`;
  const date = new Date();
  date.setTime(date.getTime() + extDate * 60 * 60 * 1000);

  res.cookie("__property_list_store_auth__", token, {
    expires: new Date(date),
    httpOnly: true,
  });

  redis.set(
    key,
    JSON.stringify({
      id: user.id,
      username: user.username,
      allowPasswordChange: user.allowPasswordChange,
    }),
    "EX",
    expired,
  );
};
export const keyBy = (array, key) => (array || []).reduce((r, x) => ({ ...r, [key ? x[key] : x]: x }), {});
export function pagination(total, perPage, currentPage) {
  const totalPage = Math.ceil(total / perPage);
  const next = currentPage + 2 <= totalPage ? currentPage + 2 : totalPage;
  const previous = currentPage >= 2 ? currentPage + 1 - 1 : 1;

  return {
    total,
    perPage,
    currentPage: Number(currentPage),
    next,
    totalPage,
    previous,
    pages: [...Array(totalPage).keys()],
  };
}

export const paging = req => {
  let page = req.query.page || 1;
  let perPage = req.query.per_page || 20;
  if (isNaN(Number(perPage))) {
    perPage = 20;
  }
  if (isNaN(Number(page))) {
    page - 1;
  }
  if (page - 1 >= 0) {
    page = page - 1;
  }
  return {
    page,
    perPage,
  };
};

export const isValidLatLng = str => {
  const latRgex = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
  const longRgex = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;
  if (!str.includes(",")) return false;
  var pair = str.split(",");
  if ((pair[0].startsWith("(") && !pair[1].endsWith(")")) || (pair[1].endsWith(")") && !pair[0].startsWith("(")))
    return false;
  return latRgex.test(pair[0]) && longRgex.test(pair[1]);
};

export const generateMD5 = value => {
  return crypto.createHash("md5").update(value).digest("hex");
};

export const getExtension = file => {
  return path.extname(file);
};

export const pick = (data, toPick) => pickBy(data, toPick, (values, v) => includes(values, v));

export const omit = (data, toOmit) => pickBy(data, toOmit, (values, v) => !includes(values, v));

export const pickBy = (data, values, predicate) => {
  return Object.keys(data).reduce((c, v) => {
    if (predicate(values, v)) {
      c[v] = data[v];
      return c;
    }
    return c;
  }, {});
};

export const displayPhoneNumber = (phone, countryCode = "kh") => {
  try {
    let phoneNumber = phoneUtil.parseAndKeepRawInput(phone, countryCode);
    return phoneUtil.format(phoneNumber, PNF.NATIONAL);
  } catch (er) {
    return phone;
  }
};

export const formatPhoneNumber = (phone, countryCode = "kh") => {
  try {
    let phoneNumber = phoneUtil.parseAndKeepRawInput(phone, countryCode);
    phoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    return phoneNumber;
  } catch (error) {
    return "";
    console.log({ error });
  }
};

export const isPhoneValid = (phone, countryCode = "kh") => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phone, countryCode);
    return phoneUtil.isValidNumber(number);
  } catch (error) {
    return false;
  }
};

export const getCountryCode = phone => {
  try {
    const numberProto = phoneUtil.parse(phone);
    const callingCode = numberProto.getCountryCode();
    const nationalNumber = numberProto.getNationalNumber();
    const countryCode = phoneUtil.getRegionCodeForCountryCode(callingCode);
    return { countryCode, phone: nationalNumber.toString() };
  } catch (error) {
    return { countryCode: "kh", phone: "" };
  }
};

export default {
  storeLoginSession,
  validateEmail,
  clearSession,
  generateAuthToken,
  pagination,
  paging,
  keyBy,
  formatCurrency,
  dateFormat,
  errorSerialize,
  groupBy,
  isPhoneValid,
  getCountryCode,
  formatPhoneNumber,
  displayPhoneNumber,
  generateMD5,
};

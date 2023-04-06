import axios from "axios";
import crypto from "crypto";
import download from "image-downloader";
import appleSigninAuth from "apple-signin-auth";
import User from "~/app/models/User";
import { s3Upload } from "~/config/s3Client";
import { generateToken, clearSession } from "~/config/jwt";
import trim from "lodash.trim";
import { raw } from "objection";
import { profileSerializer } from "~/app/serializer/user";
import helper from "~/app/helper/utils";

export const apple = async (req, res) => {
  const { nonce, identityToken } = req.body;
  try {
    const appleIdTokenClaims = await appleSigninAuth.verifyIdToken(identityToken, {
      nonce: nonce ? crypto.createHash("sha256").update(nonce).digest("hex") : undefined,
    });
    const pwd = await User.generatePassword(appleIdTokenClaims.c_hash);
    const username = appleIdTokenClaims.email.split("@")[0];
    const params = {
      phone: "",
      username,
      email: appleIdTokenClaims.email,
      password: pwd,
      provider: "apple",
      uid: appleIdTokenClaims.sub,
    };
    let account = await User.query().where({ uid: params.uid, provider: "apple" }).first();
    if (!account) {
      if (appleIdTokenClaims.email) {
        const user = await User.query().findOne({
          email: appleIdTokenClaims.email,
        });
        if (user) {
          return res.status(400).json({ message: "Email already taken" });
        }
      }
      account = await User.query().insertAndFetch(params);
    }
    const token = await generateToken(account);
    return res.status(200).json({ token: token, data: profileSerializer(account) });
  } catch (err) {
    res.status(400).json({ message: "Oop, something went wrong with Apple Authorization." });
  }
};

export const google = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "Oop, sorry something went wrong with your data." });
  }
  try {
    const resp = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const data = resp.data;
    const pwd = await User.generatePassword(`${data.sub}${data.nonce}`);
    const username = `${data.given_name.toLowerCase()}_${data.family_name.toLowerCase()}`;
    const params = {
      phone: "",
      username,
      email: data.email,
      password: pwd,
      provider: "google",
      uid: data.sub,
    };
    let account = await User.query().where({ uid: params.uid, provider: "google" }).first();
    if (!account) {
      if (data.email) {
        const user = await User.query().findOne({
          email: data.email,
        });
        if (user) {
          return res.status(400).json({ message: "Email already taken" });
        }
      }
      const key = helper.generateMD5(`${+new Date()}${data.sub}${data.nonce}`);
      const filePath = `${process.cwd()}/tmp/${key}.jpg`;
      await download.image({
        url: data.picture,
        dest: filePath,
      });
      const s3Key = await s3Upload(filePath, "uploads/avatar/");
      params.profile = s3Key;
      account = await User.query().insertAndFetch(params);
    }
    const token = await generateToken(account);
    return res.status(200).json({ token: token, data: profileSerializer(account) });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};

export const facebook = async (req, res) => {
  const { access_token } = req.body;

  if (access_token) {
    try {
      const resp = await axios.get(`https://graph.facebook.com/me?fields=id,email,name&access_token=${access_token}`);
      const user = await User.facebookAuth(resp.data);
      if (user.errors) {
        return res.status(400).json({ message: user.message });
      }
      const token = await generateToken(user);
      return res.status(200).json({ token: token, data: profileSerializer(user) });
    } catch (err) {
      console.log({ err });
      return res.status(400).json({ message: "something went wrong!" });
    }
  }
  return res.status(400).json({ message: "Missing Access token" });
};

export const register = async (req, res) => {
  const { phone, password, username } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone or Password is required" });
  }
  const { countryCode } = helper.getCountryCode(phone);

  if (!helper.isPhoneValid(phone, countryCode)) {
    return res.status(400).json({ message: "Phone is invalid!" });
  }

  const value = trim(phone);

  const user = await User.query()
    .where(raw(`phone = '${value}'`))
    .first();

  if (user) {
    return res.status(400).json({ message: "Phone is already taken!" });
  }
  if (password.length <= 6) {
    return res.status(400).json({ message: "Password is too short. Minimum 6 character." });
  }

  const pwd = await User.generatePassword(password);

  const params = {
    phone,
    username,
    password: pwd,
    provider: "phone",
    uid: phone,
  };

  try {
    const account = await User.query().insertAndFetch(params);
    const token = await generateToken(account);
    return res.status(200).json({ token: token, data: profileSerializer(account) });
  } catch (err) {
    if (err?.data) {
      return res.status(400).json({ ...err?.data });
    }
    console.log(err);
    res.status(400).json({ message: "Oop, something went wrong." });
  }
};

export const session = async (req, res) => {
  const phone = req.body.phone || "";
  const password = req.body.password || "";
  const errors = {
    success: false,
    message: ["Invalid Phone or Password"],
  };

  if (password.length && phone.length) {
    const value = trim(phone);

    const user = await User.query()
      .where(raw(`phone = '${value}'`))
      .first();
    if (user) {
      const isValid = await user.validPassword(password);

      if (isValid) {
        const token = await generateToken(user);
        return res.status(200).json({ token: token, data: profileSerializer(user) });
      }
    }
  }

  res.status(401).json(errors);
};

export const logout = (req, res) => {
  clearSession(req.auth_token);
  res.status(200).json({ message: "Account logout!." });
};

export const verify = (req, res) => {
  res.status(200).json({ data: profileSerializer(req.currentUser) });
};

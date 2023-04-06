import { raw } from "objection";
import User from "~/app/models/User";
import { profileSerializer } from "~/app/serializer/user";
import { generateToken } from "~/config/jwt";
import { isPhoneValid } from "~/app/helper/utils";
import crypto from 'crypto';

export const requestCode = async (req, res) => {
  const {phone} = req.body;
  if(!phone) {
    return res.status(400).json({message: 'Phone Number is required'});
  }
  if(!isPhoneValid(phone)) {
    return res.status(400).json({message: 'Phone Number is invalid'});
  }
  const user = await User.query().findOne({phone});
  if(!user) {
    return res.status(404).json({message: 'Invalid Phone Number or Account not found.'})
  }
  const otpCode = await User.generateOtp();
  await user.$query().patch({otp_code: otpCode, otp_code_sent_at: raw('now()')}).returning('*');
  // TODO SEND CODE TO PHONE NUMBER
  res.status(200).json({message: 'OTP code has been sent to your phone number.'});
}

export const requestReset = async (req, res) => {
  const {phone, code} = req.body;
  if(!phone || !code) {
    return res.status(400).json({message: 'Phone Number Or Code is required'});
  }
  if(!isPhoneValid(phone)) {
    return res.status(400).json({message: 'Phone Number is invalid'});
  }
  const user = await User.query().whereRaw(`otp_code_sent_at > now() - '30 MINUTES'::INTERVAL`).findOne({phone, otp_code: code});
  if(!user) {
    return res.status(404).json({message: 'Phone Number / OTP Code is invalid or expired'})
  }
  const token = crypto.randomBytes(68).toString('base64url');
  await user.$query().patch({reset_password_token: token, reset_password_sent_at: raw('now()'), otp_code: null, otp_code_sent_at: null});

  return res.status(200).json({token})
}

export const resetPassword = async (req, res) => {
  const {phone, token, password, password_confirmation} = req.body;
  if(!password || !password_confirmation) {
    return res.status(400).json({message: 'Password or Password Confirmation is required'});
  }
  if(password !== password_confirmation) {
    return res.status(400).json({message: 'Password is not match'});
  }
  if(password.length < 6) {
    return res.status(400).json({message: 'Password is too short. Minimum 6 character'});
  }
  if(!phone || !token) {
    return res.status(400).json({message: 'Phone Number Or Reset Token is required'});
  }

  if(!isPhoneValid(phone)) {
    return res.status(400).json({message: 'Phone Number is invalid'});
  }
  const user = await User.query().findOne({reset_password_token: token, phone: phone}).whereRaw(`reset_password_sent_at > now() - '30 MINUTES'::INTERVAL`)
  if(!user) {
    return res.status(404).json({message: 'Reset Password Token is invalid or expired'})
  }

  const pwd = await User.generatePassword(password);
  await user.$query().patch({password: pwd, reset_password_token: null, reset_password_sent_at: null});
  const authToken = await generateToken(user);

  return res.status(200).json({ token: authToken, data: profileSerializer(user) });
}
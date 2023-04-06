import groupBy from 'lodash/groupBy';
import dayjs from 'dayjs';
import User from '~/app/models/User';
import Property from '~/app/models/Property';
import DeviceToken from "~/app/models/DeviceToken";
import { propertySerializer } from "~/app/serializer/property";
import { profileSerializer } from "~/app/serializer/user";
import { validationResult } from "express-validator";
import { errorSerialize } from "~/app/validators/api/users";

export const deviceToken = async (req, res) => {
  try {
    const { token_id: tokenId, uuid } = req.body;
    const token = await DeviceToken.query().findOne({
      token_id: tokenId,
      user_id: req.decoded.id
    });

    if (!token) {
      await DeviceToken.query().insert({
        token_id: tokenId,
        user_id: req.decoded.id,
        unique_id: uuid
      })
    }

    res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(400).json({ message: 'Oop, sorry. Something went wrong!' });
  }
};

export const updateProfile = async (req, res) => {
  const body = req.body;
  const avatar = req.file?.filename || req.file?.key;
  const params = { username: body.username, email: body.email }
  const result = validationResult(req);
  const errors = groupBy(result.errors, "param");
  const errorsMessage = errorSerialize(errors);

  if(result.errors.length) {
    return res.status(400).json(errorsMessage)
  }

  if(avatar) {
    params.profile = avatar
  }
  if(body.dob && dayjs(body.dob).isValid()) {
    params.dob = body.dob;
  }

  let user = await User.query().findById(req.decoded.id);
  await user.$query().patch({...params, updated_at: new Date()});

  user = await User.query().findById(req.decoded.id)

  res.status(200).json({data: profileSerializer(user)})
}

export const profile = async (req, res) => {
  res.status(200).json({ data: profileSerializer(req.currentUser) });
}

export const changePassword = async (req, res) => {
  const body = req.body;
  const result = validationResult(req);
  const errors = groupBy(result.errors, "param");
  const errorsMessage = errorSerialize(errors);

  if(result.errors.length) {
    return res.status(400).json(errorsMessage)
  }
  const pwd = await User.generatePassword(body.password);
  const user = await User.query().findById(req.decoded.id)
  await user.$query().patch({password: pwd, updated_at: new Date()});

  res.status(200).json({ data: profileSerializer(user) });
}

export const property = async (req, res) => {
  const property = await Property.query().withGraphFetched("[category, galleries, user]").findOne({ user_id: req.decoded.id });

  res.status(200).json({ data: property ? propertySerializer(property || {}) : null });
}

export const facebookAccountDeletion = async (req, res) => {
  res.status(200).json({message: 'Your account has been deleted by callback'});
}
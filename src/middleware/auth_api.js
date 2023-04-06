import { verifyToken, clearSession } from '../config/jwt';
import User from "../app/models/User";

const handleClearToken = (token) => clearSession(token);

export const authAccess = async (req, _, next) => {
  const authorization = req.headers["authorization"];
  if (authorization && authorization.split(" ")[0] === 'Bearer') {
    const token = authorization.split(" ")[1];
    try {
      const keyIndex = await redis.get(token);
      if(!keyIndex) {
        const payload = await verifyToken(token);
        const account = await User.query().findOne({ id: payload.id, phone: payload.phone });
        req.currentUser = account;
        req.decoded = payload;
        req.auth_token = token;
      }
    } catch (e) {
      if(e?.name == 'TokenExpiredError') {
        handleClearToken(token);
      }
      console.log(e)
    }
  }
  next();
}

export default async (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (authorization && authorization.split(" ")[0] === 'Bearer') {
    const token = authorization.split(" ")[1];
    try {
      const keyIndex = await redis.get(token);
      if (keyIndex) {
        return res.status(401).json({ message: 'unauthorized' });
      }
      const payload = await verifyToken(token);
      const account = await User.query().findOne({ id: payload.id, phone: payload.phone });
      req.decoded = payload;
      req.currentUser = account;
      req.auth_token = token;
      next();
      return;
    } catch (e) {
      if(e?.name == 'TokenExpiredError') {
        handleClearToken(token);
      }
      console.log(e)
    }
  }
  return res.status(401).json({ message: 'unauthorized' });
}

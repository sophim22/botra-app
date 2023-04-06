import { pick } from "../helper/utils";

export const profileSerializer = (account) => {
  account.profile = account.profileUrl;

  return pick(account, [
    "id",
    'username',
    "phone",
    "email",
    "provider",
    "profile",
    "dob",
    "is_verify"
  ]);
};

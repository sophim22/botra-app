import { pick } from "../helper/utils";

export const categorySerializer = category => {
  category.id = category.uuid;
  category.image = category.imageUrl;
  return pick(category, ["id", "name", "status", "code", "image"]);
};

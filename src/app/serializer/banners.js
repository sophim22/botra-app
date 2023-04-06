import { pick } from "../helper/utils";


export const bannerSerializer = banner => {
  banner.id = banner.uuid;
  banner.image = banner.imageUrl;
  return pick(banner, [
    "id",
    "name",
    "image",
    "order",
    "status",
    "link",
  ]);

}
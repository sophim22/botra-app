import { pick } from "../helper/utils";

export const propertySerializer = property => {
  property.id = property.uuid;
  property.category = {
    id: property?.category?.uuid || "",
    name: property?.category?.name || "",
    code: property?.category?.code || "",
    image: property?.category?.imageUrl || "",
  };

  property.user = property.user
    ? {
        id: property.user.id,
        profile: property.user.profileUrl,
        username: property.user.username,
        is_verify: property.user.is_verify,
      }
    : {};

  property.images = property.galleries
    ? (property.galleries || []).map(gallery => ({
        id: gallery.id,
        image: gallery.pathUrl,
      }))
    : [];

  return pick(property, [
    "id",
    "name",
    "latitude",
    "longitude",
    "description",
    "status",
    "open_close_time",
    "price_range",
    "address",
    "website",
    "category",
    "user",
    "is_like",
    "social_link",
    "images",
    "contact"
  ]);
};

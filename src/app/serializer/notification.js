import { pick } from "../helper/utils";
import { profileSerializer } from "./user";



export const notificationSerializer = (notification) => {
  notification.id = notification.uuid;
  notification.image = notification.imageUrl;
  return pick(notification, [
    "id",
    "title",
    "content",
    "image",
    "created_at",
  ]);
}
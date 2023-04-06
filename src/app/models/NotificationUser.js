import "dotenv/config";
import { Model } from "objection";


class NotificationUser extends Model {
  static get tableName() {
    return "notification_user";
  }
  static relationMappings = {
    notification : {
      relate : Model.BelongsToOneRelation,
      modelClass: __dirname + "/Notification",
      join: {
        from: "notification_user.notification_id",
        to: "notifications.id",
      }
    },
    user : {
      relate: Model.BelongsToOneRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "notification_user.user_id",
        to: "users.id",
      }
    },
  };

}

export default NotificationUser;
import "dotenv/config";
import { Model } from "objection";


class Notification extends Model {
  static get tableName() {
    return "notifications";
  }
  static get softDelete() {
    return true;
  }

  static relationMappings = {
    notification_user: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/NotificationUser",
      join: {
        from: "notifications.id",
        to: "notification_user.notification_id",
      },
    },

    users: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "notifications.id",
        through: {
          from: "notification_user.notification_id",
          to: "notification_user.user_id",
        },
        to: "users.id",
      },
    },
  };

  static get modifiers() {
    return {
    searchFilter(query, params) {
      if (params.title) {
        query.where("name", "like", `%${params.title}%`);
      }
    }
  }
}

static list = async (params, page = 1, perPage = 20) => {
  const data = await Notification.query().modify("searchFilter", params).orderBy("updated_at", "desc").page(page, perPage);
  return data;
};

get imageUrl() {
  if (process.env.STORAGE === "s3") {
    return `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/${this.image}`;
  }
  return `${process.env.BASE_URL}/uploads/${this.image}`;
}

}

export default Notification;
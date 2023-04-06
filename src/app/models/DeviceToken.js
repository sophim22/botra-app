import { Model } from "objection";

class DeviceToken extends Model {
  static get tableName() {
    return "device_tokens";
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "device_tokens.user_id",
        to: "users.id",
      },
    },
  };
}

export default DeviceToken;

import "dotenv/config";
import { Model } from "objection";
import bcrypt from "bcrypt";

class Favorite extends Model {
  static get tableName() {
    return "favorites";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    property: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "favorites.property_id",
        to: "properties.id",
      },
    },
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "favorites.user_id",
        to: "users.id",
      },
    },
  };
}

export default Favorite;

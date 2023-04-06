import "dotenv/config";
import { Model } from "objection";

class Review extends Model {
  static get tableName() {
    return "reviews";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "reviews.user_id",
        to: "users.id",
      },
    },
    property: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "reviews.property_id",
        to: "properties.id",
      },
    },
    parent: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Review",
      join: {
        from: "reviews.parent_id",
        to: "reviews.id",
      },
    },
    children: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Review",
      join: {
        from: "reviews.id",
        to: "reviews.parent_id",
      },
    },
  };
}

export default Review;

import "dotenv/config";
import { Model } from "objection";

class Tagging extends Model {
  static get tableName() {
    return "tags";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    tags: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Tag",
      join: {
        from: "taggings.tag_id",
        to: "tags.id",
      },
    },
  };
}

export default Tagging;

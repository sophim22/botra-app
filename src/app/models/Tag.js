import "dotenv/config";
import { Model } from "objection";

class Tag extends Model {
  static get tableName() {
    return "tags";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    taggables: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Taggable",
      join: {
        from: "tags.id",
        to: "taggables.tag_id",
      },
    },
  };
}

export default Tag;

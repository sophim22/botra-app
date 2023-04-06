import "dotenv/config";
import { Model } from "objection";

class Gallery extends Model {
  static get tableName() {
    return "galleries";
  }

  static get softDelete() {
    return true;
  }

  get fileKey() {
    return `/uploads/galleries/${this.file}`;
  }

  get pathUrl() {
    if (process.env.STORAGE === "s3") {
      return `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/${this.file}`;
    }

    return `${process.env.BASE_URL}/uploads/${this.file}`;
  }

  static relationMappings = {
    property: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Property",
      filter(builder) {
        builder.where("filable_id", "Property");
      },
      beforeInsert(model) {
        model.filable_id = "Property";
      },
      join: {
        from: "galleries.filable_id",
        to: "properties.id",
      },
    },
  };
}

export default Gallery;

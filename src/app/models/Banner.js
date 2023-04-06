import "dotenv/config";
import { Model } from "objection";

class Banner extends Model {
  static get tableName() {
    return "banners";
  }
  static get softDelete() {
    return true;
  }
  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.name) {
          query.where("name", "like", `%${params.name}%`);
        }
      },
    };
  }
  static list = async (params, page = 1, perPage = 20) => {
    const data = await Banner.query().modify("searchFilter", params).orderBy("updated_at", "desc").page(page, perPage);

    return data;
  };
  static relationMappings = {
    properties: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "banners.id",
        to: "properties.banner_id",
      },
    },
  };

  get imageUrl() {
    if (process.env.STORAGE === "s3") {
      return `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/${this.image}`;
    }
    return `${process.env.BASE_URL}/uploads/${this.image}`;
  }
}

export default Banner;

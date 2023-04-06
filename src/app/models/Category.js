import "dotenv/config";
import { Model } from "objection";

class Category extends Model {
  static get tableName() {
    return "categories";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    properties: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "categories.id",
        to: "properties.category_id",
      },
    },
  };

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.name) {
          query.where("name", "like", `%${params.name}%`);
        }

        if (params.code) {
          query.where("code", "like", `%${params.code}%`);
        }
        if (params.status) {
          query.where({ status: params.status });
        }
      },
      actives(query) {
        query.where("status", "active");
      },
    };
  }

  static list = async (params, page = 1, perPage = 20) => {
    const data = await Category.query()
      .modify("searchFilter", params)
      .orderBy("created_at", "desc")
      .page(page, perPage);

    return data;
  };

  get imageUrl() {
    if (!this.image) {
      return;
    }
    if (process.env.STORAGE === "s3") {
      return `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/${this.image}`;
    }

    return `${process.env.BASE_URL}/uploads/${this.image}`;
  }
}

export default Category;

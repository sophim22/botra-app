import "dotenv/config";
import { Model } from "objection";

class Feature extends Model {
  static get tableName() {
    return "features";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    properties : {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "features.id",
        through: {
          from: "feature_properties.feature_id",
          to: "feature_properties.property_id",
        },
        to: "properties.id",
      },
    },
    feature_properties : {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Feature_properties",
      join: {
        from: "features.id",
        to: "feature_properties.feature_id",
      },
    },
  };

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.name) {
          query.where("name", "like", `%${params.name}%`);
        }
        if (params.status) {
          query.where({ status: params.status });
        }
      },
    }
  }
  static list = async (params, page = 1, perPage = 20) => {
    const data = await Feature.query()
      .modify("searchFilter", params)
      .withGraphFetched("properties")
      .withGraphFetched("properties.user")
      .withGraphFetched("properties.category")
      .withGraphFetched("properties.galleries")
      .orderBy("order", "asc")
      .page(page, perPage);

    return data;
  };

}

export default Feature;
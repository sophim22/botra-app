import "dotenv/config";
import { Model, raw } from "objection";
import { keyBy, isEmpty } from "../helper/utils";
import Favorite from "./Favorite";
const STATUSES = ["pending", "request preview", "approved", "rejected"];

class Property extends Model {
  static get tableName() {
    return "properties";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    category: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Category",
      join: {
        from: "properties.category_id",
        to: "categories.id",
      },
    },
    galleries: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Gallery",
      join: {
        from: "properties.id",
        to: "galleries.filable_id",
      },
      filter: { filable_type: "Property" },
    },
    coupons: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Coupon",
      join: {
        from: "properties.id",
        to: "coupons.property_id",
      },
    },
    reviews: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Review",
      join: {
        from: "properties.id",
        to: "reviews.property_id",
      },
    },
    taggings: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Tagging",
      join: {
        to: "taggings.taggable_id",
        from: "properties.id",
      },
    },
    tags: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Tag",
      join: {
        from: "properties.id",
        through: {
          from: "taggings.taggable_id",
          to: "taggings.tag_id",
        },
        to: "tags.id",
      },
      filter: { filable_type: "Property" },
    },
    favorites: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Favorite",
      join: {
        from: "properties.id",
        to: "favorites.property_id",
      },
    },
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/User",
      join: {
        from: "properties.user_id",
        to: "users.id",
      },
    },
    features: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Feature",
      join: {
        from: "properties.id",
        through: {
          from: "feature_properties.property_id",
          to: "feature_properties.feature_id",
        },
        to: "features.id",
      },
    },
    feature_properties: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Feature_properties",
      join: {
        from: "properties.id",
        to: "feature_properties.property_id",
      },
    },
  };

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params?.name) {
          query.where(raw("lower(properties.name)"), "like", `%${params.name.toLowerCase()}%`);
        }
        if (params?.category_id) {
          query.where({ category_id: params.category_id });
        }
        if (params?.category_code) {
          query.withGraphFetched("category").whereIn("category_id", function () {
            this.select("id").from("categories").where("uuid", "like", `%${params.category_code}%`);
          });
        }
        if (params?.status) {
          query.whereRaw(`properties.status = '${params.status}'`);
        }
        if (params?.username) {
          query.whereRaw(`lower(username) like lower('%${params.username}%')`);
        }
        if (params?.phone) {
          query.where(raw(`users.phone`), "like", `%${params.phone}%`);
        }
        const sw = params.sw;
        const ne = params.ne;
        const boundSearch =
          !isEmpty(sw) && !isEmpty(ne) && sw.split(",").length === 2 && ne.split(",").length === 2 ? true : false;
        if (boundSearch) {
          const swPoint = sw.split(",");
          const nePoint = ne.split(",");
          query.whereRaw(
            `point(longitude, latitude) <@ '(${swPoint[1]}, ${swPoint[0]}),(${nePoint[1]}, ${nePoint[0]})'::box`,
          );
        }
      },
      requestPreview(query) {
        query.where({ status: "request preview" });
      },
      pending(query) {
        query.where({ status: "pending" });
      },
      approved(query) {
        query.where({ status: "approved" });
      },
      rejected(query) {
        query.where({ status: "rejected" });
      },
    };
  }

  static list = async (authId = null, params, page = 1, perPage = 20) => {
    const data = await Property.query()
      .joinRelated("user")
      .withGraphFetched("category")
      .withGraphFetched("galleries")
      .withGraphFetched("user")
      .modify("searchFilter", params)
      .orderBy(raw(`properties.created_at`), "desc")
      .page(page, perPage);

    if (authId) {
      const favorites = await Favorite.query()
        .where({ user_id: authId })
        .whereIn(
          "property_id",
          data.results.map(obj => obj.id),
        );
      const favoriteById = keyBy(favorites, "property_id");
      data.results.map(property => {
        property.is_like = !!favoriteById[property.id];
        return property;
      });
    }
    return data;
  };

  get isRequestPreview() {
    return this.status == "request preview";
  }

  get isPending() {
    return this.status == "pending";
  }
}

export default Property;

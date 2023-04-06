import "dotenv/config";
import { Model } from "objection";

class Coupon extends Model {
  static get tableName() {
    return "coupons";
  }

  static get softDelete() {
    return true;
  }

  static relationMappings = {
    property: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "coupons.property_id",
        to: "properties.id",
      },
    },
  };

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.code) {
          query.where("code", "=", `${params.code}`);
        }
        if (params.status) {
          query.where({ status: params.status });
        }
        if (params.property_id) {
          query.where({ property_id: params.property_id });
        }
      },
    };
  }

  static list = async (params, page = 1, perPage = 20) => {
    const data = await Coupon.query()
      .withGraphFetched("property")
      .modify("searchFilter", params)
      .orderBy("created_at", "desc")
      .page(page, perPage);

    return data;
  };
}

export default Coupon;

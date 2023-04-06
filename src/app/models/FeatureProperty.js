import "dotenv/config";
import { Model } from "objection";


class FeatureProperty extends Model {

  static get tableName() {
    return "feature_properties";
  }
  static relationMappings = {
    property : {
      relate : Model.BelongsToOneRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "feature_properties.property_id",
        to: "properties.id",
      }
    },
    feature : {
      relate: Model.BelongsToOneRelation,
      modelClass: __dirname + "/Feature",
      join: {
        from: "feature_properties.feature_id",
        to: "features.id",
      }
    },
  };


}

export default FeatureProperty;
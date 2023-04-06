import { pick } from "../helper/utils";
import { propertySerializer } from "./property";

export const featureSerializer = feature => {
  feature.id = feature.uuid;
  feature.properties = feature.properties.map(propertySerializer);

  return pick(feature, [
    "id",
    "name",
    "order",
    "style",
    "properties",
  ]);

}
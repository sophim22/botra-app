import "dotenv/config";
import { Model } from "objection";

class Page extends Model {
  static get tableName() {
    return "pages";
  }
  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.title) {
          query.where("title", "like", `%${params.title}%`);
        }
        if (params.code) {
          query.where("code", "like", `%${params.code}%`);
        }
      },
    };
  }
}

export default Page;

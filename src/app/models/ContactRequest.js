import "dotenv/config";
import { Model } from "objection";

class ContactRequest extends Model {
  static get tableName() {
    return "contact_requests";
  }

  static relationMappings = {
  };
}

export default ContactRequest;

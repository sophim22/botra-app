import "dotenv/config";
import { Model } from "objection";
import bcrypt from "bcrypt";

class Admin extends Model {
  static get tableName() {
    return "admins";
  }
  static get softDelete() {
    return true;
  }

  validPassword(password) {
    return bcrypt.compareSync(password, this.password || "");
  }

  static generatePassword = async (password) => {
    return bcrypt.hashSync(password, 12);
  };

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.email) {
          query.where("email", "like", `%${params.email}%`);
        }
      },
    };
  }

  static list = async (params, page = 1, perPage = 20) => {
    const data = await Admin.query()
      .modify("searchFilter", params)
      .orderBy("created_at", "desc")
      .page(page, perPage);

    return data;
  };

  async resetPassword(password) {
    const encryptedPassword = await Admin.generatePassword(password);
    return this.$query().patch({
      password: encryptedPassword,
      reset_password_token: null,
      reset_password_sent_at: null,
    });
  }
}

export default Admin;

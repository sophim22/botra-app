import "dotenv/config";
import { Model } from "objection";
import bcrypt from "bcrypt";
import random from "lodash.random";
import { customAlphabet } from "nanoid";

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get softDelete() {
    return true;
  }

  static generatePassword = async password => {
    return bcrypt.hashSync(password, 12);
  };

  validPassword(password) {
    return bcrypt.compareSync(password, this.password || "");
  }

  static get modifiers() {
    return {
      searchFilter(query, params) {
        if (params.email) {
          query.where("email", "like", `%${params.email}%`);
        }
        if (params.username) {
          query.where("username", "like", `%${params.username}%`);
        }
        if (params.phone) {
          query.where("phone", "like", `%${params.phone}%`);
        }
      },
    };
  }
  static list = async (params, page = 1, perPage = 20) => {
    const data = await User.query().modify("searchFilter", params).orderBy("created_at", "desc").page(page, perPage);

    return data;
  };

  static relationMappings = {
    reviews: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Review",
      join: {
        from: "users.id",
        to: "reviews.user_id",
      },
    },
    notification_user: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/NotificationUser",
      join: {
        from: "users.id",
        to: "notification_user.user_id",
      },
    },
    notifications: {
      relation: Model.ManyToManyRelation,
      modelClass: __dirname + "/Notification",
      join: {
        from: "users.id",
        through: {
          from: "notification_user.user_id",
          to: "notification_user.notification_id",
        },
        to: "notifications.id",
      },
    },
    favorites: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Favorite",
      join: {
        from: "users.id",
        to: "favorites.user_id",
      },
    },
    properties: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/Property",
      join: {
        from: "users.id",
        to: "properties.user_id",
      },
    },
    device_tokens: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/DeviceToken",
      join: {
        from: "users.id",
        to: "device_tokens.user_id",
      },
    },
  };

  get profileUrl() {
    if (!this.profile) {
      return;
    }
    if (process.env.STORAGE === "s3") {
      return `${process.env.ENDPOINT}/${process.env.FOG_DIRECTORY}/${this.profile}`;
    }

    return `${process.env.BASE_URL}/uploads/${this.profile}`;
  }

  static facebookAuth = async info => {
    let user = await User.query().findOne({
      uid: info.id,
      provider: "facebook",
    });

    if (!user) {
      const { email, name, id } = info;

      if (email) {
        user = await User.query().findOne({ email: email });

        if (user) {
          return { errors: true, message: "Email already token" };
        }
      }
      const nanoid = customAlphabet("1234567890asdfghjklqwertyuiopzxcvbnm", random(6, 10));
      const pwd = bcrypt.hashSync(nanoid(), 12);
      user = await User.query().insertAndFetch({
        email: email || "",
        username: name || "",
        uid: id,
        provider: "facebook",
        password: pwd,
      });
    }

    return user;
  };

  static generateOtp = () => {
    return process.env.APP_ENV === "production" ? crypto.randomInt(100000, 999999) : 123456;
  };
}

export default User;

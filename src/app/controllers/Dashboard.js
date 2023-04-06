import User from "../models/User";
import Coupon from "../models/Coupon";
import Property from "../models/Property";
import Category from "../models/Category";
import Admin from "../models/Admin";
class DashboardController {
  index = async (req, res) => {
    const users = await User.query();
    const coupons = await Coupon.query();
    const properties = await Property.query();
    const categories = await Category.query();
    const members = await Admin.query();
    res.render("dashboards/index", {
      title: 'Dashboard',
      properties,
      categories,
      users,
      members,
      coupons,
    });
  };
}
export default new DashboardController();

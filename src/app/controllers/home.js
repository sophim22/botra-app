class DashboardController {
  index = async (req, res) => {
    res.render("index", {
      title: 'Dashboard',
    });
  };
}
export default new DashboardController();
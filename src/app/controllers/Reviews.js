import Review from "../models/Review";
import helper, { groupBy } from "../helper/utils";

class ReviewsController {
  index = async (req, res) => {
    const {page, perPage} = helper.paging(req);
      const reviews  = await Review.query().withGraphFetched("property").withGraphFetched("user").page(page,perPage);
      const pagination = helper.pagination(reviews.total, perPage, page);
      res.render("reviews/index", {
        title: "Reviews",
        reviews,
        pagination
      });
  };
  show = async (req, res) => {
    const {id} = req.params
    const review = await Review.query().withGraphFetched("property").withGraphFetched("user").findById(id);
    res.render("reviews/show", {
      title: "Review Detail",
      review,
    });
  }
}

export default new ReviewsController();
import Banner from "~/app/models/Banner";
import { pagination, paging } from "~/app/helper/utils";
import { bannerSerializer } from "~/app/serializer/banners";

export const list  = async (req, res) => {
  try {
    const { perPage, page, query } = paging(req);
    const banners = await Banner.query()
      .page(page, perPage);
    const meta = pagination(banners.total, perPage, page);
    res.status(200).json({data: banners.results.map(bannerSerializer), meta});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

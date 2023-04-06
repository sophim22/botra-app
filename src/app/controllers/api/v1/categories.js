import Category from "~/app/models/Category";
import { categorySerializer } from "~/app/serializer/category";
export const list = async (_req, res) => {
  const data = await Category.query().modify("actives");

  res.status(200).json({ data: data.map(categorySerializer) });
};

export const show = async (req, res) => {
  const category = await Category.query().findOne({ uuid: req.params.id });
  if (!category) {
    return res.status(404).json({ message: "not found!" });
  }

  res.status(200).json({ data: categorySerializer(category) });
};

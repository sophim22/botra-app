import { validationResult } from "express-validator";
import Favorite from "~/app/models/Favorite";
import Property from "~/app/models/Property";
import Gallery from "~/app/models/Gallery";
import Category from "~/app/models/Category";
import { pagination, paging } from "~/app/helper/utils";
import { propertySerializer } from "~/app/serializer/property";
import { errorSerialize } from "~/app/validators/api/property";
import { groupBy } from "~/app/helper/utils";

export const list = async (req, res) => {
  const { perPage, page, query } = paging(req);
  const user = req.currentUser;
  const queryParams = {...req.query, status: "approved" };
  const data = await Property.list(user?.id, queryParams, { perPage, page });
  const meta = pagination(data.total, perPage, page);
  res.status(200).json({ data: data.results.map(propertySerializer), meta });
};


export const show = async (req, res) => {
  const id = req.params.id;
  const user = req.currentUser;
  const property = await Property.query()
    .withGraphFetched("[category, galleries, user]")
    .modify("approved")
    .findOne({ uuid: id });

  if (!property) {
    return res.status(400).json({ message: "Property not found" });
  }
  if (user) {
    const isLike =
      Number(await Favorite.query().where({ user_id: user.id, property_id: property.id }).resultSize()) > 0;
    property.is_like = isLike;
  }
  res.status(200).json({ data: propertySerializer(property || {}) });
};

export const create = async (req, res) => {
  try {
    const params = req.body;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    const user = req.currentUser;
    const images = req.files;
    if (result.errors.length) {
      return res.status(400).json(errorsMessage);
    }
    const { category_id, social_link, } = params;
    const category = await Category.query().findOne({ uuid: category_id });
    if (!category) {
      errorsMessage.category_id = "Category not found!";
      return res.status(400).json(errorsMessage);
    }
    params.category_id = category.id;
    params.user_id = user.id;
    params.status = 'pending'
    params.social_link = JSON.stringify(social_link || []);
    const permitParams = ['name', 'price_range', 'website', 'open_close_time', 'description', 'description', 'address', 'latitude', 'longitude', 'category_id', 'status', 'user_id', 'contact', 'social_link'].map(key => {
      return params[key]
    }).filter(obj => obj);
    let property = await Property.query()
      .insert(permitParams)
      .returning("*");

    for (let image of images) {
      const path = image.key || image.filename;
      await Gallery.query().insert({
        file: path,
        visible: true,
        filable_type: "Property",
        filable_id: property.id,
      });
    }

    property = await Property.query()
      .withGraphFetched("user")
      .withGraphFetched("category")
      .withGraphFetched("galleries")
      .findOne({ id: property.id });

    return res.status(200).json({ data: propertySerializer(property) });
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ error });
  }

 
};

export const update = async (req, res) => {
  const {id} = req.params;
  try {
    const params = req.body;
    const result = validationResult(req);
    const errors = groupBy(result.errors, "param");
    const errorsMessage = errorSerialize(errors);
    const images = req.files
    if (result.errors.length) {
      return res.status(400).json(errorsMessage);
    }
    const {
      category_id,
      social_link,
      image_ids,
    } = params;

    const category = await Category.query().findOne({ uuid: category_id });
    if (!category) {
      errorsMessage.category_id = "Category not found!";
      return res.status(400).json(errorsMessage);
    }
    let property = await Property.query().findOne({uuid: id});
    if (!property) {
      return res.status(400).json({ message: "Property not found" });
    }
    params.category_id = category.id;
    params.social_link = JSON.stringify(social_link || []);
    params.updated_at = new Date();
    const permitParams = ['name', 'price_range', 'website', 'open_close_time', 'description', 'address', 'latitude', 'longitude', 'category_id', 'contact', 'social_link'].map(key => {
      return params[key]
    }).filter(obj => obj);
     await  property.$query().patch(permitParams)

    if (image_ids) {
        await Gallery.query().whereIn("id", image_ids).delete();
    }
    for (let image of images) {
      const path = image.key || image.filename;
      await Gallery.query().insert({
        file: path,
        visible: true,
        filable_type: "Property",
        filable_id: property.id,
      });
    }
    property  = await Property.query()
      .withGraphFetched("user")
      .withGraphFetched("category")
      .withGraphFetched("galleries")
      .findOne({ id: property.id });
    return res.status(200).json({ data: propertySerializer(property) });
  } catch (error) {
    return res.status(400).json({ message:  error.message });
  }
}


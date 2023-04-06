import Favorite from "~/app/models/Favorite";
import Property from '~/app/models/Property';
import {pagination, paging} from "~/app/helper/utils";
import {propertySerializer} from '~/app/serializer/property';

export const list = async (req, res) => {
  const user = req.currentUser;
  const {perPage, page} = paging(req);
  const data = await Property.query()
    .joinRelated("favorites")
    .whereRaw(`favorites.user_id = ${user.id}`)
    .orderBy("created_at", "desc")
    .withGraphFetched("[category, galleries, user]")
    .modify("approved")
    .page(page, perPage);
  const meta = pagination(data.total, perPage, page);
  const results = data.results.map(obj => {
    obj.is_like = true;
    return propertySerializer(obj);
  });
  res.status(200).json({data: results, meta});
}

export const create = async (req, res) => {
  const {id} = req.params;
  const user = req.currentUser;
  const property = await Property.query().findOne({ uuid: id });
  if(!property) {
    return res.status(404).json({message: 'Not found'});
  }
  const isLike =
    Number(
      await Favorite.query()
        .where({ user_id: user.id, property_id: property.id })
        .resultSize()
    ) > 0;
  if(isLike) {
    await Favorite.query().where({user_id: user.id, property_id: property.id}).delete();
  } else {
    await Favorite.query().insert({user_id: user.id, property_id: property.id});
  }
  res.status(200).json({data: { is_like: !isLike }});
};

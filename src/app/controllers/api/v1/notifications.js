import Notification from "../../../models/Notification";
import { notificationSerializer } from "~/app/serializer/notification";
import { pagination, paging } from "../../../helper/utils";


export const notifications = async (req, res) => {
  const { perPage, page} = paging(req);
  // const  id = req.decoded.id
  try {
    // const notification = await Notification.query().joinRelated("notification_user").where("notification_user.user_id", id).page(page, perPage);
    const notification = await Notification.query().page(page, perPage);
    const meta = pagination(notification.total, perPage, page);
    res.status(200).json({ data: notification.results.map(notificationSerializer), meta });
  } catch (error) {
   res.status(400).json({ message: 'Oop, sorry. Something went wrong!' });
  }
}

export const notification = async (req, res) => {
  try {
    const notification = await Notification.query().findOne({uuid: req.params.id});
    if(!notification) {
      return res.status(404).json({message: 'Not Found!'})
    }
    res.status(200).json({ data: notificationSerializer(notification) });
  } catch (error) {
   res.status(400).json({ message: 'Oop, sorry. Something went wrong!' });
  }
}
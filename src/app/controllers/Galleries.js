import Gallery from "../models/Gallery";
import { deleteLocalObject, deleteObject } from "../../config/uploader";

class GalleriesController {
  show = async (req, res) => {
    if (req.query.load) {
      const data = await Gallery.query().findById(req.query.load);
      const source = { source: data.pathUrl, filename: data.file, id: data.id };

      return res.status(200).json({ ...source });
    }
    res.status(400).json({ success: false });
  };

  upload = async (req, res) => {
    const path = req.file.key || req.file.filename;
    const gallery = await Gallery.query()
      .insert({
        file: path,
        visible: true,
      })
      .returning("*");

    res.status(200).json({ ...gallery });
  };

  destroy = async (req, res) => {
    const gallery = await Gallery.query().findById(req.params.id);
    if (gallery) {
      await gallery.$query().delete();
      if (process.env.STORAGE === "local") {
        await deleteLocalObject(gallery.fileKey);
      } else {
        deleteObject(gallery.fileKey)
      }
    }
    res.redirect(`/directories/${gallery.filable_id}/edit`);
  };
}

export default new GalleriesController();

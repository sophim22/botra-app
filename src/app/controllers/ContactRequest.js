import helper, { groupBy } from "../helper/utils";
import ContactRequest from "../models/ContactRequest";




class ContactRequestController {
  index = async (req, res) => {
    const { page, perPage } = helper.paging(req);
    try {
      const contactrequests = await ContactRequest.query().page(page, perPage);
      const pagination = helper.pagination(contactrequests.total, perPage, page); 
      res.render("contactrequest/index", {
        title: "Contact Request",
        contactrequests,
        pagination,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  show = async (req, res) => {
    const {id} = req.params;
    try {
      const contactrequest = await ContactRequest.query().findById(id);
      res.render("contactrequest/show", {
        title: "Contact Request",
        contactrequest,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
}


export default new ContactRequestController();
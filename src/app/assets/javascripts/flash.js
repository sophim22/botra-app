import { Notyf } from "notyf";
import { isEmpty } from "./utils";
export default () => {
  const element = document.getElementById("notification");
  if (element) {
    const json = JSON.parse(element.dataset.notice);
    if (!isEmpty(json)) {
      const notyf = new Notyf({ duration: 5000 });
      Object.keys(json).map(key => {
        json[key].map(notice => {
          if (["alert", "error"].includes(key)) notyf.error(notice.message);
          if (["success", "info"].includes(key)) notyf.success(notice.message);
        });
      });
    }
  }
};

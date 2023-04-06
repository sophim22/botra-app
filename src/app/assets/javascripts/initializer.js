import * as FilePond from "filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { capitalize, camelize } from "./utils";
import axios from "axios";
import client from "./client";

global.axios = axios;
global.FilePond = FilePond;

class Initializer {
  constructor() {
    const [controller, action] = this.currentPage();
    this.initAxios();

    if (controller && client[controller]) {
      const instance = new client[controller]();

      if(instance[camelize(action)])
        instance[camelize(action)]();
    }
  }

  currentPage() {
    if (!document.body.id) return "";
    const bodyId = document.body.id.split("-");
    const action = capitalize(bodyId[1]);
    const controller = capitalize(bodyId[0]);
    return [controller, action];
  }

  initAxios() {
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    let token = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    axios.defaults.headers.common["X-CSRF-Token"] = token;
    axios.defaults.headers.common["Accept"] = "application/json";

    FilePond.registerPlugin(
      FilePondPluginFileValidateType,
      FilePondPluginImagePreview,
      FilePondPluginImageTransform
    );
    FilePond.setOptions({
      server: {
        url: "/galleries",
        revert: "/process",
        fetch: "/fetch",
        load: "/fetch",
        patch: "?patch=",
        headers: {
          "X-CSRF-TOKEN": token,
        },
      },
    });
  }
}

export default Initializer;

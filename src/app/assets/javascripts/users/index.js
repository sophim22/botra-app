import Base from "../base";
import flatpickr from "flatpickr";
import { toggleClass } from "../utils";
import Viewer from "viewerjs";
import intlTelInput from "intl-tel-input";
require("intl-tel-input/build/js/utils.js");

class Users extends Base {
  constructor(action) {
    super(action);
  }
  new() {
    const dateInput = document.getElementById("dateInput");
    flatpickr(dateInput, {});
    document.getElementById("file").addEventListener("input", this.previewFile);
    this.phoneFormat();
  }

  edit() {
    document.getElementById("file").addEventListener("input", this.previewFile);
    const dateInput = document.getElementById("dateInput");
    flatpickr(dateInput, {});
    this.phoneFormat();
  }
  show() {
    new Viewer(document.getElementById("gallery"));
    const favoriteBtn = document.getElementById("favorite-tab-btn");
    const propertyBtn = document.getElementById("property-tab-btn");
    if (favoriteBtn) favoriteBtn.addEventListener("click", this.toggleTab);
    if (propertyBtn) propertyBtn.addEventListener("click", this.toggleTab);
  }

  toggleTab() {
    toggleClass("#property", "hidden");
    toggleClass("#favorite", "hidden");
    toggleClass("#property-tab-btn", "tab-active");
    toggleClass("#favorite-tab-btn", "tab-active");
  }

  previewFile() {
    const preview = document.getElementById("preview");
    const file = document.querySelector("input[type=file]").files[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        preview.src = reader.result;
      },
      false,
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  phoneFormat() {
    const input = document.getElementById("phone");
    const countryCode = document.getElementById("country_code");
    const iti = intlTelInput(input, {
      formatOnDisplay: true,
      initialCountry: countryCode.value || "kh",
    });

    input.addEventListener("countrychange", function (e) {
      const code = iti.getSelectedCountryData().iso2;
      countryCode.value = code;
    });
  }
}

export default Users;

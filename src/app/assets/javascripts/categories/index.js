import Base from '../base';
import flatpickr from "flatpickr";

class Banners  extends Base {
  constructor(action) {
    super(action)
    this.new
  }
  index() {

  }
  new() {
    document.getElementById("file").addEventListener("input", this.previewFile);
  }
  edit() {
    document.getElementById("file").addEventListener("input", this.previewFile);
  }
   previewFile() {
    const preview = document.getElementById("visible");
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      preview.src = reader.result;
    }, false);
    if (file) {
      reader.readAsDataURL(file);
    }
  }
}

export default Banners;
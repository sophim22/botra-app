import Base from "../base";
import Viewer from 'viewerjs';
import FilerobotImageEditor from 'filerobot-image-editor';


class Categories extends Base {
  constructor(action) {
    super(action);
    this.new;
  }
  show () {
    new Viewer(document.getElementById("gallery"))
  }
  index() {}
  new() {
  document.getElementById("file").addEventListener("input", this.imageEditor);
  }
  edit() {
    document.getElementById("file").addEventListener("input", this.imageEditor);
    const source =  document.getElementById("visible").src;
  }
  previewFile() {
    const preview = document.getElementById("visible");
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
  
  imageEditor (){
    const { TABS, TOOLS } = FilerobotImageEditor
    const file = document.querySelector("input[type=file]").files[0];
    const reader = new FileReader();
    const fileReader = reader.readAsDataURL(file);
    const config = {
      onSave: (editedImageObject, designState) => console.log('saved', editedImageObject, designState),
      annotationsCommon: {
        fill: '#ff0000'
      },
      Text: { text: 'Filerobot...' },
      tabsIds: [TABS.ADJUST], // or ['Adjust', 'Annotate', 'Watermark']
      defaultTabId: TABS.ADJUST, // or 'Annotate'
      toolbarIds:[],
      isLowQualityPreview: false,
    };
    const filerobotImageEditor = new FilerobotImageEditor(
      document.querySelector('#editor_container'),
      config,
      );
    reader.addEventListener(
      "load",
      function () {
        filerobotImageEditor.render({
          useZoomPresetsMenu: true,
          Crop: {
            ratio: 1.77,
          },
          avoidChangesNotSavedAlertOnLeave: true,
          onModify: (editedImageObject, designState) => {
            const getValue  = document.querySelector(`#editor_container label[title="Saved image size (width x height)"]`).textContent
            const getSize =   getValue.replace('px', '').split(" x ")
            document.getElementById("image-adjustments").value = JSON.stringify({...editedImageObject.adjustments.crop, size: {width: getSize[0], height: getSize[1]}});
        
          },
          disableZooming: true,
          source: reader.result,
        })
      },
      false,
    );
  }
}

export default Categories;

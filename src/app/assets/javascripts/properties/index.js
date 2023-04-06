import Base from "../base";
import Swal from "sweetalert2";
import Viewer from 'viewerjs';
import FilerobotImageEditor from 'filerobot-image-editor';
import {v4 as uuidv4} from 'uuid';


class Properties extends Base {
  constructor(action) {
    super(action);
    this.fileEditor = null
    this.previewEvent = {}
    this.removeEvent = {}
  }
  show() {
    new Viewer(document.getElementById("gallery"))
    this.handleReject();
    this.handleApprove();
    const mapEle = document.getElementById("map");
    const lat = mapEle.dataset.latitude || 13.3450459;
    const lng = mapEle.dataset.longitude || 103.476156;
    const zoom = 13;

    var myCoords = new google.maps.LatLng(lat, lng);
    var mapOptions = {
      center: myCoords,
      zoom,
    };

    var map = new google.maps.Map(mapEle, mapOptions);
    new google.maps.Marker({
      position: myCoords,
      animation: google.maps.Animation.DROP,
      map: map,
      draggable: false,
    });
  }
  new() {
    this.initSocialLink();
    this.renderSocialList();
    this.removeRow();
    this.initMap();
    this.initImage();
    this.handleFileInput();
    this.removeInput();
  }

  edit() {
    this.renderSocialList();
    this.initSocialLink();
    this.removeRow();
    this.initMap();
    this.initImage();
    this.handleFileInput();
    this.removeInput();
  }

  initMap() {
    console.log("initMap")
    var lat = document.getElementById("property-latitude").value;
    var lng = document.getElementById("property-longitude").value;
    const zoom = 13;
    if (!lat || !lng) {
      lat = 13.364047;
      lng = 103.860313;
      document.getElementById("property-latitude").value = lat;
      document.getElementById("property-longitude").value = lng;
    }

    var myCoords = new google.maps.LatLng(lat, lng);
    var mapOptions = {
      center: myCoords,
      zoom,
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var marker = new google.maps.Marker({
      position: myCoords,
      animation: google.maps.Animation.DROP,
      map: map,
      draggable: true,
    });
    marker.addListener("drag", function () {
      document.getElementById("property-latitude").value = marker.getPosition().lat();
      document.getElementById("property-longitude").value = marker.getPosition().lng();
    });



    marker.addListener("dragend", function () {
      map.panTo(marker.getPosition());
    });
    const input = document.getElementById("search-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
       marker.setPosition(places[0].geometry.location);
      document.getElementById("property-latitude").value = marker.getPosition().lat();
      document.getElementById("property-longitude").value = marker.getPosition().lng();
      if (places.length == 0) {
        return;
      }
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        const icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
      google.maps.event.addDomListener(window, 'load', initAutocomplete);
    });
  }

  renderSocialList() {
    const socials = document.getElementById("social-list").dataset.value;

    if (socials == undefined) return;
    const socialWrapper = document.getElementById("social-link-wrapper");
    const socialArr = JSON.parse(socials);
    Array.isArray(socialArr) &&
      socialArr.forEach((social, index) => {
        const renderSocial = this.renderSocialRow(index, social);
        socialWrapper.innerHTML += renderSocial;
      });
  }

  initSocialLink() {
    const checkPage = document.getElementById("properties-new")
    if(!checkPage) return;
    const socialWrapper = document.getElementById("social-link-wrapper");
    const uuid = Math.floor(Math.random() * 100) + 1;
    const renderSocial = this.renderSocialRow(uuid);
    const wrapper = document.createElement("div");
    wrapper.innerHTML += renderSocial;
    socialWrapper.appendChild(wrapper);
    this.removeRow();
    const addBtn = document.getElementById("add-social-link");
    addBtn.addEventListener("click", () => {
      const socialWrapper = document.getElementById("social-link-wrapper");
      const uuid = Math.floor(Math.random() * 100) + 1;
      const renderSocial = this.renderSocialRow(uuid);
      const wrapper = document.createElement("div");
      wrapper.innerHTML += renderSocial;
      socialWrapper.appendChild(wrapper);
      this.removeRow();
    });
   
  }

  removeRow() {
    const removeBtns = document.getElementsByClassName("remove-social");
    for (const removeBtn of removeBtns) {
      removeBtn.addEventListener("click", event => {
        event.currentTarget.parentElement.remove();
      });
    }
  }

  renderSocialRow(index, value = {}) {
    return `
    <div class="social-row flex items-center mt-4">
      <div class="w-full">
        <label>Social Type<span class="ml-1 text-red-500">*</span></label>
        <select class="w-full px-4 py-2 mt-2 border rounded-md" name='property[social_link][${index}][social_type]' required>
          <option value='facebook' ${value.social_type == "facebook" && "selected"}>Facebook</option>
          <option value='instagram' ${value.social_type == "instagram" && "selected"}>Instagram</option>
          <option value='twitter' ${value.social_type == "twitter" && "selected"}>Twitter</option>
          <option value='line' ${value.social_type == "line" && "selected"}>Line</option>
          <option value='tiktok' ${value.social_type == "tiktok" && "selected"}>TIKTOK</option>
        </select>
      </div>
      <div class="mx-2 w-full">
        <label>Name<span class="ml-1 text-red-500">*</span></label>
        <input class="w-full px-4 py-2 mt-2 border rounded-md" name='property[social_link][${index}][name]' type='text' value="${
    value.name || ""  
  }" required/>
      </div>
      <div class="mx-2 w-full">
        <label>Link<span class="ml-1 text-red-500">*</span></label>
        <input class="w-full px-4 py-2 mt-2 border rounded-md" name='property[social_link][${index}][link]' type='url' value="${
    value.link || ""
  }" required/>
      </div>
      <a class="border-red-500 text-white bg-red-500 remove-social rounded mx-1 p-2 mt-7 cursor-pointer" >Delete</a>
    </div>
  `;
  }

  handleReject() {
    const rejectBtn = document.getElementById("reject");
    if (rejectBtn) {
      rejectBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Are you sure to reject?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        }).then(result => {
          if (result.value) {
            const url = rejectBtn.dataset.url;
            window.location = url;
          }
        });
      });
    }
  }

  handleApprove() {
    const approveBtn = document.getElementById("approve");
    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Are you sure to approve?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        }).then(result => {
          if (result.value) {
            const url = approveBtn.dataset.url;
            window.location = url;
          }
        });
      });
    }
  }
  initImage () {
    const { TABS, TOOLS } = FilerobotImageEditor
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
    this.fileEditor = new FilerobotImageEditor(
      document.querySelector('#editor_container'),
      config,
      );
    const imageWrapper = document.getElementById("files-wrapper");
    const uuid = uuidv4();
    const renderImage = this.renderImageRow(uuid);
    const wrapper = document.createElement("div");
    wrapper.innerHTML += renderImage;
    imageWrapper.appendChild(wrapper);
    this.handleFileInput(uuid)
    this.removeInput(uuid)
    const self = this;
    const addBtn = document.getElementById("add-file");
    addBtn.addEventListener("click", () => {
      const imageWrapper = document.getElementById("files-wrapper");
      const uuid = uuidv4();
      const renderImage = this.renderImageRow(uuid);
      const wrapper = document.createElement("div");
      wrapper.innerHTML += renderImage;
      imageWrapper.appendChild(wrapper);
      self.handleFileInput(uuid)
      self.removeInput(uuid)
    });

    ;
    
  }
  imageEditor(source, uuid) {
    const inputValue = document.getElementById(`property-image-adjustments-${uuid}`).value;
    let dataValue
    if(inputValue){
      dataValue = JSON.parse(inputValue)
    }
    this.fileEditor.render({
      useZoomPresetsMenu: true,
      Crop: {
        ratio: 1.77,
      },
      source,
      avoidChangesNotSavedAlertOnLeave: true,
      onModify: (editedImageObject, designState) => {
        const getValue  = document.querySelector(`#editor_container label[title="Saved image size (width x height)"]`).textContent
        const getSize =   getValue.replace('px', '').split(" x ")
        document.getElementById(`property-image-adjustments-${uuid}`).value = JSON.stringify({...editedImageObject.adjustments.crop, size: {width: getSize[0], height: getSize[1]}});
      },
    })
  }

  handleFileInput(uuid) {
      const input = document.getElementById(`file-picker-${uuid}`);
      if(!input){
        return
      }
      const self = this;
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          const reader = new FileReader();
          const fileReader = reader.readAsDataURL(input.files[0]);
          const preview = document.getElementById(`file-picker-preview-${uuid}`);  
          reader.addEventListener(
              "load",
              function () {
                self.imageEditor(reader.result, uuid)
                preview.src = reader.result;
              },
              false,
            );
          this.handleImageClick(uuid)
        }
      });

   
  }

  removeInput(uuid) {
    const self = this;
    const removeId = `remove-input-${uuid}`
    const removeBtns = document.getElementById(removeId);
    const divParent = document.getElementById(uuid);
    if (this.removeEvent[removeId]) {
      return ;
    }
    if (removeBtns) {
      removeBtns.addEventListener('click', () => {
        divParent.parentElement.remove();
      });
    }
    this.removeEvent[removeId] = removeBtns
  }

  handleImageClick (uuid) {
    const self = this
    const previewId = `file-picker-preview-${uuid}`
    const preview = document.getElementById(previewId);
    if (this.previewEvent[previewId]) {
      return ;
    }
    preview.addEventListener('click', () => {
      // self.fileEditor.render({source: preview.src})
      self.imageEditor(preview.src, uuid)
    });
    this.previewEvent[previewId] = preview 
  }

  renderImageRow(index, value) {
    return `
      <div class="image-row flex items-center mt-4" id=${index}>
        <div class="w-full">
        <label for="file-picker-${index}" class="cursor-pointer mr-2 py-1 px-2 rounded-md border-0 text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600">Choose File</label>
        <a class="cursor-pointer mr-2 py-1 px-2 rounded-md border-0 text-sm font-semibold bg-red-500 text-white hover:bg-red-600" id="remove-input-${index}" >Delete</a>
            <input id="file-picker-${index}" class='hidden' name='files' type='file'>
            <img id="file-picker-preview-${index}" class="w-48 h-32 object-cover mt-2 cursor-pointer" />
            <input type="hidden" name="adjustments" id="property-image-adjustments-${index}"/>
        </div>
      </div>
    `;
  }

}

export default Properties;

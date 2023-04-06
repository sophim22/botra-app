import Compressor from "compressorjs";

export const isEmpty = obj =>
  [Object, Array].includes((obj || {}).constructor) &&
  !Object.entries(obj || {}).length;
export const base64ToBlob = url => {
  return fetch(url).then(res => res.blob());
};

export const csrfToken = () => {
  return document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
};

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const compressFile = file => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      success(result) {
        resolve(result);
      },
      error(err) {
        resolve(file);
      }
    });
  });
};

export const toggleClass = (selector, className) => {
  if (!selector || !className) return;
  const elements = document.querySelector(selector);
  if (elements.classList.contains(className)) {
    elements.classList.remove(className);
    return;
  }

  elements.classList.add(className);
};

export function b64toBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/jpeg" });
}

export const capitalize = (value) =>
  value.replace(/(^|\s)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

export const camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return "";
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

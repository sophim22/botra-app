import axios from "axios";
import Swal from "sweetalert2";

const isEmpty = obj => {
  return (
    [Object, Array].includes((obj || {}).constructor) &&
    !Object.entries(obj || {}).length
  );
};

export const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  return Object.assign(element, options);
};

export const csrfToken = () => {
  return document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
};

const remoteAction = async (url, element, callback) => {
  try {
    await axios.delete(url, {
      headers: {accept: "application/json", "csrf-token": csrfToken()}
    });
    if (element) element.remove();
    if (callback) callback();
  } catch (e) {
    alert(e.message);
  }
};

const createFormData = (action, method) => {
  const form = createElement("form", {action: action, method: "POST"});
  document.body.appendChild(form);

  const token = csrfToken();
  if (token) {
    const csrfInput = createElement("input", {
      type: "hidden",
      value: token,
      name: "_csrf"
    });
    form.appendChild(csrfInput);
  }
  const methodElement = createElement("input", {
    name: "_method",
    value: method.toUpperCase(),
    type: "hidden"
  });
  form.appendChild(methodElement);
  form.submit();
};

const handleToggleButton = () => {
  const uploader = document.getElementById("uploader");
  uploader.style.display = "flex";
};

export const setupDataMethod = element => {
  const validDataMethods = ["delete", "put", "patch", 'post'];
  const dataset = element.dataset || {};
  const callback = dataset.callback;
  const isRemote = (dataset.remote && dataset.remote == "true") || false;
  const target = dataset.target || "self";
  const method = dataset.method.toLowerCase();
  const message = dataset.message;
  if (validDataMethods.includes(method)) {
    element.addEventListener("click", async e => {
      e.preventDefault();
      if (element.href) {
        if (isEmpty(message)) {
          if (isRemote) {
            const removeElement =
              target === "parent" ? element.parentElement : element;
            const callbackFnc = () => {
              if (callback === "#uploader") {
                handleToggleButton();
              }
            };
            remoteAction(element.href, removeElement, callbackFnc);

            return;
          }
          createFormData(element.href, method);
          return false;
        }
        const response = await Swal.fire({
          title: message,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33"
        });

        if (response && response.value) {
          if (isRemote) {
            const removeElement =
              target === "parent" ? element.parentElement : element;
            const callbackFnc = () => {
              if (callback === "#uploader") {
                handleToggleButton();
              }
            };
            remoteAction(element.href, removeElement, callbackFnc);

            return;
          }
          createFormData(element.href, method);
        } else {
          return false;
        }
      }
    });
  }
};
const initDataMethod = () => {
  const elements = document.querySelectorAll("[data-method]");
  elements.forEach(element => {
    setupDataMethod(element);
  });
};

document.addEventListener("turbolinks:load", () => {
  initDataMethod();
});

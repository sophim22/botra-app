export const loadFileUploader = () => {
  const inputElements = document.querySelectorAll('input[type="file"]');
  let token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  for (const inputElement of inputElements) {
    let files = [];
    const icon = inputElement.dataset.icon
      ? `<i class="${inputElement.dataset.icon} w-5 h-5 mr-2"> </i>`
      : "";
    const labelIdle =
      icon +
      `Drag Drop your files or
      <span class="filepond--label-action" tabindex="0">
          Browse
      </span>`;

    const oldValue = document.getElementById(`${inputElement.id}-wrapper`)
      .dataset.value;

    const oldValues = document.getElementById(`${inputElement.id}-wrapper`)
      .dataset.values;

    if(oldValue && oldValue !== 'undefined') {
      files.push({
        source: oldValue,
        options: {
          type: 'local'
        }
      })
    }

    if (oldValues && oldValues !== "undefined") {
      JSON.parse(oldValues).map((value) => {
        files.push({
          source: value.id,
          options: {
            type: "local",
          },
        });
      });
    }

    // FilePond.create(inputElement, {
    //   labelIdle,
    //   imagePreviewMaxHeight: 468,
    //   imageTransformOutputQuality: 80,
    //   acceptedFileTypes: ["image/png", "image/jpg", "image/jpeg"],
    //   files,
    //   server: {
    //     url: "/galleries",
    //     revert: "/process",
    //     process: {
    //       url: "/process",
    //       method: "POST",
    //       ondata: (formData) => {
    //         const fd = new FormData();
    //         const data = formData
    //           .getAll(inputElement.name)
    //           .filter((input) => input instanceof File);
    //         data.map((input) => {
    //           fd.append("image", input);
    //         });

    //         fd.append("field", inputElement.name);
    //         return fd;
    //       },
    //     },
    //     headers: {
    //       "X-CSRF-TOKEN": token,
    //     },
    //     load: async (source, load) => {
    //       try {
    //         const data = (await axios.get(`/galleries?load=${source}`)).data;
    //         const request = new Request(data.source);
    //         const response = await fetch(request.url);
    //         const blob = await response.blob();
    //         blob.name = data.filename;

    //         load(blob);
    //       } catch (err) {}
    //     },
    //     remove: async (source, load, error) => {
    //       try {
    //         await axios.delete(`/galleries/${source}`);
    //         load();
    //       } catch (error) {}
    //     },
    //   },
    // });
  }
}
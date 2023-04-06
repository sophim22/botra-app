import flatpickr from "flatpickr";
class Common {
  constructor() {
    this.sidebar();
    this.initDatepicker();
  }
  sidebar() {
    // SET ANIMATION ON MENU DROP DOWN
    let isChildActive = false;
    const submenu = document.querySelector('.parent');
    const child = document.querySelector('.child');
    if (submenu) {
      submenu.addEventListener('click', function () {
        isChildActive = !isChildActive;
        if (isChildActive) {
          child.classList.remove('child');
          child.classList.add('child-active');
          submenu.classList.add('parent-active');
        } else {
          child.classList.remove('child-active');
          child.classList.add('child');
          submenu.classList.remove('parent-active');
        }
      })
    }
    // OPEN MENU TOGGLE
    const openToggle = document.querySelector('#open-toggle');
    const closeToggle = document.querySelector('#close-toggle');
    const toggleMenu = document.querySelector('.toggle-menu');
    if (openToggle) {
      openToggle.addEventListener('click', function () {
        toggleMenu.classList.remove('toggle-inActive');
        toggleMenu.classList.add('toggle-active');
        openToggle.classList.remove('block');
        openToggle.classList.add('hidden');
        closeToggle.classList.remove('hidden');
        closeToggle.classList.add('block');
      })
    }
    // CLOSE MENU TOGGLE
    if (closeToggle) {
      closeToggle.addEventListener('click', function () {
        toggleMenu.classList.remove('toggle-active');
        toggleMenu.classList.add('toggle-inActive');
        closeToggle.classList.remove('block');
        closeToggle.classList.add('hidden');
        openToggle.classList.remove('hidden');
        openToggle.classList.add('block');
      })
    }
  }
  initDatepicker() {
    const dateInput = document.querySelectorAll("#dateInput");
    flatpickr(dateInput, {});
  }
}

export default Common;
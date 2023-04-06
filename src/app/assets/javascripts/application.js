import Turbolinks from "turbolinks";
import flash from "./flash";
import Initializer from "./initializer";
import Common from "./commons";
import './data_method';
const $ = document.querySelector.bind(document);
window.$ = $;
Turbolinks.start();

document.addEventListener('turbolinks:load', () => {
  new Initializer();
  new Common();
  flash();
});

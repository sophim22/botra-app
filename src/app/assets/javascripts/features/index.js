import Base from '../base';
import Choices from 'choices.js';
import Sortable from 'sortablejs';
import axios from 'axios';


class Features  extends Base {
  constructor(action) {
    super(action)
    this.new
  }
  index() {
    const sortable = Sortable.create(document.getElementById('features-list'), {
      animation: 150,
      ghostClass: 'blue-background-class',
      draggable: '.item',
      onEnd: (evt) => {
        const tableRows = document.querySelectorAll('#features-list tr');
        const newIds = [];
        (tableRows).forEach((element, index) => {
          newIds.push({id: element.dataset.id, order: index + 1})
        });
        const feature_id = evt.item.dataset.id;
        const url = `/v1/features/${feature_id}/update_order`;
        const updateOrder = async () => {
          try {
            const response = await axios.put(url, {
              features: newIds
            });
          } catch (error) {
            throw new Error(error);
          }
        }
        updateOrder();
      }
      
    });
  }
  addProperty() {
    const choice = new Choices("#js-choice", {
      removeItems: true,
      removeItemButton: true
    });
  }
}

export default Features;
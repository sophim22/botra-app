class Base {
  constructor(action) {
    this.action = action;
    if (action) this[action]();
  }

  index() {
    console.log("call from base class index");
  }
  show() {
    console.log("call from base class show");
  }
  edit() {
    console.log("call from base class edit");
  }
  create() {
    this.new()
    console.log("call from base class create");
  }
  update() {
    this.edit()
    console.log("call from base class update");
  }
  new() {
    console.log("call from base class new");
  }
}

export default Base;

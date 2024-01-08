class WidgetCollection {
  constructor(defaultWidget) {
    this.factory = new Map();
    this.typeList = [];
    this.defaultWidget = defaultWidget;
  }

  addByType(widget, type) {
    if (typeof widget == "undefined") {
      console.warn("Undefined widget");
      return;
    }
    if (!this.typeList.includes(type)) {
      this.typeList.push(type);
    }

    if (this.factory.has(type)) {
      this.factory.delete(type);
    }

    this.factory.set(type, widget);
  }

  getByType(type) {
    let widget = {};

    if (this.factory.has(type)) {
      widget = this.factory.get(type);
      return widget;
    }

    console.warn("Unknown type: Using default");
    widget = this.defaultWidget;

    return widget;
  }

  getDefault() {
    return this.defaultWidget;
  }

  setDefault(defaultWidget) {
    if (typeof defaultWidget == "undefined") {
      console.warn("Undefined widget");
      return;
    }
    this.defaultWidget = defaultWidget;
  }
}

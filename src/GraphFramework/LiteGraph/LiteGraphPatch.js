// monkey patching of the original litegraph.js is done here.

(function (LiteGraph) {
  LiteGraph.visualWidgets = new WidgetCollection(Widget_Blank);

  LiteGraph.addVisualWidgetByType = function (widget, type) {
    this.visualWidgets.addByType(widget, type);
  };

  LiteGraph.getVisualWidgetByType = function (type) {
    return this.visualWidgets.getByType(type);
  };

  LiteGraph._registerNodeType = LiteGraph.registerNodeType;
  LiteGraph.registerNodeType = function (type, base_class) {
    var pos = type.lastIndexOf("/");
    if (pos > -1) {
      base_class.title = type.substr(pos + 1, type.length);
    }

    this._registerNodeType(type, base_class);
  };

  LiteGraph.computeTextWidth = function (text, fontSize) {
    if (!text) {
      return 0;
    }

    let t = text.toString();

    if (typeof fontSize === "undefined")
      return LiteGraph.NODE_TEXT_SIZE * t.length * 0.6;

    return LiteGraph.NODE_TEXT_SIZE * t.length * fontSize;
  };

  LiteGraph.LGraphNode.prototype._addProperty =
    LiteGraph.LGraphNode.prototype.addProperty;
})(LiteGraph);

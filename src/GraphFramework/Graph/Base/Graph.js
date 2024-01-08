class Graph extends LGraph {
  constructor(o) {
    super(o);
    this.registerWidgetByType("BOOL", Widget_Bool);
    this.registerWidgetByType("NUMBER", Widget_Number);
    this.registerWidgetByType("COMBO", Widget_Combo);
    this.registerWidgetByType("SLIDER", Widget_Slider);
    this.registerWidgetByType("SEPARATOR", Widget_Separator);
    this.registerWidgetByType("BLANK", Widget_Blank);
  }

  install = function (nodePack) {
    nodePack.RegisterWithGraph(this);
  };

  registerNodeByType = function (type, node) {
    LiteGraph.registerNodeType(type, node);
  };

  registerWidgetByType = function (type, widget) {
    LiteGraph.addVisualWidgetByType(widget, type);
  };

  attachCanvas(graphcanvas) {
    if (graphcanvas.constructor != GraphCanvas) {
      throw "attachCanvas expects a GraphCanvas instance";
    }
    if (graphcanvas.graph && graphcanvas.graph != this) {
      graphcanvas.graph.detachCanvas(graphcanvas);
    }

    graphcanvas.graph = this;

    if (!this.list_of_graphcanvas) {
      this.list_of_graphcanvas = [];
    }
    this.list_of_graphcanvas.push(graphcanvas);
  }
}

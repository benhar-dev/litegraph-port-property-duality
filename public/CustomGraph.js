/**
 * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
 *
 * @param {Object} node: the parent Node.
 * @param {Object} property: the Property object.
 * @param {Object} options: the object that contains special properties of this widget.
 *
 * a Property object has "name", "default value", "type" properties, plus any extra properties supplied by options.
 *
 * property.name
 * property.default_value
 * property.type
 * property.label (supplied by options)
 */
class WidgetBase {
  constructor(node, property, options) {
    this.parentNode = node;
    this.readOnly = false;
    this.labelFont = "12px Arial";
    this.valueFont = "12px Arial";
    this.readOnlyValueFont = "italic 12px Arial";
    this.value = null;
    this.margin = 20;
    this.outline_color = LiteGraph.WIDGET_OUTLINE_COLOR;
    this.background_color = LiteGraph.WIDGET_BGCOLOR;
    this.text_color = LiteGraph.WIDGET_TEXT_COLOR;
    this.secondary_text_color = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
    this.value_color = LiteGraph.WIDGET_TEXT_COLOR;
    this.secondary_value_color = "#555555";
    this.size = new Float32Array([0, 0]);
    this.visible = true;
    this.auto_update_node_size = false;

    if (!options) {
      options = {};
    }

    if (property) {
      if (typeof property.name !== "undefined") {
        options.property = property.name;
      }

      if (typeof property.default_value !== "undefined") {
        this.value = property.default_value;
      }

      if (typeof property.name !== "undefined") {
        this.label = property.name;
      } else {
        this.label = "<label>";
      }
    }

    if (options.label) {
      this.label = options.label;
    }

    if (typeof options.defaultValue !== "undefined") {
      this.value = options.defaultValue;
    }

    if (typeof options.readOnly !== "undefined") {
      this.readOnly = options.readOnly;
    }

    if (typeof options.disabled !== "undefined") {
      this.disabled = options.disabled;
    }

    if (options.callback && options.callback.constructor !== Function) {
      console.warn("Custom widget: Callback must be a function");
    }

    this.options = options;
    this.callback = options.callback;

    if (this.options.y !== undefined) {
      this.y = this.options.y;
    }
  }

  computeSize() {
    if (this.onComputeSize) {
      this.size = this.onComputeSize(this.size);
    } else {
      this.size[0] = LiteGraph.computeTextWidth(this.label);
      this.size[0] += LiteGraph.computeTextWidth(this.value);
      this.size[0] += 60;
      this.size[1] = LiteGraph.NODE_WIDGET_HEIGHT;
    }

    return this.size;
  }

  draw(ctx, node, widget_width, y, H) {
    ctx.save();

    if (this.visible) {
      if (this.onDraw) {
        ctx.textAlign = "left";
        this.onDraw(ctx, node, widget_width, y, H);
      }
    }

    ctx.restore();
  }

  mouse(event, pos, node) {
    if (!this.visible) {
      return true;
    }

    if (this.readOnly) {
      return true;
    }

    if (this.onMouse) {
      this.onMouse(event, pos, node);
    }

    return true;
  }

  changeValue(value, node) {
    if (this.onChangeValue) {
      if (!this.onChangeValue(value, node)) {
        return;
      }
    } else {
      if (this.value == value) {
        return;
      }
    }

    if (this.callback) {
      if (!this.callback(value, node)) {
        return;
      }
    }

    this.value = value;

    if (
      this.options &&
      this.options.property &&
      node.properties[this.options.property] !== undefined
    ) {
      node.setProperty(this.options.property, value);
    }

    if (this.auto_update_node_size) node.setSize(node.computeSize());

    node.setDirtyCanvas(true, true);
  }

  hide() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }
}

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

class Widget_Blank extends WidgetBase {
  constructor() {
    super();
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.fillStyle = this.background_color;
    ctx.beginPath();
    ctx.roundRect(this.margin, y, drawWidth, H, H * 0.5);
    ctx.fill();
    ctx.stroke();
  }
}

class Widget_Bool extends WidgetBase {
  constructor(node, property, options) {
    super(node, property, options);
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.fillStyle = this.background_color;
    ctx.beginPath();
    ctx.roundRect(this.margin, y, drawWidth, H, H * 0.5);
    ctx.fill();
    ctx.stroke();

    // draw the status circle
    ctx.fillStyle = this.value ? "#89A" : "#333";
    ctx.beginPath();
    ctx.arc(drawWidth + 4, y + H * 0.5, H * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // draw the label text
    ctx.font = this.labelFont;
    ctx.fillStyle = this.secondary_text_color;
    if (this.label != null) {
      ctx.fillText(this.label, this.margin * 2 + 5, y + H * 0.7);
    }

    // draw the value text
    ctx.font = this.readOnly ? this.readOnlyValueFont : this.valueFont;
    ctx.fillStyle = this.value ? this.value_color : this.secondary_text_color;
    ctx.textAlign = "right";
    ctx.fillText(
      this.value ? this.options.on || "true" : this.options.off || "false",
      drawWidth - 20,
      y + H * 0.7
    );
  }

  onMouse(event, pos, node) {
    var widget = this;
    var value = widget.value;
    if (event.type == "mousedown") {
      value = !value;
      super.changeValue(value, node);
    }
  }
}

class Widget_Combo extends WidgetBase {
  constructor(node, property, options) {
    super(node, property, options);
  }

  onComputeSize(size) {
    var maxValueWidth = 0;

    if (this.options && this.options.values && this.options.values.length) {
      for (var i = 0, j = this.options.values.length; i < j; i++) {
        maxValueWidth = Math.max(
          maxValueWidth,
          LiteGraph.computeTextWidth(this.options.values[i])
        );
      }
    }

    size[0] = maxValueWidth;
    size[0] += LiteGraph.computeTextWidth(this.label);
    size[0] += 60;
    size[1] = LiteGraph.NODE_WIDGET_HEIGHT;

    return size;
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.fillStyle = this.background_color;
    ctx.beginPath();
    ctx.roundRect(this.margin, y, drawWidth, H, H * 0.5);
    ctx.fill();
    ctx.stroke();

    // draw the +/- triangles
    ctx.fillStyle = this.text_color;
    ctx.beginPath();
    ctx.moveTo(this.margin + 16, y + 5);
    ctx.lineTo(this.margin + 6, y + H * 0.5);
    ctx.lineTo(this.margin + 16, y + H - 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(widget_width - this.margin - 16, y + 5);
    ctx.lineTo(widget_width - this.margin - 6, y + H * 0.5);
    ctx.lineTo(widget_width - this.margin - 16, y + H - 5);
    ctx.fill();

    // draw the label text
    ctx.font = this.labelFont;
    ctx.fillStyle = this.secondary_text_color;
    if (this.label != null) {
      ctx.fillText(this.label, this.margin * 2 + 5, y + H * 0.7);
    }

    // draw the value text
    ctx.font = this.readOnly ? this.readOnlyValueFont : this.valueFont;
    ctx.fillStyle = this.value_color;
    ctx.textAlign = "right";
    var v = this.value;
    if (this.options.values) {
      var values = this.options.values;
      if (values.constructor === Function) values = values();
      if (values && values.constructor !== Array) v = values[this.value];
    }
    ctx.fillText(v, drawWidth - 20, y + H * 0.7);
  }

  onMouse(event, pos, node) {
    var widget = this;
    var value = widget.value;
    var x = pos[0]; // - node.pos[0];
    var y = pos[1]; // - node.pos[1];
    var widget_width = node.size[0];
    var ref_window = event.target.data.getCanvasWindow();

    if (event.type == "mousedown") {
      var values = widget.options.values;
      if (values && values.constructor === Function) {
        values = w.options.values(widget, node);
      }
      var values_list = null;
      values_list = values.constructor === Array ? values : Object.keys(values);

      var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0; // delta = -1, 1 or 0 (left arrow, right arrow or in between)

      if (delta) {
        // clicked in arrow
        var index = -1;
        this.last_mouseclick = 0; // avoids double click event
        if (values.constructor === Object)
          index = values_list.indexOf(String(value)) + delta;
        else index = values_list.indexOf(value) + delta;
        if (index >= values_list.length) {
          index = values_list.length - 1;
        }
        if (index < 0) {
          index = 0;
        }

        if (values.constructor === Array) {
          value = values[index];
        } else {
          value = index;
        }

        super.changeValue(value, node);
      } else {
        //combo clicked
        var text_values =
          values != values_list ? Object.values(values) : values;
        var menu = new LiteGraph.ContextMenu(
          text_values,
          {
            scale: 1, //Math.max(1, this.ds.scale),
            event: event,
            className: "dark",
            callback: function (v) {
              value = v;
              widget.changeValue(value, node);
            },
          },
          ref_window
        );
      }
    }
  }
}

class Widget_Number extends WidgetBase {
  // This widget accepts the following constructor arguments
  // -------------------------------------------------------
  // node - parent node
  // property - the property the widget is linked to (and shall keep updated)
  // options - shown below

  // This widget accepts the following options as an object
  // -------------------------------------------------------
  // options.min - user defined minimum value, if no value is given then the iec minimum will be used
  // options.max - user defined maximum value, if no value is given then the iec maximum will be used
  // options.step - how many places the widget will count up per click / move (can be used for counting in odd, even numbers)
  // options.precision - how many decimal places are displayed
  // options.onlyEven (true / false) - limits the value to only even numbers;
  // options.onlyOdd (true / false) - limits the value to only odd numbers;

  constructor(node, property, options) {
    super(node, property, options);

    this.precision =
      typeof options.precision !== "undefined" ? options.precision : 0;
    this.step = options.step || 1 / Math.pow(10, this.precision);

    this.minimum =
      typeof options.min !== "undefined" ? options.min : -Number.MAX_VALUE;
    this.maximum =
      typeof options.max !== "undefined" ? options.max : Number.MAX_VALUE;

    this.onlyOdd = options && options.onlyOdd ? true : false;
    this.onlyEven = options && options.onlyEven ? true : false;

    if (this.onlyOdd || this.onlyEven) {
      this.precision = 0;
      this.step = 1;
    }

    this.limitMinimum =
      (this.onlyOdd && this.minimum % 2 == 0) ||
      (this.onlyEven && !(this.minimum % 2 == 0))
        ? this.minimum + 1
        : this.minimum;
    this.limitMaximum =
      (this.onlyOdd && this.maximum % 2 == 0) ||
      (this.onlyEven && !(this.maximum % 2 == 0))
        ? this.maximum - 1
        : this.maximum;

    if (
      (this.onlyOdd && this.value % 2 == 0) ||
      (this.onlyEven && !(this.value % 2 == 0))
    ) {
      this.value += 1;
    }

    this.value = Math.min(
      Math.max(this.value, this.limitMinimum),
      this.limitMaximum
    );
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.fillStyle = this.background_color;
    ctx.beginPath();
    ctx.roundRect(this.margin, y, drawWidth, H, H * 0.5);
    ctx.fill();
    ctx.stroke();

    // draw the +/- triangles
    if (!this.readOnly) {
      ctx.fillStyle = this.text_color;
      ctx.beginPath();
      ctx.moveTo(this.margin + 16, y + 5);
      ctx.lineTo(this.margin + 6, y + H * 0.5);
      ctx.lineTo(this.margin + 16, y + H - 5);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(widget_width - this.margin - 16, y + 5);
      ctx.lineTo(widget_width - this.margin - 6, y + H * 0.5);
      ctx.lineTo(widget_width - this.margin - 16, y + H - 5);
      ctx.fill();
    }

    // draw the label text
    ctx.font = this.labelFont;
    ctx.fillStyle = this.secondary_text_color;
    if (this.label != null) {
      ctx.fillText(this.label, this.margin * 2 + 5, y + H * 0.7);
    }

    // draw the value text
    ctx.font = this.readOnly ? this.readOnlyValueFont : this.valueFont;
    ctx.fillStyle = this.value_color;
    ctx.textAlign = "right";
    ctx.fillText(
      Number(this.value).toFixed(this.precision),
      drawWidth - 20,
      y + H * 0.7
    );
  }

  onMouse(event, pos, node) {
    let value = this.value;
    let x = pos[0];
    let y = pos[1];
    let widget_width = node.size[0];

    if (event.type == "mousemove") {
      let preCheckValue = value + event.deltaX * this.step;

      if (
        (this.onlyOdd && preCheckValue % 2 == 0) ||
        (this.onlyEven && !(preCheckValue % 2 == 0))
      ) {
        if (event.deltaX <= -1) preCheckValue -= 1;
        if (event.deltaX >= 1) preCheckValue += 1;
      }

      value = Math.min(
        Math.max(preCheckValue, this.limitMinimum),
        this.limitMaximum
      );

      super.changeValue(value, node);
    } else if (event.type == "mousedown") {
      let delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0; // delta = -1, 1 or 0 (left arrow, right arrow or in between)

      value += delta * this.step;

      if (
        (this.onlyOdd && value % 2 == 0) ||
        (this.onlyEven && !(value % 2 == 0))
      ) {
        if (delta == -1) value -= 1;
        if (delta == 1) value += 1;
      }

      value = Math.min(Math.max(value, this.limitMinimum), this.limitMaximum);
      super.changeValue(value, node);
    } else if (event.type == "mouseup") {
      let delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0; // delta = -1, 1 or 0 (left arrow, right arrow or in between)
      if (event.click_time < 200 && delta == 0) {
        let widget = this;

        event.target.data.prompt(
          "Value",
          value,
          function (v) {
            value = Number(v);

            if (
              (widget.onlyOdd && value % 2 == 0) ||
              (widget.onlyEven && !(value % 2 == 0))
            )
              return;

            value = Math.min(
              Math.max(value, widget.limitMinimum),
              widget.limitMaximum
            );
            widget.changeValue(value, node);
          },
          event
        );
      }
    }
  }
}

class Widget_Separator extends WidgetBase {
  constructor() {
    super();
  }

  onDraw(ctx, node, widget_width, y, H) {
    // draw the separator line
    ctx.strokeStyle = this.outline_color;
    ctx.beginPath();
    ctx.moveTo(this.margin, y + H * 0.5);
    ctx.lineTo(widget_width - this.margin, y + H * 0.5);
    ctx.stroke();
  }
}

class Widget_Slider extends WidgetBase {
  constructor(node, property, options) {
    super(node, property, options);
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the background
    ctx.fillStyle = this.background_color;
    ctx.fillRect(this.margin, y, drawWidth, H);

    // draw the internal fill
    var range = this.options.max - this.options.min;
    var nvalue = (this.value - this.options.min) / range;
    ctx.fillStyle = this.secondary_value_color;
    ctx.fillRect(this.margin, y, nvalue * drawWidth, H);

    // draw the outline
    ctx.strokeRect(this.margin, y, drawWidth, H);

    // draw the label text
    ctx.font = this.labelFont;
    ctx.fillStyle = this.secondary_text_color;
    if (this.label != null) {
      ctx.fillText(this.label, this.margin * 2 + 5, y + H * 0.7);
    }

    // draw the value text
    ctx.font = this.readOnly ? this.readOnlyValueFont : this.valueFont;
    ctx.fillStyle = this.value_color;
    ctx.textAlign = "right";
    ctx.fillText(
      Number(this.value).toFixed(
        this.options.precision !== undefined ? this.options.precision : 3
      ),
      drawWidth - 20,
      y + H * 0.7
    );
  }

  onMouse(event, pos, node) {
    var widget = this;
    var value = widget.value;
    var x = pos[0]; // - node.pos[0];
    var y = pos[1]; // - node.pos[1];
    var widget_width = node.size[0];

    var range = widget.options.max - widget.options.min;
    var nvalue = Math.clamp((x - 15) / (widget_width - 30), 0, 1);

    if (event.type == "mousemove") {
      value =
        widget.options.min + (widget.options.max - widget.options.min) * nvalue;
      super.changeValue(value, node);
    } else if (event.type == "mousedown") {
      value =
        widget.options.min + (widget.options.max - widget.options.min) * nvalue;
      super.changeValue(value, node);
    }
  }
}

class Widget_String extends WidgetBase {
  constructor(node, property, options) {
    super(node, property, options);
    this.displayString = "";
  }

  onComputeSize(size) {
    this.displayString = "";

    if (this.value !== "undefined" && this.value !== null)
      this.displayString = this.value.toString();

    size[0] = LiteGraph.computeTextWidth(this.displayString);
    size[0] += LiteGraph.computeTextWidth(this.label);
    size[0] += 60;
    size[1] = LiteGraph.NODE_WIDGET_HEIGHT;

    return size;
  }

  onDraw(ctx, node, widget_width, y, H) {
    var drawWidth = widget_width - this.margin * 2;

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.fillStyle = this.background_color;
    ctx.beginPath();
    ctx.roundRect(this.margin, y, drawWidth, H, H * 0.5);
    ctx.fill();
    ctx.stroke();

    // draw the label text
    ctx.font = this.labelFont;
    ctx.fillStyle = this.secondary_text_color;
    if (this.label != null) {
      ctx.fillText(this.label, this.margin * 2 + 5, y + H * 0.7);
    }

    // draw the value text
    ctx.font = this.readOnly ? this.readOnlyValueFont : this.valueFont;
    ctx.fillStyle = this.value_color;
    ctx.textAlign = "right";
    ctx.fillText(this.displayString, drawWidth, y + H * 0.7);
  }

  onMouse(event, pos, node) {
    var widget = this;
    var value = widget.value;
    if (event.type == "mousedown") {
      event.target.data.prompt(
        "Value",
        value,
        function (v) {
          value = v;
          widget.changeValue(value, node);
        },
        event
      );
    }
  }
}

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

class GraphCanvas extends LGraphCanvas {
  constructor(canvas, graph, options) {
    super(canvas, graph, options);
    super.resize();
    this.render_canvas_border = false;
  }

  // full override of the draw node function.
  drawNode(node, ctx) {
    var temp_vec2 = new Float32Array(2);
    var glow = false;
    this.current_node = node;

    var color =
      node.color || node.constructor.color || LiteGraph.NODE_DEFAULT_COLOR;
    var bgcolor =
      node.bgcolor ||
      node.constructor.bgcolor ||
      LiteGraph.NODE_DEFAULT_BGCOLOR;

    //shadow and glow
    if (node.mouseOver) {
      glow = true;
    }

    var low_quality = this.ds.scale < 0.6; //zoomed out

    //only render if it forces it to do it
    if (this.live_mode) {
      if (!node.flags.collapsed) {
        ctx.shadowColor = "transparent";
        if (node.onDrawForeground) {
          node.onDrawForeground(ctx, this, this.canvas);
        }
      }
      return;
    }

    var editor_alpha = this.editor_alpha;
    ctx.globalAlpha = editor_alpha;

    if (this.render_shadows && !low_quality) {
      ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
      ctx.shadowOffsetX = 2 * this.ds.scale;
      ctx.shadowOffsetY = 2 * this.ds.scale;
      ctx.shadowBlur = 3 * this.ds.scale;
    } else {
      ctx.shadowColor = "transparent";
    }

    //custom draw collapsed method (draw after shadows because they are affected)
    if (
      node.flags.collapsed &&
      node.onDrawCollapsed &&
      node.onDrawCollapsed(ctx, this) == true
    ) {
      return;
    }

    //clip if required (mask)
    var shape = node._shape || LiteGraph.BOX_SHAPE;
    var size = temp_vec2;
    temp_vec2.set(node.size);
    var horizontal = node.horizontal; // || node.flags.horizontal;

    if (node.flags.collapsed) {
      ctx.font = this.inner_text_font;
      var title = node.getTitle ? node.getTitle() : node.title;
      if (title != null) {
        node._collapsed_width = Math.min(
          node.size[0],
          ctx.measureText(title).width + LiteGraph.NODE_TITLE_HEIGHT * 2
        ); //LiteGraph.NODE_COLLAPSED_WIDTH;
        size[0] = node._collapsed_width;
        size[1] = 0;
      }
    }

    if (node.clip_area) {
      //Start clipping
      ctx.save();
      ctx.beginPath();
      if (shape == LiteGraph.BOX_SHAPE) {
        ctx.rect(0, 0, size[0], size[1]);
      } else if (shape == LiteGraph.ROUND_SHAPE) {
        ctx.roundRect(0, 0, size[0], size[1], 10);
      } else if (shape == LiteGraph.CIRCLE_SHAPE) {
        ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2);
      }
      ctx.clip();
    }

    //draw shape
    if (node.has_errors) {
      bgcolor = "red";
    }
    this.drawNodeShape(
      node,
      ctx,
      size,
      color,
      bgcolor,
      node.is_selected,
      node.mouseOver
    );
    ctx.shadowColor = "transparent";

    //draw foreground
    if (node.onDrawForeground) {
      node.onDrawForeground(ctx, this, this.canvas);
    }

    //connection slots
    ctx.textAlign = horizontal ? "center" : "left";
    ctx.font = this.inner_text_font;

    var render_text = !low_quality;

    var out_slot = this.connecting_output;
    ctx.lineWidth = 1;

    var max_y = 0;
    var slot_pos = new Float32Array(2); //to reuse

    //render inputs and outputs
    if (!node.flags.collapsed) {
      //input connection slots
      max_y = this.drawNodeInputs(node, ctx, max_y);

      //output connection slots
      if (this.connecting_node) {
        ctx.globalAlpha = 0.4 * editor_alpha;
      }

      ctx.textAlign = horizontal ? "center" : "right";
      ctx.strokeStyle = "black";

      max_y = this.drawNodeOutputs(node, ctx, max_y);

      ctx.textAlign = "left";
      ctx.globalAlpha = 1;

      if (node.widgets) {
        var widgets_y = max_y;
        if (horizontal || node.widgets_up) {
          widgets_y = 2;
        }
        if (node.widgets_start_y != null) widgets_y = node.widgets_start_y;
        this.drawNodeWidgets(
          node,
          widgets_y,
          ctx,
          this.node_widget && this.node_widget[0] == node
            ? this.node_widget[1]
            : null
        );

        max_y = this.drawNodeWidgetInputs(node, ctx, max_y);
      }
    } else if (this.render_collapsed_slots) {
      var input_slot = null;

      if (node.inputs) {
        for (var i = 0; i < node.inputs.length; i++) {
          var slot = node.inputs[i];
          if (slot.link == null) {
            continue;
          }
          input_slot = slot;
          break;
        }
      }
      out_slot;

      if (input_slot) {
        var x = 0;
        var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
        if (horizontal) {
          x = node._collapsed_width * 0.5;
          y = -LiteGraph.NODE_TITLE_HEIGHT;
        }
        ctx.fillStyle = "#686";
        ctx.beginPath();
        if (
          slot.type === LiteGraph.EVENT ||
          slot.shape === LiteGraph.BOX_SHAPE
        ) {
          ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
        } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(x + 8, y);
          ctx.lineTo(x + -4, y - 4);
          ctx.lineTo(x + -4, y + 4);
          ctx.closePath();
        } else {
          ctx.arc(x, y, 4, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      var output_slot = null;

      if (node.outputs) {
        for (var i = 0; i < node.outputs.length; i++) {
          var slot = node.outputs[i];
          if (!slot.links || !slot.links.length) {
            continue;
          }
          output_slot = slot;
        }
      }

      if (output_slot) {
        var x = node._collapsed_width;
        var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
        if (horizontal) {
          x = node._collapsed_width * 0.5;
          y = 0;
        }
        ctx.fillStyle = "#686";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        if (
          slot.type === LiteGraph.EVENT ||
          slot.shape === LiteGraph.BOX_SHAPE
        ) {
          ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
        } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(x + 6, y);
          ctx.lineTo(x - 6, y - 4);
          ctx.lineTo(x - 6, y + 4);
          ctx.closePath();
        } else {
          ctx.arc(x, y, 4, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    if (node.clip_area) {
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
  }

  drawNodeInputs(node, ctx, max_y) {
    var out_slot = this.connecting_output;
    var low_quality = this.ds.scale < 0.6;
    var render_text = !low_quality;
    var horizontal = node.horizontal;
    var editor_alpha = this.editor_alpha;

    var slot_pos = new Float32Array(2);

    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; i++) {
        var slot = node.inputs[i];

        if (typeof slot.widget_slot !== "undefined") continue;

        ctx.globalAlpha = editor_alpha;

        if (
          this.connecting_node &&
          out_slot &&
          !LiteGraph.isValidConnection(slot.type, out_slot.type)
        ) {
          ctx.globalAlpha = 0.4 * editor_alpha;
        }

        ctx.fillStyle =
          slot.link != null
            ? slot.color_on || this.default_connection_color.input_on
            : slot.color_off || this.default_connection_color.input_off;

        var pos = node.getConnectionPos(true, i, slot_pos);
        pos[0] -= node.pos[0];
        pos[1] -= node.pos[1];
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
        }

        ctx.beginPath();

        var ctx_saved = false;

        if (
          slot.type === LiteGraph.EVENT ||
          slot.shape === LiteGraph.BOX_SHAPE
        ) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14);
          } else {
            ctx.save();
            ctx_saved = true;

            if (
              node.mode != LiteGraph.ON_TRIGGER &&
              slot.type === LiteGraph.EVENT
            ) {
              ctx.globalAlpha = 0.4 * editor_alpha;
            }

            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10);
          }
        } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
          ctx.closePath();
        } else {
          if (low_quality) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8); //faster
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
        }
        ctx.fill();

        if (render_text) {
          var text = slot.label != null ? slot.label : slot.name;
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
            if (horizontal || slot.dir == LiteGraph.UP) {
              ctx.fillText(text, pos[0], pos[1] - 10);
            } else {
              ctx.fillText(text, pos[0] + 10, pos[1] + 5);
            }
          }
        }

        if (ctx_saved) ctx.restore();
      }
    }

    return max_y;
  }

  drawNodeOutputs(node, ctx, max_y) {
    var low_quality = this.ds.scale < 0.6;
    var render_text = !low_quality;
    var horizontal = node.horizontal;

    var slot_pos = new Float32Array(2);

    if (node.outputs) {
      for (var i = 0; i < node.outputs.length; i++) {
        var slot = node.outputs[i];

        var pos = node.getConnectionPos(false, i, slot_pos);
        pos[0] -= node.pos[0];
        pos[1] -= node.pos[1];
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
        }

        ctx.fillStyle =
          slot.links && slot.links.length
            ? slot.color_on || this.default_connection_color.output_on
            : slot.color_off || this.default_connection_color.output_off;
        ctx.beginPath();

        if (
          slot.type === LiteGraph.EVENT ||
          slot.shape === LiteGraph.BOX_SHAPE
        ) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14);
          } else {
            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10);
          }
        } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
          ctx.closePath();
        } else {
          if (low_quality) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8);
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
        }

        ctx.fill();
        if (!low_quality) ctx.stroke();

        if (render_text) {
          var text = slot.label != null ? slot.label : slot.name;
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
            if (horizontal || slot.dir == LiteGraph.DOWN) {
              ctx.fillText(text, pos[0], pos[1] - 8);
            } else {
              ctx.fillText(text, pos[0] - 10, pos[1] + 5);
            }
          }
        }
      }
    }

    return max_y;
  }

  drawNodeWidgetInputs(node, ctx, max_y) {
    var out_slot = this.connecting_output;
    var low_quality = this.ds.scale < 0.6;
    var render_text = !low_quality;
    var horizontal = node.horizontal;
    var editor_alpha = this.editor_alpha;

    var slot_pos = new Float32Array(2);

    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; i++) {
        var slot = node.inputs[i];

        if (typeof slot.widget_slot === "undefined") continue;

        ctx.globalAlpha = editor_alpha;

        if (
          this.connecting_node &&
          !LiteGraph.isValidConnection(slot.type, out_slot.type)
        ) {
          ctx.globalAlpha = 0.4 * editor_alpha;
        }

        ctx.fillStyle =
          slot.link != null
            ? slot.color_on || this.default_connection_color.input_on
            : slot.color_off || this.default_connection_color.input_off;

        var pos = node.getConnectionPos(true, i, slot_pos);
        pos[0] -= node.pos[0];
        pos[1] -= node.pos[1];
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
        }

        ctx.beginPath();

        var ctx_saved = false;

        if (low_quality) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8); //faster
        else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);

        ctx.fill();

        if (slot.link) {
          var text = slot.label != null ? slot.label : slot.name;
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
            if (horizontal || slot.dir == LiteGraph.UP) {
              ctx.fillText(text, pos[0], pos[1] - 10);
            } else {
              ctx.fillText(text, pos[0] + 10, pos[1] + 5);
            }
          }
        }

        if (ctx_saved) ctx.restore();
      }
    }

    return max_y;
  }
}

class NodeBase extends LGraphNode {
  constructor(title) {
    super(title);
    this.margin = 100;
  }

  addHiddenProperty(...args) {
    this._addProperty(...args);
  }

  addProperty(property_name, default_value, type, options) {
    options = options || {};

    let visualWidget = LiteGraph.getVisualWidgetByType(type);
    let property = this._addProperty(
      property_name,
      default_value,
      type,
      options
    );
    let widget = new visualWidget(this, property, options);

    super.addCustomWidget(widget);

    if (options && options.suppressInput) {
      return;
    }

    var input = this.addInput(property_name, type);
    input.widget_slot = this.widgets.indexOf(widget);
  }

  addContent(content_name, default_value, type, options) {
    let node = this;

    options = options || {};

    let visualWidget = LiteGraph.getVisualWidgetByType(type);

    if (!options) {
      options = {};
    }
    options.readOnly = true;

    options.label =
      typeof options.label === "undefined" ? content_name : options.label;
    options.defaultValue =
      typeof options.defaultValue === "undefined"
        ? default_value
        : options.defaultValue;

    let widget = new visualWidget(this, null, options);

    this.registerStatusHandler(function (status, node) {
      let content = status.content;
      widget.changeValue(
        content.find((element) => element.name === content_name).data,
        node
      );
    });

    super.addCustomWidget(widget);
  }

  addVisibleWidgetByType(type, options) {
    let visualWidget = this.visualWidgets.getByType(type);
    let widget = new visualWidget(this, null, options);

    super.addCustomWidget(widget);
  }

  getWidgetByLabel(label) {
    return this.widgets.find((element) => element.label == label);
  }

  customWidgetCallback(...args) {
    console.log("Custom widget called back: ", args);
  }

  // used to correct litegraph size issues
  computeSize(out) {
    if (this.constructor.size) {
      return this.constructor.size.concat();
    }

    var standard_inputs = 0;

    if (this.inputs) {
      for (var i = 0; i < this.inputs.length; i++) {
        var slot = this.inputs[i];

        if (typeof slot.widget_slot === "undefined") standard_inputs++;
      }
    }

    var rows = Math.max(
      standard_inputs,
      this.outputs ? this.outputs.length : 1
    );
    var size = out || new Float32Array([0, 0]);
    rows = Math.max(rows, 1);
    var font_size = LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

    var font_size = font_size;
    var title_width = compute_text_size(this.title);
    var input_width = 0;
    var output_width = 0;

    if (this.inputs) {
      for (var i = 0, l = this.inputs.length; i < l; ++i) {
        var input = this.inputs[i];
        var text = input.label || input.name || "";
        var text_width = compute_text_size(text);
        if (input_width < text_width) {
          input_width = text_width;
        }
      }
    }

    if (this.outputs) {
      for (var i = 0, l = this.outputs.length; i < l; ++i) {
        var output = this.outputs[i];
        var text = output.label || output.name || "";
        var text_width = compute_text_size(text);
        if (output_width < text_width) {
          output_width = text_width;
        }
      }
    }

    size[0] = Math.max(input_width + output_width + 10, title_width);
    size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH);
    if (this.widgets && this.widgets.length) {
      size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1.5);
    }

    size[1] =
      (this.constructor.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;

    var widgets_height = 0;
    if (this.widgets && this.widgets.length) {
      for (var i = 0, l = this.widgets.length; i < l; ++i) {
        if (this.widgets[i].computeSize)
          widgets_height += this.widgets[i].computeSize(size[0])[1] + 4;
        else widgets_height += LiteGraph.NODE_WIDGET_HEIGHT + 4;
      }
      widgets_height += 8;
    }

    //compute height using widgets height
    if (this.widgets_up) size[1] = Math.max(size[1], widgets_height);
    else if (this.widgets_start_y != null)
      size[1] = Math.max(size[1], widgets_height + this.widgets_start_y);
    else size[1] += widgets_height;

    function compute_text_size(text) {
      if (!text) {
        return 0;
      }
      return font_size * text.length * 0.6;
    }

    if (this.constructor.min_height && size[1] < this.constructor.min_height) {
      size[1] = this.constructor.min_height;
    }

    size[1] += 6; //margin

    // from last

    title_width = LiteGraph.computeTextWidth(this.title) + 40; // corrects small error with long titles in the standard code
    let widgets_maximum_width = 0;

    if (this.widgets && this.widgets.length) {
      for (var i = 0, l = this.widgets.length; i < l; ++i) {
        let widget_size = this.widgets[i].computeSize();
        widgets_maximum_width = Math.max(widgets_maximum_width, widget_size[0]);
      }
    }

    size[0] = Math.max(size[0], title_width, widgets_maximum_width);

    if (this.onComputeSize) {
      var custom_size = this.onComputeSize(size);
      size[0] = Math.max(size[0], custom_size[0]);
      size[1] = Math.max(size[1], custom_size[1]);
    }

    return size;
  }

  getConnectionPos(is_input, slot_number, out) {
    out = out || new Float32Array(2);
    var num_slots = 0;
    if (is_input && this.inputs) {
      num_slots = this.inputs.length;
    }
    if (!is_input && this.outputs) {
      num_slots = this.outputs.length;
    }

    var offset = LiteGraph.NODE_SLOT_HEIGHT * 0.5;

    if (this.flags.collapsed) {
      var w = this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
      if (this.horizontal) {
        out[0] = this.pos[0] + w * 0.5;
        if (is_input) {
          out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
        } else {
          out[1] = this.pos[1];
        }
      } else {
        if (is_input) {
          out[0] = this.pos[0];
        } else {
          out[0] = this.pos[0] + w;
        }
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      }
      return out;
    }

    //weird feature that never got finished
    if (is_input && slot_number == -1) {
      out[0] = this.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      out[1] = this.pos[1] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      return out;
    }

    //hard-coded pos
    if (is_input && num_slots > slot_number && this.inputs[slot_number].pos) {
      out[0] = this.pos[0] + this.inputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.inputs[slot_number].pos[1];
      return out;
    } else if (
      !is_input &&
      num_slots > slot_number &&
      this.outputs[slot_number].pos
    ) {
      out[0] = this.pos[0] + this.outputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.outputs[slot_number].pos[1];
      return out;
    }

    //horizontal distributed slots
    if (this.horizontal) {
      out[0] = this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
      if (is_input) {
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
      } else {
        out[1] = this.pos[1] + this.size[1];
      }
      return out;
    }

    //default vertical slots
    if (is_input) {
      out[0] = this.pos[0] + offset;
    } else {
      out[0] = this.pos[0] + this.size[0] + 1 - offset;
    }

    if (
      is_input &&
      this.inputs &&
      this.inputs[slot_number] &&
      typeof this.inputs[slot_number].widget_slot !== "undefined"
    ) {
      let widget_slot = this.inputs[slot_number].widget_slot;
      let widget = this.widgets[widget_slot];
      out[1] = this.pos[1] + widget.last_y + widget.size[1] / 2;
      return out;
    }

    if (is_input) {
      var actual_slot_pos = slot_number;

      for (var i = slot_number - 1; i > 0; i--) {
        if (
          is_input &&
          this.inputs &&
          this.inputs[i] &&
          typeof this.inputs[i].widget_slot !== "undefined"
        ) {
          actual_slot_pos--;
        }
      }

      out[1] =
        this.pos[1] +
        (actual_slot_pos + 0.7) * LiteGraph.NODE_SLOT_HEIGHT +
        (this.constructor.slot_start_y || 0);
    } else {
      out[1] =
        this.pos[1] +
        (slot_number + 0.7) * LiteGraph.NODE_SLOT_HEIGHT +
        (this.constructor.slot_start_y || 0);
    }

    return out;
  }

  onConnectionsChange(input_type, slot, flag, link, x) {
    if (input_type != LiteGraph.INPUT) return;

    if (typeof this.inputs[slot].widget_slot === "undefined") return;

    if (this.inputs[slot].link) {
      this.widgets[this.inputs[slot].widget_slot].hide();
    } else {
      this.widgets[this.inputs[slot].widget_slot].show();
    }
  }
}

// Example node ------------------------------------------------------------------------

class Node_SandpitNode extends NodeBase {
  constructor() {
    super("My Node");
    this.addInput("NumberIn", "NUMBER");
    this.addProperty("NumberProp", 3, "NUMBER", { onlyOdd: true });
    this.addOutput("NumberOut", "NUMBER");
    this.addInput("BoolIn", "BOOL");
    this.addProperty("BoolProp", 3, "BOOL");
    this.addOutput("BoolOut", "BOOL");
  }
}

// Example node registration -----------------------------------------------------------

var NodePack_Sandpit = (function () {
  return {
    RegisterWithGraph: function (Graph) {
      Graph.registerNodeByType("Sandpit/SandpitNode", Node_SandpitNode);
    },
  };
})();

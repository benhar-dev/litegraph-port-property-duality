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

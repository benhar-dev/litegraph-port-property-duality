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

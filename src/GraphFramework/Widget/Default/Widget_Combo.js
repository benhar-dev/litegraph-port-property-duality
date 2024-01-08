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

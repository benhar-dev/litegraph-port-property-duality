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

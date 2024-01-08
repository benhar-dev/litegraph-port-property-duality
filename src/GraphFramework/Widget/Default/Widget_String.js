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

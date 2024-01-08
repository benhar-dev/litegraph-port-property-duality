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

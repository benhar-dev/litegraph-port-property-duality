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

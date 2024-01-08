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

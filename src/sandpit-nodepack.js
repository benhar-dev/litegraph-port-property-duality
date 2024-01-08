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

var graph = new Graph();

graph.install(NodePack_Sandpit);
var canvas = new GraphCanvas("#mycanvas", graph);

window.addEventListener("resize", function () {
  canvas.resize();
});

graph.start();

// var node = LiteGraph.createNode("Sandpit/SandpitNode");
// canvas.graph.add(node);

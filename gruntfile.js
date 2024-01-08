module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    watch: {
      js: {
        files: ["src/*.js"],
        tasks: ["concat:build"],
        options: {
          livereload: 1030,
        },
      },
    },
    concat: {
      build: {
        src: [
          "./src/Uuid/UuidGen.js",
          "./src/GraphFramework/Widget/Base/WidgetBase.js",
          "./src/GraphFramework/Widget/Collection/WidgetCollection.js",
          "./src/GraphFramework/Widget/Default/Widget_Blank.js",
          "./src/GraphFramework/Widget/Default/Widget_Bool.js",
          "./src/GraphFramework/Widget/Default/Widget_Combo.js",
          "./src/GraphFramework/Widget/Default/Widget_Number.js",
          "./src/GraphFramework/Widget/Default/Widget_Separator.js",
          "./src/GraphFramework/Widget/Default/Widget_Slider.js",
          "./src/GraphFramework/Widget/Default/Widget_String.js",
          "./src/GraphFramework/LiteGraph/LiteGraphPatch.js",
          "./src/GraphFramework/Graph/Base/Graph.js",
          "./src/GraphFramework/GraphCanvas/Base/GraphCanvas.js",
          "./src/GraphFramework/Node/Base/NodeBase.js",
          "./src/GraphFramework/Node/LiteGraph/LiteGraphPatch.js",
          "./src/sandpit-nodepack.js",
        ],
        dest: "./public/CustomGraph.js",
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-concat");

  grunt.registerTask("build", ["concat:build"]);
};

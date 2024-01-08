const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.static("src"));
app.use(express.static("litegraph.js"));

app.listen(8000, () => console.log("Live port 8000!"));

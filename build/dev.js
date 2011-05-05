/*jslint node: true, strict: false */
var u = require("./utils.js"),
    b = require("./build.js"),
    fs = require("fs"), 
    size,
    type = process.argv[2] || "js";

if (!b.types.hasOwnProperty(type)) {
    throw "invalid type: " + type;
}

var file = type + ".class.js";

console.log("watching: " + file + "...\n");

fs.watchFile(u.path("src/class.js"), function (curr) {
    if (!curr.size || size === curr.size) {
        return;
    }
    b.build(type);
    console.log(file + " updated..");
    size = curr.size;
});

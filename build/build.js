/*jslint node: true, strict: false */
var u = require("./utils.js");
var lint = require("./lint.js");

var version = u.version("1.1.0");

var types = {};

u.importFiles({
    comment: "comment",
    content: "class.js",
    readme: "README.md"
});

function getComment(env) {
    return u.parse(u.data.comment, {
        "@ENV": env
    });
}

function buildClientSide(d, name, prefix) {
    lint.options.browser = true;
    var content = lint.optionsAsComment(lint.options) + "\n", c;
    delete lint.options.browser;
    content += prefix + " = ";
    content += d.content;
    
    c = u.minify(content, function (content) {
        return getComment(name) + "\n" + content + "\n";
    });

    u.save(name.toLowerCase() + ".class.js", c.uncompressed);
    u.save(name.toLowerCase() + ".class.min.js", c.compressed);

    c.outputInfo();
}

function build(type) {
    type = (type || "").toLowerCase();
    
    if (typeof types[type] !== "function") {
        throw "Invalid type: " + type;
    }
    
    console.log("Enviroment: " + type + ", version: " + version);

    types[type].call(u.data, u.data);
}

types = {
    jquery: function (d) {
        buildClientSide(d, "jQuery", "/*global jQuery */\njQuery.Class");
    },
    node: function (d) {
        var content = getComment("node.js");
        lint.options.node = true;
        content += "\n" + lint.optionsAsComment(lint.options);
        delete lint.options.node;
        content += "\nmodule.exports = ";
        content += d.content + "\n";

        u.save("node.class.js", content);
    },
    js: function (d) {
        buildClientSide(d, "js", "var Class");
    }
};

var l = lint.result;

if (l === true) {

    var type = process.argv[2];

    if (!type) {
        u.each(types, function (type) {
            console.log();
            build(type);
        });
    } else {
        build(type);
    }

    u.save("README.md", u.data.readme);

    console.log("\ndone !");

}

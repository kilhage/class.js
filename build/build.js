
var u = require("./utils.js");

var version = u.version("1.1.0");

u.importFiles({
    comment: "comment",
    content: "class.js",
    readme: "README.md"
});

var types = {
    jquery: function(d) {
        buildClientSide(d, "jQuery", "jQuery.Class");
    },
    node: function(d) {
        var content = getComment("node.js")+"\nmodule.exports = "+d.content+"\n";

        u.save("node.class.js", content);
    },
    js: function(d) {
        buildClientSide(d, "js", "var Class");
    }
};

var type = process.argv[2];

if ( ! type ) {
    u.each(types, function(type){
        console.log();
        build(type);
    })
} else {
    build(type);
}

console.log();

u.save("README.md", u.data.readme);

console.log();

console.log("done !");

function getComment(env) {
    return u.parse(u.data.comment, {"@ENV": env});
}

function buildClientSide(d, name, prefix) {
    var c = u.minify(d.content, function(content) {
        return getComment(name)+"\n"+prefix+" = "+content+"\n";
    });

    u.save(name.toLowerCase()+".class.js", c.uncompressed);
    u.save(name.toLowerCase()+".class.min.js", c.compressed);

    c.outputInfo();
}

function build(type) {
    type = (type || "").toLowerCase();
    
    if ( typeof types[type] != "function" )
        throw "Invalid type: "+type;

    console.log("Enviroment: " + type + ", version: " + version);

    types[type].call(u.data, u.data);
}

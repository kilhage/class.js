/*jslint node: true, strict: false */
var fs = require("fs");
var uglify = require("./uglify.js");

var version;

// format: 2011-04-27 21:40:44
var date = (function () {
    var d = new Date();
    return [
        d.getFullYear(),
        (d.getMonth() < 10 ? "0" : "") + d.getMonth(),
        (d.getDate() < 10 ? "0" : "") + d.getDate()
    ].join("-") + " " + d.toLocaleTimeString();
}());

var path = process.env.PWD;

if (fs.readdirSync(path).indexOf("src") === -1) {
    path += "/..";
}

path += "/";

if (fs.readdirSync(path).indexOf("src") === -1) {
    throw "invalid path: " + path;
}

var data = {};

function each(o, fn) {
    var i;
    for (i in o) {
        fn.call(o, i, o[i]);
    }
    return o;
}

function extend(a, b) {
    var k;
    for (k in b) {
        a[k] = b[k]; 
    }
    return a;
}

function output() {
    if (output.enabled) {
        console.log.apply(console, arguments);
    }
}

output.enabled = true;

function save(fileName, content) {
    fs.writeFileSync(path + fileName, content);
    output(fileName + ' updated!');
}

function parse(c, vars) {
    vars = extend({"@DATE": date, "@VERSION": version}, vars || {});
    each(vars, function (k, v) {
        c = c.replace(k, v);
    });
    return c;
}

function minify(content, parser) {
    var uncompressed = parser(content).replace(/\s*;\s*$/, "") + ";\n",
        compressed = parser(uglify(content, {
            strict_semicolons: false,
            mangle_options: {
                toplevel: false,
                parent: false,
                except: false
            },
            squeeze_options: {
                make_seqs   : true,
                dead_code   : true,
                keep_comps  : true,
                no_warnings : false
            },
            gen_options: {
                indent_start : 0,
                indent_level : 4,
                quote_keys   : false,
                space_colon  : false,
                beautify     : false,
                ascii_only   : false
            }
        }).replace(/\s*;\s*$/, "") + ";");
    
    return {
        compressed: compressed,
        uncompressed: uncompressed,
        size: uncompressed.length,
        sizeC: compressed.length,
        diff: uncompressed.length - compressed.length,
        outputInfo: function () {
            output("Size compressed: " + this.sizeC + 
                        "b, Size uncompressed: " + this.size + 
                        "b, diff: " + this.diff + "b");
        }
    };
}

function read(file) {
    return fs.readFileSync(path + file, "utf8");
}

module.exports.data = data;
module.exports.date = date;
module.exports.read = read;
module.exports.each = each;
module.exports.extend = extend;
module.exports.save = save;
module.exports.parse = parse;
module.exports.minify = minify;
module.exports.read = read;
module.exports.output = output;
module.exports.setOutputEnabled = function (e) {
    output.enabled = e;
};

module.exports.version = function (v) {
    return (version = v);
};

module.exports.importFiles = function (files) {
    each(files, function (key, file) {
        data[key] = parse(read("src/" + file)).trim();
    });
};

module.exports.path = function (p) {
    return path + p;
};

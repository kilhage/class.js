
var fs = require("fs");
var uglify = require("./uglify.js");

var version;

// format: 2011-04-27 21:40:44
var date = (function() {
    var d = new Date();
    return [
        d.getFullYear(),
        (d.getMonth() < 10 ? "0" : "") + d.getMonth(),
        d.getDate()
    ].join("-")+" "+d.toLocaleTimeString();
}());

var path = process.env.PWD;

if ( fs.readdirSync(path).indexOf("src") == -1 )
    path += "/.."
    
path += "/";

if ( fs.readdirSync(path).indexOf("src") == -1 )
    throw "invalid path: " + path;

var data = {};

function each(o, fn) {
    for ( var i in o ) fn.call(o, i, o[i]); return o;
}

function extend(a, b) {
    for ( var k in b ) a[k] = b[k]; return a;
}

function save(fileName, content) {
    fs.writeFileSync(path+fileName, content);
    console.log(fileName+' updated!');
}

function parse(c, vars) {
    vars = extend({"@DATE": date, "@VERSION": version}, vars || {});
    each(vars, function(k, v) {
        c = c.replace(k, v);
    });
    return c;
}

function minify(content, parser) {
    var uncompressed = parser(content).replace(/\s*;\s*$/, "")+";\n";

    var compressed = parser(uglify(content, {
            ast: false,
            mangle: true,
            mangle_toplevel: false,
            squeeze: true,
            make_seqs: true,
            dead_code: true,
            beautify: false,
            verbose: false,
            show_copyright: true,
            out_same_file: false,
            extra: false,
            unsafe: false,
            beautify_options: {
                    indent_level: 4,
                    indent_start: 0,
                    quote_keys: false,
                    space_colon: false
            },
            output: true
    }).replace(/\s*;\s*$/, "")+";");
    
    return {
        compressed: compressed,
        uncompressed: uncompressed,
        size: uncompressed.length,
        sizeC: compressed.length,
        diff: uncompressed.length - compressed.length,
        outputInfo: function() {
            console.log("Size compressed: "+this.sizeC+"b, Size uncompressed: "+this.size+"b, diff: "+this.diff+"b");
        }
    };
}

function read(file) {
    return fs.readFileSync(path+file, "utf8");
}

exports.data = data;
exports.path = path;
exports.date = date;
exports.read = read;
exports.each = each;
exports.extend = extend;
exports.save = save;
exports.parse = parse;
exports.minify = minify;
exports.read = read;
exports.version = function(v){
    return version = v;
};
exports.importFiles = function(files) {
    each(files, function(key, file) {
        data[key] = parse(read("src/"+file)).trim();
    });
};

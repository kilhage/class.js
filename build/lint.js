/*jslint node: true, strict: false */
var JSLINT = require("./lib/jslint.js"),
    u = require("./utils.js"),
    options = {
        forin: true,
        onevar: true,
        debug: false,
        indent: 4,
        white: true,
        strict: true,
        undef: true,
        newcap: true,
        maxlen: 85,
        evil: false,
        nomen: false,
        regexp: false
    },
    valid_reasons = {
        "Expected an identifier and instead saw 'undefined' (a reserved word).": true
    };

function make(content) {
    content = content || u.read("src/class.js");
    JSLINT(content, options);
    
    var errors = [], ok;
    
    JSLINT.data().errors.forEach(function (e) {
        if (e && !valid_reasons[e.reason]) {
            e.message = "Error at line " + e.line + ", char " +
                e.character + ", reason: " + e.reason;

            errors.push(e);
        }
    });
    
    ok = errors.length === 0;
    
    u.output("\njslint %spassed", !ok ? "not " : "");
    errors.forEach(function (e) {
        u.output(e.message);
    });
    
    return !ok ? errors : true;
}

if (process.mainModule === module) {
    make();
}

module.exports.make = make;
module.exports.options = options;
module.exports.optionsAsComment = function (op) {
    var o = [[]], i = 0;
    
    u.each(op, function (k, v) {
        var s = k + ": " + (v === true ? "true" : (v === false ? "false" : v));
        if (o[i].length >= 4) {
            i++;
            o[i] = [];
        }
        o[i].push(s);
    });
    
    o.forEach(function (v, k) {
        o[k] = v.join(", ");
    });
    
    return "/*jslint " + o.join("\n   ") + " */";
};

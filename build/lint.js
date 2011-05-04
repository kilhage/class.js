/*jslint node: true, strict: false */
var JSLINT = require("./lib/jslint.js");
var u = require("./utils.js");
var options = {
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
};

function make(content, output) {
    content = content || u.read("src/class.js");
    var ok = JSLINT(content, options);
    
    u.output("\njslint %spassed", !ok ? "not " : "");
    
    if (!ok) {
        return JSLINT.data().errors.forEach(function (e) {
            if (e && output) {
                u.output("Error at line %s, char %s, reason: %s", 
                                e.line, e.character, e.reason);
            }
        });
    }
    
    return true;
}

if (process.mainModule === module) {
    make(false, true);
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

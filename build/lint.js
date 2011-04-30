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
    evil: false
};

function lint(content) {
    var ok = JSLINT(content, options);
    
    console.log("\njslint %spassed", !ok ? "not " : "");
    
    if (!ok) {
        return JSLINT.data().errors.forEach(function (e) {
            if (e) {
                console.log("Error at line %s, char %s, reason: %s", 
                                e.line, e.character, e.reason);
            }
        });
    }
    
    return true;
}

var l = lint(u.read("src/class.js"));

module.exports.lint = lint;
module.exports.result = l;
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
    
    return "/*jslint " + o.join("\n   ") + "\n */";
};

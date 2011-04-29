
var JSLINT = require("./lib/jslint.js");
var u = require("./utils.js");

function lint(content) {
    var ok = JSLINT(content, {
        forin: true,
        onevar: true
    });
    
    if ( ! ok )
        return print(JSLINT.data().errors);
    
    console.log("\njslint passed");
    
    return true;
}

function print(errs) {
    console.log("\njslint not passed\n");
    
    errs.forEach(function(e) {
        if ( e )
            console.log("Error at line %s, char %s, reason: %s", e.line, e.character, e.reason);
    });
    return errs;
    
    console.log("\nFix this shit!");
}

var l = lint(u.read("src/class.js"));

exports.print = print
exports.lint = lint;
exports.result = l;

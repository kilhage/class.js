//convienence function(src, [options]);
/*jslint node: true, strict: false*/
function uglify(orig_code, options) {
    options = options || {};
    var jsp = uglify.parser,
        pro = uglify.uglify,
        // parse code and get the initial AST
        ast = jsp.parse(orig_code, options.strict_semicolons);
        
    // get a new AST with mangled names
    ast = pro.ast_mangle(ast, options.mangle_options);
    
    // get an AST with compression optimizations
    ast = pro.ast_squeeze(ast, options.squeeze_options);
    
    // compressed code here
    return pro.gen_code(ast, options.gen_options);
}

uglify.parser = require("./lib/parse-js");
uglify.uglify = require("./lib/process");

module.exports = uglify;

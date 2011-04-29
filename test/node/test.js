
var assert = require('assert');

var Class = require("../../node.class.js");

global.Class = Class;

global.ok = function() {
    assert.ok.apply(assert, arguments);
}

global.currentModule = "";

global.test = function(name, test) {
    console.log(global.currentModule+": "+name);
    test();
};

global.equal = global.equals = function() {
    assert.equal.apply(assert, arguments);
};

require("../test.js");

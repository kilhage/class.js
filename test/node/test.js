/*jslint node: true, strict: false */
var assert = require('assert');

global.Class = require("../../node.class.js");

global.ok = function () {
    assert.ok.apply(assert, arguments);
};

global.currentModule = "";

global.test = function (name, test) {
    console.log(global.currentModule + ": " + name);
    test();
};

global.equal = global.equals = function () {
    assert.equal.apply(assert, arguments);
};

global.deepEqual = global.deepEquals = function () {
//    assert.deepEqual.apply(assert, arguments);
};

require("../test.js");

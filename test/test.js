/**
 * Unit tests for both client and server side
 */

/* Some stuff to simplify the testing */

var toString = Object.prototype.toString;

function each( object, callback, args ) {
    var name, i = 0,
        length = object.length,
        isObj = length === undefined || isFunction(object);

    if ( args ) {
        if ( isObj ) {
            for ( name in object ) {
                if ( callback.apply( object[ name ], args ) === false ) {
                    break;
                }
            }
        } else {
            for ( ; i < length; ) {
                if ( callback.apply( object[ i++ ], args ) === false ) {
                    break;
                }
            }
        }
        
    } else {
        if ( isObj ) {
            for ( name in object ) {
                if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                    break;
                }
            }
        } else {
            for ( var value = object[0];
                i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
        }
    }

    return object;
};

function isFunction(fn) {
    return toString.call(fn) == "[object Function]";
};

var class2type = {};

each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function type( obj ) {
    return obj == null ?
        String( obj ) :
        class2type[ toString.call(obj) ] || "object";
};

function log(m){
    if ( typeof console === "object" && typeof console.log === "function" ) {
        console.log.apply(console, arguments);
    }
    return m;
};

function testModule(name) {
    if ( isFunction(module) ) {
        module(name);
    } else {
        this.currentModule = name;
    }
}

/* The tests starts here */

testModule("Initial Check");

test("Class.makeClass", function() {
    
    var C = Class.makeClass();
    
    equal(type(C), "function");
    
    equal(type(new C()), "object");
    equal(type(C()), "object");
    
    var valid = false;
    
    function check() {
        equal(valid, true);
    }
    
    C.prototype.init = function(c) {
        valid = c !== false;
    };
    
    valid = false;
    
    new C(true);
    
    check();
    
    valid = false;
    
    C(true);
    
    check();
    
    function t() {
        new C(arguments);
    }
    
    t(false);
    
    check();
    
    valid = false;
    
    try {
        new C(null);
    } catch(e) {
        valid = false;
    }
    
    ok(valid);
    
});

testModule("Usage");

test("Basic", function(){
    
    var val = "name",
    check,
    
    Cl = Class({
        
        init: function(name){
            this.name = name;
        }
        
    }),
    
    Cl2 = Class({}),
    
    Cl3 = Cl.extend({}),
    
    c = new Cl(val),

    b = Cl(val);
    
    ok(b instanceof Cl);
    ok(c instanceof Cl);
    
    ok(!(b instanceof Cl2));
    ok(!(c instanceof Cl2));
    
    ok(!(b instanceof Cl3));
    ok(!(c instanceof Cl3));
    
    try {
        check = c.name === b.name && b.name === val;
    } catch(e) {
        log(e.message);
        check = false;
    }
    
    ok(check, "Are the behavior of initalizing a class with/without the new keyword the same?");
    
    check = true;
    try {
        var C = Class();
        var t = new C();
        
        C = Class(true);
        t = new C;
        
        C = Class({});
        t = new C();
        
        C = Class(true, {});
        t = new C();
        
        C = Class();
        t = C();
        
        C = Class(true);
        t = C;
        
        C = Class({});
        t = C();
        
        C = Class(true, {});
        t = C();
    } catch(e) {
        log(e.message);
        check = false;
    }
    
    ok(check, "Is it possible to create an empty class?");
    
});

test("Inheritance", function(){
    
    var valid = true;
    
    var Cl = Class({
        
        fn: function() {
            return "first";
        },
            
        set: function(name, val){
            this[name] = val;
        }
        
    });
    
    var Cl2 = Cl.extend({
        
        fn: function(){
            return "not the "+this._parent();
        },
        
        newSet: function(key, value) {
            ok((valid = (typeof this._parent.set == "function")), "could not call parent functions");
            if ( valid )
                this._parent.set(key, value);
            return value;
        }
        
    });
    
    var c = new Cl2();
    
    equals(c.fn(), "not the first");
    
    equals(c.newSet("test", "vaaalue"), c.test);
    
    if ( ! valid )
        return;
    
    Cl2.addMethods({
        
        fn: function(){
            return this._parent()+", but added";
        }
        
    });
    
    c = new Cl2();
    
    equals(c.fn(), "not the first, but added");
    
    var t = 100, y = false, b = t;
    try {
        Cls = {};
        Cls[t] = Class({
            n: 100,

            fn:function(){
                return this.n;
            },

            fn2:function(){
                return this.n;
            },
            
            prototype: {
                init: function(){
                    this.n = 100;
                },

                fn:function(){
                    return this.n;
                },

                fn2:function(){
                    return this.n;
                }
            }
        });

        while( t-- ) {
            Cls[t] = (function(t){
                return Cls[t+1].extend({

                    fn:function(){
                        return this._parent()+t;
                    },

                    fn2:function(){
                        return this._parent.fn2()+t;
                    },
            
                    prototype: {
                        init: !!(t % 2) ? 
                            function(){this._parent()} : 
                            function(){this._parent.init()},

                        fn:function(){
                            return this._parent()+t;
                        },

                        fn2:function(){
                            return this._parent.fn2()+t;
                        }
                    }
                });
            }(t));
            b += t;
        }
        
        c = new Cls[t+1]();
        y = c.fn() == b && c.fn2() == b && Cls[t+1].fn() == b && Cls[t+1].fn2() == b;
    } catch(e) {
        log(e);
        y = false;
    }
    
    ok(y, "Build really long inheritance chains");
    
    Cl = Class({
        subClass: Class({
            fn: function(){
                return true;
            }
        }),
        test: function(){
            var c = new this.subClass();
            return c.fn();
        }
    });
    
    Cl2 = Cl.extend({
        subClass: Class({
            fn: function(){
                return false;
            }
        }),
        test2: function(){
            var c = new this._parent.subClass();
            return c.fn();
        }
    });
    
    c = new Cl2();
    
    equal(c.test(), false);
    equal(c.test2(), true);
    
    var A = Class({
        init: function(){
            
        },
        fn: function(){
            
        } 
    });
    
    var B = A.extend({
        init: function(){
            this._parent();
        },
        
        hello: function(){
            return true;
        }
    });
    
    var C = B.extend({
        init: function(){
            this._parent.fn();
        }
    });
    
    C.addMethods({
        hello2: function(){
            return this._parent.hello && this._parent.hello() === true;
        },
        hi: function(){
            return 1;
        }
    });
    
    valid = true;
    
    var i;
    
    try {
        i = new C();
    } catch(e) {
        valid = false;
    }
    
    equal(valid, true);
    
    if (!valid) return;
    
    ok(i.hello2());
    
    i.addMethods({
        hiThere: function(){
            return this._parent.hi && this._parent.hi() === 1;
        }
    });
    
    ok(i.hiThere());
    
});

test("Static", function(){
    
    var Cl = Class(true, {
        
        staticFn: function(val) {
            this.prop = val;
        },
        
        prototype: {
            
            init: function(){
                this.name = this.prop;
            },
            
            set: function(name, val){
                this[name] = val;
            }
            
        }
        
    });
    
    var Cl2 = Cl.extend(true, {
        
        value: "value",
        
        staticFn: function() {
            this._parent(this.value);
            return this.prop;
        },
        
        prototype: {
            
            prop: "prop",
            
            init: function() {
                this._parent();
                this.set("foo", this.name);
            }
            
        }
        
    });
    
    var c = new Cl2();
    
    equals(Cl2.staticFn(), Cl2.value);
    
    equals(c.foo, Cl2.prototype.prop);
    
    Cl = Class({
        
        staticFn: function(val) {
            this.prop = val;
        },
        
        prototype: {
            
            init: function(){
                this.name = this.prop;
            },
            
            set: function(name, val){
                this[name] = val;
            }
            
        }
        
    });
    
    Cl2 = Cl.extend({
        
        value: "value",
        
        staticFn: function() {
            this._parent(this.value);
            return this.prop;
        },
        
        prototype: {
            
            prop: "prop",
            
            init: function() {
                this._parent();
                this.set("foo", this.name);
            }
            
        }
        
    });
    
    c = new Cl2();
    
    equals(Cl2.staticFn(), Cl2.value);
    
    equals(c.foo, Cl2.prototype.prop);
    
});

test("Instance", function(){
    
    var Cl = Class({
        
        init: function() {
            this.i = 0;
        },
        
        count: function() {
            return this.i;
        }
        
    });
    
    var instance = new Cl();
    
    ok(instance instanceof Cl);
    ok(Cl.prototype.isPrototypeOf(instance));
    
    instance.addMethods({
        
        count: function() {
            var i = this._parent();
            
            i++;
            
            return i;
            
        },
        
        get: function() {
            return this.count()
        }
        
    });
    
    equals(instance.count(), 1, "Make a simple instance extention");
    
    equals(instance.get(), 1);
    
    ok(instance instanceof Cl);
    ok(Cl.prototype.isPrototypeOf(instance));
    
    instance.addMethods({
        
        count: function() {
            var i = this._parent();
            
            i++;
            
            return i;
            
        },
        
        get: function() {
            return this.count()
        }
        
    });
    
    equals(instance.count(), 2, "Extend the same instance again");
    
    equals(instance.get(), 2);
    
    ok(instance instanceof Cl);
    ok(Cl.prototype.isPrototypeOf(instance));
    
    instance = new Cl();
    
    equals(instance.count(), 0, "Make sure that only the instance are modified");
    
    equals(type(instance.get), "undefined");
    
    ok(instance instanceof Cl);
    ok(Cl.prototype.isPrototypeOf(instance));

});

testModule("Internal");

test("Only rewrite functions when it's needed", function(){
    
    var A = Class({
        fn: function(){}
    })
    
    var B = A.extend({
        fn: function(){
            this._parent();
        },
        fn2: function(){
            this._parent.fn();
        }
    });
    
    var C = B.extend({});
    
    ok(B.prototype.fn === C.prototype.fn);
    ok(B.prototype.fn2 === C.prototype.fn2);
    
});

test("Errors", function(){
    var check = function(name, fn, message){
        var check = false;
        try {
             fn();
        } catch(e) {
            check = e == Class.errors[name];
        }
        ok(check, message);
    };
    
    check("logic_parent_call", function(){
        var Cl = Class({
            callToUndefined: function(){
                this._parent();
            }
        });
        
        var c = new Cl();
        
        c.callToUndefined();
        
    }, "Does a function call to a parent method that don't exist in the parent class thows an error?");
    
});

test("Helpers", function(){
   
   each([
       function(){
           this._parent();
       }
   ], function(i, fn){
       ok(Class.fnSearch.test(fn), "Identify if a function calls a parent function?");
   });
   
   each([
       function(){
           this._parent.fn();
       }
   ], function(i, fn){
       ok(Class.parentFnSearch.test(fn), "Identify if a function calls a parent.fn function?");
   });
   
   each([
       function(){
           this.hej();
       },
       function(){
           this._parents();
       },
       function(){
           this_parent();
       }
   ], function(i, fn){
       ok(!Class.fnSearch.test(fn), "Identify if a function don't calls a parent function");
       ok(!Class.fnSearch.test(fn), "Identify if a function don't calls a parent function");
   });
   
   var Cl = Class({
        
        init: function() {
            
        },
        
        fn: function(){
            
        }
        
    });
    
    var Cl2 = Cl.extend({
        
        init: function(){
            this._parent();
        },
        
        fn: function(){
            this._parent();
        }
        
    });
    
    var c = new Cl2();
    
    ok(!("_parent" in c), "Is the '_parent' property properly removed from the instance when it don't exists after a this._parent function call?");
    
    c._parent = true;
    
    c.fn();
    
    ok(c._parent, "Is the '_parent' property properly maintained in the instance when it exists after a this._parent function call?")
   
});

test("Evil", function(){
   
   var Cl, t, check = true,
   tests = {
       "true": true,
       "false": false,
       "null": null,
       "undefined": undefined,
       "\"\"": "",
       "[]": [],
       "NaN": NaN,
       "RegExp": /_parent/
   };
   
   each(tests, function( i, v ) {
       var b = 2, args, nargs, c, m;
       while(b--) {
           check = true;
           m = "Class( ";
           try {
               args = [];
               nargs = [];
               for(c = 0; c <= b; c++) {
                   args.push(v);
                   nargs.push(i);
               }
               m += nargs.join(", ")+" )";
               Cl = Class.apply(Class, args);
               t = new Cl();
           } catch(e) {
               check = false;
               m += " :: error: "+ e.message;
               log(m);
           }
           ok(check, m);
       }
   });
    
    Cl = Class({
        
        init: function(){}
        
    });
    
    var valid = true;
    
    try {
        var instance = new Cl(null);
    } catch(e) {
        valid = false;
    }
    
    ok(valid);
   
});

testModule("Bugs");

test("RegExp's of pure evil", function() {
   
   var Cl = Class({
       
       preg: /_parent/
       
   });
   
   var Cl2 = Cl.extend({});
   
   ok(type(Cl2.prototype.preg) === "regexp", "Are the Class.rewrite function only rewriting functions?");
    
   Cl = Class({
        
        init: /fwscds/
        
    });
    
    var valid = true;
    
    try {
        var instance = new Cl();
    } catch(e) {
        valid = false;
        log(e);
        
    }
    
    ok(valid, "Could we have an reqexp called 'init' ?");
   
});

test("addMethods", function(){
    
    var Cl = Class({
        
        get: function(){
            return "hi there";
        }
        
    });
    
    var instance = new Cl();
    
    Cl.addMethods({
        
        get: function(){
            return this._parent();
        }
        
    });
    
    ok(instance instanceof Cl, "make sure that the instance still is the instance of it's origin");
    ok(Cl.prototype.isPrototypeOf(instance));

});

test("Unwanted properties", function() {

    var C = Class({
        
        fn: function() {
            
        },
        
        fn2: function() {
            
        }
        
    });
    
    var T = C.extend({
        
        fn2: function(){
            this._parent.fn();
        }
        
    });
    
    C.prototype.fn2.fn = true;
    
    var o = new T();
    
    o.fn2();
    
    equals( C.prototype.fn2.fn, true );
    
});

testModule("Features");

test("Class.is", function () {
    
    var A = Class({});
    var B = A.extend({});
    
    each([A, B], function(i, fn){
        ok(Class.is(fn, "is a valid class"));
    });
    
    each({
        "null": null,
        "undefined": undefined,
        "false": false,
        "true": true,
        "array": [],
        "plain object": {},
        "int": 1,
        "float": 2.4,
        "regexps": /ccds/,
        "string": "hyjukl"
        }, function(type, p){
        ok(!Class.is(p), type + "is not a class");
    });
    
});

test("constructor.inherits", function() {
    
    var Cl = Class({});
    
    var Ext = Cl.extend({});
    
    var Ext2 = Ext.extend({});
    
    ok( Ext2.inherits(Ext) );
    ok( Ext2.inherits(Cl) );
    ok( Ext.inherits(Cl) );
    ok( ! Cl.inherits(Ext) );
    
    try {
        each({
            "null": null,
            "undefined": undefined,
            "false": false,
            "true": true,
            "array": [],
            "plain object": {},
            "int": 1,
            "float": 2.4,
            "regexps": /ccds/,
            "string": "hyjukl"
        }, function(type, v){
            ok( ! Ext2.inherits(v), type + " does not inherits from Ext2");
        });
        
    } catch(e) {
        ok(false);
    }
    
});

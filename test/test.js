
log = function(m) {
    if ( typeof window.console === "object" && typeof console.log === "function" ) {
        var type = typeof m;
        if ( type === "string" || type === "number") {
            m = $.Class.log_prefix + m;
        }
        console.log(m);
    }
    return m;
};

test("Basic", function(){
    
    var val = "name",
    check,
    
    Cl = $.Class({
        
        init: function(name){
            this.name = name;
        }
        
    }),
    
    c = new Cl(val),

    b = Cl(val);
    
    try {
        check = c.name === b.name;
    } catch(e) {
        log(e.message);
        check = false;
    }
    
    ok(check, "Are the behavior of initalizing a class with/without the new keyword the same?");
    
    check = true;
    try {
        var C = $.Class();
        var t = new C();
        
        C = $.Class(true);
        t = new C;
        
        C = $.Class({});
        t = new C();
        
        C = $.Class(true, {});
        t = new C();
        
        C = $.Class();
        t = C();
        
        C = $.Class(true);
        t = C;
        
        C = $.Class({});
        t = C();
        
        C = $.Class(true, {});
        t = C();
    } catch(e) {
        log(e.message);
        check = false;
    }
    
    ok(check, "Is it possible to create an empty class?");
    
});

test("Inheritance", function(){
    
    var Cl = $.Class({
        
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
        
        newSet: function(key, value){
            this._parent.set(key, value);
            return value;
        }
        
    });
    
    var c = new Cl2();
    
    equals(c.fn(), "not the first");
    
    equals(c.newSet("test", "vaaalue"), c.test);
    
    Cl2.addMethods({
        
        fn: function(){
            return this._parent()+", but added";
        },
        
        fn2: function(m){
            return this._parent.fn()+m;
        }
        
    });
    
    c = new Cl2();
    
    equals(c.fn(), "not the first, but added");
    
    equals(c.fn2(", but fn2"), "not the first, but fn2");
    
    Cl2.addMethods({
        
        fn: function(){
            return this._parent.fn()+" - "+this._parent.fn2(", but fn");
        }
        
    });
    
    c = new Cl2();
    
    equals(c.fn(), "not the first, but added - not the first, but fn");
    
});

test("Static", function(){
    
    var Cl = $.Class(true, {
        
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
    
    Cl = $.Class({
        
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

test("Errors", function(){
    var check = function(name, fn, message){
        var check = false;
        try {
             fn();
        } catch(e) {
            check = e == $.Class.log_prefix + $.Class.errors[name];
        }
        ok(check, message);
    };
    
    check("logic_parent_call", function(){
        var Cl = $.Class({
            callToUndefined: function(){
                this._parent();
            }
        });
        
        var c = new Cl();
        
        c.callToUndefined();
        
    }, "Does a function call to a parent method that don't exist in the parent class thows an error?");
    
    check("self_in_prop", function(){
        
        $.Class({__self__: function(){}});
        
    }, "The plugin should not allow functions called '__self__'");
    
});

test("Internal test", function(){
   
   var Cl = $.Class({
       
       init: function(){
           
       }
       
   }),
   Cl2 = Cl.extend({
       
       init: function(){
           this._parent();
       },
       
       test: function(){
           this._parent.fn();
       },
       
       fn: function(){
           
       }
       
   });
   
   ok($.Class.is(Cl), "Can $.Class.is identify classes created by the plugin?");

   ok( ! $.Class.is(function(){}), "Can $.Class.is identify classes not created by the plugin?");
  
   ok($.Class.fnSearch.test(Cl2.prototype.init) && $.Class.parentFnSearch.test(Cl2.prototype.test), "Can the plugin identify if a function calls a parent function");
  
   ok( ! $.Class.fnSearch.test(Cl2.prototype.fn), "Can the plugin identify if a function don't calls a parent function");
    
    Cl = $.Class({
        
        init: function() {
            
        },
        
        fn: function(){
            
        }
        
    });
    
    Cl2 = Cl.extend({
        
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
   
   $.each(tests, function( i, v ) {
       var b = 2, args, nargs, c, m;
       while(b--) {
           check = true;
           m = "$.Class( ";
           try {
               args = [];
               nargs = [];
               for(c = 0; c <= b; c++) {
                   args.push(v);
                   nargs.push(i);
               }
               m += nargs.join(", ")+" )";
               Cl = $.Class.apply($.Class, args);
               t = new Cl();
           } catch(e) {
               check = false;
               m += " :: error: "+ e.message;
               log(m);
           }
           ok(check, m);
       }
   });
   
});

test("Bugs", function() {
   
   var Cl = $.Class({
       
       preg: /_parent/
       
   });
   
   var Cl2 = Cl.extend({});
   
   ok($.type(Cl2.prototype.preg) === "regexp", "Are the $.Class.rewrite function only rewriting functions?")
   
});

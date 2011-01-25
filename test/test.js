

test("Basic", function(){
    
    var val = "name";
    
    var Cl = $.Class({
        
        init: function(name){
            this.name = name;
        }
        
    }),
    
    c = new Cl(val);
    
    equals(c.name, val);
    
});


test("Inheritance", function(){
    
    var Cl = $.Class({
        
        fn: function() {
            return "first";
        }
        
    });
    
    var Cl2 = Cl.extend({
        
        fn: function(){
            return "not the "+this._parent();
        }
        
    });
    
    var c = new Cl2();
    
    equals(c.fn(), "not the first");
    
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
    
});

/*--------------------------------------------*
 * Low-level plugin that helps 
 * you to create classes/objects
 * https://github.com/kilhage/jquery-class
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-04-25 21:44:41
 * Version 1.0.0
 *--------------------------------------------*/
(function(root) {

var initializing = false,
prefix = "_Class",

unique = prefix + (new Date()).getTime() + "_",
ID = "_"+unique+"_",

_searchable = (/\b_parent\b/).test(function(){this._parent();}),
fnSearch = _searchable ? (/\b_parent\b/) : /.*/,
parentFnSearch = _searchable ? (/\b_parent\b\./) : /.*/,

test = RegExp.prototype.test,
toString = Object.prototype.toString,

/**
 * makeClass - By John Resig (MIT Licensed)
 * http://ejohn.org/
 *
 * Makes it possible to instantiate a
 * class both with or without the new keyword.
 * It also moves the constructor to a function
 * on the prototype called "init"
 *
 * @return <function Awesome>
 */
makeClass = function(){
    function Awesome( args ) {
        if ( this instanceof Awesome ) {
            // If not executing the "extend" function and an init method exist
            if ( initializing === false && isFunction(this.init) ) {
                // Call the "real" constructor and apply the arguments
                this.init.apply(this, (typeof args === "object" && args !== null && args.callee) ? args : arguments);
            }
        } else {
            // Instantiate the class and pass the aruments
            return new Awesome(arguments);
        }
    }
    
    return Awesome;
},

/**
 * The base Class implementation that all 
 * classes created by this plugin will be extended from
 */
Base = makeClass();

/**
 * Makes it possible to create classes that extends
 * antoher class prototype
 */
Base.extend = function( setStatic, prop ) {

        // Create the new class
    var Awesome = makeClass(), name, src = this, 
        prototype, parent = src.prototype;

    if ( typeof setStatic !== "boolean" ) {
        prop = setStatic;
    }

    prop = typeof prop === "object" && prop !== null ? prop : {};
    
    prototype = prop.prototype;

    // Move all static properties
    for ( name in src ) {
        if( src.hasOwnProperty(name) ) {
            Awesome[name] = src[name];
        }
    }

    if ( setStatic === true || (typeof prototype === "object" && prototype !== null) ) {
        add(prop, src, Awesome, Class.initPopulator(src));
        prop = prototype;
    }
    
    // Create a shallow copy of the source prototype
    initializing = true;
    prototype = new src();
    initializing = false;

    // Copy the properties over onto the new proto
    add(prop || {}, parent, prototype, Class.initPopulator(parent));

    Awesome.prototype = prototype;
    
    /**
     * Enforce the constructor to be what we expect
     * 
     * Store a reference to the constructor at the prototype
     * Makes it possible to access the constructor dynamically inside an instance
     */
    Awesome.constructor = Awesome.prototype.constructor = Awesome;
    
    /**
     * Checks if a class inherits from another class
     * 
     * @param <function> parent
     * @return boolan
     */
    Awesome.inherits = function(parent) {
        return parent === src || src.inherits(parent);
    };
    
    return Awesome;
};

/**
 * Adds methods to a Class proto
 */
Base.addMethods = function( prop ) {
    return add(prop, this.prototype);
};

/**
 * The Base-class doesn't inherit from anything
 * @return <boolean> false
 */
Base.inherits = function() {
    return false;
};

Base.prototype = {

    /**
     * A default function on all classes that are created.
     *
     * Makes in possible to extend already initalized
     * objects in an easy way
     * 
     * @param <object> prop
     * @return self
     */
    addMethods: function( prop ) {
        return add(prop, this);
    }

};

/**
 * Needed to rewrite the behaviour of this regexp's test method to work properly
 */
parentFnSearch.test = function(fn) {
    return test.call(parentFnSearch, fn) || fn[ID] === true;
};

/**
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * @param <object> prop: The proto that you want the object to have
 * @return <function> Created class
 */
function Class( setStatic, prop ) {
    return Base.extend( setStatic, prop );
}

Class.fnSearch = fnSearch;
Class.parentFnSearch = parentFnSearch;
Class.log_prefix = prefix;

// Error messages
Class.errors = {
    logic_parent_call: ": Logic error, unable to call the parent function since it isn't defined..",
    invalid_$: ": Invalid data-type of the global '$' property"
};

/**
 * makeClass - By John Resig (MIT Licensed)
 * http://ejohn.org/
 *
 * Makes it possible to instantiate a
 * class both with or without the new keyword.
 * It also moves the constructor to a function
 * on the prototype called "init"
 *
 * @return <function>
 */
Class.makeClass = makeClass;

/**
 * 
 * @param <string> name
 * @param <object> current
 * @param <object> parent
 * @param <function> populator
 * @return <function>
 */
Class.rewrite = function(name, current_props, parent_props, populator) {
    var current = current_props[name], parent = parent_props[name];
    
    if (!(isFunction(current) && 
        // Check if we're overwriting an existing function using a parent method
        (isFunction(parent) || !(name in parent_props)) &&
        // Don't rewrite classes, and only rewrite functions that are calling a parent function
        ! Class.is(current) && fnSearch.test(current)))
        return current;
    
    var populate = !!(isFunction(populator) && parentFnSearch.test(current)), 

    /**
     * Needed to wrap the original function inside a new function to avoid adding
     * properties to the original function when calling 'this._parent.<method name>()'
     */
    _parent = parent ? function() {
        return parent.apply(this, arguments);
    } : function() {
        // Make sure to throw an error when calling a method that don't exists
        throw prefix + Class.errors.logic_parent_call;
    },
    
    method = function() {
        var self = this, set_parent = "_parent" in self, 
            // store the content in the '_parent' property 
            // so we can revert the object after we're done
            tmp = self._parent, ret, parent_functions, name;

        // Add the parent class's methods to 'this._parent' which enables you 
        // to call 'this._parent<method name>()'
        if ( populate === true ) {
            populate = false;
            // Get the parent functions from the populator
            parent_functions = populator();
            for ( name in parent_functions) {
                if ( parent_functions.hasOwnProperty(name) ) {
                    // Add the parent functions
                    _parent[name] = parent_functions[name];
                }
            }
        }

        // Add a new ._parent() method that points to the parent 
        // class's method with the same name
        self._parent = _parent;

        // Save a reference to the class instance on the parent
        // function so the other methods from the instance parent class can be called
        self._parent[unique] = self;

        // Execute the original function
        ret = current.apply( self, arguments );

        // Restore the context
        if ( set_parent ) {
            self._parent = tmp;
        } else {
            delete self._parent;
        }

        return ret;
    }

    method[ID] = populate;

    return method;
};

/**
 * Checks if a function is created by this plugin
 * @param <function> fn
 * @return <boolean>
 */
Class.is = function(fn) {
    return !!(fn && fn.extend === Base.extend);
};

/**
 * 
 * @param <object> parent
 * @return <function>
 */
Class.initPopulator = function(parent) {
    var cache = null;
    return function(){
        // Only build this once
        if ( cache === null ) {
            cache = {};
            for ( var key in parent ) {
                if ( isFunction(parent[key]) ) {
                    cache[key] = (function(fn) {
                        return function(){
                            return fn.apply(this[unique], arguments);
                        };
                    }(parent[key]));
                }
            }
        }
        return cache;
    };
};

/* ============ Private Helper functions ============ */

function add(from, ref, to, populator) {
    to = to != null ? to : ref;
    for ( var name in from ) {
        if( from.hasOwnProperty(name) ) {
            to[name] = Class.rewrite( name, from, ref, populator );
        }
    }
    return ref;
}

function isFunction(fn) {
    return toString.call(fn) === "[object Function]";
}

/* ================= Expose globally ================ */

if ( ! root.$ ) {
    // Make sure that $ isn't overwritten..
    if ( "$" in root ) {
        throw prefix + Class.errors.invalid_$;
    }
    root.$ = {};
}

root.$.Class = Class;

}(this));

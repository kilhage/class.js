/*--------------------------------------------*
 * Useful extensions when
 * you are creating your own
 * javascript objects/classes
 *--------------------------------------------*
 * Orgins from:
 * Simple JavaScript Inheritance and makeClass
 * by John Resig http://ejohn.org/
 *--------------------------------------------*
 * Added functionality by Emil Kilhage
 *--------------------------------------------*
 * Last Update: 2011-02-27 18:54:08
 *--------------------------------------------*/
(function(window) {

var initializing = false,

prefix = "$.Class :: ",

// This 'ID' key will be set to 'unique' on all classes
// created by this plugin so the plugin can 
// identify the classes in an easy way
ID = "__is_class__",
unique = prefix + (new Date()).getTime(),

_searchable = (/\b_parent\b/).test(function(){this._parent();}),
fnSearch = _searchable ? (/\b_parent\b/) : /.*/,
parentFnSearch = _searchable ? (/\b_parent\b\./) : /.*/,

toString = Object.prototype.toString, // Used in the isFunction function in the buttom

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

    Awesome[ID] = unique;

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

    // Create a new class
    var Awesome = makeClass(), name, src = this, prototype, parent = src.prototype || {};

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

    if ( setStatic === true || typeof prototype === "object" && prototype != null ) {
        Class.validate(prop);
        add(prop, src, Awesome, Class.initPopulator(src));
        prop = prototype;
    }

    // Enforce the constructor to be what we expect
    Awesome.constructor = Awesome;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    prototype = new src();
    initializing = false;

    prop = prop || {};
    Class.validate(prop);

    // Copy the properties over onto the new proto
    add(prop, parent, prototype, Class.initPopulator(parent));

    Awesome.prototype = prototype;
    
    return Awesome;
};

/**
 * Adds methods to a Class proto
 */
Base.addMethods = function( prop ) {
    return add(prop, this.prototype);
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
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * @param <object> prop: The proto that you want the object to have
 * @return <function> Created class
 */
var Class = function( setStatic, prop ) {
    return Base.extend( setStatic, prop );
};

Class.fnSearch = fnSearch;
Class.parentFnSearch = parentFnSearch;
Class.log_prefix = prefix;

// Error messages
Class.errors = {
    logic_parent_call: "Logic error, unable to call the parent function since it isn't defined..",
    self_in_prop: "'__self__' is a preserved word used in the jQuery.Class plugin, please rename the function"
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
 * Rewrites a property
 * 
 * @param <string> name
 * @param <object> current
 * @param <object> parent
 * @param <function> populator
 * @return <function>
 */
Class.rewrite = function(name, current, parent, populator) {
    return ((isFunction(current[name]) && 
        // Check if we're overwriting an existing function using a parent method
        (isFunction(parent[name]) || ! (name in parent)) &&
        // Don't rewrite classes, and only rewrite functions that are calling a parent function
        ! Class.is(current[name]) && fnSearch.test(current[name])) ? 
        // Rewrite the function and make it possible to call the parent function
        (function(current, parent, populator) {
            parent = parent || function() {
                error("logic_parent_call");
            };

            var populate = isFunction(populator) && parentFnSearch.test(current);
            function get() {
                if ( populate === true ) {
                    populate = false;
                    // Get the parent functions from the populator callback
                    var parent_functions = populator(), name;
                    for ( name in parent_functions) {
                        if ( parent_functions.hasOwnProperty(name) ) {
                            // Add the parent functions
                            parent[name] = parent_functions[name];
                        }
                    }
                }
                return parent;
            }

            return function() {
                var set_parent = this.hasOwnProperty("_parent"), 
                    // store the content in the '_parent' property 
                    // so we can revert the object after we're done
                    tmp = this._parent, ret;

                // Add a new ._parent() method that points to the parent class
                this._parent = get();

                // Save a reference to the class instance on the parent
                // function so the other methods from the instance parent class can be called
                this._parent.__self__ = this;

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                ret = current.apply( this, arguments );

                if ( set_parent ) {
                    this._parent = tmp;
                } else {
                    try {
                        delete this._parent;
                    } catch(e) {}
                }

                return ret;
            };
        }(current[name], parent[name], populator)) : current[name]);
};

/**
 * Checks if a function is created by this plugin
 * @param <function> fn
 * @return <boolean>
 */
Class.is = function(fn) {
    return fn[ID] === unique;
};

/**
 * 
 * @param <object> parent
 * @return <function>
 */
Class.initPopulator = function(parent) {
    var cache;
    return function(){
        // Only build this once
        if ( cache == null ) {
            cache = {};
            for ( var key in parent ) {
                if ( parent.hasOwnProperty(key) && isFunction(parent[key]) ) {
                    cache[key] = (function(fn) {
                        return function(){
                            return fn.apply(this.__self__, arguments);
                        };
                    }(parent[key]));
                }
            }
        }
        return cache;
    };
};

Class.validate = function(prop) {
    if ( isFunction(prop.__self__) ) {
        error("self_in_prop");
    }
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

function error(key) {
    throw (Class.log_prefix + Class.errors[key]);
}

/* ================= Expose globally ================ */

if ( ! window.$ ) {
    window.$ = {};
}

window.$.Class = Class;

if ( "jQuery" in window ) {
    window.jQuery.Class = Class;
}

}(window));

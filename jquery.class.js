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
 * Last Update: 2011-02-26 02:02:56
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
 * Makes it possible to extend objects
 */
Base.extend = function( setStatic, prop ) {

    // Create a new class
    var Awesome = makeClass(), name;

    if ( typeof setStatic !== "boolean" ) {
        prop = setStatic;
    }

    prop = typeof prop === "object" && prop !== null ? prop : {};

    // Move all static properties
    for ( name in this ) {
        if( this.hasOwnProperty(name) ) {
            Awesome[name] = this[name];
        }
    }

    if ( setStatic === true || typeof prop.prototype === "object" ) {
        Class.validate(prop);
        add(prop, this, Awesome, Class.initPopulator(this));
        prop = prop.prototype;
    }

    // Enforce the constructor to be what we expect
    Awesome.constructor = Awesome;

    // Populate our constructed prototype object
    Class.addMethods( this, prop, Awesome );

    return Awesome;
};

/**
 * Adds methods to a Class prototype
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
    extend: function(prop) {
        return add(prop, this);
    }

};

/**
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * @param <object> prop: The prototype that you want the object to have
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
 * Adds methods to a class prototype
 *
 * @param <function> src: The Class that the methods should be added to
 * @param <object> prop: New methods
 * @param <function> [classToModify]: The Class that should be modified
 *
 * @return {class} Modified class
 */
Class.addMethods = function( src, prop, classToModify ) {
    // If "classToModify" isn't set, modify "src" insead
    classToModify = classToModify || src;

    initializing = true;

    var parent = src.prototype || {},
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        prototype = new src();
    
    initializing = false;

    prop = prop || {};
    Class.validate(prop);

    // Copy the properties over onto the new prototype
    add(prop, parent, prototype, Class.initPopulator(parent));

    classToModify.prototype = prototype;

    return classToModify;
};

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
        (function(parent_method, parent, populator) {
            parent = parent || function() {
                error("logic_parent_call");
            };

            var populate = isFunction(populator) && parentFnSearch.test(parent_method);
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
                var set_parent = "_parent" in this, tmp = this._parent, ret;

                // Add a new ._parent() method that is the same method
                // but on the parent-class
                this._parent = get();

                // Save a reference to the class instance on the parent
                // function so the other parent functions can be called
                this._parent.__self__ = this;

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                ret = parent_method.apply( this, arguments );

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
 * @param <boolean> [inProto]
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

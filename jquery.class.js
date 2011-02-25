/*--------------------------------------------*
 * Useful extensions when
 * you are creating your own
 * javascript objects/classes
 *--------------------------------------------*
 * Orgins from:
 * Simple JavaScript Inheritance and makeClass
 * by John Resig http://ejohn.org/
 *--------------------------------------------*
 * Integrated with jQuery and added
 * functionality by Emil Kilhage
 *--------------------------------------------*
 * Last Update: 2011-02-25 21:44:23
 *--------------------------------------------*/
(function( $ ) {

var initializing = false,

prefix = "jQuery.Class :: ",

// This 'ID' key will be set to 'unique' on all classes
// created by this plugin so the plugin can 
// identify the classes in an easy way
ID = "__is_class__",
unique = prefix + $.now(),

_searchable = (/\b_parent\b/).test(function(){this._parent();}),
fnSearch = _searchable ? (/\b_parent\b/) : /.*/,
parentFnSearch = _searchable ? (/\b_parent\b\./) : /.*/,

FUNCTION = "function",
OBJECT = "object",
BOOLEAN = "boolean",

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
            if ( ! initializing && typeof this.init === FUNCTION ) {
                // Call the "real" constructor and apply the arguments
                this.init.apply( this, (typeof args === OBJECT && args.callee) ? args : arguments );
            }
        } else {
            // Instantiate the class and pass the aruments
            return new Awesome( arguments );
        }
    }

    Awesome[ID] = unique;

    return Awesome;
},

/**
 * The base Class implementation (does nothing) and some base functions
 */
Base = $.extend( makeClass(), {

    /**
     * Makes it possible to extend objects
     */
    extend: function( setStatic, prop ) {

        // Create a new class
        var Class = makeClass(), name, populator;

        if ( typeof setStatic !== BOOLEAN ) {
            prop = setStatic;
        }
        
        prop = typeof prop === OBJECT && prop !== null ? prop : {};

        // Add functions
        for ( name in this ) {
            if( this.hasOwnProperty(name) ) {
                Class[name] = this[name];
            }
        }

        if ( setStatic === true || typeof prop.prototype === OBJECT ) {
            populator = $.Class.initPopulator(this);
            $.Class.validate(prop);
            for ( name in prop ) {
                if( prop.hasOwnProperty(name) && name !== "prototype" ) {
                    Class[name] = $.Class.rewrite(name, prop, this, populator);
                }
            }
            prop = prop.prototype;
        }

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // Populate our constructed prototype object
        $.Class.addMethods( this, prop, Class );

        return Class;
    },

    /**
     * An alias for the $.Class.addMethods method
     * to be able to add methods to a class with a nice syntax
     */
    addMethods: function( prop ) {
        return $.Class.addMethods( this, prop );
    }

});

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
        for ( var name in prop ) {
            if( prop.hasOwnProperty(name) ) {
                this[name] = $.Class.rewrite( name, prop, this );
            }
        }
        return this;
    }

};

/**
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * @param <object> prop: The prototype that you want the object to have
 * @return <function> Created class
 */
$.Class = function( setStatic, prop ) {
  return Base.extend( setStatic, prop );
};

$.extend($.Class, {
    
    fnSearch: fnSearch,
    parentFnSearch: parentFnSearch,
    
    // Error messages
    errors: {
        logic_parent_call: "Logic error, unable to call the parent function since it isn't defined..",
        self_in_prop: "'__self__' is a preserved word used in the jQuery.Class plugin, please rename the function"
    },
    
    log_prefix: prefix,
    
    /**
     * Internal error function
     */
    error: function(key) {
        $.error($.Class.log_prefix + $.Class.errors[key]);
    },

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
    makeClass: makeClass,

   /**
    * Adds methods to a class' prototype
    *
    * @param <function> src: The Class that the methods should be added to
    * @param <object> prop: New methods
    * @param <function> [classToModify]: The Class that should be modified
    *
    * @return {class} Modified class
    */
    addMethods: function( src, prop, classToModify ) {
        // If "classToModify" isn't set, modify "src" insead
        classToModify = classToModify || src;

        initializing = true;

        var parent = src.prototype || {},
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        prototype = new src(),
        populator = $.Class.initPopulator(parent),
        name;
        initializing = false;
        
        prop = prop || {};
        $.Class.validate(prop);

        // Copy the properties over onto the new prototype
        for ( name in prop ) {
            // Avoid problems if someone should add properties to the Object.prototype
            if( prop.hasOwnProperty(name) ) {
                prototype[name] = $.Class.rewrite( name, prop, parent, populator );
            }
        }
        
        classToModify.prototype = prototype;

        return classToModify;
    },
    
    /**
     * Rewrites a property
     * 
     * @param <string> name
     * @param <object> current
     * @param <object> parent
     * @param <function> populator
     * @return <function>
     */
    rewrite: function(name, current, parent, populator) {
        return (($.type(current[name]) === FUNCTION && 
            // Check if we're overwriting an existing function using a parent method
            ($.type(parent[name]) === FUNCTION || ! (name in parent)) &&
            // Don't rewrite classes, and only rewrite functions that are calling a parent function
            ! $.Class.is(current[name]) && fnSearch.test(current[name])) ? 
            // Rewrite the function and make it possible to call the parent function
            (function(parent_method, parent, populator) {
                parent = parent || function() {
                    $.Class.error("logic_parent_call");
                };
                
                var populate = typeof populator === FUNCTION && parentFnSearch.test(parent_method);
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
    },
    
    /**
     * Checks if a function is created by this plugin
     * @param <function> fn
     * @return <boolean>
     */
    is: function(fn) {
        return fn[ID] === unique;
    },
    
    /**
     * 
     * @param <object> parent
     * @param <boolean> [inProto]
     * @return <function>
     */
    initPopulator: function(parent) {
        var cache, key;
        return function(){
            // Only build this once
            if ( cache == null ) {
                cache = {};
                for ( key in parent ) {
                    if ( parent.hasOwnProperty(key) && $.type(parent[key]) === FUNCTION ) {
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
    },
    
    validate: function(prop) {
        if ( $.type(prop.__self__) === FUNCTION ) {
            $.Class.error("self_in_prop");
        }
    }

});

}( jQuery ));

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
 * Last Update: 2011-01-30 03:35:00
 *--------------------------------------------*/
(function( $ ) {

var initializing = false,

prefix = "jQuery.Class :: ",

// This 'ID' key will be set to 'unique' on all classes
// created by this plugin so the plugin can 
// identify the classes in an easy way
ID = "__is_class__",
unique = prefix + ((new Date()).getTime()),

fnSearch = (/\b_parent\b/).test(function(){this._parent();}) ? (/\b_parent\b/) : /.*/,

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
 * @return <function Class>
 */
makeClass = function(){
    function Class( args ) {
        if ( this instanceof arguments.callee ) {
            // If not executing the "extend" function and an init method exist
            if ( ! initializing && typeof this.init === FUNCTION ) {
                // Call the "real" constructor and apply the arguments
                this.init.apply( this, (typeof args === OBJECT && args.callee) ? args : arguments );
            }
        } else {
            // Instantiate the class and pass the aruments
            return new arguments.callee( arguments );
        }
    }

    Class[ID] = unique;

    return Class;
},

/**
 * The base Class implementation (does nothing) and some base functions
 */
Base = $.extend( makeClass(), {

    /**
     * Create the extend method that makes it possible to extend objects
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

/**
 * Just an alias for the $.Class.Create function
 */
$.Class = function( setStatic, prop ) {
  return $.Class.create( setStatic, prop );
};

$.extend($.Class, {
    
    fnSearch: fnSearch,
    
    // Error messages
    errors: {
        logic_parent_call: "Logic error, unable to call the parent function since it isn't defined.."
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
    * Simple JavaScript Inheritance
    * By John Resig http://ejohn.org/
    * MIT Licensed.
    * @param <object> prop: The prototype that you want the object to have
    * @return <function> Created class
    */
    create: function( setStatic, prop ) {
        return Base.extend( setStatic, prop );
    },

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
        return ((typeof current[name] === FUNCTION && 
            // Check if we're overwriting an existing function using a parent method
            (typeof parent[name] === FUNCTION || ! (name in parent)) &&
            // Don't rewrite classes, and only rewrite functions that are calling a parent function
            ! $.Class.is(current[name]) && fnSearch.test(current[name])) ? 
            // Rewrite the function and make it possible to call the parent function
            $.Class.rewriteMainParent(current[name], parent[name], populator) : current[name]);
    },
    
    /**
     * @param <function> fn
     * @param <function> _parentFn
     * @param <function> populator
     * @return <function>
     */
    rewriteMainParent: function(fn, _parentFn, populator){
        var parent_functions = populator(), name;
        
        _parentFn = _parentFn || function() {
            $.Class.error("logic_parent_call");
        };
        
        for ( name in parent_functions) {
            if ( parent_functions.hasOwnProperty(name) ) {
                _parentFn[name] = parent_functions[name];
            }
        }
        
        return function() {
            var set_parent = ("_parent" in this), tmp = this._parent, ret;

            // Add a new ._parent() method that is the same method
            // but on the parent-class
            this._parent = _parentFn;
            // Save a reference to the class instance on the parent
            // function so the other parent functions can be called
            this._parent._self = this;

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            ret = fn.apply( this, arguments );
            
            if ( set_parent ) {
                this._parent = tmp;
            } else {
                try {
                    delete this._parent;
                } catch(e) {}
            }

            return ret;
        };
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
                    if ( parent.hasOwnProperty(key) && typeof parent[key] === FUNCTION ) {
                        cache[key] = (function(fn) {
                            return function(){
                                return fn.apply(this._self, arguments);
                            };
                        }(parent[key]));
                    }
                }
            }
            return cache;
        };
    }

});

}( jQuery ));

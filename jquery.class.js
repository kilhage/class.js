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
 * Last Update: 2011-01-27 21:16:00
 *--------------------------------------------*/
(function( $ ) {

var initializing = false,

// This 'ID' key will be set to 'unique' on all classes
// created by this plugin so the plugin can 
// identify the classes in an easy way
ID = "__is_class__",
unique = "jQuery.Class-" + ((new Date()).getTime()),

// Does the browser have an debug-console?
enable_log = typeof window.console === "object" && typeof console.log === "function",
// Internal log function
log = function(m) {
    if ( enable_log && $.Class.enable_log ) {
        var type = typeof m;
        if ( type === "string" || type === "number") {
            m = $.Class.log_prefix + m;
        }
        console.log(m);
    }
    return m;
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
 * @return <function Class>
 */
makeClass = function(){
    function Class( args ) {
        if ( this instanceof arguments.callee ) {
            // If not executing the "extend" function and an init method exist
            if ( ! initializing && typeof this.init === "function" ) {
                // Call the "real" constructor and apply the arguments
                this.init.apply( this, (typeof args === "object" && args.callee) ? args : arguments );
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
        var Class = $.Class.makeClass(), n, populator;

        if ( typeof setStatic !== "boolean" ) {
            prop = typeof setStatic === "object" && setStatic !== null ? setStatic : {};
            setStatic = typeof prop.prototype === "object";
        } else {
            prop = typeof prop === "object" && prop !== null ? prop : {};
        }

        // Add functions
        for ( n in this ) {
            if( this.hasOwnProperty(n) ) {
                Class[ n ] = this[ n ];
            }
        }

        if ( setStatic === true ) {
            populator = $.Class.initPopulator(this);
            for ( n in prop ) {
                if( prop.hasOwnProperty(n) && n !== "prototype" ) {
                    Class[n] = $.Class.rewrite(n, prop, this, populator);
                }
            }
            prop = prop.prototype || {};
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
    
    fnSearch: (function(){
        var fn = function(){var h = xyz;};
        return (/xyz/).test( fn ) ? /\b_parent\b/ : /.*/;
    }()),
    
    enable_log: true,
    
    // Error messages
    errors: {
        logic_parent_call: "Logic error, unable to call the parent function since it isn't defined"
    },
    
    log_prefix: "jQuery.Class :: ",
    
    /**
     * Internal error function
     */
    error: function(key) {
        $.error($.Class.log_prefix + $.Class.errors[key]);
    },
    
    log: log,

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
        populator = $.Class.initPopulator(parent, true),
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
        return ((typeof current[name] === "function" && 
            // Check if we're overwriting an existing function using a parent method
            (typeof parent[name] === "function" || ! (name in parent)) &&
            // Don't rewrite classes, and only rewrite functions that are calling a parent function
            ! $.Class.is(current[name]) && $.Class.fnSearch.test(current[name])) ? 
            // Rewrite the function and make it possible to call the parent function
            $.Class.rewriteMainParent(current[name], parent[name], populator) : current[name]);
    },
    
    /**
     * @param <function> fn
     * @return <function>
     */
    rewriteParent: function(fn){
        return function(){
            return fn.apply(this._self, arguments);
        };
    },
    
    /**
     * @param <function> fn
     * @param <function> _parentFn
     * @param <function> populator
     * @return <function>
     */
    rewriteMainParent: function(fn, _parentFn, populator){
        _parentFn = _parentFn || function() {
            $.Class.error("logic_parent_call");
        };
        $.extend(_parentFn, populator());
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
                delete this._parent;
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
    initPopulator: function(parent, inProto) {
        var cache = null, key;
        return function(){
            // Only build the cache once
            if ( cache === null ) {
                cache = {};
                for ( key in parent ) {
                    if ( parent.hasOwnProperty(key) && typeof parent[key] === "function" && 
                            (inProto || typeof Base[key]) !== "function" ) {
                        cache[key] = $.Class.rewriteParent(parent[key]);
                    }
                }
            }
            return cache;
        };
    }

});

}( jQuery ));

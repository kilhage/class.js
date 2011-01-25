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
 * Last Update: 2011-01-25 22:41:0
 *--------------------------------------------*/
(function( $ ) {

var initializing = false,
_fnSearchFn = function(){var h = xyz;},
fnSearch = /xyz/.test( _fnSearchFn ) ? /\b_parent\b/ : /.*/,
id = "__is_class__";

$.Class = function( setStatic, prop ) {
  return $.Class.create( setStatic, prop );
};

$.extend($.Class, {
    
    _unique: "jQueryClass-"+(new Date).getTime(),

   /**
    * makeClass - By John Resig (MIT Licensed)
    * http://ejohn.org/
    *
    * Makes it possible to instantiate a
    * class both with or without the new keyword.
    * It also moves the constructor to a function
    * on the prototype called "init"
    *
    * @return {class}
    */
    makeClass: function() {
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
        };
        
        Class[id] = $.Class._unique;
        
        return Class;
    },

   /**
    * Simple JavaScript Inheritance
    * By John Resig http://ejohn.org/
    * MIT Licensed.
    *
    * @param prop {object}: The prototype that you want the object to have
    * 
    * @return {class} Created class
    */
    create: function( setStatic, prop ) {
        return BaseClass.extend( setStatic, prop );
    },

   /**
    * Adds methods to a class' prototype
    *
    * @param src {class}: The Class that the methods should be added to
    * @param prop {object}: New methods
    * @param classToModify {class}: The Class that should be modified
    *
    * @return {class} Modified class
    */
    addMethods: function( src, prop, classToModify ) {
        // If "classToModify" isn't set, modify "src" insead
        classToModify = classToModify || src;

        initializing = true;

        var _parent = src.prototype,
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        prototype = new src(),
        name;
        initializing = false;

        // Copy the properties over onto the new prototype
        for ( name in prop ) {
            // Avoid problems if someone should add properties to the Object.prototype
            if( prop.hasOwnProperty( name ) ) {
                // Check if we're overwriting an existing function using a parent method
                prototype[ name ] = typeof _parent[ name ] === "function" &&
                    typeof prop[ name ] === "function" && fnSearch.test( prop[ name ] ) &&
                    ! $.Class.is(prop[ name ]) ?
                    // Rewrite the function and make it possible to call the parent function
                    $.Class.rewrite( prop[ name ], _parent[ name ] ) :
                    // If we aren't overwriting a function with a function and the property is an object,
                    // Make a deep copy of the object to avoid that 
                    // properties between prototypes arent linked
                    typeof prop[ name ] === "object" ? 
                        $.extend(true, {}, prop[ name ]) :
                        // else, don't modify it
                        prop[ name ];
            }
        }
        
        classToModify.prototype = prototype;

        return classToModify;
    },
    
    /**
     * Rewrites a function
     * 
     * @param fn {function}
     * @param _parent {function}
     * @return {function}
     */
    rewrite: function( fn, _parent ) {
        return function() {

            var tmp = this._parent;

            // Add a new ._parent() method that is the same method
            // but on the parent-class
            this._parent = _parent;

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply( this, arguments );
            this._parent = tmp;

            return ret;
        };
    },
    
    /**
     * Checks if a function is created by this plugin
     * @param fn {function}
     * @return {boolean}
     */
    is: function(fn) {
        return fn[id] === $.Class._unique;
    }

});

// The base Class implementation (does nothing) and add functions
var BaseClass = $.extend( $.Class.makeClass(), {
    // Create the extend method that makes it possible to extend objects
    extend: function( setStatic, prop ) {
        
        // Create a new class
        var Class = $.Class.makeClass(), n;
        
        if ( typeof setStatic !== "boolean" ) {
            prop = setStatic;
            setStatic = false;
        }

        // Add functions
        for ( n in this ) {
            if( this.hasOwnProperty(n) ) {
                Class[ n ] = this[ n ];
            }
        }
        
        if ( setStatic === true ) {
            for ( n in prop ) {
                if( prop.hasOwnProperty(n) && n !== "prototype" ) {
                    Class[n] = typeof prop[n] === "function" && typeof this[n] === "function" && 
                               ! $.Class.is(prop[n]) && fnSearch.test(prop[n]) ? 
                                    $.Class.rewrite(prop[n], this[n]) : 
                                    typeof prop[n] === "object" ? 
                                        $.extend(true, {}, prop[n]) : 
                                        prop[n];
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

    // Create a alias for the $.Class.addMethods method
    // to be able to add methods to a class with a nice syntax
    addMethods :function( prop ) {
        return $.Class.addMethods( this, prop );
    }

});

})( jQuery );

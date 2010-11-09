/*
 * Useful extensions when
 * you are creating your own
 * javascript objects/classes
 *
 * Orgins from:
 * Simple JavaScript Inheritance and makeClass
 * by John Resig http://ejohn.org/
 *
 * Integrated with jQuery and added functionality by Emil Kilhage
 */
(function( $ ) {

var initializing = false,
_fnSearchFn = function(){xyz;},
fnSearch = /xyz/.test( _fnSearchFn ),
// Cached RegExp object for the function searchs
_fnSearchs = {};

$.extend({

  // Shortcut $.Class.create function
  Class: function( proto ) {
    return C.create( proto );
  },

  /**
   * Checks if eg a variable is used in a function
   *
   * If the bowser isn't supporting this kind of
   * regexp tasks it will allways return true
   */
  fnSearch: function( search, fn ) {
    return ( fnSearch ?
      // Do we have a cached RegExp object?
       _fnSearchs[search] ?
        // Take the object from cache
         _fnSearchs[search] :
        // Cache the RegExp object
         _fnSearchs[search] = new RegExp("\\b" + search + "\\b") :
       /.*/ ).test( fn );
  }
  
});

var C = $.Class;

$.extend(C, {
  
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
    var ret = function( args ) {
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
    // Enforce the constructor to be what we expect
    ret.constructor = ret;
    return ret;
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
  create: function( prop ) {
    return Class.extend( prop );
  },

  /**
   * Adds methods to a class prototype
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
    prototype = new src();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for ( var name in prop ) {
      // Check if we're overwriting an existing function using a parent method
      prototype[ name ] = typeof _parent[ name ] === "function" &&
        typeof prop[ name ] === "function" && $.fnSearch( "_parent", prop[ name ] ) ?
        (function(name, fn) {
          // Rewrite the function and make it possible to call the parent function
          return function() {
            var tmp = this._parent;

            // Add a new ._parent() method that is the same method
            // but on the parent-class
            this._parent = _parent[ name ];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply( this, arguments );
            this._parent = tmp;

            return ret;
          };
        })( name, prop[ name ] ) :
        // If we aren't overwriting a function with a function, simply replace/set it
        prop[ name ];
    }
    classToModify.prototype = prototype;
    
    return classToModify;
  }
  
});

// The base Class implementation (does nothing)
var Class = C.makeClass();

// Create the extend method that makes it possible to extend objects
Class.extend = function( prop ) {
  // Create a new class
  var NewClass = C.makeClass();

  // Populate our constructed prototype object
  C.addMethods( this, prop, NewClass );

  // And make this class extendable
  NewClass.extend = arguments.callee;
  
  // Create a alias for the $.Class.addMethods method
  // to be able to add methods to a class with a nice syntax
  NewClass.addMethods = function( prop ) {
    return C.addMethods( this, prop );
  };

  return NewClass;
};

}( jQuery ));

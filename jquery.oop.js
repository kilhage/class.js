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

var initializing = false, _fnSearch = /xyz/.test( function(){xyz;} );

$.extend({

  // Shortcut $.Class.create function
  Class: function( proto ) {
    return $.Class.create( proto );
  },

  /**
   * Checks if eg a variable is used in a function
   *
   * If the bowser isn't supporting this kind of
   * regexp tasks it will allways return true
   */
  fnSearch: function( search, fn ) {
    return ( _fnSearch ? new RegExp("\\b" + search + "\\b") : /.*/ ).test( fn );
  }
  
});

$.extend($.Class, {
  
  /**
   * makeClass - By John Resig (MIT Licensed)
   * http://ejohn.org/
   *
   * Makes it possible to instantiate a
   * class both with or without the new keyword.
   * It also moves the constructor to a function
   * on the prototype called "init"
   */
  makeClass: function() {
    var ret = function( args ) {
      if ( this instanceof arguments.callee ) {
        // If not executing the "extend" function and an init method exist
        if ( ! initializing && $.isFunction( this.init ) ) {
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
   */
  create: function( prop ) {
    return Class.extend( prop );
  },

  addMethods: function( src, prop, classToModify ) {
    // If "classToModify" isn't passed, modify "src" insead
    classToModify = classToModify || src;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new src();
    initializing = false;
    
    return classToModify.prototype = this._addMethods( prototype, prop, src.prototype );
  },
  
  _addMethods: function( prototype, prop, _parent ) {
    // Do not require that a parent class is used
    _parent = _parent || {};
    // Copy the properties over onto the new prototype
    for ( var name in prop ) {
      // Check if we're overwriting an existing function using a parent method
      prototype[ name ] = $.isFunction( prop[ name ] ) &&
        $.isFunction( _parent[ name ] ) && $.fnSearch( "_parent", prop[ name ] ) ?
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
    return prototype;
  }
  
});

// The base Class implementation (does nothing)
var Class = $.Class.makeClass();

// Create a new Class that inherits from this class
Class.extend = function( prop ) {

  // Create a new class
  var Class = $.Class.makeClass();

  // Populate our constructed prototype object
  $.Class.addMethods( this, prop, Class );

  // And make this class extendable
  Class.extend = arguments.callee;

  // Create a alias for the $.Class.addMethods method
  // to be able to add methods to a class with a nice syntax
  Class.addMethods = function( prop ) {
    $.Class.addMethods( this, prop );
  };

  return Class;
};

}( jQuery ));

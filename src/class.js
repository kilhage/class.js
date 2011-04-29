(function() {

var initializing = false,
    prefix = "Class",

    unique = prefix + (new Date()).getTime(),
    unique2 = unique+1,

    _searchable = /\b_parent\b/.test(function(){this._parent();}),
    fnSearch = _searchable ? (/\b_parent\b/) : /.*/,
    parentFnSearch = _searchable ? (/\b_parent\b\./) : /.*/,

    test = RegExp.prototype.test,
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,

    errors = {
        logic_parent_call: prefix + ":Logic error, unable to call the parent function since it isn't defined.."
    };

// Needed to rewrite the behaviour of this regexp's test method to work properly
parentFnSearch.test = function(fn) {
    return test.call(parentFnSearch, fn) || fn[unique2] === true;
};

/* ============ Class Functions ============ */

/**
 * The base Class implementation that all 
 * classes created by this library will be extended from
 */
function Base(){}

/**
 * Creates a new class based on the current class
 * 
 * @param setStatic
 * @param prop
 * @return <function>
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
        if( hasOwn.call(src, name) ) {
            Awesome[name] = src[name];
        }
    }

    if ( setStatic === true || (typeof prototype === "object" && prototype !== null) ) {
        add(prop, src, Awesome, initPopulator(src));
        prop = prototype;
    }
    
    // Create a shallow copy of the source prototype
    initializing = true;
    prototype = new src();
    initializing = false;

    // Copy the properties over onto the new prototype
    add(prop || {}, parent, prototype, initPopulator(parent));

    Awesome.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Awesome.constructor = prototype.constructor = Awesome;
    
    /**
     * Checks if a class inherits from another class
     * 
     * @param <function> parent
     * @return <boolean>
     */
    Awesome.inherits = function(parent) {
        return parent === src || src.inherits(parent);
    };
    
    return Awesome;
};

Base.inherits = function() {
    return false;
};

/**
 * Adds properties to a Class prototype
 * @param <object> prop
 */
Base.addMethods = function( prop ) {
    add(prop, this.prototype);
};

/**
 * A default function on all classes that are created.
 *
 * Makes in possible to extend already initalized
 * objects in an easy way
 * 
 * @param <object> prop
 */
Base.prototype.addMethods = function( prop ) {
    add(prop, this);
};

/* ============ Public Functions ============ */

/**
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * 
 * @param <object> prop: The prototype that you want the object to have
 * @return <function>: Created class
 */
function Class( setStatic, prop ) {
    return Base.extend( setStatic, prop );
}

// The are exposed to simplify the unit-testing
// I will probably remove them later...
Class.fnSearch = fnSearch;
Class.parentFnSearch = parentFnSearch;
Class.errors = errors;

/**
 * @param <mixed> fn
 * @return <boolean>: if fn is created by this library
 */
function is(fn) {
    return !!(fn && fn.extend === Base.extend);
}

Class.is = is;

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
function makeClass() {
    function Awesome( args ) {
        if ( this instanceof Awesome ) {
            // If not executing the "extend" function and an init method exist
            if ( initializing === false && isFunction(this.init) ) {
                // Call the "real" constructor and apply the arguments
                this.init.apply(this, args && args.callee === Awesome ? args : arguments);
            }
        } else {
            // Instantiate the class and pass the aruments
            return new Awesome(arguments);
        }
    }
    
    return Awesome;
}

Class.makeClass = makeClass;

/* ============ Private Helper functions ============ */

function initPopulator(parent) {
    var fns = {}, key;
    for ( key in parent ) {
        if ( isFunction(parent[key]) ) {
            fns[key] = rewriteFn(parent[key]);
        }
    }
    return fns;
}

function rewriteFn(fn) {
    return function(){
        return fn.apply(this[unique], arguments);
    };
}

function rewrite(name, current_props, parent_props, fns) {
    var current = current_props[name], parent = parent_props[name];
    
    if (!(isFunction(current) && 
        // Check if we're overwriting an existing function using a parent method
        (isFunction(parent) || !(hasOwn.call(parent_props, name))) &&
        // Don't rewrite classes, and only rewrite functions that are calling a parent function
        ! is(current) && fnSearch.test(current))) {
        
        return current;
    }
    
    var populate = !!(typeof fns === "object" && fns !== null && parentFnSearch.test(current)),
    
    /**
     * Needed to wrap the original function inside a new function to avoid adding
     * properties to the original function when calling 'this._parent.<method name>()'
     */
    _parent = parent ? function() {
        return parent.apply(this, arguments);
    } : function() {
        // Make sure to throw an error when calling a method that don't exists
        throw errors.logic_parent_call;
    },
    
    method = function() {
        var self = this, set_parent = hasOwn.call(self, "_parent"), 
            // store the content in the '_parent' property 
            // so we can revert the object after we're done
            tmp = self._parent, ret, name;

        // Add the parent class's methods to 'this._parent' which enables you 
        // to call 'this._parent<method name>()'
        if ( populate === true ) {
            populate = false;
            for ( name in fns ) {
                if ( hasOwn.call(fns, name) ) {
                    // Add the parent functions
                    _parent[name] = fns[name];
                }
            }
            // Remove the reference to this object from the scope.
            fns = null;
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
        if ( set_parent === true ) {
            self._parent = tmp;
        } else {
            delete self._parent;
        }

        return ret;
    };

    method[unique2] = populate;

    return method;
}

function add(from, ref, to, fns) {
    var name;
    to = to || ref;
    for ( name in from ) {
        if( hasOwn.call(from, name) ) {
            to[name] = rewrite( name, from, ref, fns );
        }
    }
}

function isFunction(fn) {
    return toString.call(fn) === "[object Function]";
}

return Class;

}());

(function (undefined) {
    "use strict";

    var initializing = false,
        prefix = "Class",

        __self__ = prefix + (new Date()).getTime(),
        
        testFn = function () {
            this._parent();
        },

        fnSearchable = /\b_parent\b/.test(testFn),
        fnSearch = fnSearchable ? (/\b_parent\b/) : /.*/,
        parentFnSearch = fnSearchable ? (/\b_parent\b\./) : /.*/,
        
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,

        functionToString = toString.call(testFn),
        baseTmpl,

        errors = {
            logic_parent_call: prefix + ":Logic error, unable to call the parent " + 
                                        "function since it isn't defined.."
        };

    /**
     * The base Class implementation that all 
     * classes created by this library will be extended from
     */
    function Base() {}
    
    /**
     * Simple JavaScript Inheritance
     * By John Resig http://ejohn.org/
     * MIT Licensed.
     * 
     * @param <object> prop: The prototype that you want the object to have
     * @return <function>: Created class
     */
    function Class(setStatic, properties) {
        return Base.extend(setStatic, properties);
    }

    /**
     * @param <mixed> fn
     * @return <boolean>: if fn is created by this library
     */
    function is(fn) {
        return toString.call(fn) === functionToString && 
            Base.prototype.isPrototypeOf(baseTmpl);
    }

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
        function Awesome(args) {
            var self = this;
            if (self instanceof Awesome) {
                // If not executing the "extend" function and an init method exist
                if (initializing === false && 
                        toString.call(self.init) === functionToString) {
                    // Call the "real" constructor and apply the arguments
                    self.init.apply(self, args && args.callee === Awesome ? 
                                                    args : arguments);
                }
            } else {
                // Instantiate the class and pass the aruments
                return new Awesome(arguments);
            }
        }

        return Awesome;
    }

    function rewrite(current, parent, populator) {
            // Should this._parent be 
            // populated with any properties 
            // from the parent class?
        var populate = parentFnSearch.test(current),

             // Needed to wrap the original function 
             // inside a new function to avoid adding
             // properties to the original function 
             // when calling 'this._parent.<method name>()'
            realParent = toString.call(parent) === functionToString ? function () {
                return parent.apply(this, arguments);
            } : // Make sure to throw an error 
                // when calling a method that don't exists
                function () {
                    throw errors.logic_parent_call;
                };

        return function () {
            var self = this,
                // Are the current context storing a 
                // property called ._parent
                // That we need to revert after the 
                // current function has been executed?
                has_parent = hasOwn.call(self, "_parent"), 
                // Store the content in the ._parent property 
                // so we can revert the object after 
                // we're done if it's needed
                tmp = self._parent, 
                ret, 
                name,
                fns;

            // Add the parent class's methods to 
            // 'this._parent' which enables you 
            // to call 'this._parent<method name>()'
            if (populate === true) {
                // We only need to do this once
                populate = false;
                // Get the parent functions and add'em
                fns = populator();
                for (name in fns) {
                    if (hasOwn.call(fns, name)) {
                        // Add the parent functions
                        realParent[name] = fns[name];
                    }
                }
            }

            // Add a new ._parent() method that points to the parent 
            // class's method with the same name
            self._parent = realParent;

            // Save a reference to the class instance on the parent
            // function so the other methods from the 
            // instance parent class can be called
            self._parent[__self__] = self;

            // Execute the original function
            ret = current.apply(self, arguments);

            // Restore the context
            if (has_parent === true) {
                self._parent = tmp;
            } else {
                delete self._parent;
            }

            return ret;
        };
    }

    function rewriteFn(fn) {
        return function () {
            return fn.apply(this[__self__], arguments);
        };
    }

    function addProperties(from, reference, target) {
        var name, current, fns,
            populator = function () {
                if (fns === undefined) {
                    var key;
                    fns = {};
                    for (key in reference) {
                        if (toString.call(reference[key]) === functionToString) {
                            fns[key] = rewriteFn(reference[key]);
                        }
                    }
                }
                return fns;
            };

        if (target === undefined) {
            target = reference;
        }

        for (name in from) {
            if (hasOwn.call(from, name)) {
                current = from[name];
                target[name] = toString.call(current) === functionToString && 
                    fnSearch.test(current) ?
                    rewrite(current, reference[name], populator) : current;
            }
        }
    }

    /**
     * Creates a new class based on the current class
     * 
     * @param setStatic
     * @param properties
     * @return <function>
     */
    Base.extend = function (setStatic, properties) {
            // Create the new class
        var Awesome = makeClass(), name, Src = this, 
            prototype, parent = Src.prototype;

        if (typeof setStatic !== "boolean") {
            properties = setStatic;
        }

        properties = typeof properties === "object" && properties !== null ?
            properties : {};

        prototype = properties.prototype;

        // Move all static properties
        for (name in Src) {
            if (hasOwn.call(Src, name)) {
                Awesome[name] = Src[name];
            }
        }

        if (setStatic === true ||
                (typeof prototype === "object" && prototype !== null)) {
            addProperties(properties, Src, Awesome);
            properties = prototype;
        }

        // Create a shallow copy of the source prototype
        initializing = true;
        prototype = new Src();
        initializing = false;

        // Copy the properties over onto the new prototype
        addProperties(properties || {}, parent, prototype);

        // Enforce the constructor to be what we expect
        Awesome.constructor = prototype.constructor = Awesome;

        // Add the final prototype to the created class
        Awesome.prototype = prototype;

        /**
         * Checks if a class inherits from another class
         * 
         * @param <function> parent
         * @return <boolean>
         */
        Awesome.inherits = function (parent) {
            return parent === Src || Src.inherits(parent);
        };

        return Awesome;
    };

    Base.inherits = function () {
        return false;
    };

    /**
     * Adds properties to a Class prototype
     * @param <object> prop
     */
    Base.addMethods = function (properties) {
        addProperties(properties, this.prototype);
    };

    /**
     * A default function on all classes that are created.
     *
     * Makes in possible to extend already initalized
     * objects in an easy way
     * 
     * @param <object> properties
     */
    Base.prototype.addMethods = function (properties) {
        addProperties(properties, this);
    };
    
    baseTmpl = new Base();

    // Public helper methods
    Class.is = is;
    Class.makeClass = makeClass;

    // These are exposed to simplify the unit-testing
    // I will probably remove them later...
    Class.fnSearch = fnSearch;
    Class.parentFnSearch = parentFnSearch;
    Class.errors = errors;

    return Class;
}());

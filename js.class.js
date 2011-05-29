/*--------------------------------------------*
 * Info: https://github.com/kilhage/class.js
 *--------------------------------------------*
 * Copyright 2011, Emil Kilhage
 * Released under the MIT License
 *--------------------------------------------*
 * Environment-release: js
 * Last Update: 2011-04-29 18:10:51
 * Version 1.1.0
 *--------------------------------------------*/
/*jslint forin: true, onevar: true, debug: false, indent: 4
   white: true, strict: true, undef: true, newcap: true
   maxlen: 85, evil: false, nomen: false, regexp: false
   browser: true */
var Class = (function (undefined) {
    "use strict";

    var initializing = false,
        prefix = "Class",

        __self__ = prefix + (new Date()).getTime(),
        
        testFn = function () {
            this._parent();
        },

        fnSearch = /\b_parent\b/,
        parentFnSearch = fnSearch.test(testFn) ? (/\b_parent\b\./) : fnSearch = /.*/,
        
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,

        functionToString = toString.call(testFn),
        objectToString = toString.call({}),
        StdError = Error,
        
        tmpProto,

        errors = {};

    /* Define some used Errors */

    /**
     * This is thrown whenever the input in any of the class building
     * functions conatins something wiered.
     */
    function InvalidClassDefinition(msg) {
        StdError.apply(this, arguments);
        this.message = prefix + "::" + msg;
    }

    tmpProto = InvalidClassDefinition.prototype = new StdError();
    errors[tmpProto.name = "InvalidClassDefinition"] = InvalidClassDefinition;

    /**
     * Gets thrown when someone calls a parent method that don't exists
     */
    function InvalidParentMethodCall(name) {
        StdError.apply(this, arguments);
        this.message = prefix + "::Parent Class doesn't have the method: " + name;
    }

    tmpProto = InvalidParentMethodCall.prototype = new StdError();
    errors[tmpProto.name = "InvalidParentMethodCall"] = InvalidParentMethodCall;

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
    function Class(properties) {
        return Base.extend(properties);
    }

    /**
     * @param <mixed> fn
     * @return <boolean>: if fn is created by this library
     */
    function is(fn) {
        return !!(fn && fn.extend === Base.extend);
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
        // The constructor will be cached 
        // here and updated each time it changes
        var init;
        function Awesome(args) {
            var self = this;
            // Where the new keyword used?
            if (self instanceof Awesome) {
                if (initializing === false) {
                    // Have the constructor property changed since
                    // last time a new instance where made?
                    if (init !== self.init) {
                        // Is the constructor property a function?
                        if ("init" in self &&
                                toString.call(self.init) === functionToString) {
                            // Update the cached constructor.
                            init = self.init;
                        } else {
                            // The not a valid constructor.
                            init = undefined;
                        }
                    }
                    if (init !== undefined) {
                        // Call the "real" constructor and apply the arguments
                        init.apply(self, args && args.callee === Awesome ? 
                                                        args : arguments);
                    }
                }
            } else {
                // Instantiate the class and pass the aruments
                return new Awesome(arguments);
            }
        }

        return Awesome;
    }

    function rewrite(name, current, parent, populator) {
            // Should this._parent be 
            // populated with any properties 
            // from the parent class?
        var populate = parentFnSearch.test(current),
        
            setSelf = populate,

             // Needed to wrap the original function 
             // inside a new function to avoid adding
             // properties to the original function 
             // when calling 'this._parent.<method name>()'
            realParent = toString.call(parent) === functionToString ? function () {
                return parent.apply(this, arguments);
            } : // Make sure to throw an error 
                // when calling a method that don't exists
                function () {
                    throw new InvalidParentMethodCall(name);
                };

        return function () {
            var self = this,
                // Store the content in the ._parent property 
                // so we can revert the object after 
                // we're done if it's needed
                tmp = self._parent,
                ret,
                name,
                fns;

            // Add a new ._parent() method that points to the parent 
            // class's method with the same name
            self._parent = realParent;

            if (setSelf) {
                // Add the parent class's methods to 
                // 'this._parent' which enables you 
                // to call 'this._parent<method name>()'
                if (populate) {
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
                // Save a reference to the class instance on the parent
                // function so the other methods from the 
                // instance parent class can be called.
                // Only do this when needed, to optimize the performace
                realParent[__self__] = self;
            }

            // Execute the original function
            ret = current.apply(self, arguments);

            // Restore the context
            self._parent = tmp;

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
                    rewrite(name, current, reference[name], populator) : current;
            }
        }
    }

    /**
     * Creates a new class based on the current class
     * 
     * @param properties
     * @return <function>
     */
    Base.extend = function (properties) {
            // Create the new class
        var Awesome = makeClass(), name, Src = this, 
            prototype, parent = Src.prototype, m;
            
        if (!properties || toString.call(properties) !== objectToString) {
            m = "Unable to " + (Src === Base ? "extend" : "create") + " class";
            throw new InvalidClassDefinition(m);
        }

        // Move all static properties
        for (name in Src) {
            if (hasOwn.call(Src, name)) {
                Awesome[name] = Src[name];
            }
        }
        
        /**
         * Does the input contains any static properties that should be added?
         */
        if (properties.hasOwnProperty("prototype")) {
            prototype = properties.prototype;
            if (prototype && toString.call(prototype) === objectToString) {
                delete properties.prototype;
                addProperties(properties, Src, Awesome);
                properties = properties.prototype = prototype;
            } else {
                m = "Invalid type on properties.prototype(" +
                    prototype + "), literal object expected";
                throw new InvalidClassDefinition(m);
            }
        }

        // Create a shallow copy of the source prototype
        initializing = true;
        prototype = new Src();
        initializing = false;

        // Copy the properties over onto the new prototype
        addProperties(properties, parent, prototype);

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
     * Adds properties to a Class
     * @param <object> prop
     */
    Base.addMethods = function (properties, proto, own_proto) {
        if (properties && toString.call(properties) === objectToString) {
            proto = properties.prototype;
            own_proto = this.prototype;

            if (proto && toString.call(proto) === objectToString) {
                addProperties(proto, own_proto);

                delete properties.prototype;
                addProperties(properties, this);
                properties.prototype = proto;

            } else {
                addProperties(properties, own_proto);
            }
        } else {
            throw new InvalidClassDefinition("Unable to add methods to class");
        }
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
        if (properties && toString.call(properties) === objectToString) {
            addProperties(properties, this);
        } else {
            throw new InvalidClassDefinition("Unable to add methods to instance");
        }
    };

    // Public helper methods
    Class.is = is;
    Class.makeClass = makeClass;

    // These are exposed to simplify the unit-testing
    // I will probably remove them later...
    Class.fnSearch = fnSearch;
    Class.parentFnSearch = parentFnSearch;
    Class.errors = errors;
    Class.version = "1.1.0";

    return Class;
}());

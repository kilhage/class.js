/****************************
 * jQuery Benchmark Plugin
 * https://github.com/kilhage/jquery-benchmark
 *
 * MIT Licensed
 * @author Emil Kilhage
 * Version: 0.9.0
 * Last updated: 2011-02-19 02:54:00
 */
(function( $ ) {

// Assign some private variables used in the scope

// Used in the output function
var error_preg = /(\{error\}\:)/,

error_messages = {
    callback: " Callback didn't return a value!"
},

// All output will be stored here
bufferd_output = "",

// Name of the plugin, used in outputs
name = "jQuery.benchmark :: ",

// suffixes used in the Tester
_s = "_start", _e = "_end",

// Default test name
DF = "Default",

// currentTest
curTest = DF,

// Contains test instances
tests = {};

/**
 * The Base benchmarker that do the actual benchmarking
 *
 * @param avoidMarkStart
 */
$.benchmark = function Benchmarker( avoidMarkStart ) {
    if( ! ( this instanceof Benchmarker ) ) {
        return new Benchmarker( avoidMarkStart );
    }
    this.marks = {};
    this.prev.marks = {};
    this.result._ = 0;
    if( ! avoidMarkStart ) {
        this.start();
    }
};

// Build the Benchmarker Class

$.extend($.benchmark, {
    
    __is_rewritten__: true,
    
    // Controlls the output
    enabled: true,

    /**
     * Function tester
     */
    test: function( a ) {
        // Set argument offset according to
        // what is passed in as the first argument
        var offset = typeof a === "object" ? 1 : 0,
        // If an array is passed in as the first
        // argument, use these arguments
        args = offset === 1 ? a : [],
        // Init the benchmarker
        bench = new $.benchmark(),
        // Declare some variables
        lastArg = args.length,
        i = args[ lastArg ] = 0,
        // Set callback function
        c = arguments[ 0 + offset ],
        // Set the length of the loop
        len = arguments[ 1 + offset ] || 1000;

        // Do the actual test
        for(; i <= len; args[ lastArg ] = ++i ) {
            // Apply the arguments to the function
            c.apply( this, args );
        }
        return bench.end(function( time ) {
            return " Function tester :: Runtime->> " + time + " ms Runned->> " + len +
            " times, Average->> " + ($.benchmark.round((time / len))) + " ms";
        });
    },
    
    // Checks if a function already have been rewritten
    isRewritten: function(fn) {
        return fn.__is_rewritten__ === true;
    },

    /**
     * This function sets up tests object/function so you 
     * don't need to rewrite the actual function
     * to be able to test it.
     * 
     * @param {string} prefix
     * @param {object/function} object
     * @param {boolean} recursive
     * @return {object/function}
     */
    setup: function( prefix, object, tester ) {
        var new_object = {}, fn, prop, is_fn;

        // Switch the arguments if the first parameter isn't a string
        if ( typeof prefix === "string" ) {
            prefix = prefix.replace(/\.$/, "");
        } else {
            tester = object;
            object = prefix;
            prefix = "";
        }

        tester = tester instanceof $.benchmark.Test ? tester : $.benchmark;

        is_fn = $.type(object) === "function";

        if ( is_fn || (typeof object === "object" && object) ) {

            // If the object param is a function, rewrite it
            if ( is_fn ) {
                new_object = rewrite("", object, prefix, tester);
            }
            // Rewrite all sub functions
            for ( prop in object ) {
                // Filter away evil properties on from the prototype
                if ( object.hasOwnProperty( prop ) ) {
                    // Transfer the properties to the new, modified object
                    new_object[ prop ] = (function( prop, fn ) {
                        // Rewrite the property, only allow js-objects and arrays
                        if ( $.type(fn) === "function" || (typeof fn === "object" && fn !== null && !fn.nodeType && !fn.jquery) ) {
                            return $.benchmark.setup(prefix ? prefix + "." + prop : prop, fn, tester);
                        }
                        // Else, don't modify the property
                        return fn;
                    }( prop, object[ prop ] ));
                }
            }

            // Return the modified object
            return new_object;
        }
        return object;
    },

    // Methods to handel tests
    
    getTest: function(name) {
        name = name || curTest || DF ;
        return name in tests ? tests[name] : tests[name] = new $.benchmark.Test( name );
    },

    /**
     * Starts a new test
     *
     * @param name : test-name
     */
    startTest: function( name ) {
        curTest = name = name || DF;
        tests[ name ] = (new $.benchmark.Test( name )).start();
        return this;
    },


    /**
     * Ends and outputs a test
     *
     * @param name : test-name
     */
    endTest: function( name, avoidReset, testHandler ) {
        if( ! tests[ (curTest = name = name || curTest || DF) ] ) {
            return this;
        } else {
            tests[ name ].end().output(avoidReset, testHandler);
        }
        return this;
    },

    /**
     * Start benchmarking a sub-test in a test
     *
     * @param name : sub-test-name
     * @param startTest : startTest
     */
    start: function( name, startTest ) {
        if( typeof name !== "string" ) {
            this.startTest();
        } else {
            tests[ curTest ].start(name);
            if( startTest ) {
                this.startTest();
            }
        }
        return this;
    },

    /**
     * Stops benchmarking a sub-test in a test
     *
     * @param name : sub-test-ame
     * @param endTest : endTest
     */
    end: function( name, endTest ) {
        if( typeof name !== "string" ) {
            this.endTest();
        } else {
            tests[ curTest ].end(name);
            if( endTest ) {
                this.endTest();
            }
        }
        return this;
    },

    /**
     * Returns the result from the previous runned test in ms,
     * is allways updated with the lastest result
     *
     * @param name : If you want to get the results of a specific test
     */
    result: function( name ) {
        return typeof tests[ ( name = name || curTest || DF ) ] === "object" ? tests[ name ].result() : 0;
    },

    /**
     * Method to enable/disable the whole output mechanism
     */
    enable: function() {
        this.enabled = true;
        return this;
    },

    /**
     * Method to enable/disable the whole output mechanism
     */
    disable: function() {
        this.enabled = false;
        return this;
    },

    /**
     * Makes it possible the watch the output in other ways than the console / in alerts
     *
     * @param avoidReset {boolean}: avoidReset
     */
    output: function( avoidReset ) {
        var returnVal = bufferd_output;
        if( ! avoidReset ) {
            bufferd_output = "";
        }
        return returnVal;
    },

    now: function() {
        return (new Date()).getTime();
    },

    // Math methods

    /**
     * Rounds a number: $.benchmark.round( 0,23456789876543, 5 ) ->> 0,23456
     *
     * @param n {number}: number to round
     * @param l {int}: decimals
     */
    round: function( num, dec ) {
        dec = dec || 5;
        return Math.round( num * Math.pow( 10, dec ) ) / Math.pow( 10, dec );
    },
    
    prototype: {

        /**
         * Shortcut to make simple tests
         */
        start: function() {
            this.mark("start");
            return this;
        },

        /**
         * Shortcut to make simple tests
         *
         * @param doOutput: Output
         */
        end: function( doOutput ) {
            this.mark("end", "start", (doOutput == null ? true : doOutput));
            return this;
        },

        /**
         * Mark the start / end of a test
         *
         * @param name: Name
         * @param start: Start
         * @param doOutput: Output
         */
        mark: function( name, start, doOutput ) {
            // Make the mark
            this.marks[ name ] = (new Date()).getTime();
            if( start ) {
                this.elapsedTime( start, name, doOutput );
            }
            return this;
        },

        /**
         * Outputs the elapsed time
         *
         * @param m1: Mark 1
         * @param m2: Mark 2
         * @param doOutput:  Output
         */
        elapsedTime: function( m1, m2, doOutput ) {
            var time = this.result._= this.marks[ m2 ] - this.marks[ m1 ];
            if( doOutput ) {
                // Make the output
                this.message = output(typeof doOutput === "function" ?
                    // If a function is passed as the output param,
                    // run it and pass the values
                    // I the function don't returns a valid value, throw an error
                    // this makes it possible to build custom messages
                    ( doOutput.call( this, time, m1, m2 ) || "{error}:elapsedTime->>" + error_messages.callback ) :
                    // else, output the std message
                    "start(" + m1 + ")->> end('" + m2 + "') :: Runtime->> " + time + " ms" + (typeof doOutput === "string" ? doOutput : ""));
            }
            return this;
        },

        count: function(prev) {
            var prop = prev ? this.prev.marks : this.marks, i = 0, n;
            for( n in prop ) {
                if( prop.hasOwnProperty( n ) ) {
                    i = i + 1;
                }
            }
            return parseInt(i / 2, 10);
        },

        result: function() {
            return this.result._;
        },

        /**
         * Resets the objects tests
         */
        reset: function() {
            return reset(this, ["marks"]);
        },

        prev: function(item, sub) {
            var ret;
            if (typeof item === "string") {
                ret = typeof sub === "string" && this.prev[item] ? this.prev[item][sub] : this.prev[item];
            } else {
                $.extend(true, ret = {}, this.prev);
            }
            return ret;
        }

    }

});

// Handels tests
$.benchmark.Test = function Test( name ) {
    if( ! ( this instanceof Test ) ) {
        return new Test( name );
    }
    this.bench = new $.benchmark();
    this.name = typeof name === "string" ? name : DF;
    this.marks = {};
    this.times = {};
    this.prev.marks = {};
    this.prev.times = {};
    this.tests = {};
    this.result._ = 0;
};

$.benchmark.Test.prototype = {
    
    ntests: 0,
    enabled: true,

    /**
     * Start a sub-test
     *
     * @param name : Name
     * @param v : internal variable
     */
    start: function( name, v ) {
        name = typeof name === "string" ? name : this.name;
        this._start( v );
        if( typeof this.marks[ name ] !== "number" ) {
            this.times[ name ] = this.marks[ name ] = 0;
        }
        this.bench.mark( name + _s );
        return this;
    },

    /**
     * Makes sure that the main test have started
     *
     * @param v : internal variable, avoids an infinite loop
     */
    _start: function( v ) {
        if( !v && typeof this.marks[ this.name ] !== "number" ) {
            this.start(this.name, true);
        }
        return this;
    },

    /**
     * Start a sub-test
     *
     * @param name : Name
     */
    end: function( name ) {
        name = typeof name === "string" ? name : this.name;
        this.times[ name ] += 1;
        this.marks[ name ] += this.result._ = this.bench.mark( name + _e, name + _s, false ).result();
        return this;
    },
    
    count: function(prev) {
        return this.bench.count(prev)-1;
    },

    /**
     * Outputs all tests in the object
     *
     * @return self
     */
    output: function(avoidReset, testHandler) { 
        // Count the numbers of tests made
        this.ntests = this.count();
        
        // Show some extra test details if
        // there have been more than 1 sub-test made
        var more_detail = this.ntests > 0,

        numberOfTests = 0, name;
        
        if ( typeof avoidReset !== "boolean" ) {
            testHandler = avoidReset;
        }
        
        testHandler = $.type(testHandler) === "function" ? testHandler : this._testHandler;
        testHandler.std = this._testHandler;

        if( more_detail) {
            // Output a extra line space to make the test more
            // readable and the first line to note that the result have began
            this._output();
            this.message = this._output("Report for test->> '" + this.name + "' :");
        }

        for( name in this.marks ) {
            // Don't output the Main test here
            if( this.marks.hasOwnProperty( name ) && name !== this.name ) {
                // Increese the number of runned test to the main test
                numberOfTests += this._outputTest( name, "end", testHandler);
            }
        }

        // If we only have made one sub-test there is no
        // need for the this output to show
        if ( this.ntests !== 1 ) {
            this._outputTest(this.name, (this.ntests > 0 ? "endTest" : "end"), function() {
                // Output the test result
                return more_detail ? ", Total Tests->> " + numberOfTests : " ";
            });
        }
        
        if ( avoidReset !== true ) {
            this.reset();
        }
        
        return this;
    },

    _outputTest: function( name, fn, callback ) {
            // Get the number of times runned
        var times = this.times[ name ],
            // Get the time
            time = this.marks[ name ],
            message = callback.call( this, times, time, name );
        if ( typeof message !== "string" ) {
            message = typeof callback.std === "function" ? callback.std.call( this, times, time, name ) : "{error}:_outputTest('" + name + "','" + fn + "')->> " + error_messages.callback;
        }
        // Make the output
        this.message = this._output(fn + "('" + name + "') :: Runtime->> " + time + " ms" + message );
        this.result._ = time;
        return times;
    },
    
    _testHandler: function(times, time) {
        // If only one test have been runned, there isn't any reason to show this info
        return times > 1 ? ", Runned->> " + times + " times, Average->> " + $.benchmark.round( time / times ) + " ms" : " ";
    },
    
    _output: function(message) {
        return output(message, this.enabled);
    },

    /**
     * Resets the objects tests
     */
    reset: function() {
        // Reset the benchmark instance
        this.bench.reset();
        return reset(this, ["marks", "times"]);
    },
    
    setup: function(name, object) {
        if ( typeof name !== "string" ) {
            object = name;
            name = "";
        }
        return $.benchmark.setup(name, object, this);
    },
    
    add: function(name, tests, setup) {
        if ( typeof name !== "string" ) {
            setup = tests;
            tests = name;
            name = "";
        }
        if ( tests ) {
            if ( setup !== false ) {
                tests = this.setup(name, tests);
            }
            if ( typeof tests === "object" && !name ) {
                for ( var n in tests ) {
                    this.tests[n] = tests[n];
                }
            } else {
                this.tests[name] = tests;
            }
        }
        return this;
    },
    
    run: function(make, times, args) {
        if ( typeof make !== "boolean" ) {
            args = times;
            times = make;
        }
        if ( typeof times !== "number" ) {
            args = times;
            times = 1;
        }
        if ( !(args instanceof Array) ) {
            args = [];
        }
        if ( make !== false ) {
            this.start();
        }
        while(times--) {
            run(this.tests, this,  args);
        }
        if ( make !== false ) {
            this.end();
        }
        return this;
    }

};

$.each(["prev", "result"], function(i, name){
    $.benchmark.Test.prototype[name] = $.benchmark.prototype[name];
});

$.each(["enable", "disable"], function(i, name){
    $.benchmark.Test.prototype[name] = $.benchmark[name];
});

function run(fn, context, args) {
    var type, name, item;
    if ( typeof fn === "function" && !fn.test && !fn.exec && fn.apply ) {
        fn.apply(context, args);
    }
    for ( name in fn ) {
        item = fn[name];
        type = typeof item;
        if (((type === "function") || (type === "object" && item)) && !item.nodeType && !item.jquery) {
            run(item, fn, args);
        }
    }
}

function reset(self, items) {
    var l = items.length, i = 0, name, n;
    for(; i < l; i += 1) {
        name = items[i];
        self.prev[name] = {};
        for ( n in self[name] ) {
            self.prev[name][n] = self[name][n];
        }
        self[name] = {};
    }
    return self;
}

function rewrite( name, fn, prefix, tester ) {
    // Don't rewrite the function twice
    if ( $.benchmark.isRewritten(fn) ) {
        return fn;
    }

    name = prefix ? (name ? prefix + "." + name : prefix) : name;

    var ret = function() {
        //Start the function-test
        tester.start(name);
        // Call the actual function
        var r = fn.apply(this, arguments);
        // End the test
        tester.end(name);
        // Return the return value from the function
        return r;
    };
    ret.__is_rewritten__ = true;
    ret.prototype = fn.prototype;
    return ret;
}

// Internal output function
function output( message, _enabled ) {
    message = message !== undefined ? message : "";
    
    // Test if an error have accoured
    if( error_preg.test( message ) ) {
        // Build the error message and throw an error
        $.error(name + ((message.split( error_preg ))[ 2 ]));
    }

    // Buffer the output wich make it possible
    // to the the messages using $.benchmark.output();
    bufferd_output += message + "<br>";

    // Output the message
    if( _enabled && $.benchmark.enabled && window.console && console.log ) {
        console.log( typeof message === "string" && message ? name + message : "" );
    }

    return message;
}

tests[ DF ] = new $.benchmark.Test( DF );

})( jQuery );

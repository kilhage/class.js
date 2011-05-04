[Javascript-Class](https://github.com/kilhage/javascript-class)
================================

About
----------------------------
 * Copyright 2011, Emil Kilhage
 * Released under the MIT License
 * Last Updated: @DATE
 * Current version: @VERSION

This library allows you to create Class-like functions in an very effective and nice way.
I found this very useful when working with large projects needing structure, scalability 
and all the other stuff that the ordinary object oriented model gives you in other languages, 
which javascript is kind of missing natively(at least in an easy way).

This project is inspired by John Resig's 
"Simple JavaScript Inheritance": http://ejohn.org/blog/simple-javascript-inheritance/
and "makeClass": http://ejohn.org/blog/simple-class-instantiation/
They have been integrated with each other and improved in many ways..

Iv'e made alot of unit testing on this that covers all the functionality, and many ways to use this.
Everything around this is also very performance optimized.

* The library comes in 3 environment releases: *

 * js: Works for any browser environment
 * node.js: Designed for node.js environments
 * jQuery: Designed as a jQuery-plugin

The source code between these are the same, the only difference are how there are built.

It don't have any dependencies and works in all environments.
Iv'e runned the unit tests in following environments:

 * Browsers: IE 7,8, Firefox, Chrome
 * node.js versions: 0.5

If you should find any problems, report a bug/make a pull-requests...

The master branch is kind of work in progress, to get the lastest stable version
look at the tag with highest version-number...

Examples:
----------------------------

### [node.js](https://github.com/joyent/node) ###

<pre>

// You can name 'Class' whatever you want...
var Class = require("path/to/the/lib/node.class.js");

var MyClass = Class({

    // define your class...

});

var instance = new MyClass();

// ..

</pre>

### js ###

<pre>

var MyClass = Class({

    // define your class...

});

var instance = new MyClass();

// ..

</pre>

### [jQuery](https://github.com/jquery/jquery) ###

<pre>

var MyClass = jQuery.Class({

    // define your class...

});

var instance = new MyClass();

// ..

</pre>


More detailed examples:
----------------------------

This examples belove is made with the jQuery release

* Create a basic class...

<pre>

var YourClass = jQuery.Class({
    
    // Constructor is moved here..
    init: function( message ) {
        this.message = message;
    },

    doShit: function() {
        // code ....
    },

    getMessage: function() {
        return this.message;
    }

    // more methods .....

});

</pre>

* Initalizing
read this: http://ejohn.org/blog/simple-class-instantiation/

<pre>

var object = new YourClass( "YES" );

// The new keyword isn't needed, but recommended since its 
// faster and makes your code more readlable..
var object = YourClass( "YES" );

object.getMessage(); // --> "YES"

object.doShit(); // --> call a method

// and so on ...

</pre>

* Create a new class that extends from an existing class.

<pre>

var ExtendedClass = YourClass.extend({

    init: function() {
        // constructor code ..
    },

    doShit: function() {
        // code ..
        this._parent(); // --> this will call the parent doShit method in the "YourClass" class
        // code..
        
        // you could also do like this:
        this._parent.getMessage(); 
        // which calls the parent getMessage-method 
        // that returns this.message instead of null..
    },

    /7 Change the behaviour of this
    getMessage: function() {
        return null;
    }

    // more methods ..

});

</pre>

* Add properties to a existing class prototype on the fly.
* Only adds the properties to new instance'ses of the class

<pre>

ExtendedClass.addMethods({

    doSomething: function() {
        // code ...
    },

    doSomethingMore: function() {
        // code ...
    },

    doShit: function() {
        this._parent(); // call the doShit method that this method overwrites
    }

    // and so on ...

});

</pre>

* Add properties to an class instance on the fly

<pre>

var Class = jQuery.Class({

    get: function(){
        return "Oh";
    }

});

var instance = new Class();

instance.get() === "Oh";

instance.addMethods({

    get: function(){
        var ret = this._parent();

        return ret + "My";
    }

});

instance.get() === "OhMy";

var org_instance = new Class();

org_instance.get() === "Oh";

</pre>

* You also have the possibility to add static properties in an easy way

<pre>

var Base = jQuery.Class({

    staticMethod: function() {
        return "Hi";
    },
    
    // These properties will be the instance-properties
    prototype: {

        init: function() {
            this.message = "Hello";
        },

        getMessage: function() {
            return this.message;
        }

    }

});

var ExtendedClass = Base.extend({

    there: " there!",

    staticMethod: function(){
        return this._parent() + this.there;
    },

    prototype: {

        getMessage: function() {
            return this._parent() + ExtendedClass.there;
        }
    }

});

Base.staticMethod() // -> "Hi"

ExtendedClass.staticMethod() // -> "Hi there!"

var ext = new ExtendedClass();

ext.getMessage() // -> "Hello there!"

</pre>

* All instances will have a property called 'constructor' that always will be a
  reference to the class-constructor, this enables you to access the constructor-properties
  dynamically without hard-code the constructor name.

<pre>

var Class = jQuery.Class({

    property: "hi there",

    prototype: {
        
        get: function() {
            return this.constructor.property;
        }

    }

});

var instance = new Class();

instance.get() -> "hi there"

</pre>

* All classes will have static function called "inherits"
  that can be used to check if a class inherits from another class

<pre>

var Base = jQuery.Class({});
var Ext = Base.extend({});
var Ext2 = Ext.extend({});

Ext.inherits(Base); -> true

Ext.inherits(Ext2); -> false

Ext.inherits(Ext); -> false

Ext2.inherits(Base); -> true

Ext2.inherits(Ext); ->true

</pre>

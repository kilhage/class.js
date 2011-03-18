[jQuery-Class](https://github.com/kilhage/jquery-class)
================================

About
----------------------------
* MIT Licensed
* Last Updated: 2011-03-16 21:04:27
* Version 1.0.0
* Author Emil Kilhage

This library allows you to create Class-like objects in an very effective and nice way.
I found this very useful when working with large projects needing structure, scalability 
and all the other stuff that the ordinary object oriented model gives you in other languages, 
which javascript is kind of missing natively(at least in an easy way).

This project is inspired by John Resig's 
"Simple JavaScript Inheritance": http://ejohn.org/blog/simple-javascript-inheritance/
and "makeClass": http://ejohn.org/blog/simple-class-instantiation/
They have been integrated with each other and improved in many ways..

This library don't have any dependencies and works in all environments.

Iv'e made alot of unit testing on this that covers all the functionality, and many ways to use this.
Everything around this is also very performance optimized.

If you should find any problems, report a bug/make a pull-requests...

Usage:
----------------------------

* Normally when defining a class-definition in javascript, it looks something like this:
<pre>
// Constructor
function YourClass(message){
    this.message = message;
};

YourClass.prototype = {

    doShit: function() {
        // code ....
    },

    getMessage: function() {
        return this.message;
    }

    // more methods .....

});
</pre>

* This library enables you to do the same thing like this:
<pre>
var YourClass = $.Class({
    
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

var Class = $.Class({

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


Good to know:
----------------------------

* You could not have a function called '__self__', this is a preserved word 
  and is used when calling a parent method like this: `this._parent.doSomething()`

Bad(will throw an exception):
<pre>
var YourAwesomeClass = $.Class({

    __self__: function(){

    }

});
</pre>

* Since this library adds the 'Class' property to the global '$' variable, this 
  variable must not be of a data-type that don't support for sub-properties.
  If however it don't exist at all, if will be defined..

Bad(will throw an exception):
<pre>
$ = null;
// or
$ = false;
// or
$ = true;
// or
$ = NaN;
// or
$ = undefined;
// or
$ = "blah";
// or
$ = 0;
</pre>

* You can find some more examples how you can create 
  classes in different ways with this library 
  in test/test.js and test/speed.js 

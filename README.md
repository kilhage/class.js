[jQuery-Class plugin](https://github.com/kilhage/jquery-class)
================================

Info
----------------------------
* MIT Licensed
* Last Updated: 2011-02-25 21:44:23


Usage:
----------------------------

* Create a class:
<pre>
var YourClass = $.Class({
    
    // Constructor
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

* Instaciate the class
<pre>

var object = new YourClass( "YES" );

// The new keyword isn't needed, but recomended since its 
// faster and makes your code more readlable..
var object = YourClass( "YES" );

object.getMessage(); // --> "YES"

object.doShit(); // --> call a method

// and so on ...

</pre>

* To extend a class that not have been initalized, all instances do 
* this class will get these properties in the future
<pre>
var ExtendedClass = YourClass.extend({

    init: function() {
        // constructor code ..
    },

    doShit: function() {
        // code ..
        this._parent(); // --> this will call the parent doShit method in the "YourClass" class
        // code..
    }

    // more methods ..

});
</pre>

* Add methods to a existing class:
<pre>
ExtendedClass.addMethods({

    doSomething: function() {
        // code ...
    },

    doSomethingMore: function() {
        // code ...
    }

    // and so on ...

});
</pre>

* Extend an instance of a class
<pre>

var Class = $.Class({

    get: function(){
        return "Oh";
    }

});

var instance = new Class();

instance.get() === "Oh";

instance.extend({

    get: function(){
        var ret = this._parent();

        return ret + "My";
    }

});

instance.get() === "OhMy";

var org_instance = new Class();

org_instance.get() === "Oh";

</pre>

* In the file example.html, test/test.js and test/speed.js 
* you can find some more examples how you can create classes in different ways with this plugin ...

[jQuery-Class plugin](https://github.com/kilhage/jquery-class)
================================

Info
----------------------------
* MIT Licensed
* Last Updated: 2011-02-27 18:54:08


Usage:
----------------------------

* Create a class.
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
* When this is done, the init method will be executed, if it exist.
<pre>

var object = new YourClass( "YES" );

// The new keyword isn't needed, but recomended since its 
// faster and makes your code more readlable..
var object = YourClass( "YES" );

object.getMessage(); // --> "YES"

object.doShit(); // --> call a method

// and so on ...

</pre>

* Create a new class that extends form an existing class.
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

* Add properties to a existing class prototype on the fly.
* Only adds the properties to new instance'ses on the class
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

* You can find some more examples how you can create 
* classes in different ways with this plugin 
* in test/test.js and test/speed.js 

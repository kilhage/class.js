[jQuery-Class plugin](https://github.com/kilhage/jquery-class)
================================

Info
----------------------------
* MIT Licensed
* Last Updated: 2011-01-31 00:44:34


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
var object = YourClass( "YES" );

// You can also use the new keyword like this if you feel for it, but it isn't needed..
var object = new YourClass( "YES" ); 

object.getMessage(); // --> "YES"

object.doShit(); // --> call a method

// and so on ...

</pre>

* To extend a class, note that this only works on classes that not have been instaciated:
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

* In the file example.html, test/test.js and test/performance.js you can find some more examples ...

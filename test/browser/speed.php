<!doctype html>
<html>
  <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" type="text/css" href="bench/jquery-benchmark-suit.css" />
    <script src="jquery.js"></script>
    <script src="bench/jquery-benchmark.js"></script>
    <script src="bench/jquery-benchmark-suit.js"></script>
    <script src="../../jquery.class<?php echo isset($_GET["a"]) ? $_GET["a"] : "" ?>.js"></script>
    <script>

plugin("jQuery.Class");

module("Build");

test("Building 20.000 basic classes", 10000, function(t){
    var a,b;
    while(t--) {
        a = $.Class({

            init: function(){}

        });

        b = a.extend({
            init: function(){this._parent();}
        });
    }
});

test("Building 20.000 static classes", 10000, function(t){
    var a,b;
    while(t--) {
        a = $.Class({

            staticFn: function(){},

            prototype: {
                init: function(){}
            }

        });

        b = a.extend({

            staticFn: function(){this._parent();},

            prototype: {
                init: function(){this._parent();}
            }

        });
    }
});

test("Initalizing 100.000 objects using with the new keyword", 100000, function(t){
    var b, a = $.Class({
        init: function(){}
    });
    while(t--) {
        b = new a();
    }
});

test("Initalizing 100.000 objects using without the new keyword", 100000, function(t){
    var b, a = $.Class({
        init: function(){}
    });
    while(t--) {
        b = a();
    }

});

var fns = {};
var times = 50;
while(times--)
    fns["fn"+times] = function(){};

test("Extending an instance", 10000, function(t){
    
    var instance = new ($.Class({
            
        init: function(){

        }
        
    }));
    
    while(t--) {
        instance.addMethods({
            
            init: function(){
                this._parent();
            }
            
        });
    }
    
});

    </script>
  </head>
  <body>
  </body>
</html>

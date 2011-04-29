(function($) {

var tests = {}, _module = "", plugin_name = "", div;

$.fn.extend({
    
    benchmark: function() {
        var self = this,
            rows = {},
            divs = {},
            status = div.find(".status").html("Building.."),
            i = 0;
            
        $.each(tests, function(module, test){
            var div = $("<div />").append("<h2>- "+module+"</h2>").appendTo(self);
            rows[module] = {};
            divs[module] = div;
            $.each(test.tests, function(i, ob){
                var code = $("<code class='language-javascript'/>").html(ob.fn.toString()).hide();
                
                if ( ob.name in rows[module]) {
                    ob.name += i;
                }
                
                rows[module][ob.name] = $.extend(ob.test, {
                    times: ob.times,
                    li: $("<li class='test'>")
                        .html("<span>"+ob.name+" :: <b>"+ob.times+"</b> times</span>")
                        .appendTo(div)
                        .click(function(){
                        code.slideToggle(50);
                        })
                        .append(code)
                });
                
            });
            i++;
        });

        status.html("Running tests..");
        
        $.each(rows, function(module, tests){
            setTimeout(function(){
                var tester = new $.benchmark.Test(module);

                tester.disable().add(tests).run().output(function(times, time, i) {
                    this.tests[i].li.find("span").first().append(" :: <b>" + time + "ms</b> :: average <b>" + $.benchmark.round( time / this.tests[i].times ) + " ms</b><br>");
                });
                
                divs[module].find("h2").after(tester.message+"<br/><br/>");
                i--;
                if ( i == 0 ) {
                    status.html("");
                }
            }, 0);
        });
        
        return this;
    }
});

$.extend(window, {

    test: function(name, t, fn) {
        if ( typeof t === "function" ) {
            fn = t;
            t = tests[_module].times || 100;
        }
        var test = {
            test: function(){
                fn(t);
            },
            name: name,
            fn: fn,
            times: t
        };
        test.fn.nodeType = true;
        tests[_module].tests.push(test);
    },

    module: function(m, t) {
        _module = m;
        if ( !(m in tests)) {
            tests[m] = {
                times: t,
                tests: []
            };
        } else if( t != null ) {
            tests[m].times = t;
        }
    },

    plugin: function(n){
        plugin_name = n;
    },
    
    log: function(m) {
        if ( window.console && console.log ) {
            console.log(plugin_name, m);
        }
        return m;
    }

});

$(function(){
    $("head").find("title").html(plugin_name+" :: Performance");
    div = $("<div />").appendTo("body").addClass("benchmark").html("<span class='status' />");
    $("<h1 >").html(plugin_name).appendTo($("<center />").appendTo(div));
    div.benchmark();
});

$.getScript("http://github.com/balupton/jquery-syntaxhighlighter/raw/master/scripts/jquery.syntaxhighlighter.min.js", function(){
    $(function(){
        $.SyntaxHighlighter.init();
    });
});

}(jQuery));

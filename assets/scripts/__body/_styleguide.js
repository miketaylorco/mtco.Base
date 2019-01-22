/*
http://gregfranko.com/jquery-best-practices/#/8
*/
(function(yourcode) {
    yourcode(window.jQuery, window, document);
  }(function($, window, document) {

  // The $ is now locally scoped 

  $(function() {

    // ----------------------------------------------
    // The DOM is ready!

    // check cookies
    var expanded;
    if(typeof Cookies !== 'undefined') {
      expanded = Cookies.getJSON('stylenav');
      if(expanded != null) {
        for(var x=0; x<expanded.length; x++) {
          $("#" + expanded[x]).addClass("current");
        }
      }
    }

    var body = $("body");
    $("#stylenav").click(function() {
      if(body.hasClass("showstyleguide")) {
        body.removeClass("showstyleguide");
      }
      else
      {
        body.addClass("showstyleguide");
      }
      return false;
    });

    $("em, span.style-label", $("#stylenav-inner")).click(function() {

      var li = $(this).parent();
      if(li.hasClass("current")) { li.removeClass("current"); } else { li.addClass("current"); }

      // update cookies
      if(typeof Cookies !== 'undefined') {
        var current = [];
        $(".stylenav-level1.current").each(function() {
          current.push($(this).attr("id"));
        });
        Cookies.set('stylenav', current);
      }

      return false;
    });



    // ----------------------------------------------

  });

  //console.log('The DOM may not be ready');
  // The rest of code goes here!

}));







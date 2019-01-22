// revised pageSwap plug-in, removing all animation options
(function ($) {

    var isIE8 = ($("#ie").hasClass("ie8"));

    $.fn.pageSwap = function (options) {

        var selector = $(this).selector;
        var data = $(this).data();

        var defaults = {

            // default classes
            linkListSelector: "ul"+selector+"Links a, ol"+selector+"Links a",
            linkSelector: "a"+selector+"Link",
            selectSelectorClass: (selector+"Selector").substring(1),
            inlineLinkClass: (selector+"InlineLink").substring(1),
            inlineLinkPositionClass: (selector+"InlineLinkPosition").substring(1),
            linkPage: selector+"Page",
            defaultPage: selector+"Default",
            selectedClass: (selector+"Selected").substring(1),

            // changing behaviour
            selectParentClass: (selector+"SelectParent").substring(1),
            linkAncestorClass: (selector+"LinkAncestors").substring(1),
            clickToRevertClass: (selector+"ClickToRevert").substring(1),
            allowMultipleClass: (selector+"AllowMultiple").substring(1),
            revertToDefaultClass: (selector+"NoRevertToDefault").substring(1)

        };

        var options = $.extend(defaults,options);
        var anchor = window.location.hash;

        $(this).each(function() {

            var currentPage = "";
            var thisPageSwap = $(this);
            var selectParent = $(this).hasClass(options.selectParentClass);
            var linkAncestors = $(this).hasClass(options.linkAncestorClass);
            var clickToRevert = $(this).hasClass(options.clickToRevertClass);
            var allowMultiple = $(this).hasClass(options.allowMultipleClass);
            var revertToDefault = !$(this).hasClass(options.revertToDefaultClass);
            var jumpToAnchor = "";

            var pageSwapDefault = $(options.defaultPage, thisPageSwap).eq(0);
            var initialPage = (pageSwapDefault[0] ? "#"+pageSwapDefault.attr("id"):"");

            // #parameter overrides default page, and might be an anchor *inside* a page
            if(anchor != ""){
                var anchorPage = $(anchor,thisPageSwap).eq(0);
                if(anchorPage[0])
                {
                    var originalDefault = pageSwapDefault;
                    var initialDefault = originalDefault;

                    if(anchorPage.hasClass(options.linkPage.substring(1))) {
                        // anchor *is* a page swap page
                        initialDefault = anchorPage;
                        jumpToAnchor = anchor;
                    }
                    else
                    {
                        var anchorParent = anchorPage.parents(options.linkPage);
                        if(anchorParent[0])
                        {
                            // anchor is *inside* a page swap page
                            initialDefault = anchorParent;
                            jumpToAnchor = anchorParent.attr("id");
                        }
                    }

                    // do we need to hide the default page here?
                    // if there are no 'pageSwapLinks' to the default page, it will never hide
                    //alert(initialDefault.attr("id") + ", " + originalDefault.attr("id"));
                    if(initialDefault.attr("id") != originalDefault.attr("id"))
                    {
                        originalDefault.hide();
                        initialPage = "#" + initialDefault.attr("id");
                        //alert("original default = " + originalDefault.attr("id") + ", intial page = " + initialPage);
                    }

                }
            }

            // work out the initially visible page
            currentPage = initialPage;


            var links = $(options.linkListSelector + "," + options.linkSelector, thisPageSwap);
            if(links[0]) {

                if(currentPage != "") {
                    var linksToCurrentPage = $("a[href=" + currentPage + "], a[data-page=" + currentPage + "]");
                    var listLinksToCurrentPage = $("ul"+selector+"Links a[href=" + currentPage + "], ul"+selector+"Links a[data-page=" + currentPage + "]", thisPageSwap);
                    linksToCurrentPage.addClass(options.selectedClass);
                    if(selectParent) { linksToCurrentPage.parent().addClass(options.selectedClass); }
                    if(linkAncestors) {
                        listLinksToCurrentPage.parents("li").addClass(options.linkAncestorClass); 
                    }


                    thisPageSwap.addClass((selector+"HasVisiblePage").substring(1));
                    thisPageSwap.addClass(selector.substring(1)+currentPage.substring(1));
                }

                links.each(function() {

                    var show = $(this).attr("href");
                    var d = $(this).data();
                    if(d.page){ if(d.page != "") { show = d.page; }}

                    var $div = $(show);
                    //var linksToThisPage = $("a[href=" + show + "], a[data-page=" + show + "]");
                    //var listLinksToThisPage = $("ul"+selector+"Links a[href=" + show + "], ul"+selector+"Links a[data-page=" + show + "]", thisPageSwap);

                    // MT: 9/6/15 - a[data-page] is killing IE8 - don't actually use it on Ford, so commenting it out
                    var linksToThisPage = $("a[href=" + show + "]"); //, a[data-page=" + show + "]");
                    var listLinksToThisPage = $("ul"+selector+"Links a[href=" + show + "]"); //, ul"+selector+"Links a[data-page=" + show + "]", thisPageSwap);


                    if(show != initialPage) {
                        $div.hide();
                    }
                    else
                    {
                        // not sure we need this - isn't this done above?
                        $(this).addClass(options.selectedClass);
                        if(selectParent) { $(this).parent().addClass(options.selectedClass); }
                    }

                    // assume always on click - use on instead of bind
                    $(this).on("click", function(e) {

                        if(allowMultiple)
                        {  
                            if($div.is(":visible")) {                                
                                linksToThisPage.removeClass(options.selectedClass);
                                if(selectParent) { linksToThisPage.parent().removeClass(options.selectedClass); }
                                if(linkAncestors) { 
                                    listLinksToThisPage.parents("li").removeClass(options.linkAncestorClass); 
                                }
                                $div.hide();
                            }
                            else
                            {
                                linksToThisPage.addClass(options.selectedClass);
                                if(selectParent) { linksToThisPage.parent().addClass(options.selectedClass); }
                                if(linkAncestors) { 
                                    listLinksToThisPage.parents("li").addClass(options.linkAncestorClass); 
                                }
                                $div.show();

                                //alert($div.offset().top);
                            }
                        }
                        else
                        {
                            if(show != currentPage)
                            {
                                // original pageSwap had this... not sure what use case it covers?
                                // if(height==0){
                                //     $("a[href="+show+"]",thisPageSwap).first().click();
                                // } else {

                                if(currentPage != "")
                                {
                                    // hide current page
                                    thisPageSwap.removeClass(selector.substring(1)+currentPage.substring(1));

                                    var linksToCurrentPage = $("a[href=" + currentPage + "], a[data-page=" + currentPage + "]");
                                    var listLinksToCurrentPage = $("ul"+selector+"Links a[href=" + currentPage + "], ul"+selector+"Links a[data-page=" + currentPage + "]", thisPageSwap);

                                    if(isIE8) {
                                        linksToCurrentPage.each(function(){ $(this).focus(); $(this).blur(); });
                                    }

                                    linksToCurrentPage.removeClass(options.selectedClass);
                                    if(selectParent) { linksToCurrentPage.parent().removeClass(options.selectedClass); }
                                    if(linkAncestors) { 
                                        listLinksToCurrentPage.parents("li").removeClass(options.linkAncestorClass); 
                                    }
                                    $(currentPage).hide();
                                }

                                linksToThisPage.addClass(options.selectedClass);
                                if(selectParent) { linksToThisPage.parent().addClass(options.selectedClass); }
                                if(linkAncestors) { 
                                    listLinksToThisPage.parents("li").addClass(options.linkAncestorClass); 
                                }
                                $div.show();


                                // TODO: make more efficient!
                                // scroll to the container if it's not already in the viewport
                                // http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
                                var win = $(window);
                                var viewportTop = win.scrollTop();
                                var viewportBottom = viewportTop + win.height();
                                var divTop = $div.offset().top;

                                if(divTop < viewportTop || divTop > viewportBottom) {
                                    var mobileOffset = 0;
                                    if($("#mqMobile").is(":visible")) { mobileOffset = 74; }
                                    if($("#mqSmall").is(":visible")) { mobileOffset = 90;}
                                    $('html,body').animate({ scrollTop: divTop - mobileOffset }, 500, "easeInOutQuad", function () {
                                        //location.hash = hashToAdd;
                                    });
                                }

                                currentPage = show;



                            }
                            else if (clickToRevert)
                            {
                                //alert('xxx');
                                thisPageSwap.removeClass(selector.substring(1)+currentPage.substring(1));
                                linksToThisPage.removeClass(options.selectedClass);
                                if(selectParent) { linksToThisPage.parent().removeClass(options.selectedClass); }
                                if(linkAncestors) { 
                                    listLinksToThisPage.parents("li").removeClass(options.linkAncestorClass); 
                                }
                                $div.removeAttr("tabindex").hide();
                                currentPage = "";

                                //alert(revertToDefault);
                                if(revertToDefault) {
                                    pageSwapDefault.show();
                                    currentPage = "#"+pageSwapDefault.attr("id");
                                }

                            }
                        }
                        
                        //alert(currentPage);
                        if(currentPage == "") {
                            thisPageSwap.removeClass((selector+"HasVisiblePage").substring(1));
                        } else {
                            thisPageSwap.addClass((selector+"HasVisiblePage").substring(1));
                            thisPageSwap.addClass(selector.substring(1)+currentPage.substring(1));
                        }

                        if(isIE8) {
                            $(this).focus();
                        }
                        $(this).blur(); 
                        
                        return false;

                    });

                });

                var inlineLinks = $("."+options.inlineLinkClass);
                if(inlineLinks[0]) {
                    inlineLinks.each(function() {
                        $(this).on("click", function() {

                            var pageToLinkTo = "";
                            var linkTarget = $($(this).attr("href"));
                            if(linkTarget.hasClass(options.linkPage.substring(1)))
                            {
                                // link target *is* a page swap page
                                pageToLinkTo = $(this).attr("href");
                            }
                            else
                            {
                                var linkTargetParents = linkTarget.parents(options.linkPage);
                                if(linkTargetParents[0]) {
                                    pageToLinkTo = "#"+linkTargetParents.eq(0).attr("id");
                                }
                            }

                            if(pageToLinkTo != "") {
                                var existingLinksToPage = options.linkListSelector + "[href=" + pageToLinkTo + "]," + options.linkSelector + "[href=" + pageToLinkTo + "]";
                                $(existingLinksToPage).first().click();
                                if($(this).hasClass(options.inlineLinkPositionClass)) {
                                    var new_position = linkTarget.offset();
                                    window.scrollTo(new_position.left, new_position.top);
                                    location.hash = $(this).attr("href");
                                }
                            }

                            return false;

                        });
                    });
                }

            }

            var selectSelector = $("select."+options.selectSelectorClass, thisPageSwap);
            if(selectSelector[0]) {
                selectSelector.each(function() {

                    // cycle through the options, hiding all of them, except the default page
                    $("option", $(this)).each(function() {
                        var show = $($(this).val());
                        if(pageSwapDefault && show.attr("id") != pageSwapDefault.attr("id")) {
                            show.hide();
                        }
                        else
                        {
                            $(this).attr("selected","selected");
                        }
                    });

                    $(this).on("change", function() {

                        $(currentPage).hide();

                        var pageToShow = $(this).val();
                        $(pageToShow).show();
                        currentPage = pageToShow;

                    });
                });
            }


        });

    };

})(jQuery);
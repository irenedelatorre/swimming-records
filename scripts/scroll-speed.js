

jQuery(document).ready(function(){
    var navOffset = jQuery(".navSpeedEvent").offset().top;

    jQuery(window).scroll(function(){
        var scrollPos = jQuery(window).scrollTop();

        if (scrollPos>=navOffset){

            jQuery(".navSpeedEvent").addClass("navSpeedEvent-scrolled");
            jQuery(".eventPlot").addClass("visualizations-scrolled");


        }else{
            jQuery(".navSpeedEvent").removeClass("navSpeedEvent-scrolled");
            jQuery(".eventPlot").removeClass("visualizations-scrolled");
        }
    });



})
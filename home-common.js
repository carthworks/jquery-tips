	$(document).ready(function(){
		
		var totalWidthOne = 0;
		var totalWidthTwo = 0;
		var totalWidthThree = 0;
		var totalwidth = 820;
		
		FngetCategoryOneWidth();
		function FngetCategoryOneWidth(){
					$('.tilescategoryOne .container-ss > div').each(function(index) {
						totalWidthOne += parseInt($(this).width(), 10);
					});
				
					if($(".tilescategoryOne .container-ss > div").size() > 2){
								//console.log(totalWidthOne);
								if(totalWidthOne < totalwidth){
										$(".tilescategoryOne").width(totalWidthOne);
								}else{
										//console.log("in");
										$(".tilescategoryOne").width(totalwidth);
								}
					}else{
							
							$(".tilescategoryOne").width(totalWidthOne);
								$(".tilescategoryTwo .container-ss div[data-ss-colspan]").appendTo($(".tilescategoryOne > .container-ss"));
								$(".tilescategoryTwo").remove();
								$(".tilescategoryThree .container-ss div[data-ss-colspan]").appendTo($(".tilescategoryOne > .container-ss"));
								$(".tilescategoryThree").remove();
					}

		}
			
		$('.tilescategoryTwo .container-ss > div').each(function(index) {
				totalWidthTwo += parseInt($(this).width(), 10);
		});
				if(totalWidthTwo < totalwidth){
						$(".tilescategoryTwo").width(totalWidthTwo);
				}else{
						$(".tilescategoryTwo").width(totalwidth);
				}	

		
		$('.tilescategoryThree .container-ss > div').each(function(index) {
			totalWidthThree += parseInt($(this).width(), 10);
			if(totalWidthThree < totalwidth){
					$(".tilescategoryThree").width(totalWidthThree + 50);
			}else{
					$(".tilescategoryThree").width(totalwidth);
			}
		});
		
		var gettilecategoryOne = $(".tilescategoryOne").width();
		var gettilecategoryTwo = $("div.tilescategoryTwo").width();
		var gettilecategoryThree = $("div.tilescategoryThree").width();
		
		var totaltilegroupcategory = gettilecategoryTwo + gettilecategoryThree;
		var totalgroupcategory = $(".tilescategoryGroup").width(gettilecategoryTwo);
		var totaltilecategory = gettilecategoryOne + totalgroupcategory;
		$(".content-wrapper").width(totaltilecategory + 100);
		
		
		
		  $(".main-content").mCustomScrollbar({
		axis: "x",
		 theme: "minimal",
		autoHideScrollbar: true,
		autoExpandScrollbar: true,
		mouseWheel:{ scrollAmount: "100px" },
		scrollEasing:"linear",
					advanced:{
						autoExpandHorizontalScroll:true
					}
		
		
		});
		
		 $(".container-ss").shapeshift({
		 minColumns: 3,
		 enableCrossDrop: false,
		 gutterX: 10,
		 gutterY: 10,
		 animationSpeed: 400
		 });
		 
		 
				var getcontainerssHeight = $(window).height();
					$(".main-content").height(getcontainerssHeight - 133);
					var heightPx = 175;
					var heightSmaller = 130;
		
					$(".live-tile,.flip-list").not(".exclude").liveTile();
				   $(".carousel").height(heightPx - 35);
				 $(".carousel").css({"overflow":"hidden"});
				//$(".item").height(300);
     
    
				$(window).bind('resizeEnd', function() {
					 $(".carousel").height(heightPx - 35);
					 $(".carousel").css({"overflow":"hidden"});
				 //$(".item").height(300);
				});
					});
	

$(function(){
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');
    
            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
    
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            
            // Check if the viewport is set, else we gonna set it if we can.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
    
            // Replace image with new SVG
            $img.replaceWith($svg);
    
        }, 'xml');
    
    });
});
	
	
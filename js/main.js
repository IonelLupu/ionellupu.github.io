var $ = jQuery.noConflict();
jQuery(function($) {
	"use strict";
	// preloader
	$(window).load(function() {
		$("#preloader").delay(500).fadeOut("slow");
		setTimeout(function(){$("#logo h1").addClass("animated fadeInDown")},1000);
		setTimeout(function(){$("#logo img").addClass("animated fadeInDown")},1000);
		setTimeout(function(){$("#logo p").addClass("animated fadeInDown")},1300);
		setTimeout(function(){$("#textslider").addClass("animated fadeInDown")},1600);
		setTimeout(function(){$(".description .uptodown").addClass("animated fadeInDown")},1900);
		setTimeout(function(){$(".description .jump").addClass("animated fadeInUp")},2100);
		setTimeout(function(){$(".description .downtoup").addClass("animated fadeInDown")},2400);
		setTimeout(function(){$(".left .arrow a").addClass("animated fadeInLeft")},3000);
		setTimeout(function(){$(".bottom .arrow a").addClass("animated fadeInUp")},3300);
		setTimeout(function(){$(".right .arrow a").addClass("animated fadeInRight")},3600);
    })
	
	// jumper
	var beepOne = $("#beep")[0];$(".description .jump").mouseenter(function() {beepOne.play();});
	
	// textslider
	$("#textslider").superslides({
		play: 6000, // 6 seconds between each slide
		animation: "fade",
		animation_speed: "slow",
		pagination: false,
		usekeyboard: false
	});

	// STARS
	$("#star").each(function() {
		postars($('.cover')[0]).init();
	});
	
	// floor
	var pofloor = $("#sections").pofloor({pofloorFloorName:["Home", "Service","About", "Contact" , "Countdown" , "Subcribe", "News"], time:1000,childType:"section",easing: "easeInOutExpo" ,
	direction: [[2,2],[2,1],[2,0],[2,3],[1,2],[3,2],[4,2]]});
	var pofloorInstance = $("#sections").data("pofloor");
	$(".direction").click(function() {
		pofloorInstance.scrollToDirection($(this).data("direction"));
	});	
			
	// popup
	$(".ajax-popup-link").each(function() {
		$('.ajax-popup-link').magnificPopup({
			type: 'ajax'
        });
	});
	
	// subscribe
	$("#subscribe-form").each(function() {
		$("#subscribe-form").ajaxForm( {
			target: "#subscribe .message",
			success: function() { 
				$("#subscribe-form").slideUp("slow");
				$("#subscribe .waiting").delay(100).fadeIn("slow");
				$("#subscribe .waiting").delay(500).fadeOut("slow");
				$("#subscribe .message").delay(1500).slideDown("slow");
			}
		});
	});
	
	// mailchimp
	$("#mailchimp").each(function() {
		$('#mailchimp').ajaxChimp({
			callback: mailChimpResponse,
			url: 'your-form-address',
		});
		function mailChimpResponse(resp) {
			if (resp.result === 'success') {
				
				$("#subscribe .waiting").delay(100).fadeIn("slow");
				$("#subscribe .waiting").delay(500).fadeOut("slow");
				$('#subscribe .message').delay(1000).slideDown("slow");
				$('#subscribe .message').delay(1500).html('<h1>Success!</h1><p>We have sent you a confirmation email</p>').slideDown("slow");
				$("#mailchimp").slideUp("slow");
			   
			} else if(resp.result === 'error') {
				$("#subscribe .waiting").delay(100).fadeIn("slow");
				$("#subscribe .waiting").delay(500).fadeOut("slow");
				$('#subscribe .message').delay(1500).html('<h1>Error!</h1><p>' + resp.msg +'</p>').slideDown("slow");
			}  
		}
	});
	
	// contact form
	$("#contactForm").each(function() {
		$("#contactForm").submit(function(e) {
			e.preventDefault();

			$.ajax({
				url: "inc/contact.php",
				data: "name="+ escape($("#contactName").val()) +"&email=" + escape($("#contactEmail").val()) + "&phone=" + escape($("#contactPhone").val()) + "&message="+escape($("#contactMessage").val()),
				dataType: "json",
				success: function(resp) {
					$("#contactName, #contactEmail, #contactMessage").removeClass("error");

					if(resp.success == 1){
						$("#modalContent").text(resp.message);
						$("#contact .waiting").delay(100).fadeIn("slow");
						$("#contact .waiting").delay(500).fadeOut("slow");
						$("#contact .message").delay(1500).slideDown("slow");
						$("#contactForm").slideUp("slow");
						$("#contactName, #contactEmail, #contactMessage, #contactPhone").val("");
					}
					else {
						if(resp.errorCode == 1){
							$("#contactName").addClass("error").focus();
						}
						else if(resp.errorCode == 2){
							$("#contactEmail").addClass("error").focus();
						}
						else if(resp.errorCode == 3){
							$("#contactMessage").addClass("error").focus();
						}	
					}					
				}
			});
			return false;
		});
	});
	
	// countdown
	$(".countdown").countEverest({
		//Set your target date here!
		day: 29,
		month: 12,
		year: 2015
	});
	//  nice scroll
	var nice = $('.container').getNiceScroll();
	$('.container').niceScroll({cursorborder:"0px solid #ffffff",cursorcolor:"#000000",mousescrollstep:"10",scrollspeed:"120",horizrailenabled:false});
});	
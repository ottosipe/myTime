$(document).ready(function(){
	$('#mainNav a').click(function (e) {
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#accountNav a").click(function(e) {
		e.preventDefault();
		window.location.hash = $(this).attr("href");
	  	
	})
});
$(document).ready(function(){
	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#exam1").datepicker({todayHighlight: true, autoclose:true}); //set date range

});
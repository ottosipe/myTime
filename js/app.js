$(document).ready(function(){
	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#exam1").datepicker({todayHighlight: true, autoclose:true}); //set date range

	buildSchools();

});

function buildSchools() {
	$.get("/schools", function(data) {
		var schools = $.parseJSON(data);
		var selected = "";
		$(".schoolSelector").empty();
		for (x in schools) {
			if(schools[x].schoolcode == "LSA") selected = 'selected="selected"';
			else selected = "";
			$(".schoolSelector").append('<option '+selected+' value="'+schools[x].schoolcode+'">'+schools[x].schooldescr+'</option>');
		}
		buildDepartments();
		$(".schoolSelector").removeAttr("disabled").change(function(){
			buildDepartments();
		});
	});
}

function buildDepartments() {
	$.get("/departments", { school: $(".schoolSelector").val() }, function(data) {
		var depts = $.parseJSON(data);
		//console.log(depts)
		var selected = "";
		$(".deptSelector").empty();
		for(x in depts) {
			if(depts[x].subjectcode == "MATH") selected = 'selected="selected"';
			else selected = "";
			$(".deptSelector").append('<option '+selected+' value="'+depts[x].subjectcode+'">'+depts[x].subjectdescr+'</option>');
		}
		buildNumbers();
		$(".deptSelector").removeAttr("disabled").change(function(){
			buildNumbers();
		});
	});
}

function buildNumbers() {
	$.get("/courses", { dept: $(".deptSelector").val() }, function(data) {
		var nums = $.parseJSON(data);
		var selected = "";
		$(".numSelector").empty();
		
		for(x in nums) {
			if(nums[x].catalognumber == 216) selected = 'selected="selected"';
			else selected = "";
			$(".numSelector").append('<option '+selected+' value="'+nums[x].catalognumber+'">('+nums[x].catalognumber+') '+nums[x].coursedescr +'</option>');
		}
		$(".numSelector").removeAttr("disabled");
	});
}

function buildInfo() {
	$.get("/info", { dept: $(".deptSelector").val() }, function(data) {
		var nums = $.parseJSON(data);
		var selected = "";
		$(".numSelector").empty();
		
		for(x in nums) {
			if(nums[x].catalognumber == 216) selected = 'selected="selected"';
			else selected = "";
			$(".numSelector").append('<option '+selected+' value="'+nums[x].catalognumber+'">('+nums[x].catalognumber+') '+nums[x].coursedescr +'</option>');
		}
		$(".numSelector").removeAttr("disabled");
	});
}
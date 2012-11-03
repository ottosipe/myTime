$(document).ready(function(){
	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#exam1").datepicker({todayHighlight: true, autoclose:true}); //set date range

	buildSchools();

});

function optionAdder(arr, cb){
	if(!(arr instanceof Array)) {
		var junkArr = new Array(arr);
		arr = junkArr;
	}
	for (i in arr) cb(i,arr);
}

function buildSchools() {
	$.get("/schools", function(data) {
		var schools = $.parseJSON(data);
		var selected = "";
		$(".schoolSelector").empty();
		optionAdder(schools, function(x,schools) {
			if(schools[x].schoolcode == "LSA") selected = 'selected="selected"';
			else selected = "";
			$(".schoolSelector").append('<option '+selected+' value="'+schools[x].schoolcode+'">'+schools[x].schooldescr+'</option>');
		});
		buildDepartments();
		$(".schoolSelector").removeAttr("disabled").change(function(){
			buildDepartments();
		});
	});
}

function buildDepartments() {
	$.get("/departments", { school: $(".schoolSelector").val() }, function(data) {
		var depts = $.parseJSON(data);

		var selected = "";
		$(".deptSelector").empty();
		optionAdder(depts, function(x,depts) {
			if(depts[x].subjectcode == "CHEM" || depts[x].subjectcode == "EECS") selected = 'selected="selected"';
			else selected = "";
			$(".deptSelector").append('<option '+selected+' value="'+depts[x].subjectcode+'">'+depts[x].subjectdescr+'</option>');
		});
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
		
		optionAdder(nums, function(x,nums) {
			if(nums[x].catalognumber == 210 || nums[x].catalognumber == 281) selected = 'selected="selected"';
			else selected = "";
			$(".numSelector").append('<option '+selected+' value="'+nums[x].catalognumber+'">('+nums[x].catalognumber+') '+nums[x].coursedescr +'</option>');
		});
		buildSection();
		$(".numSelector").removeAttr("disabled").change(function(){
			buildSection();
		});
	});
}

function buildSection() {
	$.get("/section", { dept: $(".deptSelector").val(), num: $(".numSelector").val() }, function(data) {
		
		var sects = $.parseJSON(data);
		var selected = "";
		$(".sectSelector").empty();
		optionAdder(sects, function(x,sects) {
			if(sects[x].catalognumber == 1) selected = 'selected="selected"';
			else selected = "";
			$(".sectSelector").append('<option '+selected+' value="'+sects[x].sectionnumber+'">Sect. '+sects[x].sectionnumber+': '+sects[x].sectiontypedescr +'</option>');
		});
		buildInfo();
		$(".sectSelector").removeAttr("disabled").change(function(){
			buildInfo();
		});
	});
}

function buildInfo() {
	$.get("/info", { dept: $(".deptSelector").val(), num: $(".numSelector").val(), sect: $(".sectSelector").val(),}, function(data) {
		
		var sects = $.parseJSON(data);
		var selected = "";
		$(".infoBox").empty();
		optionAdder(sects, function(x,info) {

			$(".infoBox").append('<p>'+info[x].days+' '+info[x].times+'</br>'+info[x].instructorname+'</br>'+info[x].location+'</p>');
		});
		$(".infoBox").show();
	});
}
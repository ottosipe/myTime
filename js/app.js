$(document).ready(function(){
	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#exam1").datepicker({todayHighlight: true, autoclose:true}); //set date range

	buildDepartments();

});

function optionAdder(arr, cb){
	if(!(arr instanceof Array)) {
		var junkArr = new Array(arr);
		arr = junkArr;
	}
	for (i in arr) cb(i,arr);
}

/*function buildSchools() {
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
}*/

function buildDepartments() {
	$.get("/codes", {}, function(data) {
		var depts = $.parseJSON(data);
		
		var selected = "";
		$(".deptSelector").empty();
		optionAdder(depts, function(x,depts) {
			if(depts[x].code == "EECS") selected = 'selected="selected"';
			else selected = "";
			$(".deptSelector").append('<option '+selected+' value="'+depts[x].code+'">'+depts[x].subject+'</option>');
		});
		buildNumbers();
		$(".deptSelector").removeAttr("disabled").change(function(){
			buildNumbers();
		});
	});
}

function buildNumbers() {
	$.get("/numbers", { subj: $(".deptSelector").val() }, function(data) {
		var nums = $.parseJSON(data);

		var selected = "";
		$(".numSelector").empty();
		optionAdder(nums, function(x,nums) {
			if(nums[x].number == 210 || nums[x].number == 281) selected = 'selected="selected"';
			else selected = "";
			$(".numSelector").append('<option '+selected+' value="'+nums[x].number+'">('+nums[x].number+') '+nums[x].title +'</option>');
		});
		buildSections();
		$(".numSelector").removeAttr("disabled").change(function(){
			buildSections();
		});
	});
}

function buildSections() {
	$.get("/sections", { subj: $(".deptSelector").val(), num: $(".numSelector").val() }, function(data) {
		
		var sects = $.parseJSON(data);
		var selected = "";

		$(".sectSelector").empty();
		optionAdder(sects, function(x,sects) {
			if(sects[x].number == 1) selected = 'selected="selected"';
			else selected = "";
			var html = '<option '+selected+' value="'+sects[x].id+'">'+sects[x].type +' - '+sects[x].section+' ';
			html += (sects[x].instructor)? "("+sects[x].instructor+")" : "(staff)";
			html += ' </option>';
			$(".sectSelector").append(html);
		});
		buildInfo();
		$(".sectSelector").removeAttr("disabled").change(function(){
			buildInfo();
		});
	});
}

function buildInfo() {
	$.get("/info", { id: $(".sectSelector").val(),}, function(data) {
		
		var sect = $.parseJSON(data);
		var selected = "";
		console.log(sect);

		optionAdder(sect, function(x,info) {
			var html = '<p>'+info[x].days+' '+info[x].time+'</br>';
			html += (info[x].instructor)? info[x].instructor+"</br>" : "(staff)</br>";
			html += info[x].location+'</p>';
			$(".infoBox").html(html);
		});
		$(".infoBox").show();
	});
}
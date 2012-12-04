var idToAdd = 0;

$(document).ready(function(){
	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})
	$('#welcome').modal();
	$("#exam1").datepicker({todayHighlight: true, autoclose:true}); //set date range

	$("#addClass").submit(function(event){
		event.preventDefault();

		$.post('/courses', { "id": idToAdd }, function(data) {
			console.log(data);
			reLoadCourses();
		});

	});



	buildDepartments();
	reLoadCourses();

});

function reLoadCourses() {
	$.getJSON('courses', function(data) {
		$("#courseList").html("");
		$("#courseListSmall").html("");
		$.each(data, function(key, course) {
			//console.log(course)
			var html = '<div class="well well-small entry">';
			html += '<div class="row-fluid"><div class="span6" data-id="'+course.id+'"><h4 class="courseTitle">'+course.code+' '+course.number+'</h4>'+course.title+' ('+course.type+')</div>';
			html += '<div class="span6"><span class="pull-right"> '+course.time+" "+course.days+' </span></div></div>';

				html += '<div class="row-fluid edit">';
					html += '<div class="span9">'+course.instructor+'</br>'+course.location+'</div>';
					html += '<div class="span3"><div class="pull-right"><a class="btn btn-danger btn-small deleteClass" data-id="'+course.id+'" role="button">';
				      html += '<i class="icon-ban-circle"></i></a>';
				    html += '<a class="btn btn-success btn-small" data-toggle="modal" href="#editClass" role="button">';
				      html += '<i class="icon-pencil"></i></a></div></div>';
			 	html += '</div></div>';
			 
			/*$(".entry").click(function(event){
				$(this).find(".edit").toggle();
			});*/

			$("#courseList").append(html);
			var html2 = '<div class="label smallCourse" data-id="'+course.id+'">';
				html2 += course.code+' '+course.number;
				html2 += '</div>';
			$("#courseListSmall").append(html2);

			$(".deleteClass").click(function(event){
				$.post("/delete", {id:$(this).attr("data-id")},function(data){ 
					console.log(data);
					reLoadCourses();
				})
			})

		});
		if(data=="") {
			$("#courseAlert").show();
		} else {
			$("#courseAlert").hide();
		}
	});

};

function optionAdder(arr, cb){
	if(!(arr instanceof Array)) {
		var junkArr = new Array(arr);
		arr = junkArr;
	}
	for (i in arr) cb(i,arr);
}

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
			idToAdd = info[x].id;
			$("#addClassBtn").html("Add "+info[x].code+" "+info[x].number);
		});

		$(".infoBox").show();
	});
}
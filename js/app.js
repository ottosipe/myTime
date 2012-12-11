var idToAdd = 0; // global for adding a class, should be attached to the dom ***

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
		$("#addClassBtn").button('loading');
		$.post('/courses', { "id": idToAdd }, function(data) {
			console.log(data);
			reLoadCourses();

			$("#addClassBtn").html('Course Added').attr("disabled","disabled");
			
		});
	});

	$("body").on("click", ".entryTitle", function() {
		$(".edit").hide();
		$(this).parent().find(".edit").show();
	});

	$("body").on("click", ".closeEntry", function() {
		$(this).closest(".edit").hide();
	});

	$("body").on("click", ".deleteClass", function() {
		var victim = $(this);
		$.post("/courses/delete", { id: victim.attr("data-id") }, function(data){ 
			console.log(data);
			victim.popover('hide');
			reLoadCourses();
		});
	});

	buildDepartments();
	reLoadCourses();


	$("#addAssign").submit(function(event){
		event.preventDefault();
		$("#addAssnBtn").button('loading');
		$.post('/assignments', $(this).serialize(), function(data) {
			console.log(data);
			reLoadAssignments();
			$("#rstAssnBtn").trigger('click');
			$("#addAssnBtn").button('reset');
		});
	});
	reLoadAssignments();


	$("#addExam").submit(function(event){
		event.preventDefault();
		$("#addExamBtn").button('loading');
		$.post('/exams', $(this).serialize(), function(data) {
			console.log(data);
			reLoadExams();

			$("#rstExamBtn").trigger('click');
			$("#addExamBtn").button('reset');
		});
	});
	reLoadExams();
});

function reLoadCourses() {
	$.getJSON('courses', function(data) {
		$("#courseList").html("");
		$("#courseListSmall").html("");
		$.each(data, function(key, course) {
			//console.log(course)
			var html = '<div class="well well-small entry">';
			html += '<div class="entryTitle" data-id="'+course.id+'"><h4 class="courseTitle">'+course.code+' '+course.number+'</h4>'+course.title+' ('+course.type+')</div>';
			html += '<div class="tags"><span class="label">test</span></div>';

				html += '<div class="row-fluid edit hide ">';
					html += '<div class="span9">'+course.instructor+'</br>'+course.location+' - '+course.days+' '+course.time+'</div>';

					html += '<div class="span3"><div class="pull-right editBtns"><a class="btn btn-danger btn-small deleteClass" role="button" data-id="'+course.id+'">';
				      html += '<i class="icon-ban-circle"></i></a>';
				    html += '<a class="btn btn-success btn-small closeEntry" role="button">';
				      html += '<i class="icon-chevron-up"></i></a></div></div>';
			 	html += '</div></div>';


			$("#courseList").append(html);
			var html2 = '<div class="btn smallCourse" data-id="'+course.id+'">';
				html2 += course.code+' '+course.number;
				html2 += '</div>';
			$("#courseListSmall").append(html2);

		});
		if(data=="") {
			$("#courseAlert").show();
		} else {
			$("#courseAlert").hide();
		}
		if($("#courseListSmall").html() == "") {
			$("#courseListSmall").html("<div class='btn'>You aren't in any courses, yet.</div>")
		}
	});

};

function reLoadAssignments() {
	$.getJSON('/assignments', function(data) {

		console.log(data);
		$("#assignList").html("");
		$.each(data, function(key, assign) {
			var html = '<div class="well well-small">';
			html += '<button class="btn pull-right"><i class="icon-ok"></i></button>';
				html += '<div class="listTitle">';
				 //   |  Worksheet
				 //   .pull-right
				 //       span.label EECS 370
				 html += ' '+ assign.title+'</h5>';

			html += '</div>';

			$("#assignList").append(html);
		});
		if(data=="") {
			$("#assignAlert").show();
		} else {
			$("#assignAlert").hide();
		}
	}); 
};

function reLoadExams() {
	$.getJSON('/exams', function(data) {

		console.log(data);
		$("#examList").html("");
		$.each(data, function(key, exam) {
			var html = '<div class="well well-small">';
			//html += '<div class="pull-right"><span class="label">hello</span></div>';
				html += '<div class="listTitle">';
				 html += ' '+ exam.title+'</h5>';
			html += '</div>';

			$("#examList").append(html);
		});
		if(data=="") {
			$("#examAlert").show();
		} else {
			$("#examAlert").hide();
		}
	}); 
};

///

function optionAdder(arr, cb){
	if(!(arr instanceof Array)) {
		var junkArr = new Array(arr);
		arr = junkArr;
	}
	for (i in arr) cb(i,arr);
}

function buildDepartments() {

	$("#addClassBtn").button('loading');
	$(".numSelector").html('<option value="">--- Course ----</option>');
	$(".sectSelector").html('<option value="">--- Section ---</option>');
	$.get("/codes", {}, function(data) {
		var depts = $.parseJSON(data);
		
		var selected = "";
		$(".deptSelector").html('<option value="">--- Subject ---</option>');
		optionAdder(depts, function(x,depts) {
			//if(depts[x].code == "EECS") selected = 'selected="selected"';
			$(".deptSelector").append('<option '+selected+' value="'+depts[x].code+'">'+depts[x].subject+'</option>');
		});
		//buildNumbers();
		$(".deptSelector").removeAttr("disabled").change(function(){
			buildNumbers();
		});
	});
}

function buildNumbers() {
	$("#addClassBtn").button('loading');
	$.get("/numbers", { subj: $(".deptSelector").val() }, function(data) {
		var nums = $.parseJSON(data);

		var selected = "";
		$(".numSelector").empty();
		optionAdder(nums, function(x,nums) {
			//if(nums[x].number == 210 || nums[x].number == 281) selected = 'selected="selected"';
			$(".numSelector").append('<option '+selected+' value="'+nums[x].number+'">('+nums[x].number+') '+nums[x].title +'</option>');
		});
		buildSections();
		$(".numSelector").removeAttr("disabled").change(function(){
			buildSections();
		});
	});
}

function buildSections() {

	$("#addClassBtn").button('loading');
		
	$.get("/sections", { subj: $(".deptSelector").val(), num: $(".numSelector").val() }, function(data) {
		
		var sects = $.parseJSON(data);
		var selected = "";

		$(".sectSelector").empty();
		optionAdder(sects, function(x,sects) {
			//if(sects[x].number == 1) selected = 'selected="selected"';
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
		//console.log(sect);

		optionAdder(sect, function(x,info) {
			var html = '<p>'+info[x].days+' '+info[x].time+'</br>';
			html += (info[x].instructor)? info[x].instructor+"</br>" : "(staff)</br>";
			html += info[x].location+'</p>';
			$(".infoBox").html(html);
			idToAdd = info[x].id;

			$("#addClassBtn").button('reset');
			$("#addClassBtn").html("Add "+info[x].code+" "+info[x].number);
		});
	});
}
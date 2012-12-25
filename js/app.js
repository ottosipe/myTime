var idToAdd = 0; // global for adding a class, should be attached to the dom ***
var courseArray = [];

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!

var yyyy = today.getFullYear();
if(dd<10){dd='0'+dd} 
if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;

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

	$("body").on("click", ".deleteClass", function() {
		var victim = $(this);
		$.post("/courses/delete", { id: victim.attr("data-id") }, function(data){ 
			console.log(data);
			victim.popover('hide');
			reLoadCourses();
		});
	});

	reLoadCourses();


	$("#addReminder").submit(function(event){
		event.preventDefault();
		$("#addRemindBtn").button('loading');

		if($("#addReminder .reminderTitle").val() == "") {
			$("#reminderAlert").show();
			$("#addRemindBtn").button('reset');
			$("#addReminder .reminderTitle").focus();
			return;
		}
		$.post('/reminders', $(this).serialize(), function(data) {
			console.log(data);
			reLoadReminders();
			$("#rstRemindBtn").trigger('click');
			$(".close").trigger("click");
			$("#addRemindBtn").button('reset');
		});
	});
	reLoadReminders();
	loadAnnouncements();

	$(".date").datepicker({
		format: 'mm/dd/yyyy',
		todayHighlight: true,
		autoclose:true
	});//.val(today); //set date range


	$(".reminderTag a").click(function() {
		var that = $(this);
		/*$(".reminderTitle").val(function( index, value ) {
		  if (value == "") return that.html();
		  return that.html() + ' '+ value;
		}).focus();*/
		$(".typeTag").val(that.html());
	});


	$("body").on("click", ".deleteRemind", function() {
		var victim = $(this);
		$.post("/reminders/delete", { id: victim.attr("data-id") }, function(data){ 
			console.log(data);
			reLoadReminders();
		});
	});

	$("body").on("click", ".completeRemind", function() {
		var victim = $(this);
		$.post("/reminders/complete", { id: victim.attr("data-id") }, function(data){ 
			console.log(data);
			reLoadReminders();
		});
	});
	
	

	$("#account").submit(function(event){
		event.preventDefault();
		$("#acctBtn").button('saving');
		$.post('/user', $(this).serialize(), function(data) {
			console.log(data);
			$("#acctBtn").button('reset');
			window.location = "/"
		});
	});

	//reads from apis
	buildDepartments();

	// *** // for the admin page only

	$("#addAnnounce").submit(function(event){
		event.preventDefault();
		$.post('/announcements', $(this).serialize(), function(data) {
			alert(data);
			window.location = "/";
		});
	});

});

function reLoadCourses() {
	$.getJSON('courses', function(data) {
		$("#courseList").empty();
		$("#courseListSmall").empty();
		$(".courseSelector").html('<option value="0">-- Course --</option>');
		courseArray = [];

		$.each(data, function(key, course) {
			//console.log(course)
			var html = '<div class="entry">';
			html += '<div class="entryTitle" data-id="'+course.id+'"><h4 class="courseTitle">'+course.code+' '+course.number+'</h4>'+course.title+' ('+course.type+')</div>';
			html += '<div class="tags"><span class="label">hw due soon</span></div>';

				html += '<div class="row-fluid">';
					html += '<div class="span7">'+course.instructor+'</br>'+course.location+' - '+course.days+' '+course.time+'</div>';

					html += '<div class="span5"><div class="pull-right editBtns">';

					html += '<div class="btn-group"><a class="btn" role="button" href="mailto:ottosipe@gmail.com">';
				      html += '<i class="icon-envelope"></i></a>';

					html += '<a class="btn" role="button" href="http://ctools.umich.edu" target="_blank">';
				      html += '<i class="icon-globe"></i></a>';

					html += '<a class="btn dropdown-toggle" data-toggle="dropdown">';
				      html += '<i class="icon-pencil"></i> <span class="caret"></span></a>';
				      html += '<ul class="dropdown-menu"><li><a href="#">Edit Details</a></li><li><a href="#">Change Sections</a></li><li><a href="#" class="deleteClass" data-id="'+course.id+'">Delete</a></li></ul></div>';
			 	html += '</div></div></div><hr>';


			$("#courseList").append(html);
			var html2 = '<div class="btn smallCourse" data-id="'+course.id+'">';
				html2 += course.code+' '+course.number;
				html2 += '</div>';
			$("#courseListSmall").append(html2);

			$(".courseSelector").append('<option value="'+course.id+'">'+course.code+' '+course.number+'</option>');

			courseArray[course.id] = course;
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

function reLoadReminders(showCompleted) {
	$.getJSON('/reminders', { showAll: showCompleted }, function(data) {

		console.log(data);
		$("#remindList").html("");
		$.each(data, function(key, remind) {
			try {
			var html = '<div class="entry">';
			
			var course = {
				code: "",
				number: ""
			};
			if (remind.course) {
				course = courseArray[remind.course];
			}
			html += '<div class="row-fluid">';
			html += '<div class="span9">';
				html += '<div class="courseLabel">'+course.code+' '+ course.number+' '+remind.type+'</div>';
				html += '<h4 class="listTitle">'+ remind.title+'</h4>';
				html += '<div class="noteLabel">'+remind.note+'</div>'
			html += '</div>'
			html += '<div class="span3"><span class="pull-right">';
				html += '<div class="dateLabel">'+ remind.date +'</div>';
				html += '<div class="btn-group"><button class="btn completeRemind" data-id="'+remind.id+'">';
				html += '<i class="icon-ok"></i></button><button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>';
				html += '<ul class="dropdown-menu"><li><a href="#">Edit</a></li><li><a href="#" class="deleteRemind" data-id="'+remind.id+'">Delete</a></li></ul></div></span>';
			html += '</div>';
				
				
			html += '</div></div><hr>';

			$("#remindList").append(html);
			} catch(err) {
				console.log(err)
			}
		});
		if(data=="") {
			$("#remindAlert").show();
		} else {
			$("#remindAlert").hide();
		}
		
	}); 
};

function loadAnnouncements() {
	$.getJSON('/announcements', function(data) {

		console.log(data);
		$("#announceList").empty();
		$.each(data, function(key, rem) {
			var html = '<div class="entry">';
			html += '<h4 class="listTitle">'+ rem.title+'</h4>';
			html += '<div class="listText">'+rem.text+'</div>';
			html += '</div><hr>';

			$("#announceList").append(html);
		});
	}); 
};

///////

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
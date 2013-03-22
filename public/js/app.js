var idToAdd = 0; // global for adding a class, should be attached to the dom ***
var courseArray = [];

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!

var yyyy = today.getFullYear() - 2000;
if(dd<10) {
	dd='0'+dd;
} if(mm<10) {
	mm='0'+mm;
}
today = mm+'/'+dd+'/'+yyyy;


$(document).ready(function(){
	$('body').animate({ scrollTop: '0px' }, 0);

	$('.tabNav').click(function (e) { // not a good solution!
	  e.preventDefault();
	  window.location.hash = $(this).attr("href");
	  $(this).tab('show');
	})

	$("#addCourse").submit(function(event){
		event.preventDefault();
		$("#addCourseBtn").button('loading');
		$.post('/courses', { "id": idToAdd }, function(data) {
			console.log(data);
			reLoadCourses();

			$("#addCourseBtn").html('Course Added').attr("disabled","disabled");
			
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

	reLoadCourses(function() {
		// prevents empty course object - this needs to be fixed!
		reLoadReminders();
	});


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

	loadAnnouncements();

	$(".date").datepicker({
		format: 'mm/dd/yy',
		todayHighlight: true,
		autoclose:true
	}); //set date range


	$(".reminderTag a").click(function() {
		var that = $(this);
		/*$(".reminderTitle").val(function( index, value ) {
		  if (value == "") return that.html();
		  return that.html() + ' '+ value;
		}).focus();*/
		$(".typeTag").val(that.attr("value"));
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
	
	$("#showAllRemind").click(function(){
		remindToggle = !remindToggle;
		reLoadReminders();
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


	// feedback
	$("#sendFeedback").submit(function(event){
		event.preventDefault();
		var that = $(this);
		$.post('/feedback', $(this).serialize(), function(data) {
			that.html(data);
		});
	});

	// *** // for the admin page only

	$("#addAnnounce").submit(function(event){
		event.preventDefault();
		$.post('/announcements', $(this).serialize(), function(data) {
			alert(data);
			window.location = "/";
		});
	});

});

function reLoadCourses(callback) {

	var template = _.template( $('#course-template').html() );
	$.getJSON('courses', function(data) {
		$("#courseList").empty();
		$("#courseListSmall").empty();
		$(".courseSelector").html('<option value="0">-- Course --</option>');
		courseArray = [];

		$.each(data, function(key, course) {

			$("#courseList").append(template(course));

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
	callback();
};

var remindToggle = false;
function reLoadReminders() {
	
	var template = _.template( $('#reminder-template').html() );
	$.getJSON('/reminders', { showAll: remindToggle }, function(data) {

		$("#remindList").html("");
		$.each(data, function(key, remind) {
			try {
				
				var obj = {
					remind: remind,
					course: courseArray[remind.course]
				};
				if(obj.course == undefined && obj.remind.course == 0) {
					obj.course = {
						code: "",
						number: ""
					}
				} else if (obj.course == undefined) {
					obj.course = {
						code: "(Course ",
						number: "Deleted)"
					}
				}
				obj.extra = "";
				obj.extraClass = "";
				obj.icon = 'icon-ok';
				if(obj.remind.completed) {
					//extra = 'disabled="true"';
					obj.extraClass = "stike";
					obj.icon = 'icon-repeat';
				}

				$("#remindList").append(template(obj));
			} catch(err) {
				console.log(err)
			}
		});
		if(data=="" || data==[]) {
			$("#remindAlert").show();
		} else {
			$("#remindAlert").hide();
		}
	}); 
};

function loadAnnouncements() {

	var template = _.template( $('#announce-template').html() );
	$.getJSON('/announcements', function(data) {

		$("#announceList").empty();
		$.each(data, function(key, rem) {
			$("#announceList").append(template(rem));
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

	$("#addCourseBtn").button('loading');
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
	$("#addCourseBtn").button('loading');
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

	$("#addCourseBtn").button('loading');
		
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

			$("#addCourseBtn").button('reset');
			$("#addCourseBtn").html("Add "+info[x].code+" "+info[x].number);
		});
	});
}
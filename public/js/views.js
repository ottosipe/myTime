$(function() {
	/// item views /// 

	window.GenericView = Backbone.View.extend({
	  	className: "entry",
		tagName: "div",
		template: _.template(""), // overriden
		events: {
			"click": "test",
			"click .delete": "delete"
		},
		initialize: function() {
			this.render();
			this.listenTo(this.model, "change", this.render);	
			this.listenTo(this.model, 'destroy', this.remove);
			//this.listenTo(this.model, 'visible', this.toggleVisible);
		},
		render: function() {
			var row = this.template(this.model.attributes);
			this.$el.html(row);
			return this;
		},
		delete: function(e) {
			this.model.destroy();
		},
		test: function() {
			//alert("something works")
		}

	});

	window.CourseView = GenericView.extend({
		
		template: _.template( $('#course-template').html() ),
		
	});

	window.ReminderView = GenericView.extend({
	    template: _.template( $('#reminder-template').html() )
	});

	window.AnnounceView = GenericView.extend({
	    template: _.template( $('#announce-template').html() )
	})


	/// list views ///

	window.GenericListView = Backbone.View.extend({

		initialize: function() {
			this.render();
			this.listenTo(this.model, "change", this.render);	
		},
		viewType: CourseView,
		render: function() {
		    //$(this.el).html('<ul class="thumbnails"></ul>');
		    var courses = this.model.models;
	        for (var i = 0; i < courses.length; i++) {
	            var viewType = new this.viewType({model: courses[i]});
	            this.$el.append( viewType.render().el );
	            
	            if(i+1 != courses.length) this.$el.append("<hr>")
	        }
			return this;
		}

	});

	window.CourseListView = GenericListView.extend({
		el: $("#courseList"),
		viewType: CourseView
	});

	window.ReminderListView = GenericListView.extend({
		el: $("#remindList"),
		viewType: ReminderView
	});

	window.AnnounceListView = GenericListView.extend({
		el: $("#announceList"),
		viewType: AnnounceView
	});


	/// modal views ///

	window.GenericModalView = Backbone.View.extend({
		
	});

	window.addCourseModal = GenericModalView.extend({
		events: {
			"click #addCourseBtn": "submit",
			
		},
		el: $("#addCourse"),
		initialize: function() {
			// build seperate model for these, and render views (caching)
			buildDepartments();
		},
		submit: function(e) {
			e.preventDefault();
			$("#addCourseBtn").button('loading');
			$.post('/courses', { "id": idToAdd }, function(data) {
				console.log(data);
				this.model.sync();
				$("#addCourseBtn").html('Course Added').attr("disabled","disabled");
				
			});
		}
	});

	window.addReminderModal = GenericModalView.extend({
		events: {
		},
		el: $("#addReminder")
	});

	/// main view ///

	window.MainView = Backbone.View.extend({
		// controls modals and navigation
		events: {
			"click #mainNav .brand": "brand",
			"hidden .modal": "modalHide",
			"click a[data-dismiss='modal']": "hash",
			"click .nav a": "hash"
		},
		el: $('body'),
		initialize: function() {
			$('body').animate({ scrollTop: '0px' }, 0);
			// check if noob here, display start screen
		},
		render: function() {
			return this;
		},
		brand: function() {
			$(".nav li").removeClass("active");
		},
		modalHide: function() {
			 window.location.hash = "";
		},
		hash: function(e) {
			window.location.hash = e.currentTarget.hash;
		}
	});
});


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
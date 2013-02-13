
$(function() {
	/// item views /// 

	window.GenericView = Backbone.View.extend({
	  	className: "entry",
		tagName: "div",
		template: _.template(""), // overriden
		initialize: function() {
			this.listenTo(this.model, "change", this.render);	
			this.listenTo(this.model, 'destroy', this.remove);
		},
		render: function() {
			var row = this.template(this.model.attributes);
			this.$el.html(row);
			return this;
		},
		delete: function(e) {
			this.model.destroy();
		}
	});

	window.CourseView = GenericView.extend({
		events: {
			"click .delete": "delete",
			"click .reminds": "showReminders"
		},
		template: _.template( $('#course-template').html() ),
		showReminders:function(e) {
			$(".reminds").removeClass("active");
			if($(e.currentTarget).hasClass("active")) {
				remindList.showAll();
				$(".viewAll").hide();
			} else {
				remindList.courseFilter(this.model.get('id'));
				$(".viewAll").show();
			}
			
		}
	});

	window.ReminderView = GenericView.extend({
	    events: {
	    	"click .delete": "delete",
			"click .complete": "complete"
		},
	    template: _.template( $('#reminder-template').html() ),
	    render: function() {

	    	var obj = this.model.attributes;
	    	var query = window.courseList.where({id:this.model.attributes.course});
	    	// may need to also query courseId!!!
	    	if (query.length > 0) {
		    	var course = query[0].attributes;
		    	obj.coursename = course.code + " " + course.number;
		    } else {
		    	obj.coursename = ""
		    }
			
			var row = this.template(obj);
			this.$el.html(row);
			return this;
		},
		complete: function() {
			this.model.toggle()
		}
	});

	window.AnnounceView = GenericView.extend({
	    template: _.template( $('#announce-template').html() )
	})


	/// list views ///
	window.GenericListView = Backbone.View.extend({
		initialize: function() {
			this.render();
			this.listenTo(this.model, "add", this.render);
			this.listenTo(this.model, "remove", this.render);
		},
		viewType: null,
		render: function() {
			this.alert(); // show alert if empty
			$(".list", this.el).empty();
	        for (var i = 0; i < this.model.models.length; i++) {
	            var viewType = new this.viewType({model: this.model.models[i]});
	            $(".list", this.el).append( viewType.render().el );
	            
	            if(i+1 != this.model.models.length) $(".list", this.el).append("<hr>")
	        }
			return this;
		},
		alert: function() {
			if(!this.model.models.length) {
				$(".alert", this.el).show();
			} else {
				$(".alert", this.el).hide();
			}
		}
	});

	window.CourseListView = GenericListView.extend({
		el: $("#courseList"),
		viewType: CourseView,
	});

	window.ReminderListView = GenericListView.extend({
		events: {
			"click .viewAll": "all"
		},
		el: $("#reminderList"),
		viewType: ReminderView,
		all: function() {
			// force all to show and remove btn classes
			remindList.showAll();
			$(".reminds").removeClass("active");
			$(".viewAll").hide();
		}
	});

	window.AnnounceListView = GenericListView.extend({
		el: $("#announceList"),
		viewType: AnnounceView
	});


	/// modal views ///

	window.GenericModalView = Backbone.View.extend({
		events: {
			"click .add": "submit"
		},
		submit: function(e) {
			//MT
		},
		alert: function(msg) {
			$(".alert .msg", this.el).html(msg)
			$(".alert", this.el).show();
			$(".close", this.el).click(function() {
				$(this).parent().hide();
			})
		}
	});

	window.addCourseModal = GenericModalView.extend({
		events: {
			"click .add": "submit",
			"click .next": "next",
			"click .back": "back",
			"keyup #searchCode": "searchCode",
			"keyup #searchNum": "searchNum",
			"blur input": "edit",
			"change input": "edit",
			"click .sect-nav .btn": "switchEdit"
		},
		el: $("#addCourse"),
		edit: function(e) {
			var name = $(e.currentTarget).attr("name");
			var value = $(e.currentTarget).val();
			if(name) {
				console.log("Changed", name, value);
				this.newCourse.set(name, value);
			}
		},
		saveDays: function() {
			if (this.newCourse) {
				var arr = [];
				$(".days-pick .btn", this.el).each(function( index ) {
					if($(this).hasClass("active")) {
						arr.push($(this).attr("day"));
					}
				});
				this.newCourse.set("days",arr);
				console.log(arr)
			}
		},
		next: function(e) {
			e.preventDefault();

			$(".page2 .sect-nav", this.el).empty();
			this.data.currentSections.each(function(course) {
				$(".page2 .sect-nav", this.el).append('<a href="#" class="btn sect-btn" data-id="'+course.get('id')+'">'+course.get('type')+'</a>')
			
			});
			if(this.data.currentSections.length == 1) {
				$(".sect-nav", this.el).parent().hide();
			} else {

				$(".sect-nav", this.el).parent().show();
			}
			this.switchEdit(null);
			$(".page1", this.el).hide("slide");
			$(".page2", this.el).show("slide");
			$(".next", this.el).hide();
			$(".next-btns", this.el).show();
		},
		back: function(e) {
			e.preventDefault();
			$(".page1", this.el).show("slide");
			$(".modalHeader", this.el).html("Add Course");
			$(".page2", this.el).hide("slide");
			$(".next", this.el).show();
			$(".next-btns", this.el).hide();
		},
		switchEdit: function(e) {

			this.saveDays();

			var classId;
			if(e) { 
				e.preventDefault();
				classId = $(e.currentTarget).attr("data-id");
			} else {
				classId = $(".sect-btn:first").attr("data-id");
			}
			this.newCourse = this.data.currentSections.where({ id: parseInt(classId) })[0];

			for(var i in this.newCourse.attributes) {
				if(this.newCourse.get(i) !== "")
					$("[name='"+i+"']", this.el).val(this.newCourse.get(i));
			}

			// add day buttons
			$(".days-pick .btn", this.el).removeClass("active");
			for(var i in this.newCourse.attributes.days) {
				$('[day="'+this.newCourse.attributes.days[i]+'"]', this.el).addClass("active");
			}


			this.saveDays();

			$("[name='start_time']", this.el).timepicker({defaultTime: false});
			$("[name='end_time']", this.el).timepicker({defaultTime: false});
			$(".modalHeader", this.el).html("Edit Course -- " + this.newCourse.get("code")+
				" "+this.newCourse.get("number")+" "+this.newCourse.get("type"));
		},
		submit: function(e) {
			e.preventDefault();

			// check to see if either time is empty 
			// or class length 0 -- show error ***
			// add link checking // append http if not there

			this.saveDays();

			var that = this;
			this.data.currentSections.each(function(sect) {
				sect.set({courseId: sect.id});
				sect.set({id: null}); // so isNew is true...


				// may not work in loop *** !!!! 
				var foundDups = that.model.every(function(i) {
					return (i.attributes.id != sect.attributes.courseId)
				});
				if(!foundDups) { 
					that.alert("Duplicate class."); // do fancier alert here
					return;
				}

				// save that shit
				sect.checker(); // fix and check simple errors
				that.model.create(sect);
			}) 

			$(".sectSelector", this.el).empty();
			$(".reset", this.el).trigger("click");
			$(".back", this.el).trigger("click");
			window.location.hash = "";

		},
		initialize: function() {
			// kick off the API fetch
			this.data = new CodeDataView({model: new APICollection()});
		},
		searchCode: function(e) {
			var key = e.currentTarget.value;
			this.data.apiCodes.find(key, 'code');
			this.data.render_codes();
		},
		searchNum: function(e) {
			var key = e.currentTarget.value;
			this.data.apiNumbers.find(key, 'number');
			this.data.render_numbers();
		}

	});

	window.editCourseModal = GenericModalView.extend({
		events: {
			"click .finishEdit": "save",
			"blur input": "edit",
			"change input": "edit"
		},
		el: $("#editCourse"),
		initialize: function() {

			$(".modalHeader", this.el).html("Edit Course -- " + this.model.get("code")+" "+this.model.get("number"));

			for(var i in this.model.attributes) {
				$("[name='"+i+"']", this.el).val(this.model.get(i));
			}

			$(".btn",this.el).removeClass("active");
			for(var i in this.model.attributes.days) {
				console.log($('[day="'+i+'"]', this.el))
				$('[day="'+this.model.attributes.days[i]+'"]', this.el).addClass("active");
			}

			$("[name='start_time']", this.el).timepicker();
			$("[name='end_time']", this.el).timepicker();

		},
		edit: function(e) {
			var name = $(e.currentTarget).attr("name");
			var value = $(e.currentTarget).val();
			if(name) {
				console.log("Changed", name, value);
				this.model.set(name, value);
				console.log(this.model)
			}
		},
		save: function(e) {
			e.preventDefault();

			var arr = [];
			$(".days-pick .btn", this.el).each(function( index ) {
				if($(this).hasClass("active")) {
					arr.push($(this).attr("day"));
				}
			});
			this.model.set("days",arr);
			this.model.checker(); 

			this.model.save();
			this.undelegateEvents(); 
			window.location.hash = "";
		}

	});

	window.addReminderModal = GenericModalView.extend({
		el: $("#addReminder"),
		initialize: function() {
			$("[name='time']", this.el).timepicker({defaultTime:false});
			var today = new Date();
			$(".date").datepicker({
				format: 'mm/dd/yy',
				startDate: (parseInt(today.getMonth()) + 1)+"/"+today.getDay()+today.getYear(),
				todayHighlight: true,
				autoclose:true
			}); //set date range
			$(".reminderTag .btn").click(function() {
				$("[name='type']", this.el).val($(this).attr("value"));
			})
			
		},
		submit: function(e) {
			e.preventDefault();
			if(!$("[name='title']", this.el).val()) {
				$("[name='title']", this.el).addClass("error")
				return;
			}


			var time = $("[name='time']", this.el).val();
			if(time && time[0] == "0") time = time.substr(1);
			console.log(time);

			// switch to working model owned by view *****
			// add a change function like in add/edit course
			var newReminder = new Reminder( {
				type: $("[name='type']", this.el).val(),
				title: $("[name='title']", this.el).val(),
				completed: false,
				date: $("[name='date']", this.el).val(), // change to utc
				time: time,
				course: parseInt($("[name='course']", this.el).val()),
				note: $("[name='note']", this.el).val()
			});

			window.location.hash="#";
			this.model.create(newReminder);

		},
	});

	window.editReminderModal = GenericModalView.extend({
		events: {
			"click .save": "save",
			"blur input": "edit",
			"change input,textarea,select": "edit"
		},
		el: $("#editReminder"),
		initialize: function() {

			// set tag active

			var type = this.model.get("type");
			$(".reminderTag a").removeClass("active")
			$(".reminderTag a", this.el).each(function( index ) {
				if($(this).attr("value") == type) {
					$(this).addClass("active");
				}
			});

			for(var i in this.model.attributes) {
				$("[name='"+i+"']", this.el).val(this.model.get(i));
			}
			$("[name='time']", this.el).timepicker({defaultTime:false});
			var today = new Date();
			$(".date").datepicker({
				format: 'mm/dd/yy',
				startDate: (parseInt(today.getMonth()) + 1)+"/"+today.getDay()+today.getYear(),
				autoclose:true
			});
			$(".reminderTag .btn").click(function() {
				$("[name='type']", this.el).val($(this).attr("value"));
			});
			
		},
		edit: function(e) {
			var name = $(e.currentTarget).attr("name");
			var value = $(e.currentTarget).val();
			if(name) {
				this.model.set(name, value);
			}
		},
		save: function(e) {
			e.preventDefault();
			if(!$("[name='title']", this.el).val()) {
				$("[name='title']", this.el).addClass("error")
				return;
			}


			var time = $("[name='time']", this.el).val();
			if(time && time[0] == "0") time = time.substr(1);
			console.log(time);

			this.model.set("type", $("[name='type']", this.el).val());
			this.undelegateEvents();
			this.model.save();
			window.location.hash = "";

		},
	});

	// view for course selectors //

	window.courseSelectView = Backbone.View.extend({
		el: $(".courseSelector"),
		initialize: function() {
			this.render();
			this.listenTo(this.model, 'add', this.render);
			this.listenTo(this.model, 'remove', this.render);
			this.listenTo(this.model, 'change', this.render);
		},
		render: function() {
			this.$el.html("<option value=''> -- Course -- </option>");
			var obj = this.model.models;
			for(i in obj) {
				var course = obj[i].attributes;
				this.$el.append("<option value='"+course.id+"'>"+course.code+" "+course.number+" - "+course.type+"</option>")
			}
		}
	});

	/// main view ///

	window.MainView = Backbone.View.extend({
		// controls modals and navigation
		events: {
			"click #mainNav .brand": "brand",
			"hidden .modal": "modalHide",
			"click a[data-dismiss='modal']": "hash",
			"click .nav a": "hash",
			"submit #editAccount": "saveAcct"
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
		},
		saveAcct: function(e) {
			e.preventDefault();
			// check this >>
			$("#editAccount [type='submit']").button('saving');
			// switch to a model ***
			$.post('/user', $("#editAccount").serialize(), function(data) {
				$("#username").html( $("#editAccount [name='name']").val() )
				$("#editAccount [type='submit']").button('reset');

			});
		}
	});


// umich.io views

	window.CodeDataView = Backbone.View.extend({
		events: {
			"change .codeSelector": "fetch_numbers",
			"change .numSelector": "fetch_sections", 
			"change .sectSelector": "fetch_info"
		},
		el: $("#addCourse"),
		initialize: function() {
			
			// models
			this.apiCodes = new (APICollection.extend({url: "/codes"}));
			this.apiNumbers = new (APICollection.extend(
			{url: 
				function(){return "/numbers/" + $(".selector .codeSelector").val();}
			}));
			this.apiSections = new (APICollection.extend({ 
			url: function() {
				return "/sections/" + $(".codeSelector").val() +"/"+ $(".numSelector").val();
			},
			model: Course 
			}));

			// render events
			this.listenTo(this.apiNumbers, "sync", this.render_numbers);
			this.listenTo(this.apiCodes, "sync", this.render_codes);
			this.listenTo(this.apiSections, "sync", this.render_sections);

			// template handles
			this.apiCodeTemp = _.template($("#code-select-template").html());
			this.apiNumTemp = _.template($("#num-select-template").html());
			this.apiSectTemp = _.template($("#sect-select-template").html());

			// start the fun
			this.apiCodes.fetch();
		},
		render_codes: function() {
			$(".codeSelector").empty();
			for (var i = 0; i < this.apiCodes.length; i++) {
				// pass one big obj to template instead ***
				if(this.apiCodes.models[i].get("show")) {
					var html = this.apiCodeTemp(this.apiCodes.models[i].toJSON());
					$(".codeSelector").append(html)
				}
			}
			this.fetch_numbers();
			$(".codeSelector").removeAttr("disabled")
		},
		fetch_numbers: function() {
			this.apiNumbers.fetch();
		},
		render_numbers: function() {
			$(".numSelector").empty();
			for (var i = 0; i < this.apiNumbers.length; i++) {
				if(this.apiNumbers.models[i].get("show")) {
					var html = this.apiNumTemp(this.apiNumbers.models[i].toJSON());
					$(".numSelector").append(html);
				}
			}
			this.fetch_sections();
			$(".numSelector").removeAttr("disabled");
		
		}, 
		fetch_sections: function() {
			this.apiSections.fetch();
		},
		render_sections: function(){
			
			$(".sectSelector").empty();
			// add loading state here ***

			var types = this.apiSections.pluck("type");
			var types = _.uniq(types);
			var that = this;
			_.each(types, function(type){

				var subSet = that.apiSections.where({type:type});
				$(".sectSelector").append("<select name='section'></select>")
					for (var i = 0; i < subSet.length; i++) {
						var html = that.apiSectTemp(subSet[i].toJSON());
						$(".sectSelector select:last").append(html);
					}
			})
			this.fetch_info();
			$(".sectSelector").removeAttr("disabled");
		},
		fetch_info: function() {
			this.currentSections = new CourseCollection();

			var that = this;
			var sects = $("[name='section']").each(function(i, sel) {
				var obj = that.apiSections.where({
					id:parseInt($(sel).val())
				})[0];
				if(obj)	obj.initialize();
				that.currentSections.add( 
					obj
				);
			});
		}
	});
});

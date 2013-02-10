
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
			"mouseenter":"hover",
			"mouseleave":"offHover"
		},
		template: _.template( $('#course-template').html() ),
		hover:function() {
			// trigger reminder highlight here ***
			remindList.highlight(this.model.get('id'));
		},
		offHover: function() {
			remindList.offLight();
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
			this.alert();
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
			"click .sort": "sort"
		},
		el: $("#reminderList"),
		viewType: ReminderView,
		sort: function() {
			console.log('hello');
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
			"change input": "edit",
			"blur input": "edit",
			"click .sect-nav .btn": "switchEdit"
		},
		el: $("#addCourse"),
		edit: function(e) {
			var name = $(e.currentTarget).attr("name");
			var value = $(e.currentTarget).val();
			if(name) {
				console.log("Changed", name, value);
				this.newCourse.set(name, value);
				console.log(this.newCourse)
			}
		},
		next: function(e) {
			e.preventDefault();

			$(".page2 .sect-nav", this.el).empty();
			this.data.currentSections.each(function(course) {
				$(".page2 .sect-nav", this.el).append('<a href="#" class="btn sect-btn" data-id="'+course.get('id')+'">'+course.get('type')+'</a>')
			
				var times = window.utils.dateFormat(course.get('time'));
				course.set('start_time', times.start);
				course.set('end_time', times.end);

				var days = window.utils.daysFormat(course.get('days'));
				course.set("days", days)

			});

			this.switchEdit(null);
			$(".page1", this.el).hide("slide");
			$(".page2", this.el).show("slide");
			$(".next", this.el).hide();
			$(".next-btns", this.el).show();
		},
		back: function(e) {
			e.preventDefault();
			$(".page1", this.el).show("slide");
			$(".page2", this.el).hide("slide");
			$(".next", this.el).show();
			$(".next-btns", this.el).hide();
		},
		switchEdit: function(e) {
			var classId;
			if(e) { 
				e.preventDefault();
				classId = $(e.currentTarget).attr("data-id");
			} else {
				classId = $(".sect-btn:first").attr("data-id");
			}
			this.newCourse = this.data.currentSections.where({ id: parseInt(classId) })[0];


			for(var i in this.newCourse.attributes) {
				$("[name='"+i+"']", this.el).val(this.newCourse.get(i));
			}

			$("[name='start_time']", this.el).timepicker();
			$("[name='end_time']", this.el).timepicker();
			


		},
		submit: function(e) {
			e.preventDefault();

			var that = this;
			this.data.currentSections.each(function(sect) {
				console.log(sect)
				sect.set({courseId: sect.id});
				sect.set({id: null});// so isNew is true...

				var foundDups = that.model.every(function(i) {
					return (i.attributes.id != sect.attributes.courseId)
				})
				if(!foundDups) { // may not work in loop ***
					that.alert("Yo, I hear you like class. So I put a class in your class so you can class while you're in class. Dawg."); // do fancier alert here
					return;
				}

				that.model.create(sect);
			}) 

			// need to save id from courseID***
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

	window.addReminderModal = GenericModalView.extend({
		el: $("#addReminder"),
		initialize: function() {
			$(".date").datepicker({
				format: 'mm/dd/yy',
				todayHighlight: true,
				autoclose:true
			}); //set date range
			$(".reminderTag .btn").click(function() {
				$("[name='type']", this.el).val($(this).attr("value"));
			})
			
		}, 
		submit: function(e) {
			e.preventDefault();

			var newReminder = new Reminder( {
				type: $("[name='type']", this.el).val(),
				title: $("[name='title']", this.el).val(),
				completed: false,
				date: $("[name='date']", this.el).val(), // change to utc
				time: "", // add selector
				course: parseInt($("[name='course']", this.el).val()),
				note: $("[name='note']", this.el).val()
			});

			window.location.hash="#";
			this.model.create(newReminder);

		},
	});

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
				
				that.currentSections.add( 
					that.apiSections.where({
						id:parseInt($(sel).val())
					})[0]
				);
			});
		}
	});
});


$(function() {
	/// item views /// 

	window.GenericView = Backbone.View.extend({
	  	className: "entry",
		tagName: "div",
		template: _.template(""), // overriden
		events: {
			"click .delete": "delete"
		},
		initialize: function() {
			this.listenTo(this.model, "change", this.render);	
			this.listenTo(this.model, 'destroy', this.remove);
			//this.listenTo(this.model, 'visible', this.toggleVisible);
		},
		render: function() {
			var row = this.template(this.model.attributes);
			console.log(this.model.attributes)
			this.$el.html(row);
			return this;
		},
		delete: function(e) {
			console.log(this.model)
			this.model.destroy();
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
		events: {
			"click":"test"
		},
		initialize: function() {
			this.render();
//			this.listenTo(this.model, "change", this.render);
			this.listenTo(this.model, "add", this.render);
		},
		viewType: null,
		render: function() {
			this.$el.html("");
	        for (var i = 0; i < this.model.models.length; i++) {
	            var viewType = new this.viewType({model: this.model.models[i]});
	            this.$el.append( viewType.render().el );
	            
	            if(i+1 != this.model.models.length) this.$el.append("<hr>")
	        }
			return this;
		},
		test: function() {
			console.log(this.model)
		},
		hello: function() {
			console.log("Hello")
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
		events: {
			"click .add": "submit"
		},
		submit: function(e) {
			e.preventDefault();
			alert('override me')
			//MT
		}
	});

	window.addCourseModal = GenericModalView.extend({
		el: $("#addCourse"),
		submit: function(e) {
			e.preventDefault();
			//$(".add", this.el).button('loading');
			var newCourse = this.data.currentSection;
			newCourse.set({courseId: newCourse.id});
			newCourse.set({id: null});

			this.model.create(newCourse);
			console.log(this.model)

			window.location.hash = "";

		},
		initialize: function() {
			// kick off the API fetch
			this.data = new CodeDataView({model: new APICollection()});
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
				course: $("[name='course']", this.el).val(),
				note: $("[name='note']", this.el).val()
			});

			this.model.create(newReminder);

			console.log(this.model)
		},
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


// umich.io views

	window.CodeDataView = Backbone.View.extend({
		events: {
			"change .deptSelector":"render_numbers",
			"change .numSelector":"render_sections", 
			"change .sectSelector": "render_info"
		},
		el: $("#addCourse"),
		initialize: function() {
			this.render_codes();
		},
		render_codes: function() {
			var that = this;
			var template = _.template($("#code-select-template").html());
			this.model.fetch({
				success: function(model) {
					for (var i = 0; i < model.length; i++) {
						var html = template(model.models[i].toJSON());
						$(".deptSelector").append(html)
					}
					that.render_numbers();
					$(".deptSelector").removeAttr("disabled")
				}
			});
		},
		render_numbers: function() {
			var url = "/numbers/" + $(".selector .deptSelector").val()
			var numbs = new (APICollection.extend({url:url}));
			var that = this;
			var template = _.template($("#num-select-template").html());
			numbs.fetch({
				success: function(model) {
					$(".numSelector").empty();
					for (var i = 0; i < model.length; i++) {
						var html = template(model.models[i].toJSON());
						$(".numSelector").append(html);
					}
					that.render_sections();
					$(".numSelector").removeAttr("disabled");
				}
			});
		}, 
		render_sections: function() {
			var url = "/sections/" + 
				$(".deptSelector").val() +"/"+ 
				$(".numSelector").val();
			var sects = new (APICollection.extend({url:url}));
			var that = this;
			var template = _.template($("#sect-select-template").html());
			sects.fetch({
				success: function(model) {

					that.allSections = model.models;
					
					$(".sectSelector").empty();
					var types = model.pluck("type");
					var types = _.uniq(types);
					_.each(types, function(type){

						var subSet = model.where({type:type});
						$(".sectSelector").append("<select name='section'></select>")
							for (var i = 0; i < subSet.length; i++) {
								var html = template(subSet[i].toJSON());
								$(".sectSelector select:last").append(html);
							}
					})
					that.render_info();
					$(".sectSelector").removeAttr("disabled");
				}
			});
		},
		render_info: function() {
			for (i in this.allSections) {

				var section = this.allSections[i].attributes;
				if(section.section == $("[name='section']:first").val()) {
					delete this.currentSection;
					this.currentSection = new Course(section);
				}
			}
			var section = this.currentSection.attributes;
			$("[name='days']", this.el).html(section.days);
			$("[name='time']", this.el).html(section.time);
			$("[name='location']", this.el).html(section.location);
			$("[name='instructor']", this.el).html(section.instructor);

		}
	});
});

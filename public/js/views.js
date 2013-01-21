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
			console.log(this.model)
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

	        for (var i = 0; i < this.model.models.length; i++) {
	            var viewType = new this.viewType({model: this.model.models[i]});
	            this.$el.append( viewType.render().el );
	            
	            if(i+1 != this.model.models.length) this.$el.append("<hr>")
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
		events: {
			"click .add": "submit",
			
		},
		submit: function(e) {
			e.preventDefault();
                        console.log('inside submit for generic modal view');
			$(".add", this.el).button('loading');
			console.log($("#addCourse select:last").val())
			//this.model.save();
			$.post('/courses', { "id": $("#addCourse select:last").val() }, function(data) {
				console.log(data);
				$("#addCourseBtn").html('Course Added').attr("disabled","disabled");
				
			});
		}
	});

	window.addCourseModal = GenericModalView.extend({
		el: $("#addCourse"),
		initialize: function() {
			// build seperate model for these, and render views (caching)
			//buildDepartments();
                        console.log('inside add course modal too');
			new CodeDataView({model: new APICollection()});
                }
	});

	window.addReminderModal = GenericModalView.extend({
		el: $("#addReminder"),
                initialize: function() {
                        console.log('inside add reminder modal');
                }
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

	window.CodeDataView = Backbone.View.extend({
		events: {
			"change .deptSelector":"render_numbers",
			"change .numSelector":"render_sections"	
		},
		el: $('.selector'),
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
			var url = "/numbers/" + $(".deptSelector", this.el).val()
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
					$(".sectSelector").empty();
					var types = model.pluck("type");
					var types = _.uniq(types);
					_.each(types, function(type){
						console.log(type)
						var subSet = model.where({type:type});
						$(".sectSelector").append("<select name='id'></select>")
							for (var i = 0; i < subSet.length; i++) {
								var html = template(subSet[i].toJSON());
								$(".sectSelector select:last").append(html);
							}
					})
					
					$(".sectSelector").removeAttr("disabled");
				}
			});
		}
	});
});

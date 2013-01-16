$(function() {
	/// item views /// 

	window.GenericView = Backbone.View.extend({
	  	className: "entry",
		tagName: "div",
		template: _.template(""), // overriden
		events: {
			"click": "test"
		},
		initialize: function() {
			this.render();
			this.listenTo(this.model, "change", this.render);	
			//this.listenTo(this.model, 'destroy', this.remove);
			//this.listenTo(this.model, 'visible', this.toggleVisible);
		},
		render: function() {
			var row = this.template(this.model.attributes);
			this.$el.html(row);
			return this;
		},
		test: function() {
			//alert("something works")
		}

	});

	window.CourseView = GenericView.extend({
		template: _.template( $('#course-template').html() )
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
			this.render(); // this.listenTo(this.model, "change", this.render);
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
		el: "#courseList",
		viewType: CourseView
	});

	window.ReminderListView = GenericListView.extend({
		el: "#remindList",
		viewType: ReminderView
	});

	window.AnnounceListView = GenericListView.extend({
		el: "#announceList",
		viewType: AnnounceView
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
		el: 'body',
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
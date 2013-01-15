/// main view ///

window.MainView = Backbone.View.extend({
	events: {
		"click #mainNav .brand": "brand",
		"hidden .modal": "modalHide",
		"click [data-dismiss='modal']": "test",
		"click .nav a": "test"
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
	test: function(e) {
		window.location.hash = e.currentTarget.hash;
		$(e)
	}
});

/// item views /// 

window.GenericView = Backbone.View.extend({
  	className: "entry",
	tagName: "li",
	template: _.template( "junk" ),

	events: {
		"click": "test"
	},
	initialize: function() {
		this.render();
		this.listenTo(this.model, "change", this.render);
	},
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	test: function() {
		alert("something works")
	}

});

window.CourseView = GenericView.extend({
	template: _.template( "$('#course-template').html()" )
})

window.ReminderView = GenericView.extend({
    template: _.template( "$('#reminder-template').html()" )
})


/// list views ///

window.GenericListView = Backbone.View.extend({

	initialize: function() {
		this.render(); // this.listenTo(this.model, "change", this.render);
	},
	render: function() {
	    $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = 0; i < courses.length; i++) {
            $('.thumbnails', this.el).append(new CourseView({model: courses[i]}).render().el);
        }
		return this;
	}

});

window.CourseListView = GenericListView.extend({

})

window.RemindeListView = GenericListView.extend({

})
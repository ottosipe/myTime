/// item views /// 

window.GenericView = Backbone.View.extend({
  	className: "entry",
	tagName: "li",
	//template: _.template( $('#item-template').html() ),

	events: {
		"click ": "test"
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

})

window.ReminderView = GenericView.extend({

    
})


/// list views ///

window.GenericView = Backbone.View.extend({
	tagName: "li",
  	className: "entry",
	//template: _.template( $('#item-template').html() ),

	events: {
		//"click .icon": "open"
	},

	initialize: function() {
		this.render(); // this.listenTo(this.model, "change", this.render);
	},
	render: function() {
	    this.$el.html(this.template(this.model.toJSON()));
		return this;
	}

});

window.CourseListView = GenericListView.extend({

})

window.RemindeListView = GenericListView.extend({

})
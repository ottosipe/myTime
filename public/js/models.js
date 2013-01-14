
/// models ///

window.Course = Backbone.Model.extend({
	defaults: {
		id: null,
		code: "",
		number: null,
		section: null,
		type: "",
		title: "",
		days: "", // these will change
		time: "",
		location: "",
		instructor: ""
	}
});

window.Reminder = Backbone.Model.extend({
	defaults: {
		type: "",
		title: "",
		completed: false,
		date: "",
		course: null,
		note: "",
		id: null
	},
	toggle: function() {
		this.save({
			completed: !this.get('completed')
		});
	}
});


/// collections ///

window.CourseCollection = Backbone.Collection.extend({

    model: Course,
    url: "/courses"
    
});

window.ReminderCollection = Backbone.Collection.extend({
	
    model: Reminder,
    url: "/reminders",
    completed: function() {
		return this.filter(function( reminder ) {
			return reminder.get('completed');
		});
	}
});


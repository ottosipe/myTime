$(function() {
	/// models ///

	window.Course = Backbone.Model.extend({
		url: "/courses",
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
		url: "/reminders",
		defaults: {
			id: null,
			type: "",
			title: "",
			completed: false,
			date: "",
			course: null,
			note: ""
		},
		toggle: function() {
			this.save({
				completed: !this.get('completed')
			});
		}
	});

	window.Announcement = Backbone.Model.extend({
		defaults: {
			title: "",
			text: ""
		}
	});

	window.Student = Backbone.Model.extend({
		defaults: {
			user: "",
			name: "",
			major: "",
			advisor_email: ""
		}
	});


	/// collections ///

	window.CourseCollection = Backbone.Collection.extend({
	    model: Course,
	    url: "/courses",
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

	window.AnnouncementCollection = Backbone.Collection.extend({
		
	    model: Announcement,
	    url: "/announcements"

	});

	/// other API collections ///

	window.APICollection = Backbone.Collection.extend({
	    model: Backbone.Model,
		url: "/codes"
	});


});

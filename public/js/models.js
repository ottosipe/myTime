
var app = app || {};

$(function() {
	/// models ///

	window.Course = Backbone.Model.extend({
		urlRoot: "/courses",
		defaults: {
			code: "",
			number: null,
			section: null,
			type: "",
			title: "",
			days: "", // these will change
			time: "",
			start: "",
			end: "",
			location: "",
			instructor: "",
			email: "",
			link: ""
		},
		validate: function(attrs, options) {
		// add elsewhere
		 /*one.on("invalid", function(model, error) {
		  alert(model.get("title") + " " + error);
		});*/
			//console.log(attrs, options)
			return false;
		 }
	});

	window.Reminder = Backbone.Model.extend({
		urlRoot: "/reminders",
		defaults: {
			id: null,
			type: "",
			title: "",
			completed: false,
			date: "", // switch to timestamp
			time: "",
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

	window.AnnouncementCollection = Backbone.Collection.extend({
		
	    model: Announcement,
	    url: "/announcements"

	});

	/// other API collections ///

	window.APICollection = Backbone.Collection.extend({
	    model: Backbone.Model.extend({
	    	defaults: {
	    		show: true
	    	}
	    }),
	    find: function(key) {
	    	for (i in this.models) {
	    		var code = this.models[i].get('code');
	    		if(code.indexOf(key) == -1) {
	    			this.models[i].set({show: false}, {silent: true});
	    		} else {
	    			console.log(this.models[i].get('code'))
	    		}
	    		
	    	}
	    	this.trigger("change")
	    }
	});


});

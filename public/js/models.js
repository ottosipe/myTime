
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
			start_time: "",
			end_time: "",
			start: "",
			end: "",
			location: "",
			instructor: "",
			prof_email: "",
			site_link: ""
		},
		validate: function(attrs, options) {
			// check time
			/*var split = attrs.time.indexOf("-");
			var startTime = attrs.time.substring(0, split);
			var endTime = attrs.time.substring(split + 1, attrs.time.length - 2);
			console.log(startTime + " and end time is " + endTime)

			var timePatt1 = /^1[0-2]:*[0-5][0-9]$/i;
			var timePatt2 = /[0-9]:*[0-5][0-9]$/i;

			// validate the time syntactically
			if (startTime.match(timePatt1) == null && startTime.match(timePatt2) == null) {
				return "times are syntatically wrong";
			}*/


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
	    find: function(key, type) {
	    	key = key.toUpperCase();
	    	for (i in this.models) {
	    		var check = this.models[i].get(type).toString();
	    		if(check.indexOf(key) == -1) {
	    			this.models[i].set({show: false}, {silent: true});
	    		} else {
	    			this.models[i].set({show: true}, {silent: true});
	    		}
	    		
	    	}
	    	this.trigger("change")
	    }
	});


});

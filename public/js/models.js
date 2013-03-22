
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
			days: [], 
			time: "", // raw string
			start_time: "",
			end_time: "",
			start: "",
			end: "",
			location: "",
			instructor: "(staff)",
			prof_email: "",
			site_link: ""
		},
		checker: function() {

			if(this.get("site_link") && this.get("site_link") != "") {
				var link = this.get("site_link");
				if(link.indexOf("http") == -1) {
					this.set("site_link", "http://"+link);
				}
			}

			return true;
		},
		initialize: function() {
			if(typeof this.get("days") == "string") {
				var days = window.utils.daysFormat(this.get('days'));
				this.set("days", days);
			}

			if(this.get("time") && this.get("time") != "" && this.get("time") != "ARR") {
				var times = window.utils.dateFormat(this.get('time'));
				this.set('start_time', times.start);
				this.set('end_time', times.end);
				this.set("time","");
			}
		}
	});

	// TODO:  enforce that start time < end time
	window.Reminder = Backbone.Model.extend({
		urlRoot: "/reminders",
		defaults: {
			id: null,
			type: "",
			title: "",
			class_title: "",
			completed: false,
			date: "", // switch to timestamp
			start_time: "",
			end_time: "",
			course: null,
			note: "",
			hide: false,
			add_to_cal: false,
			is_overdue: false,
			time_mills: 0
		},
		toggle: function() {
			this.save({
				completed: !this.get('completed')
			});
		},
		initialize: function() {
			this.listenTo(this, "change:date", this.checkOverdue);
			this.listenTo(this, "change:date", this.setTimeMil);

			this.checkOverdue();
			this.setTimeMil();
		},
		checkOverdue: function() {
			var time = this.get("start_time");
			if (this.get("end_time")) time = this.get("end_time");
			this.set("is_overdue", utils.isOverdue(this.get("date"), time) );
		},
		setTimeMil: function() {
			var mills = utils.getTimeMil(this.get("date"), this.get("start_time"));
			this.set("time_mills", mills);
			if(this.collection) this.collection.sort() // may not need this
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
	    comparator: function(course) {
	    	return course.get("type");
	    },
	    sortBy: function () {
			var models = _.sortBy(this.models, this.comparator);
			models.reverse();
			return models;
		}
	});

	window.ReminderCollection = Backbone.Collection.extend({
		
	    model: Reminder,
	    url: "/reminders",
	    completed: function() {
			return this.filter(function( reminder ) {
				return reminder.get('completed');
			});
		},
		courseFilter: function(id) {
			this.each(function(reminder){
				if(reminder.get("course") == id) {
					reminder.set("hide", false);
				} else {
					reminder.set("hide", true)
				}
			});
		},
		showAll: function() {
			this.each(function(reminder){
				reminder.set("hide", false);
			});
		},
		sortKey: 0,
		comparator: function(reminder) {
			/*
			0 Date 
	        1 Course
	        2 Type
	        3 Completed
	        */

			switch(this.sortKey) {
			case 0:
				return reminder.get("time_mills");
			case 1:
				return reminder.get("class_title");
			case 2:
				return reminder.get("type");
			case 3:
				return reminder.get("completed");
			default:
				console.log("something is wrong with sort!")	
			}
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

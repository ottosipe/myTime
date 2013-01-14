var Router = Backbone.Router.extend({ 
	routes: {
		""					: "home",
		"editAccount" 		: "editAccount",
		"addClass"			: "addClass",
		"editClass/:id"		: "editClass",
		"addReminder"		: "addReminder",
		"editReminder/:id"	: "editReminder",
		"feedback"			: "feedback"
	},
	initialize: function () {
        // check if noob here, display start screen
    },

    home: function() {
        var courseList = new CourseCollection();
        courseList.fetch({success: function(){
            $("body").html(new CourseListView({model: courseList}).el);
        }});
    },

    editAccount: function() {

    },

    addClass: function() {

    },

    editClass: function(id) {

    },

    addReminder: function() {

    },

    editReminder: function(id) {

    },

    feedback: function() {

    }
});

window.app = new Router();
Backbone.history.start();
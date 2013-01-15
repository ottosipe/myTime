
var Router = Backbone.Router.extend({ 
	routes: {
		""					: "home",
		"editAccount" 		: "editAccount",
		"addCourse"			: "addCourse",
		"editCourse/:id"	: "editCourse",
		"addReminder"		: "addReminder",
		"editReminder/:id"	: "editReminder",
        "welcome"           : "welcome",
		"feedback"			: "feedback",
        "admin"             : "admin"
	},
	initialize: function () {
        new MainView();
    },

    home: function() {
        /*var courseList = new CourseCollection();
        courseList.fetch({
            success: function(){
                $("body").html(new CourseListView({model: courseList}).el);
            }
        });*/
        $(".modal").modal("hide");
        $("a[href='#home']").tab('show');
        $(".nav li").removeClass("active");
    },

    editAccount: function() {
        $("#editAccount").modal();
    },

    addCourse: function() {
        $("#addCourse").modal();
    },

    editCourse: function(id) {
        $("#editCourse").modal();
    },

    addReminder: function() {
        $("#addReminder").modal();
    },

    editReminder: function(id) {
        $("#editReminder").modal();
    },

    welcome: function() {
        $("#welcome").modal()
    },

    feedback: function() {
        $("a[href='#feedback']").tab('show');
    },

    admin: function() {
        $("a[href='#admin']").tab('show');
    }
});


window.app = new Router();
Backbone.history.start();
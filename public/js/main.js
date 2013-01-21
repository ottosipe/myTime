
$(function() {

    window.Router = Backbone.Router.extend({ 
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

            var courseList = new CourseCollection();
            courseList.fetch({
                success: function(){
                    new CourseListView({model: courseList});
                    new addCourseModal({model: courseList});
                }
            });

            var remindList = new ReminderCollection();
            remindList.fetch({
                success: function(){
                    new ReminderListView({model: remindList});
                    new addReminderModal({model: remindList});
                }
            });

            var announceList = new AnnouncementCollection();
            announceList.fetch({
                success: function(){
                    new AnnounceListView({model: announceList});
                }
            });


        },

        home: function() {
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

    window.router = new Router();
    Backbone.history.start();
});

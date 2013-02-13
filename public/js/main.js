
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

            window.courseList = new CourseCollection();
            courseList.fetch({
                success: function(){
                    new CourseListView({model: courseList});
                    new addCourseModal({model: courseList});
                    new courseSelectView({model: courseList});

                    window.remindList = new ReminderCollection();
                    remindList.fetch({
                        success: function(){
                            new ReminderListView({model: remindList});
                            new addReminderModal({model: remindList});
                            // declare edit view here ***??
                        }
                    });

                }
            });

            window.announceList = new AnnouncementCollection();
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

        editCourse: function(idArg) {
            // *** make this into one modal which changes its model ****
            if(idArg == null) return;
            if(!window.courseList.length) window.location.hash = "";
            var mod = window.courseList.where({id: parseInt(idArg)})[0];
            new editCourseModal({model: mod});
            $("#editCourse").modal();
        },

        addReminder: function() {
            $("#addReminder").modal();
        },

        editReminder: function(idArg) {
            // *** make this into one modal which changes its model ***
            if (idArg == null) return;
            if(!window.remindList.length) window.location.hash = "";
            var mod = window.remindList.where({id: parseInt(idArg)})[0];
            new editReminderModal({model: mod});
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

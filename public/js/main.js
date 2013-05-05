
$(function() {

    window.Router = Backbone.Router.extend({ 
    	routes: {
    		""					: "home",
    		"editAccount" 		: "editAccount",
    		"addCourse"			: "addCourse",
    		"editCourse/:id"	: "editCourse",
    		"addReminder"		: "addReminder",
    		"editReminder/:id"	: "editReminder",
            "help"              : "help",
    		"feedback"			: "feedback",
            "admin"             : "admin"
    	},
    	initialize: function () {
            new MainView();

            window.haltRender = false;

            window.courseList = new CourseCollection();
            courseList.fetch({
                success: function(){
                    this.courseView = new CourseListView({model: courseList});
                    new addCourseModal({model: courseList});
                    new courseSelectView({model: courseList});
                }
            });

            window.remindList = new ReminderCollection();
            remindList.fetch({
                success: function(){
                    this.reminderView = new ReminderListView({model: remindList});
                    new addReminderModal({model: remindList});
                }
            });

            window.announceList = new AnnouncementCollection();
            announceList.fetch({
                success: function(){
                    this.announceView = new AnnounceListView({model: announceList});
                }
            });

            this.editModalView = new editCourseModal();
            this.editRemindView = new editReminderModal();
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
            if(window.courseList.length) {
                var mod = window.courseList.where({id: parseInt(idArg)})[0];
                this.editModalView.open(mod);
                //var modalView = new editCourseModal({model: mod});
                $("#editCourse").modal();
            } else {
                window.location.hash = "";
            }
        },

        addReminder: function() {
            $("#addReminder").modal();
        },

        editReminder: function(idArg) {
            // *** make this into one modal which changes its model ***
            if (idArg == null) return;
            if(window.remindList) {
                var mod = window.remindList.where({id: parseInt(idArg)})[0];
                this.editRemindView.open(mod);
                //var remindView = new editReminderModal({model: mod});
                $("#editReminder").modal();
            } else {
              window.location.hash = "";   
            }
        },

        help: function() {

            window.haltRender = true;
            // show example reminder and course here
            var template = _.template( $('#course-template-demo').html() )
            $("#courseList .list").html(template());

            template = _.template( $('#reminder-template-demo').html() )
            $("#reminderList .list").html(template());

            function chardinhelper(e) {
                e.preventDefault();
                e.stopPropagation();
                //$('body').chardinJs('stop');
            }

            $('body').chardinJs('start');
            $('body').click(chardinhelper);

            $('body').on("chardinJs:stop", function() {
                window.location.hash = "";
                 window.haltRender = false;
                // rerender all the data
                courseView.render();
                reminderView.render();
                announceView.render();
                $('body').unbind('click', chardinhelper);
            });
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

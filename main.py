import os
import webapp2
import models
import api
import views

## mvc layout
# model: api.py and models.py
# controlers: views.py
# view: templates/

app = webapp2.WSGIApplication([
    # oauth callback
    (views.decorator.callback_path, views.decorator.callback_handler()),

    ('/', views.MainPage),
    #('/admin', views.AdminPage),
    
    # class apis
    ('/codes', api.Code),
    ('/numbers', api.Numbers),
    ('/sections', api.Sections),
    ('/info', api.Info),

    # user apis
    ('/user', api.User),
    ('/courses', api.Courses),
    ('/courses/delete', api.DeleteCourse),
    ('/reminders', api.Reminders),
    ('/reminders/delete', api.DeleteReminder),
    ('/reminders/complete', api.CompleteReminder),
    ('/announcements', api.Announcements),

    # feedback api
    ('/feedback', api.Feedback)

], debug=True)

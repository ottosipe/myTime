import os
import webapp2
import models
import api
import views
import oauth_decorator

## mvc layout
# model: api.py and models.py
# controlers: views.py
# view: templates/

app = webapp2.WSGIApplication([
    # oauth callback
    (oauth_decorator.decorator.callback_path, oauth_decorator.decorator.callback_handler()),

    ('/', views.MainPage),
    #('/admin', views.AdminPage),
    
    # class apis
    ('/codes', api.Code),
    (r'/numbers/(.*)', api.Numbers),
    (r'/sections/(.*)/(.*)', api.Sections),
    (r'/info/(.*)', api.Info),

    # user apis
    ('/user', api.User),
    ('/courses', api.Courses),
    (r'/courses/(.*)', api.EditCourse),
    ('/reminders', api.Reminders),
    (r'/reminders/(.*)', api.EditReminder),
    ('/announcements', api.Announcements),

    # feedback api
    ('/feedback', api.Feedback)

], debug=True)

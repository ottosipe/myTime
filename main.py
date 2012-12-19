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
    ('/', views.MainPage),
    ('/admin', views.AdminPage),
    
    # class apis
    ('/codes', api.Code),
    ('/numbers', api.Numbers),
    ('/sections', api.Sections),
    ('/info', api.Info),

    # user apis
    ('/courses', api.Courses),
    ('/courses/delete', api.DeleteCourse),
    ('/assignments', api.Assignments),
    ('/assignments/delete', api.DeleteAssignment),
    ('/assignments/complete', api.CompleteAssignment),
    ('/exams', api.Exams),
    ('/exams/delete', api.DeleteExam),
    ('/reminders', api.Reminders)
], debug=True)

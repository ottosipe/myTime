import os
import webapp2
import jade
from google.appengine.api import users
from google.appengine.ext import ndb


class Student(ndb.Model):
  user = ndb.UserProperty()
  id = ndb.IntegerProperty() # may not need this
  year = ndb.StringProperty(required=True,
                           choices=set(["Freshman", "Sophomore", "Junior","Senior","Grad Or Above"]))
  classes = ndb.StructuredProperty(Class, repeated=True)
  assignments = ndb.StructuredProperty(Assign, repeated=True)
  exams = ndb.StructuredProperty(Exam, repeated=True)

class Class(ndb.Model):
  id = ndb.IntegerProperty()
  instructor = ndb.StringProperty()
  times = ndb.StructuredProperty(Timeset)
  location = GeoPtProperty()

class Timeset(ndb.Model):
  days = ndb.StructuredProperty(repeated=true, choices=["M","T","W","R","F",])
  begin = ndb.TimeProperty()
  end = ndb.TimeProperty()

#####


class MainPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade
    user = users.get_current_user()
    if user:

      context = {
          'title': 'MyTime',
          'user': user.nickname(),
          'email': user.email(),
          'logoutUrl': users.create_logout_url(),
          'achievement': 58,
          'classes': ['EECS 281','EECS 370','STATS 412', 'ENGN 455'],
          'assignments': ['one', 'two'],  
          'exams': ['one', 'two'],
          'events': ['one', 'two'],
      }
      self.render_response('index.jade', **context)
    else: 
      self.redirect(users.create_login_url(self.request.uri))

app = webapp2.WSGIApplication([
    ('/', MainPage)
], debug=True)


# can change design
# modals -
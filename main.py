import os
import webapp2
import jade
import logging
import json

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import urlfetch
from google.appengine.ext import ndb

# url = "http://umich.io/academics/v0/1920/schools"
# result = urlfetch.fetch(url)
# allDepts = []
# if result.status_code == 200:
#   schools = json.loads(result.content)
#   for school in schools:
#     url = "http://umich.io/academics/v0/1920/"+school['schoolcode']+"/departments"
#     result = urlfetch.fetch(url)
#     depts = json.loads(result.content)
#     for dept in depts:
#       #logging.warning(dept['subjectcode'])
#       allDepts.append(dept['subjectcode'])



class Meeting(ndb.Model):
  days = ndb.StringProperty()
  begin = ndb.TimeProperty()
  end = ndb.TimeProperty()
  location = ndb.StringProperty()
  instructor = ndb.StringProperty()

class Course(ndb.Model):
  id = ndb.IntegerProperty()
  
  dept = ndb.StringProperty()
  num = ndb.IntegerProperty()
  sect = ndb.IntegerProperty()
  meetings = ndb.LocalStructuredProperty(Meeting)#, repeated=True)

class Assignment(ndb.Model):
  due = ndb.DateTimeProperty()
  course = ndb.StructuredProperty(Course)

class Exam(ndb.Model):
  time = ndb.DateTimeProperty()
  course = ndb.StructuredProperty(Course)

class Student(ndb.Model):
  user = ndb.UserProperty()
  year = ndb.StringProperty(choices=set(["Freshman", "Sophomore", "Junior","Senior","Grad Or Above"]))
  courses = ndb.StructuredProperty(Course, repeated=True)
  assignments = ndb.StructuredProperty(Assignment, repeated=True)
  exams = ndb.StructuredProperty(Exam, repeated=True)


#####

class MainPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade

    User = users.get_current_user()
    if User:

      student = Student.query(Student.user == User)
      logging.warning(student)

      context = {
          'title': 'MyTime',
          'user': User.nickname(),
          'email': User.email(),
          'logoutUrl': users.create_logout_url("/"),
          'achievement': 58,
          'classes': ['EECS 281','EECS 370','STATS 412', 'ENGN 455'],
          'assignments': ['one', 'two'],  
          'exams': ['one', 'two'],
          'events': ['one', 'two']
      }
      self.render_response('index.jade', **context)
    else: 
      self.redirect(users.create_login_url(self.request.uri))

# class SchoolAPI(webapp2.RequestHandler):
#   def get(self):
#     url = "http://umich.io/academics/v0/1920/schools"
#     result = urlfetch.fetch(url)
#     if result.status_code == 200:
#       self.response.out.write(result.content)
#     else:
#       self.response.out.write("[]")

class CodeAPI(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/subjects"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class NumbersAPI(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('subj')+"/courses"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class SectionsAPI(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('subj')+"/"+self.request.get('num')+"/sections"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class InfoAPI(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('id')+"/info"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class addClass(webapp2.RequestHandler):
  def post(self):
    url = "http://umich.io/academics/v0/1920/"+self.request.get('subj')+"/"+self.request.get('num')+"/"+self.request.get('sect')+"/times"
    result = urlfetch.fetch(url)
    classInfo = json.loads(result.content)

    new_class = Course(
      id = 99,
      dept = self.request.get('dept'),
      num = self.request.get('num'),
      sect = self.request.get('sect'),
      meetings = Meetings( 
        days = classInfo.days,
        begin = classInfo.times,
        end =classInfo.times,
        location = classInfo.location,
        instructor = classInfo.instructorname
      )
    )
    #new_class.put()

app = webapp2.WSGIApplication([
    ('/', MainPage),
    #('/schools', SchoolAPI),
    ('/codes', CodeAPI),
    ('/numbers', NumbersAPI),
    ('/sections', SectionsAPI),
    ('/info', InfoAPI),
    #('/assignments', AssignmentsAPI),
    #('/exams', ExamsAPI)
], debug=True)



# can change design
# modals -
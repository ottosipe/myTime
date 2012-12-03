import os
import webapp2
import jade
import logging
import json

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import urlfetch
from google.appengine.ext import ndb

# class Meeting(ndb.Model):
#   days = ndb.StringProperty()
#   begin = ndb.TimeProperty()
#   end = ndb.TimeProperty()
#   location = ndb.StringProperty()
#   instructor = ndb.StringProperty()

class Course(ndb.Model):
  id = ndb.IntegerProperty()  
  code = ndb.StringProperty()
  number = ndb.IntegerProperty()
  section = ndb.IntegerProperty()
  title = ndb.StringProperty()
  type = ndb.StringProperty()
  #meetings = ndb.LocalStructuredProperty(Meeting)#, repeated=True)

class Assignment(ndb.Model):
  title = ndb.StringProperty()
  due = ndb.DateTimeProperty()


class Exam(ndb.Model):
  title = ndb.StringProperty()
  time = ndb.DateTimeProperty()

class Student(ndb.Model):
  user = ndb.UserProperty()
  courses = ndb.StructuredProperty(Course, repeated=True)
  assignments = ndb.StructuredProperty(Assignment, repeated=True)
  exams = ndb.StructuredProperty(Exam, repeated=True)
  #noob = ndb.Boolean

#####

class MainPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade

    User = users.get_current_user()
    if User:
      isNoob = 0;
      std_query = Student.query(Student.user == User).fetch(1)
      if(std_query == []): 
        Student(user=User,
          courses = [],
          assignments = [],
          exams = []
          ).put();
        isNoob = 1;
        student = Student.query(Student.user == User).fetch(1)[0]
      else:
        student = std_query[0]
      
      logging.warning(student)

      context = {
          'title': 'MyTime',
          'user': User.nickname(),
          'email': User.email(),
          'logoutUrl': users.create_logout_url("/"),
          'achievement': 89,
          'courses': [],
          'assignments': [],  
          'exams': [],
          #'events': [],
          'noob': isNoob
      }

      for x in student.courses:
        context['courses'].append(x.to_dict());

      for x in student.assignments:
        context['assignments'].append(x.to_dict());

      logging.warning(context)

      self.render_response('index.jade', **context)
    else: 
      self.redirect(users.create_login_url(self.request.uri))

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

class courseAPI(webapp2.RequestHandler):
  def post(self):
    url = "http://umich.io/academics/v0/"+self.request.get('id')+"/info"
    result = urlfetch.fetch(url)
    info = json.loads(result.content)[0]
    
    User = users.get_current_user()
    student = Student.query(Student.user == User).fetch(1)[0]
    student.courses += [Course(
      id = info["id"],
      code = info["code"],
      number = info["number"],
      section = info["section"],
      type = info["type"],
      title = info["title"]
    )]
    
    student.put()
    self.response.out.write(info["code"]+" "+str(info["number"]))
  
  def get(self):
    User = users.get_current_user()
    if User:
    
      student = Student.query(Student.user == User).fetch(1)[0]

      output = []
      for x in student.courses:
        output.append(x.to_dict());

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']");

app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/codes', CodeAPI),
    ('/numbers', NumbersAPI),
    ('/sections', SectionsAPI),
    ('/info', InfoAPI),
    ('/courses', courseAPI)
], debug=True)



# can change design
# modals -
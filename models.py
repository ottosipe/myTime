from google.appengine.api import users
from google.appengine.ext import ndb

class Course(ndb.Model):
  id = ndb.IntegerProperty()  
  code = ndb.StringProperty()
  number = ndb.IntegerProperty()
  section = ndb.IntegerProperty()
  title = ndb.StringProperty()
  type = ndb.StringProperty()
  days = ndb.StringProperty()
  time = ndb.StringProperty()
  location = ndb.StringProperty()
  instructor = ndb.StringProperty()
  #meetings = ndb.LocalStructuredProperty(Meeting)#, repeated=True)

class Assignment(ndb.Model):
  # need id***?
  title = ndb.StringProperty()
  course = ndb.KeyProperty(kind=Course)
  due = ndb.IntegerProperty() #unix timestamp
  completed = ndb.BooleanProperty()
  #added = ndb.DateTimeProperty(auto_now_add=True)

class Exam(ndb.Model):
  # need id? ***
  title = ndb.StringProperty()
  course = ndb.KeyProperty(kind=Course)
  time = ndb.IntegerProperty() #unix timestamp

class Student(ndb.Model):
  user = ndb.UserProperty()
  courses = ndb.StructuredProperty(Course, repeated=True)
  assignments = ndb.StructuredProperty(Assignment, repeated=True)
  exams = ndb.StructuredProperty(Exam, repeated=True)

# class Meeting(ndb.Model):
#   days = ndb.StringProperty()
#   begin = ndb.TimeProperty()
#   end = ndb.TimeProperty()
#   location = ndb.StringProperty()
#   instructor = ndb.StringProperty()


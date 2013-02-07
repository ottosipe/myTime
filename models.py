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
  eventid = ndb.StringProperty()
  prof_email = ndb.StringProperty()
  site_link = ndb.StringProperty()

class Reminder(ndb.Model):
  id = ndb.IntegerProperty()
  type = ndb.StringProperty()
  title = ndb.StringProperty()
  course = ndb.IntegerProperty()
  date = ndb.StringProperty() #eventually a unix timestamp
  note = ndb.TextProperty()
  completed = ndb.BooleanProperty()
  #added = ndb.DateTimeProperty(auto_now_add=True)

class Student(ndb.Model):
  user = ndb.UserProperty()
  name = ndb.StringProperty()
  major = ndb.StringProperty()
  advisor_email = ndb.StringProperty()
  calID = ndb.StringProperty()

  courses = ndb.StructuredProperty(Course, repeated=True)
  reminders = ndb.StructuredProperty(Reminder, repeated=True)

###
class Announcement(ndb.Model):
  title = ndb.StringProperty() 
  text = ndb.StringProperty()


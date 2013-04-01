from google.appengine.api import users
from google.appengine.ext import db

def student_key(user):
  return db.Key.from_path('Student', user.user_id())

def serialize(object):
  properties = object.properties().items() 
  output = {} 
  for field, value in properties:
    output[field] = getattr(object, field) 
  return output

class Course(db.Model):
  id = db.IntegerProperty()  
  code = db.StringProperty()
  number = db.IntegerProperty()
  section = db.IntegerProperty()
  title = db.StringProperty()
  type = db.StringProperty()
  days = db.StringProperty()
  start_time = db.StringProperty()
  end_time = db.StringProperty()
  start = db.StringProperty()
  end = db.StringProperty()
  location = db.StringProperty()
  instructor = db.StringProperty()
  eventid = db.StringProperty()
  eventseq = db.IntegerProperty()
  prof_email = db.StringProperty()
  site_link = db.StringProperty()

class Reminder(db.Model):
  id = db.IntegerProperty()
  type = db.StringProperty()
  title = db.StringProperty()
  course = db.IntegerProperty()
  date = db.StringProperty() #eventually a unix timestamp
  start_time = db.StringProperty()
  end_time = db.StringProperty()
  note = db.TextProperty()
  completed = db.BooleanProperty()
  eventid = db.StringProperty()
  eventseq = db.IntegerProperty()
  add_to_cal = db.BooleanProperty()

class Student(db.Model):
  user = db.UserProperty()
  name = db.StringProperty()
  major = db.StringProperty()
  advisor_email = db.StringProperty()
  calID = db.StringProperty()

###
class Announcement(db.Model):
  title = db.StringProperty() 
  text = db.StringProperty()


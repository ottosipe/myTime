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
  days = ndb.StringProperty()
  time = ndb.StringProperty()
  location = ndb.StringProperty()
  instructor = ndb.StringProperty()
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
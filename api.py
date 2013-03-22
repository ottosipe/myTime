import os
import webapp2
import logging
import json
import datetime
import time
import utils

import models

from google.appengine.api import users
from google.appengine.api import urlfetch
from google.appengine.api import mail

from google.appengine.ext import db

from oauth_decorator import service
from oauth_decorator import decorator

# for adding and deleting user specific courses

class Courses(webapp2.RequestHandler):
  @decorator.oauth_required
  def post(self):
 
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()

      info = json.loads(self.request.body)   
      logging.warning(info)

      if student == None :
        self.response.out.write("student is null")
        return

      dup_course = db.GqlQuery("SELECT * FROM Course WHERE ANCESTOR IS :1 AND id = :2",
        models.student_key(User), int(info["courseId"])).get()

      if dup_course != None :
        logging.warning("duplicate course")
        self.response.out.write("already in this course")
        return

      # create the courses calendar if it doesn't already exist
      if student.calID is None or student.calID == "":
        logging.warning('student calID is in fact empty')
        self.response.out.write("student calendar is empty in api, not adding course")
        return
      else:
        logging.warning('student id is something else, it is %s' % student.calID)

      courseInfo = utils.createClassEvent(info)
      logging.warning(courseInfo)
      event = courseInfo["event"]
      request = service.events().insert(calendarId=student.calID, body=event)
      response = request.execute(http=decorator.http())

      logging.warning(json.dumps(response))

      newCourse = models.Course(parent=models.student_key(User))
      newCourse.id = info["courseId"]
      newCourse.code = info["code"]
      newCourse.number = info["number"]
      newCourse.section = info["section"]
      newCourse.type = info["type"]
      newCourse.title = info["title"]
      newCourse.days = courseInfo["days"]
      newCourse.start_time = info["start_time"]
      newCourse.end_time = info["end_time"]
      newCourse.start = info["start"]
      newCourse.end = info["end"]
      newCourse.location = info["location"]
      newCourse.instructor = info["instructor"]
      newCourse.prof_email = info["prof_email"]
      newCourse.site_link = info["site_link"]
      newCourse.eventid = response["id"]
      newCourse.eventseq = response["sequence"]
      
      newCourse.put()
      # respond with changes so backbone knows the id
      self.response.out.write(json.dumps(models.serialize(newCourse)))
    else:
      self.response.out.write("['auth':'fail']")
  
  def get(self):
    User = users.get_current_user()
    if User:
      courses = db.GqlQuery("SELECT * FROM Course WHERE ANCESTOR IS :1", models.student_key(User))

      output = []
      for x in courses :
        output.append(models.serialize(x))

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']")


class EditCourse(webapp2.RequestHandler):
  @decorator.oauth_required
  def delete(self, idArg):
    User = users.get_current_user() # dont do this so often ***
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()
      course = db.GqlQuery("SELECT * FROM Course WHERE ANCESTOR IS :1 AND id = :2",
        models.student_key(User), int(idArg)).get()

      if course == None :
        self.response.out.write("couldn't find class to delete")
        return

      eventid = course.eventid
      course.delete()

      # delete class from google calendar
      logging.warning("deleting class")
      request = service.events().delete(calendarId=student.calID, eventId=eventid)
      response = request.execute(http=decorator.http())

      if response is not None and response != "":
        logging.warning(json.dumps(response))

      self.response.out.write("deleted class")
    else: 
      self.response.out.write("['auth':'fail']");

  @decorator.oauth_required
  def put(self, idArg):
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()
      course = db.GqlQuery("SELECT * FROM Course WHERE ANCESTOR IS :1 AND id = :2",
        models.student_key(User), int(idArg)).get()

      if course == None :
        self.response.out.write("couldnt find class to edit")
        return

      info = json.loads(self.request.body)

      # update class in google calendar
      eventInfo = utils.createClassEvent(info)
      event = eventInfo["event"]
      event["sequence"] = int(course.eventseq)
      logging.warning(event)
      request = service.events().update(calendarId=student.calID,
          eventId=course.eventid, body=event)
      logging.warning(course.eventid + " " + student.calID)
      response = request.execute(http=decorator.http())
      logging.warning(json.dumps(response))

      # edit the course
      course.type = info["type"]
      course.title = info["title"]
      course.days = eventInfo["days"]
      course.start = info["start"]
      course.end = info["end"]
      course.start_time = info["start_time"]
      course.end_time = info["end_time"]
      course.location = info["location"]
      course.instructor = info["instructor"]
      course.site_link = info["site_link"]
      course.prof_email = info["prof_email"]
      course.eventid = course.eventid
      course.eventseq = response["sequence"]

      course.put()
    else:
      self.response.out.write("['auth':'fail']")

class Reminders(webapp2.RequestHandler):
  @decorator.oauth_required
  def post(self):
    
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()

      postData = json.loads(self.request.body)
      logging.warning(postData)
     
      newReminder = models.Reminder(parent=models.student_key(User))

      newReminder.type = postData['type']
      newReminder.title = postData['title']
      newReminder.completed = False
      newReminder.date =  postData['date']
      newReminder.start_time = postData['start_time']
      newReminder.end_time = postData['end_time']
      newReminder.course = postData['course']
      newReminder.note = postData['note']
      newReminder.id = int(time.time())
      newReminder.eventid = ""
      newReminder.eventseq = -1

      if postData['add_to_cal'] == True :
        event = utils.createReminderEvent(postData)
        logging.warning(event)
        request = service.events().insert(calendarId=student.calID, body=event)
        response = request.execute(http=decorator.http())

        if response is not None and response != "" :
          logging.warning(json.dumps(response))
          newReminder.eventid = response["id"]
          newReminder.eventseq = response["sequence"]

      newReminder.put()
      logging.warning("added reminder to db")

      self.response.out.write(json.dumps(newReminder.to_dict()))
    else :
      self.response.out.write("['auth':'fail']")
  
  def get(self):
    User = users.get_current_user()
    if User:
      reminders = db.GqlQuery("SELECT * FROM Reminder WHERE ANCESTOR IS :1", models.student_key(User))

      output = []
      for x in reminders :
        #if(self.request.get('showAll') == "true" or x.completed == False):
          output.append(x.to_dict());

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']")

class EditReminder(webapp2.RequestHandler):
  @decorator.oauth_required
  def delete(self, idArg):
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()
      reminder = db.GqlQuery("SELECT * FROM Reminder WHERE ANCESTOR IS :1 AND id = :2",
        models.student_key(User), idArg).get()

      if reminder == None :
        self.response.out.write("failed to find single reminder to delete")
        return

      eventid = reminder.eventid

      reminder.delete()

      if eventid == "" :
        self.response.out.write("deleted reminder only from db")
      else :
        # delete reminder from google calendar
        logging.warning("about to delete reminder from gcal")
        request = service.events().delete(calendarId=student.calID, eventId=eventid)
        response = request.execute(http=decorator.http())
        if response is not None and response != "":
          logging.warning(response)
        self.response.out.write("deleted reminder from db AND gcal")
    else: 
      self.response.out.write("['auth':'fail']");

  # toggle completed state
  @decorator.oauth_required
  def put(self, idArg):
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()
      reminder = db.GqlQuery("SELECT * FROM Reminder WHERE ANCESTOR IS :1 AND id = :2",
        models.student_key(User), int(idArg)).get()

      if reminder == None :
        self.response.out.write("couldn't find a single reminder to edit")
        return

      info = json.loads(self.request.body)

      reminder.course = 0
      if (info['course']):
        reminder.course = int(info['course'])
      reminder.type = info['type']
      reminder.title = info['title']
      reminder.completed = info['completed']
      reminder.date =  info['date']
      reminder.note = info['note']
      reminder.start_time = info['start_time']
      reminder.end_time = info['end_time']

      if info['add_to_cal'] == True :
        event = utils.createReminderEvent(info)
        logging.warning(event)

        if reminder.eventid == "" :
          # reminder was NOT on calendar before, add it
          request = service.events().insert(calendarId=student.calID, body=event)
          response = request.execute(http=decorator.http())
          logging.warning(json.dumps(response))
          reminder.eventid = response["id"]
          reminder.eventseq = response["sequence"]
        else :
          # reminder was on calendar before, edit it
          event["sequence"] = int(reminder.eventseq)
          request = service.events().update(calendarId=student.calID,
              eventId=reminder.eventid, body=event)
          response = request.execute(http=decorator.http())
          logging.warning(json.dumps(response))
          reminder.eventseq = response["sequence"]

        reminder.put()

      else :
        if reminder.eventid != "" :
          # reminder was on calendar before, delete it
          request = service.events().delete(calendarId=student.calID, eventId=reminder.eventid)
          response = request.execute(http=decorator.http())
          logging.warning(response)
          reminder.delete()
        else :
          # reminder was not on cal before, not adding it
          reminder.put()

      self.response.out.write("completed reminders")
    else: 
      self.response.out.write("['auth':'fail']");


class Announcements(webapp2.RequestHandler):
  def get(self):
      announcements = db.GqlQuery("SELECT * FROM Announcement")

      logging.warning(announcements)

      output = []
      for x in announcements :
        output.append(x.to_dict())

      self.response.out.write(json.dumps(output))
  def post(self):
      announce = models.Announcement(
        title = self.request.get('title'),
        text = self.request.get('text')
      ) 
      announce.put();
      self.response.out.write("Announcement: '" + announce.title +"'' added!")


class Feedback(webapp2.RequestHandler):
  def post(self):
      mail.send_mail(
        sender= self.request.get('name') + " <"+self.request.get('email')+">",
        to= "Otto Sipe <ottosipe@umich.edu>, Josh Billingham <wjbillin@umich.edu>, Hans Anderson <hansande@umich.edu>",
        subject= "MyTime Feedback from: " + self.request.get('name'),
        body= self.request.get('text')
      )

      self.response.out.write("Feedback sent!")



class User(webapp2.RequestHandler):
  def post(self):
    User = users.get_current_user()
    if User:
      student = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).get()
      student.name = self.request.get('name')
      student.major = self.request.get('major')
      student.advisor_email = self.request.get('advisor_email')
      student.put()
      self.response.out.write("saved user info")
    else: 
      self.response.out.write("['auth':'fail']");


# api wrapper used to build course info from umich.io

class Code(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/subjects"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class Numbers(webapp2.RequestHandler):
  def get(self, codeID):
    url = "http://umich.io/academics/v0/"+codeID+"/courses"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class Sections(webapp2.RequestHandler):
  def get(self, codeID, numID):
    url = "http://umich.io/academics/v0/"+codeID+"/"+numID+"/sections"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class Info(webapp2.RequestHandler):
  def get(self, numID):
    url = "http://umich.io/academics/v0/"+numID+"/info"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")




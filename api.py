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

from oauth_decorator import service
from oauth_decorator import decorator

# for adding and deleting user specific courses

class Courses(webapp2.RequestHandler):
  @decorator.oauth_required
  def post(self):

    info = json.loads(self.request.body)   
    logging.warning(info)
 
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]

    for x in student.courses:
      if x.id == int(info['courseId']):
        self.response.write("already in this course")
        return

    # create the courses calendar if it doesn't already exist
    if student.calID is None or student.calID == "":
      logging.warning('student calID is in fact empty')
      self.response.out.write("student calendar is empty in api, not adding course")
    else:
      logging.warning('student id is something else, it is %s' % student.calID)

    courseInfo = utils.createEvent(info)
    logging.warning(courseInfo)
    event = courseInfo["event"]
    request = service.events().insert(calendarId=student.calID, body=event)
    response = request.execute(http=decorator.http())
    eventid = response["id"]

    logging.warning(response)

    newCourse = models.Course(
      id = info["courseId"],
      code = info["code"],
      number = info["number"],
      section = info["section"],
      type = info["type"],
      title = info["title"],
      days = courseInfo["days"],
      start_time = info["start_time"],
      end_time = info["end_time"],
      start = info["start"],
      end = info["end"],
      location = info["location"],
      instructor = info["instructor"],
      prof_email = info["prof_email"],
      site_link = info["site_link"],
      eventid = eventid
    )

    student.courses += [newCourse]
    
    student.put()
    # respond with changes so backbone knows the id
    self.response.out.write(json.dumps(newCourse.to_dict())) 
  
  def get(self):
    User = users.get_current_user()
    if User:
    
      student = models.Student.query(models.Student.user == User).fetch(1)[0]

      output = []
      for x in student.courses:
        output.append(x.to_dict());

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']");


class EditCourse(webapp2.RequestHandler):
  @decorator.oauth_required
  def delete(self, idArg):
    User = users.get_current_user() # dont do this so often ***
    newCourses = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      courseToDelete = {}
      for x in student.courses:
        if x.id != int(idArg):
          newCourses.append(x)
        else:
          courseToDelete = x
      # delete class from student's classes
      student.courses = newCourses
      student.put()
      self.response.out.write("deleted class")

      # delete class from google calendar
      logging.warning("deleting class")
      request = service.events().delete(calendarId=student.calID, eventId=courseToDelete.eventid)
      response = request.execute(http=decorator.http())

      if response is not None and response != "":
        logging.warning(response)
    else: 
      self.response.out.write("['auth':'fail']");

  @decorator.oauth_required
  def put(self, idArg):
    User = users.get_current_user()
    newCourses = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      info = json.loads(self.request.body)
      courseId = info["id"]
      for course in student.courses:
        if course.id != int(courseId):
          newCourses.append(course)
        else:
          # update class in google calendar
          logging.warning("updating class")
          event = utils.createEvent(info)
          logging.warning(event)
          logging.warning(event["event"])
          request = service.events().update(calendarId=student.calID,
              eventId=course.eventid, body=event["event"])
          response = request.execute(http=decorator.http())
          logging.warning(response)

          # create new course (really the edited course that will replace the old one)
          # and add it to the newCourses
          newCourses += [models.Course(
            id = info["id"],
            code = info["code"],
            number = info["number"],
            section = info["section"],
            type = info["type"],
            title = info["title"],
            days = info["days"],
            #time = info["time"],
            start = info["start"],
            end = info["end"],
            start_time = info["start_time"],
            end_time = info["end_time"],
            location = info["location"],
            instructor = info["instructor"],
            eventid = course.eventid
          )]

      # after for loop is done, set student's courses to the newCourses (including edited course)
      student.courses = newCourses
      student.put()
    else:
      self.response.out.write("['auth':'fail']")

class Reminders(webapp2.RequestHandler):
  def post(self):
    
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]
    postData = json.loads(self.request.body)
    logging.warning(postData)
   
    student.reminders += [models.Reminder(
      type = postData['type'],
      title = postData['title'],
      completed = False,
      date =  postData['date'],
      time = postData['time'],
      course = postData['course'],
      note = postData['note'],
      id = int(time.time()),
    )]
    student.put()
  
  def get(self):
    User = users.get_current_user()
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]

      output = []
      for x in student.reminders:
        #if(self.request.get('showAll') == "true" or x.completed == False):
          output.append(x.to_dict());

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']");

class EditReminder(webapp2.RequestHandler):
  def delete(self, idArg):
    User = users.get_current_user()
    newReminds = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.reminders:
        if x.id != int(idArg):
          newReminds.append(x)
      student.reminders = newReminds
      student.put()
      self.response.out.write("deleted assignment")
    else: 
      self.response.out.write("['auth':'fail']");

  # toggle completed state
  def put(self, idArg):
    User = users.get_current_user()
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      logging.warning(student)
      newReminds = []
      for x in student.reminders:
        if x.id == int(idArg):
          newData = json.loads(self.request.body)
          x.type = newData['type']
          x.title = newData['title']
          x.completed = newData['completed']
          x.date =  newData['date']
          x.course = newData['course']
          x.note = newData['note']
        newReminds.append(x)
      #reminders = student.reminders.query(student.reminders.id == int(idArg)).fetch(1)[0]
      logging.warning(newReminds)
      student.reminders = newReminds
      logging.warning(student)
      student.put()
      self.response.out.write("completed reminders")
    else: 
      self.response.out.write("['auth':'fail']");



class Announcements(webapp2.RequestHandler):
  def get(self):
      announcements = models.Announcement.query().fetch()

      logging.warning(announcements)

      output = []
      for x in announcements:
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
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
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




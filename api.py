import os
import webapp2
import logging
import json
import datetime
import time

import models

from google.appengine.api import users
from google.appengine.api import urlfetch
from google.appengine.ext import ndb


# for adding and deleting user specific courses

class Courses(webapp2.RequestHandler):
  def post(self):
    url = "http://umich.io/academics/v0/"+self.request.get('id')+"/info"
    result = urlfetch.fetch(url)
    info = json.loads(result.content)[0]
    
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]

    for x in student.courses:
      if x.id == int(self.request.get('id')):
        self.response.write("already in this course")
        return

    # change time format from TTH 1-230 to 2011-06-03T10:00:00.000-07:00
    startDate = info["start"]
    endDate = info["end"]

    calStartDate = startDate[6:] + "-" + startDate[0:1] + "-" + startDate[3:4]
    calStartDate += "T"

    calEndDate = endDate[6:] + endDate[0:1] + endDate[3:4]

    classDaysInfo = info["days"]
    classDays = ""
    classTime = info["time"]
    i = 0
    for char in classDaysInfo
      if char == 'M'
        classDays += "MO,"
      else if char == 'T'
        if classTime[i+1] == 'H'
          # Thursday
          classDays += "TH,"
        else
          # Tuesday
          classDays += "TU,"
      else if char == 'W'
        classDays += "WE,"
      else if char == 'F'
        classDays += "FR,"
      else if char == 'S'
        if classTime[i+1] == 'U'
          # Sunday
          classDays += "SU,"
        else
          # Saturday
          classDays += "SA,"
      else if char == 'U' or char == 'A' or char == 'H'
        # do nothing
      else
        # char is something foreign
        break
      ++i
    if i == 0
      return

    classDays = classDays[:-1] # chop off last erroneous comma

    # determine am or pm
    am = true
    if classTime[-2:] == "PM"
      am = false

    # determine hour:minute timestamp
    i = 0
    startTime = ""
    for char in classTime
      if char == "-"
        break
      startTime += char
      ++i
    if i == 0
      return
    classTime = classTime[i:]

    i = 0
    endTime = ""
    for char in classTime
      if char == 'P' or char == 'A
        break
      endTime += char
      ++i
    if i == 0
      return

    # check if the class takes up zero time
    if endTime == startTime
      return

    timeLength = len(startTime)
    if timeLength == 1 and (am == true or (am == false and endTime[0] < startTime))
      startTime = calStartDate + "0" + startTime + ":00:00.000-05:00"
    else if timeLength == 1
      startTime = calStartDate + (int(startTime)
    else if timeLength = 2
      startTime = calStartDate + s
    student.courses += [models.Course(
      id = info["id"],
      code = info["code"],
      number = info["number"],
      section = info["section"],
      type = info["type"],
      title = info["title"],
      days = info["days"],
      time = info["time"],
      location = info["location"],
      instructor = info["instructor"]
    )]
    
    student.put()
    self.response.out.write("Added "+info["code"]+" "+str(info["number"]))
  
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

class DeleteCourse(webapp2.RequestHandler):
  def post(self):
    User = users.get_current_user()
    newCourses = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.courses:
        if x.id != int(self.request.get('id')):
          newCourses.append(x)
      student.courses = newCourses
      student.put()
      self.response.out.write("deleted class")
    else: 
      self.response.out.write("['auth':'fail']");


class Reminders(webapp2.RequestHandler):
  def post(self):
    
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]
    logging.warning(self.request.get('title'))
    student.reminders += [models.Reminder(
      type = self.request.get('type'),
      title = self.request.get('title'),
      completed = False,
      date =  self.request.get('date'),
      course = int(self.request.get('course')),
      note = self.request.get('note'),
      id = int(time.time())
    )]
    student.put()
  
  def get(self):
    User = users.get_current_user()
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]

      output = []
      for x in student.reminders:
        if(self.request.get('showAll') == "true" or x.completed == False):
          output.append(x.to_dict());

      self.response.out.write(json.dumps(output))
    else: 
      self.response.out.write("['auth':'fail']");

class DeleteReminder(webapp2.RequestHandler):
  def post(self):
    User = users.get_current_user()
    newReminds = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.reminders:
        if x.id != int(self.request.get('id')):
          newReminds.append(x)
      student.reminders = newReminds
      student.put()
      self.response.out.write("deleted assignment")
    else: 
      self.response.out.write("['auth':'fail']");

class CompleteReminder(webapp2.RequestHandler):
  # toggle completed state
  def post(self):
    User = users.get_current_user()
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.reminders:
        if x.id == int(self.request.get('id')):
          x.completed = not x.completed
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
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('subj')+"/courses"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class Sections(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('subj')+"/"+self.request.get('num')+"/sections"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")

class Info(webapp2.RequestHandler):
  def get(self):
    url = "http://umich.io/academics/v0/"+self.request.get('id')+"/info"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      self.response.out.write(result.content)
    else:
      self.response.out.write("[]")




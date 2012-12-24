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
        if(x.completed == False):
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
  def post(self):
    User = users.get_current_user()
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.reminders:
        if x.id == int(self.request.get('id')):
          x.completed = True
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




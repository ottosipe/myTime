import os
import webapp2
import jade
import json
import logging
import models
import utils

from google.appengine.api import users
from google.appengine.api import urlfetch

from google.appengine.ext import db

from oauth_decorator import decorator
from oauth_decorator import service

class MainPage(jade.jadeHandler):
  @decorator.oauth_required
  def get(self):
    #handles get requests, context is object sent to jade renderer

    User = users.get_current_user()

    # this should be moved to a seperate api and triggered by new users! ***
    if User:
      isNoob = 0;
      std_query = db.GqlQuery("SELECT * FROM Student WHERE user = :1", User).fetch(1)
      student = {}
      
      if len(std_query) == 0 : 

        try:
          url = "https://mcommunity.umich.edu/mcPeopleService/people/" + User.nickname()
          result = urlfetch.fetch(url)
          info = json.loads(result.content)
          studentName = info['person']['displayName']
        except:
          studentName = User.nickname()

        student = models.Student(
          user=User,
          courses = [],
          reminders = [],
          major = "",
          advisor_email = "",
          name = studentName,
          calID = ""
        )

        logging.warning(student)
        student.put()
        isNoob = 1;
      else:
        student = std_query[0]
      
      logging.warning(models.serialize(student))

      context = {
          'name': student.name,
          'email': student.user.email(),
          'major': student.major,
          'advisor_email': student.advisor_email,
          'logoutUrl': users.create_logout_url("/"),
          'achievement': 89,
          'noob': isNoob,
          'admin': users.is_current_user_admin()
      }

      self.render_response('index.jade', **context)

      # create the courses calendar asynchronously
      if student.calID is None or student.calID == "":
        logging.warning('student calID is empty')
        calendar = utils.createCal()

        request = service.calendars().insert(body=calendar)
        created_cal = request.execute(http=decorator.http())
        student.calID = created_cal["id"]
      else:
        logging.warning('student cal id already exists, it is %s' % student.calID)

      student.put()
    else: 
      self.redirect(users.create_login_url(self.request.uri))


class AdminPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade renderer

    User = users.get_current_user()
    
    if users.is_current_user_admin():
      context = {}
      self.render_response('admin.jade', **context)
    else: 
      self.redirect("/")


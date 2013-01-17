import os
import webapp2
import jade
import json
import logging
import models

from google.appengine.api import users
from google.appengine.api import urlfetch

import httplib2
from oauth2client.appengine import OAuth2Decorator
from apiclient.discovery import build

decorator = OAuth2Decorator(
  client_id='100813449163-vl4u1p376hjrc1e3gc090e8miarjnir3.apps.googleusercontent.com',
  client_secret='L3TfdZSaobeM9EANnUhivnyg',
  scope='https://www.googleapis.com/auth/calendar',
  user_agent='myTime')

service = build('calendar', 'v3')

class MainPage(jade.jadeHandler):
  @decorator.oauth_required
  def get(self):
    #handles get requests, context is object sent to jade renderer

    User = users.get_current_user()

    # this should be moved to a seperate api and triggered by new users! ***
    if User:
      isNoob = 0;
      std_query = models.Student.query(models.Student.user == User).fetch(1)
      if(std_query == []): 

        try:
          url = "https://mcommunity.umich.edu/mcPeopleService/people/" + User.nickname()
          result = urlfetch.fetch(url)
          info = json.loads(result.content)
          studentName = info['person']['displayName']
        except:
          studentName = User.nickname()

        models.Student(user=User,
          courses = [],
          reminders = [],
          major = "",
          advisor_email = "",
          name = studentName,
          calID = ""
        ).put();
        isNoob = 1;
        student = models.Student.query(models.Student.user == User).fetch(1)[0]
      else:
        student = std_query[0]
      
      logging.warning(student)

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


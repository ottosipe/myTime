import os
import webapp2
import jade
import logging
import models
import views

from google.appengine.api import users

class MainPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade renderer

    User = users.get_current_user()
    if User:
      isNoob = 0;
      std_query = models.Student.query(models.Student.user == User).fetch(1)
      if(std_query == []): 
        models.Student(user=User,
          courses = [],
          assignments = [],
          exams = []
          ).put();
        isNoob = 1;
        student = models.Student.query(models.Student.user == User).fetch(1)[0]
      else:
        student = std_query[0]
      
      logging.warning(student)

      context = {
          'title': 'MyTime',
          'user': User.nickname(),
          'email': User.email(),
          'logoutUrl': users.create_logout_url("/"),
          'achievement': 89,
          'noob': isNoob
      }

      self.render_response('index.jade', **context)
    else: 
      self.redirect(users.create_login_url(self.request.uri))

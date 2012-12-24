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
          reminders = [],
          exams = [],
          major = "",
          advisor_email = "",
          name = User.nickname()
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


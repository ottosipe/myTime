import os
import webapp2
import jade
import logging
import json

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import urlfetch

# url = "http://umich.io/academics/v0/1920/schools"
# result = urlfetch.fetch(url)
# allDepts = []
# if result.status_code == 200:
#   schools = json.loads(result.content)
#   for school in schools:
#     url = "http://umich.io/academics/v0/1920/"+school['schoolcode']+"/departments"
#     result = urlfetch.fetch(url)
#     depts = json.loads(result.content)
#     for dept in depts:
#       #logging.warning(dept['subjectcode'])
#       allDepts.append(dept['subjectcode'])

class Class(db.Model):
  name = db.StringProperty()
  instructor = db.StringProperty()
  time = db.DateTimeProperty()

class MainPage(jade.jadeHandler):
  def get(self):
    #handles get requests, context is object sent to jade

    q = Class.all()

    for p in q.run(limit=5):
        print "%s %s %s" % (p.name, p.instructor, p.time)

    context = {
        'title': 'MyTime',
        'user': 'Otto Sipe',
        'achievement': 35,
        'classes': ['EECS 281','EECS 370','STATS 412', 'ENGN 455'],
        'assignments': ['one', 'two'],  
        'exams': ['one', 'two'],
        'events': ['one', 'two']
    }
    self.render_response('index.jade', **context)

app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/api', MainPage)
], debug=True)



# can change design
# modals -
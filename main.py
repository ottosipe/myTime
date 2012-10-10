import os
import webapp2
import jade
from google.appengine.api import users
from google.appengine.ext import db

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
        'events': ['one', 'two'],
    }
    self.render_response('index.jade', **context)

app = webapp2.WSGIApplication([
    ('/', MainPage)
], debug=True)


# can change design
# modals -
import os
import webapp2
import jade

class MainPage(jade.jadeHandler):
  def get(self):
  	#handles get requests, context is object sent to jade
    context = {
    	'title': 'MyTime',
    	'user': 'Otto Sipe',
    	'achievement': 90,
    	'classes': ['EECS 281','EECS 370','STATS 412', 'ENGN 455'],
    	'assignments': ['one', 'two'],	
    	'exams': ['one', 'two'],
    	'events': ['one', 'two'],
    }
    self.render_response('index.jade', **context)

app = webapp2.WSGIApplication([
	('/', MainPage)
], debug=True)

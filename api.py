import os
import webapp2
import logging
import json
import datetime
import time
from views import service
from views import decorator

import models

from google.appengine.api import users
from google.appengine.api import urlfetch
from google.appengine.api import mail

# for adding and deleting user specific courses

class Courses(webapp2.RequestHandler):

  def post(self):
    logging.warning(self.request.body)
    # try to avoid calling out to umich.io again - we should already have
    # this class data
    #url = "http://umich.io/academics/v0/"+self.request.get('id')+"/info"
    #result = urlfetch.fetch(url)
    #logging.warning(url)
    #info = json.loads(result.content)[0]

    info = json.loads(self.request.body)   
    logging.warning(info)
 
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]

    for x in student.courses:
      if x.id == int(info['courseId']):
        self.response.write("already in this course")
        return

    # change time format from TTH 1-230 to 2011-06-03T10:00:00.000-07:00
    startDate = info["start"]
    endDate = info["end"]

    # debugging output
    logging.warning("Start date is " + startDate)
    logging.warning("End date is " + endDate)
    logging.warning("Start month is " + startDate[0:2])

    classStartTime = datetime.datetime(int(startDate[6:]), int(startDate[0:2]), int(startDate[3:5]))
    classEndTime = classStartTime
    classEndDate = datetime.datetime(int(endDate[6:]), int(endDate[0:2]), int(endDate[3:5]))

    # determine day of the week of start date; Mon = 0 ... Sun = 6
    dayOfWeek = classStartTime.weekday()
    classOnFirstDay = False

    classDaysInfo = info["days"]
    if classDaysInfo is None or classDaysInfo== "TBA" or classDaysInfo == "":
      logging.warning("class days info is no good")
      return
    logging.warning(classDaysInfo)

    classDays = ""
    classDayNums = []
    classTime = info["time"]
    i = 0
    for char in classDaysInfo:
      if char == 'M':
        classDays += "MO,"
        classDayNums.append(0)
        if dayOfWeek == 0: classOnFirstDay = True
      elif char == 'T':
        if classDaysInfo[i+1] == 'H':
          # Thursday
          classDays += "TH,"
          classDayNums.append(3)
          if dayOfWeek == 3: classOnFirstDay = True
        else:
          # Tuesday
          classDays += "TU,"
          classDayNums.append(1)
          if dayOfWeek == 1: classOnFirstDay = True
      elif char == 'W':
        classDays += "WE,"
        classDayNums.append(2)
        if dayOfWeek == 2: classOnFirstDay = True
      elif char == 'F':
        classDays += "FR,"
        classDayNums.append(4)
        if dayOfWeek == 4: classOnFirstDay = True
      elif char == 'S':
        if classDaysInfo[i+1] == 'U':
          # Sunday
          classDays += "SU,"
          classDayNums.append(6)
        else:
          # Saturday
          classDays += "SA,"
          classDayNums.append(5)
      elif char == 'U' or char == 'A' or char == 'H':
        continue
      else:
        # char is something foreign
        break
      i = i + 1
    if i == 0:
      logging.warning("class days info is empty")
      return

    # chop off last erroneous comma
    classDays = classDays[:-1]
    logging.warning(classDays)

    # make first class meeting correct, will break if semester start date
    # and first class meeting date are in different months
    if not classOnFirstDay:
      logging.warning("does not have class on the first day")
      diff = 0
      for num in classDayNums:
        if dayOfWeek < num:
          diff = num - dayOfWeek
          break
      if diff == 0:
        diff = classDayNums[0] - dayOfWeek + 7
      classStartTime = classStartTime.replace(day = classStartTime.day + diff)
      classEndTime = classStartTime

    # determine am or pm
    am = True
    if classTime[-2:] == "PM":
      am = False

    # parse start and end times for class
    i = 0
    startTime = ""
    for char in classTime:
      if char == "-":
        break
      else:
        startTime += char
      i = i + 1
    if i == 0:
      logging.warning("no start time")
      return
    classTime = classTime[i+1:]

    i = 0
    endTime = ""
    for char in classTime:
      if char == 'P' or char == 'A':
        break
      endTime += char
      i = i + 1
    if i == 0:
      logging.warning("no end time")
      return

    # check if the class takes up zero time
    if endTime == startTime:
      return

    # convert class end time
    timeLength = len(endTime)
    endHour = 0
    endMin = 0
    if timeLength == 1 or timeLength == 2:
      endHour = int(endTime)
    elif timeLength == 3:
      endHour = int(endTime[0])
      endMin = int(endTime[1:3])
    elif timeLength == 4:
      endHour = int(endTime[0:2])
      endMin = int(endTime[2:4])
    else:
      # wrongly formatted
      return
    if am or endHour == 12:
      classEndTime = classEndTime.replace(hour=endHour)
    else:
      classEndTime = classEndTime.replace(hour=endHour + 12)
    classEndTime = classEndTime.replace(minute=endMin)
    classEndTime = classEndTime.replace(second=0)
    classEndTime = classEndTime.replace(microsecond=0)
  
    # convert class start time
    timeLength = len(startTime)
    startHour = 0
    startMin = 0
    if timeLength == 1 or timeLength == 2:
      startHour = int(startTime)
    elif timeLength == 3:
      startHour = int(startTime[0])
      startMin = int(startTime[1:3])
    elif timeLength == 4:
      startHour = int(startTime[0:2])
      startMin = int(startTime[2:4])
    else:
      # wrongly formatted
      return
    if am or startHour > endHour or endHour == 12:
      classStartTime = classStartTime.replace(hour=startHour)
    else:
      classStartTime = classStartTime.replace(hour=startHour + 12)
    classStartTime = classStartTime.replace(minute=startMin)
    classStartTime = classStartTime.replace(second=0)
    classStartTime = classStartTime.replace(microsecond=0)

    # logging for debugging
    logging.warning("Class Start " + classStartTime.isoformat())
    logging.warning("Class End " + classEndTime.isoformat())

    # determine semester
    semester = ""
    if classStartTime.month == 1:
      semester = "W"
    elif classStartTime.month == 9:
      semester = "F"
    elif classStartTime.month == 5:
      semester = "SP"
    else:
      semester = "SU"
    semester += (str(classStartTime.year)[2:])

    # create the courses calendar if it doesn't already exist
    if student.calID is None or student.calID == "":
      logging.warning('student calID is in fact empty')
      calendar = {
        'summary': 'Courses ' + semester,
        'timeZone': 'America/New_York'
      }
      request = service.calendars().insert(body=calendar)
      created_cal = request.execute(http=decorator.http())
      student.calID = created_cal["id"]
    else:
      logging.warning('student id is something else')
      logging.warning('student id is %s' % student.calID)

    # create the calendar event
    event = {
      'summary': str(info["code"]) + " " + str(info["number"]) + ": " + info["title"],
      'location': info['location'],
      'start': {
        'dateTime': classStartTime.isoformat() + '.000-05:00',
        'timeZone': 'America/New_York'
      },
      'end': {
        'dateTime' : classEndTime.isoformat() + '.000-05:00',
        'timeZone': 'America/New_York'
      },
      'recurrence': [
        'RRULE:FREQ=WEEKLY;BYDAY=' + classDays + ';UNTIL=' + classEndDate.strftime("%Y%m%dT") + '235900Z',
      ]
    }

    request = service.events().insert(calendarId=student.calID, body=event)
    response = request.execute(http=decorator.http())
    eventid = response["id"]

    logging.warning(response)

    student.courses += [models.Course(
      id = info["courseId"],
      code = info["code"],
      number = info["number"],
      section = info["section"],
      type = info["type"],
      title = info["title"],
      days = info["days"],
      time = info["time"],
      location = info["location"],
      instructor = info["instructor"],
      eventid = eventid
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

class EditCourse(webapp2.RequestHandler):
  @decorator.oauth_required
  def delete(self, idArg):
    User = users.get_current_user() # dont do this so often ***
    newCourses = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for x in student.courses:
        if x.id != int(idArg):
          newCourses.append(x)
        else:
          # delete class from google calendar
          logging.warning("deleting class")
          request = service.events().delete(calendarId=student.calID, eventId=x.eventid)
          response = request.execute(http=decorator.http())
          if response is not None and response != "":
            logging.warning(response)
      student.courses = newCourses
      student.put()
      self.response.out.write("deleted class")
    else: 
      self.response.out.write("['auth':'fail']");

  @decorator.oauth_required
  def put(self, idArg):
    User = users.get_current_user()
    newCourses = []
    if User:
      student = models.Student.query(models.Student.user == User).fetch(1)[0]
      for course in student.courses:
        if course.id != int(idArg):
          newCourses.append(x)
        else:
          # update class in google calendar
          logging.warning("updating class")
          


class Reminders(webapp2.RequestHandler):
  @decorator.oauth_required
  def post(self):
    
    User = users.get_current_user()
    student = models.Student.query(models.Student.user == User).fetch(1)[0]
    postData = json.loads(self.request.body)
    logging.warning(postData)

    event = {
      'summary': postData['type'] + ":" + postData['title'],
      'description': postData['note'],
      'start': {
        'dateTime': classStartTime.isoformat() + '.000-05:00',
        'timeZone': 'America/New_York'
      },
      'end': {
        'dateTime' : classEndTime.isoformat() + '.000-05:00',
        'timeZone': 'America/New_York'
      }
    }

    request = service.events().insert(calendarId=student.calID, body=event)
    response = request.execute(http=decorator.http())
    eventid = response['id']
    
    student.reminders += [models.Reminder(
      type = postData['type'],
      title = postData['title'],
      completed = False,
      date =  postData['date'],
      #course = postData['course'],
      note = postData['note'],
      id = int(time.time()),
      eventid = eventid
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
  def put(self):
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




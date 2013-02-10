import os
import webapp2
import logging
import json
import datetime
import time

# for adding and deleting user specific courses

def createEvent(info):
    logging.warning(info)

    # change time format from TTH 1-230 to 2011-06-03T10:00:00.000-07:00
    startDate = info["start"]
    endDate = info["end"]

    # debugging output
    logging.warning("Start date is " + startDate)
    logging.warning("End date is " + endDate)
    logging.warning("Start month is " + startDate[0:2])

    startTime = info["start_time"]
    endTime = info["end_time"]

    startHour = int(startTime[0:2])
    if (startTime[:-2] == "PM") {
      startHour += 12
    }
    endHour = int(endTime[0:2])
    if (endTime[:-2] == "PM") {
      endHour += 12
    }

    classStartTime = datetime.datetime(int(startDate[6:]), int(startDate[0:2]), int(startDate[3:5]),
      startHour, int(startTime[3:5]), 0)
    classEndTime = classStartTime.replace(hour=endHour, minute=int(endTime[3:5]))
    classEndDate = datetime.datetime(int(endDate[6:]), int(endDate[0:2]), int(endDate[3:5]))

    # determine day of the week of start date; Mon = 0 ... Sun = 6
    dayOfWeek = classStartTime.weekday()
    classOnFirstDay = False

    classDays = info["days"]
    #if classDays is None or classDays == "TBA" or classDays == "":
      #logging.warning("class days info is no good")
      #return
    logging.warning(classDays)

    classDayNums = []
    classDaysString = ""
    classTime = info["time"]
    i = 0
    for day in classDays:
      if day == 'M0':
        classDayNums.append(0)
        if dayOfWeek == 0: classOnFirstDay = True
      elif day == 'TU':
          classDayNums.append(1)
          if dayOfWeek == 1: classOnFirstDay = True
      elif day == 'WE':
        classDayNums.append(2)
        if dayOfWeek == 2: classOnFirstDay = True
      elif day == 'TH':
        classDayNums.append(3)
        if dayOfWeek == 3: classOnFirstDay = True
      elif char == 'FR':
        classDayNums.append(4)
        if dayOfWeek == 4: classOnFirstDay = True
      else:
        # char is something foreign
        break
      i = i + 1
      classDaysString += day + ", "
    if i == 0:
      logging.warning("class days is empty")
      return

    # chop off erroneous comma
    classDaysString = classDaysString[:-2]

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

    # logging for debugging
    logging.warning("Class Start " + classStartTime.isoformat())
    logging.warning("Class End " + classEndTime.isoformat())


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
        'RRULE:FREQ=WEEKLY;BYDAY=' + classDaysString + ';UNTIL=' + classEndDate.strftime("%Y%m%dT") + '235900Z',
      ]
    }

    courseInfo = {
      'event': event,
      'days': classDays
    }
    
    return courseInfo

def createCal(datestring):

    # determine semester
    semester = ""
    month = int(datestring[:2])
    if month == 1:
      semester = "W"
    elif month == 9:
      semester = "F"
    elif month == 5:
      semester = "SP"
    else:
      semester = "SU"
    semester += datestring[8:] # 01/23/2012 -> <W,F,SP,SU>12

    # create the courses calendar
    calendar = {
      'summary': 'Courses ' + semester,
      'timeZone': 'America/New_York'
    }
    return calendar

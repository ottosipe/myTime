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

    logging.warning("start time is " + startTime)
    logging.warning("end time is " + endTime)

    startHour = int(startTime[0:2])
    if (startTime[-2:] == "PM"):
      startHour += 12

    endHour = int(endTime[0:2])
    if (endTime[-2:] == "PM" and endHour != 12):
      endHour += 12

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
    i = 0
    logging.warning(len(classDays))
    for day in classDays:
      if day == 'MO':
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
      elif day == 'FR':
        classDayNums.append(4)
        if dayOfWeek == 4: classOnFirstDay = True
      else:
        # char is something foreign
        break
      i = i + 1
      classDaysString += day + ","
    if i == 0:
      logging.warning("class days is empty")
      # ONLY FOR DEBUG
      classDaysString = "FR,"
      classDayNums.append(4)
      # return

    # chop off erroneous comma
    classDaysString = classDaysString[:-1]

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
      classEndTime = classEndTime.replace(day=classStartTime.day)

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
      'days': classDaysString
    }

    return courseInfo

def createCal():

    # determine semester
    semester = ""
    today = datetime.date.today()
    month = today.month
    if month == 11 or month == 12 or month == 1 or month == 2 or month == 3:
      semester = "W"
    elif month >= 6 and month <= 10:
      semester = "F"
    elif month == 4 or month == 5:
      semester = "SP"
    else:
      # will never trigger right now
      semester = "SU"
    semester += (str(today.year))[2:] # 01/23/2012 -> <W,F,SP,SU>12

    # create the courses calendar
    calendar = {
      'summary': 'Courses ' + semester,
      'timeZone': 'America/New_York'
    }
    return calendar

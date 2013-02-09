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
        if i < (len(classDaysInfo) - 1) && classDaysInfo[i+1] == 'H':
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

    return event

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

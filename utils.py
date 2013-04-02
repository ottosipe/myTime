import os
import webapp2
import logging
import json
import datetime
import time

# for adding and deleting user specific courses

def createClassEvent(info):
    logging.warning(info)

    if not isinstance(info, dict):
      info = info.to_dict()

    # change time format i.e. 9:00 AM -> 2011-06-03T09:00:00.000-05:00
    startDateArr = info["start"].split("/")
    endDateArr = info["end"].split("/")

    startTimeArr = info["start_time"].split(":")
    endTimeArr = info["end_time"].split(":")

    startHour = int(startTimeArr[0])
    if (startTimeArr[1][-2:] == "PM" and startHour != 12):
      startHour += 12

    endHour = int(endTimeArr[0])
    if (endTimeArr[1][-2:] == "PM" and endHour != 12):
      endHour += 12

    classStartTime = datetime.datetime(int(startDateArr[2]), int(startDateArr[0]), int(startDateArr[1]),
      startHour, int(startTimeArr[1][0:2]), 0)
    classEndTime = classStartTime.replace(hour=endHour, minute=int(endTimeArr[1][0:2]))
    classEndDate = datetime.datetime(int(endDateArr[2]), int(endDateArr[0]), int(endDateArr[1]))

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
    logging.warning("class days string is " + classDaysString)

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
      'location': info["location"],
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

def createReminderEvent(info):
  # assumes info is well formatted

  logging.warning(info)

  if not isinstance(info, dict):
      info = info.to_dict()

  date = info["date"]
  start_time = info["start_time"]
  end_time = info["end_time"]

  start_time_arr = start_time.split(":")
  end_time_arr = end_time.split(":")

  startHour = int(start_time_arr[0])

  if start_time[-2:] == "PM" and startHour != 12 :
    startHour += 12

  endHour = int(end_time_arr[0])

  if end_time[-2:] == "PM" and endHour != 12 :
    endHour += 12

  dateArray = date.split("/")
  startTime = datetime.datetime(int("20" + dateArray[2]), int(dateArray[0]), int(dateArray[1]),
      startHour, int(start_time_arr[1][0:2]), 0)
  endTime = startTime.replace(hour=endHour, minute=int(end_time_arr[1][0:2]))

  logging.warning(startTime)
  logging.warning(endTime)

  # create the calendar event
  summary = ""
  if info["course_str"] != "":
    summary += info["course_str"] + ": "
  event = {
    'summary': summary + info["title"],
    'start': {
      'dateTime': startTime.isoformat(),
      'timeZone': 'America/New_York'
    },
    'end': {
      'dateTime' : endTime.isoformat(),
      'timeZone': 'America/New_York'
    }
  }

  return event


def createCal():

    calendar = {
      'summary': 'myTime',
      'timeZone': 'America/New_York'
    }

    return calendar

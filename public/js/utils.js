$(function() {
	window.utils = {
		dateFormat:function(timeString) {
			var splitIndex = timeString.indexOf("-");
			var startTime = timeString.substring(0, splitIndex);
			var endTime = timeString.substring(splitIndex+1, timeString.length - 2);
			var meridiem = timeString.substring(timeString.length - 2);

			var startMin, startHour, endMin, endHour;
			if (startTime.length == 1) {
				startHour = "0" + startTime;
				startMin = "00";
			} else if (startTime.length == 2) {
				startHour = startTime;
				startMin = "00";
			} else if (startTime.length == 3) {
				startHour = "0" + (startTime[0]);
				startMin = (startTime.substring(1));
			} else if (startTime.length == 4) {
				startHour = (startTime.substring(0,2));
				startMin = (startTime.substring(2));
			}

			if (endTime.length == 1) {
				endHour = "0" + endTime;
				endMin = "00";
			} else if (endTime.length == 2) {
				endHour = (endTime);
				endMin = "00";
			} else if (endTime.length == 3) {
				endHour = "0" + (endTime[0]);
				endMin = (endTime.substring(1));
			} else if (endTime.length == 4) {
				endHour = (endTime.substring(0,2));
				endMin = (endTime.substring(2));
			}

			var startTimeCorrect, endTimeCorrect;
			if (meridiem === "AM") {
				startTimeCorrect = startHour + ":" + startMin + " AM";
				endTimeCorrect = endHour + ":" + endMin + " AM";
			} else {
				if (parseInt(startHour) > parseInt(endHour) || parseInt(endHour) == 12) {
					// first time is actually AM
					startTimeCorrect = startHour + ":" + startMin + " AM";
				} else {
					startTimeCorrect = startHour + ":" + startMin + " PM";
				}
				endTimeCorrect = endHour + ":" + endMin + " PM";
			}

			var times = {
				start: startTimeCorrect, 
				end: endTimeCorrect
			};
			return times;
		},
		daysFormat:function(daysString) {
			var days = [];
			if (daysString.length == 2 && (daysString == "MO" ||
										   daysString == "TU" ||
										   daysString == "WE" ||
										   daysString == "TH" ||
										   daysString == "FR")) {
				days.push(daysString);
			} else if (daysString.indexOf(',') != -1) {
				days = daysString.split(',');
			} else {
				for (var i = 0; i < daysString.length; i++) {
					var c = daysString[i];
					if (c === 'M') {
						days.push("MO");
					} else if (c === 'T') {
						if (i != (daysString.length - 1) && daysString[i+1] === 'H') {
							// actually thursday
							days.push("TH");
						} else {
							// tuesday
							days.push("TU");
						}
					} else if (c === 'W') {
						days.push("WE");
					} else if (c === 'F') {
						days.push("FR");
					}
				}
			}

			return days;
		},
		getReminderTitle:function(titleString) {
			console.log(titleString)
			var class_title = "";
			var dash = titleString.indexOf("-");
			if (dash > 1) {
				class_title = titleString.substring(0, dash - 1);
			}
			return class_title;
		},
		isInPast:function(dateStr, timeStr) {
			// check that a string and date are in the past
			// NOT Y3K friendly :(
			if(!dateStr || !timeStr) return false;
			console.log(dateStr, timeStr);
			var split 	= dateStr.split("/");
			var month 	= parseInt(split[0]) - 1;
			var day 	= parseInt(split[1]);
			var year 	= parseInt(split[2]) + 2000;

			split 		= timeStr.split(":");
			var hours	= parseInt(split[0]);
			split 		= split[1].split(" ");
			var minutes = parseInt(split[0]);
			var am_pm 	= split[1];

			// check hours so noon != 24
			if(am_pm == "PM" && hours != 12) hours = (hours + 12);
			if(am_pm == "AM" && hours == 12) hours = 0;
			var now = new Date();

			var check = new Date(year, month, day, hours, minutes);

			console.log(check.toDateString(), check.toLocaleTimeString());
			console.log(now.toDateString(), now.toLocaleTimeString());

			return check < now;
		}
	}; 
});
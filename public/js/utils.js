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

			var times = [startTimeCorrect, endTimeCorrect];
			return times;
		},
		daysFormat:function(daysString) {
			var days = [];
			for (var i = 0; i < daysString.length; i++) {
				var c = daysString[i];
				if (c === 'M') {
					days.push("MO");
				} else if (c === 'T') {
					if (i != (daysString.length - 1) && days[i+1] === 'H') {
						// actually thursday
						days.push("TH");
					} else {
						// tuesday
						days.push("TU");
					}
				} else if (c === 'W') {
					days.push("WE");
				} else if (c === 'F') {
					days.push("FF");
				}
			}

			return days;
		}
	}; 
});
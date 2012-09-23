var ONE_DAY = 1000 * 60 * 60 * 24;

Date.prototype.date = function() {
	var d = this;
	['Hours', 'Minutes', 'Seconds', 'Milliseconds'].forEach(function(w) {
		d['set' + w](0);
	})
	return d;
}

function estimateMiles(leaseLengthMonths, milesPerYear) {
	var milesPerLease = leaseLengthMonths / 12 * milesPerYear;
	return {
		perLease: milesPerLease,
		perYear: milesPerYear,
		perMonth: milesPerYear / 12,
		perWeek: milesPerYear / 52,
		perDay: milesPerYear / 365,
	};
}

var LeaseInfo = {
	leaseStart: new Date(2012, 8, 8),
	leaseLength: 36,
	milesPerYear: 12000,
}

function estimateMilesOn(aDate, leaseInfo, estimatedMiles) {
	var aDate = aDate.date(),
	    today = (new Date()).date();
	
	var estimate = estimatedMiles || estimateMiles(LeaseInfo.leaseLength, LeaseInfo.milesPerYear)
	var days = Math.floor((aDate - leaseInfo.leaseStart) / ONE_DAY);

	var expected = estimate.perDay * days;
	return expected;
}

function getDateRange(aroundDate, leaseInfo) {
	var center = aroundDate || (new Date()).date(),
	start = center - (2 * ONE_DAY);
	if (start < leaseInfo.leaseStart) {
		start = leaseInfo.leaseStart;
	}
	// TODO: also detect lease end.

	var stack = [], estimate = estimateMiles(leaseInfo.leaseStart, leaseInfo.milesPerYear);
	for(var i = 0; i < 5; i++) {
		var day = { day: (new Date(start + (i * ONE_DAY))).date() };
		var diff = aroundDate - day.day;
		day.type = diff == 0 ? 'current info' 
			: diff > 0 ? 'past' : 'future';
		var onDay = estimateMilesOn(day.day, leaseInfo, estimate);
		day.estimate = onDay;
		stack.push(day);
	}

	return stack;
}

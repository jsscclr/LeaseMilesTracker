var ONE_DAY = 1000 * 60 * 60 * 24;


/*
Date.uParse = function(stringDate) {
	if (!stringDate) {
		// alert('invalid input');
		return new Date();
	}

	// on iOS 5 Date.parse('2012-10-01') == NaN
	var d = Date.parse(stringDate);
	if (isNaN(d)) {
		// alert('isNaN');
		// assuming ISO format
		var dp = stringDate.split('-');
		return new Date(parseInt(dp[0], 10), parseInt(dp[1], 10)-1, parseInt(dp[2], 10));
	} else {
		// alert('good date: ' + stringDate + ': ' + d);
		// stringDate would be something like '2012-10-01'
		// but this is in locale format so in CDT would be '2012-09-30 19:00'
		d = new Date(d);
		return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
	}
}
*/

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)')
                    .exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
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

function estimateMilesOn(aDate, leaseInfo, estimatedMiles) {
	var leaseStart = moment(leaseInfo.leaseStart)
	var estimate = estimatedMiles || estimateMiles(LeaseInfo.leaseLength, LeaseInfo.milesPerYear)
	var days = aDate.diff(leaseStart, 'days')

	var expected = estimate.perDay * days;
	return expected;
}

function getDayRange(aroundDate, leaseInfo) {
	var center = moment(aroundDate).startOf('day'),
	    start = center.clone().subtract('days', 2),
	    leaseStart = moment(leaseInfo.leaseStart);
	if (start.diff(leaseStart, 'days') < 0) {
		start = leaseStart
	}
	// TODO: also detect lease end.

	var stack = [], estimate = estimateMiles(leaseInfo.leaseLength, leaseInfo.milesPerYear);
	for(var i = 0; i < 5; i++) {
		var day = { day: start.clone().add('days', i) }
		var diff = center.diff(day.day, 'days');
		day.type = diff == 0 ? 'current info' 
			: diff < 0 ? 'past' : 'future';
		var onDay = estimateMilesOn(day.day, leaseInfo, estimate);
		day.estimate = onDay;
		stack.push(day);
	}

	return stack;
}


function getMonthRange(aroundDate, leaseInfo) {
}


var LeaseInfo = {
	leaseStart: moment('2012-09-08'),
	leaseLength: 36,
	milesPerYear: 12000,
	milesPerYearShort: '12k',
};

(function (leaseObject, leaseStartParam, leaseLengthParam, milesParam) {
	var date = getParameterByName(leaseStartParam);
	if (date) {
		leaseObject.leaseStart = moment(date)
	}
	var length = getParameterByName(leaseLengthParam);
	if (length) {
		leaseObject.leaseLength = parseInt(length, 10);
	}
	var miles = parseInt(getParameterByName(milesParam));
	if (miles) {
		if (miles < 1000) {
			leaseObject.milesPerYear = miles * 1000;
			leaseObject.milesPerYearShort = miles + 'k';
		} else {
			leaseObject.milesPerYear = miles;
			leaseObject.milesPerYearShort = (miles % 1000) + 'k';
		}
	}
})(LeaseInfo, 'd', 'l', 'm');



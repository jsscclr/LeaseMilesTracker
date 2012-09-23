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

function estimateMilesOn(aDate, leaseInfo) {
	var aDate = aDate.date(),
	    today = (new Date()).date();
	
	var estimate = estimateMiles(LeaseInfo.leaseLength, LeaseInfo.milesPerYear)
	var days = Math.floor((aDate - LeaseInfo.leaseStart) / ONE_DAY);

	var expected = estimate.perDay * days;
	return expected;
}


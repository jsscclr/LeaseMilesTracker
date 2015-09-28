var UNITS_AROUND = 2;
function hideAddressBar() {
	window.scrollTo(0, 1);
}

function w(what) {
	document.write(what)
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)')
                    .exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function g(where) {
	var newQS = window.location.search.replace(/t=./, '');
	newQS += '&t=' + where;
	newQS = newQS.replace('&&', '&');
	document.location = newQS;
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


function buildForRange(opt) {
	var units = opt.unit + 's';
	var center = moment(opt.aroundDate).startOf('day'),
	    start = center.clone().subtract(units, UNITS_AROUND), //.endOf(opt.unit),
	    leaseStart = moment(opt.leaseInfo.leaseStart);
	if (start.diff(leaseStart, units) < 0) {
		start = leaseStart
	}
	// TODO: also detect lease end.

	var dayStrategy = opt.dayStrategy || function(date, incr) {
		return date.clone().add(units, incr);
	}

	var stack = [], estimate = estimateMiles(opt.leaseInfo.leaseLength, opt.leaseInfo.milesPerYear);
	for(var i = 0; i < (2 * UNITS_AROUND + 1); i++) {
		var day = { day: dayStrategy(start, i) }
		var diff = center.diff(day.day, units);
		day.type = diff == 0 ? 'current info' 
			: diff > 0 ? 'past' : 'future';
		var onDay = estimateMilesOn(day.day, opt.leaseInfo, estimate);
		day.estimate = onDay;
		stack.push(day);
	}

	return stack;
}

function ranger(type) {
	return {
		d: getDayRange,
		w: getWeeklyRange,
		m: getMonthEndRange,
		// me: getMonthEndRange,
	}[type];
}

function nmap(type) {
	return { 
		d: 'Daily',
		w: 'Weekly',
		m: 'Monthly',
	}[type];
}

function getDayRange(aroundDate, leaseInfo) {
	return buildForRange({
		unit: 'day',
		aroundDate: aroundDate,
		leaseInfo: leaseInfo,
	})
}

function getWeeklyRange(aroundDate, leaseInfo) {
	return buildForRange({
		unit: 'week',
		aroundDate: aroundDate,
		leaseInfo: leaseInfo,
		dayStrategy: function(start, incr) {
			var end = start.clone().add('weeks', incr)
			var wd = end.toDate().getDay();
			end.add('days', 6 - wd);
			console.log('for %s + %d end is %s (wd=%d)', start.toString(), incr, end.toString(), wd);
			return end;
		}
	})
}

function getMonthRange(aroundDate, leaseInfo) {
	return buildForRange({
		unit: 'month',
		aroundDate: aroundDate,
		leaseInfo: leaseInfo,
	})
}

function getMonthEndRange(aroundDate, leaseInfo) {
	return buildForRange({
		unit: 'month',
		aroundDate: aroundDate,
		leaseInfo: leaseInfo,
		dayStrategy: function(start, incr) {
			return start.clone().add('months', incr).endOf('month');
		}
	})
}

var LeaseInfo = {
	leaseStart: moment('2012-09-08'),
	leaseLength: 36,
	milesPerYear: 12000,
	milesPerYearShort: '12k',
};

var TODAY;
function writeLeaseTable() {
	var d = document,
	tbody = d.querySelector('#miles tbody'),
	ce = function(el) { return d.createElement(el) },
	cn = function(el,txt) { var e = ce(el), x = d.createTextNode(txt); e.appendChild(x); return e }
	targetDate = getParameterByName('@');
	var paintItBlack = function() {
		today = targetDate ? moment(targetDate).startOf('day') : moment().startOf('day'),
		console.log('painting for ', today);
		rangeF = ranger(MODE),
		miles = rangeF(today, LeaseInfo);
		// first remove all children
		while(tbody.firstChild) {
			tbody.removeChild(tbody.firstChild);
		}
		miles.forEach(function(m) {

			var tr = ce('tr'),
			td = ce('td'),
			attr = d.createAttribute('class');
			attr.value = m.type;
			tr.setAttributeNode(attr);
			txt = d.createTextNode();
			tr.appendChild(cn('td', m.day.toDate().toDateString()));
			tr.appendChild(cn('td', Math.floor(m.estimate) + ' miles'));
			tbody.appendChild(tr);
		})
	}
	return paintItBlack;
}

;(function (leaseObject, leaseStartParam, leaseLengthParam, milesParam) {
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
})(LeaseInfo, 's', 'l', 'm');



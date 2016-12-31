const solstice = require('astronomia/lib/solstice')
const julian = require('astronomia/lib/julian')
const moonphase = require('astronomia/lib/moonphase')

var Solar = {}
// yearly events, in order
Solar.EVENTS = ['vernal equinox', 'summer solstice', 'autumnal equinox', 'winter solstice']
Solar.CODES = {
  'vernal equinox': 'VE',
  'summer solstice': 'SS',
  'autumnal equinox': 'AE',
  'winter solstice': 'WS'
}
Solar.equinox = {
  vernal: wrapJDE(solstice.march),
  autumnal: wrapJDE(solstice.september)
}
Solar.solstice = {
  summer: wrapJDE(solstice.june),
  winter: wrapJDE(solstice.december)
}

// Calculates the date for the nearest upcoming equinox or solstice
// relative to the given Date.
// Returns [eventName, date] ex: `['winter solstice', Date(...)]`
Solar.soonest = function (date, year) {
  if (!date) date = new Date()
  if (!year) year = date.getFullYear()
  var eventDates = Solar.EVENTS.map(function (event) {
    var terms = event.split(' ')
    return Solar[terms[1]][terms[0]](year)
  })
  var upcoming = eventDates.map(function (eventDate) {
    return (date.getTime() - eventDate.getTime()) < 0
  })
  var soonestIndex = upcoming.indexOf(true)
  if (soonestIndex < 0) {
    // if all events this year have already passed
    // check against next year
    return Solar.soonest(date, year + 1)
  } else {
    var soonest = [Solar.EVENTS[soonestIndex], eventDates[soonestIndex]]
    return soonest
  }
}

// Returns the date of the most recent equinox or solstice
Solar.recent = function (date, year) {
  if (!date) date = new Date()
  if (!year) year = date.getFullYear()
  var eventDates = Solar.EVENTS.map(function (event) {
    var terms = event.split(' ')
    return Solar[terms[1]][terms[0]](year)
  })
  var past = eventDates.map(function (eventDate) {
    return (date.getTime() - eventDate.getTime()) > 0
  }).reverse()
  var recentIndex = past.length - past.indexOf(true) - 1
  if (recentIndex === past.length) {
    // if all events this year have yet to occur
    // check against last year
    return Solar.recent(date, year - 1)
  } else {
    var recent = [Solar.EVENTS[recentIndex], eventDates[recentIndex]]
    return recent
  }
}

var Lunar = {}
Lunar.EVENTS = ['new', 'first', 'full', 'last']
Lunar.CODES = {
  'new': 'NEW',
  'first': 'FIRST',
  'full': 'FULL',
  'last': 'LAST'
}
Lunar.new = wrapYearFraction(moonphase.new)
Lunar.first = wrapYearFraction(moonphase.first)
Lunar.full = wrapYearFraction(moonphase.full)
Lunar.last = wrapYearFraction(moonphase.last)

Lunar.soonest = function (date) {
  if (!date) date = new Date()
  var eventDates = Lunar.EVENTS.map(function (event) {
    return Lunar[event](date)
  })
  var upcoming = eventDates.map(function (eventDate) {
    return date.getTime() - eventDate.getTime()
  })
  var soonest = upcoming.reduce(function (a, b) {
    if (a > 0) return b
    if (b > 0) return a
    return Math.max(a, b)
  })
  var soonestIndex = upcoming.indexOf(soonest)
  if (soonest > 0) {
    // if all events this month have already passed
    // check against next month
    date.setMonth(date.getMonth() + 1)
    return Lunar.soonest(date)
  } else {
    return [Lunar.EVENTS[soonestIndex], eventDates[soonestIndex]]
  }
}

Lunar.recent = function (date, month) {
  if (!date) date = new Date()
  var eventDates = Lunar.EVENTS.map(function (event) {
    return Lunar[event](date)
  })
  var past = eventDates.map(function (eventDate) {
    return date.getTime() - eventDate.getTime()
  })
  var recent = past.reduce(function (a, b) {
    if (a < 0) return b
    if (b < 0) return a
    return Math.min(a, b)
  })
  var recentIndex = past.indexOf(recent)
  if (recent < 0) {
    // if all events this year have yet to occur
    // check against last year
    date.setMonth(date.getMonth() - 1)
    return Lunar.recent(date)
  } else {
    return [Lunar.EVENTS[recentIndex], eventDates[recentIndex]]
  }
}

// Wrapper for solstice functions that return JDE.
// Returns the function's result as a Date.
// If no year is provided, wrapJDE assumes the current year.
function wrapJDE (func) {
  return function (year) {
    if (!year) year = (new Date()).getFullYear()
    var jde = func(year)
    return julian.JDEToDate(jde)
  }
}

const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000

// Returns a date as a year and a decimal fraction,
// ex: 2016.25
function wrapYearFraction (func) {
  return function (date) {
    if (!date) date = new Date()
    var year = date.getFullYear()
    var yearStart = new Date(year, 0)
    var elapsed = date.getTime() - yearStart.getTime()
    var fraction = elapsed / YEAR_IN_MS
    var jde = func(year + fraction)
    return julian.JDEToDate(jde)
  }
}

module.exports = {
  solar: Solar,
  lunar: Lunar
}

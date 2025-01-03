import { JDEToDate } from 'astronomia/lib/julian'

// approx duration of a year
const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000

// This function converts a Date like '2016-06-19T12:06:30.806Z'
// to a Number like '2016.25'
//
// Astronomia functions accept integer years
// but can also process intra-year dates
// by adding the fraction of the year which has elapsed
// to the year's integer value.
function dateToYearFraction (date) {
  var year = date.getFullYear()
  var yearStart = new Date(year, 0)
  var elapsed = date.getTime() - yearStart.getTime()
  var fraction = elapsed / YEAR_IN_MS
  return (year + fraction)
}

// Wrapper for astronomia functions
// which only accept integer years
// but can process arbitrary dates.
// Returns a function which accepts a Date
// and returns the wrapped function's result as a Date
function wrapAstro (func) {
  return function (date) {
    if (!date) date = new Date()
    var yearFraction = dateToYearFraction(date)
    var jde = func(yearFraction)
    return JDEToDate(jde)
  }
}

// Accepts an object describing
// the lookups for event names to their short codes.
// Returns a function which accepts an event name and date
// and returns an object describing the object
// as `{ code: '...', date: Date, name: '...' }`
function codesToEventMaker (codes) {
  return function (name, date) {
    // calculate days-til-event, for `code` value
    var timeTil = (date.getTime() - Date.now())
    var daysTil = timeTil / 1000 / 60 / 60 / 24
    var sign = (timeTil > 0) ? '-' : '+'
    return {
      code: [codes[name], sign, Math.round(Math.abs(daysTil))].join(''),
      date: date,
      name: name
    }
  }
}

export { YEAR_IN_MS, dateToYearFraction, wrapAstro, codesToEventMaker }

const util = require('./util')
const solstice = require('astronomia/lib/solstice')

var solar = {}

// yearly events, in order
solar.EVENTS = ['vernal equinox', 'summer solstice', 'autumnal equinox', 'winter solstice']

// lookup table, event name to short code
solar.CODES = {
  'vernal equinox': 'VE',
  'summer solstice': 'SS',
  'autumnal equinox': 'AE',
  'winter solstice': 'WS'
}

// wrapped astronomia functions
solar.equinox = {
  vernal: util.wrapAstro(solstice.march),
  autumnal: util.wrapAstro(solstice.september)
}
solar.solstice = {
  summer: util.wrapAstro(solstice.june),
  winter: util.wrapAstro(solstice.december)
}

// convenience function to return all solar events
// relative to a given Date
// in the same order as solar.EVENTS
solar.events = function (date) {
  return solar.EVENTS.map(function (name) {
    var terms = name.split(' ')
    return toSolarEvent(name, solar[terms[1]][terms[0]](date))
  })
}

// initialize formatting helper
var toSolarEvent = util.codesToEventMaker(solar.CODES)

// Calculates the date for the nearest upcoming equinox or solstice
// relative to the given Date.
// Returns [eventName, date] ex: `['winter solstice', Date(...)]`
solar.soonest = function (date) {
  if (!date) date = new Date()
  // get events relative to the year's start,
  // because astronomia solar can't handle decimals
  var events = solar.events(new Date(date.getFullYear(), 0))
  // include events from the next year, in case of dates after yule
  // but before the new year
  events = events.concat(solar.events(new Date(date.getFullYear() + 1, 0)))
  var upcoming = events.map(function (event) {
    return date.getTime() - event.date.getTime()
  })
  var soonest = upcoming.reduce(function (a, b) {
    if (a > 0) return b
    if (b > 0) return a
    return Math.max(a, b)
  })
  var soonestIndex = upcoming.indexOf(soonest)
  return events[soonestIndex]
}

// Returns the date of the most recent equinox or solstice
solar.recent = function (date) {
  if (!date) date = new Date()
  // get events relative to the year's start,
  // because astronomia solar can't handle decimals
  var events = solar.events(new Date(date.getFullYear(), 0))
  // include events from the last year, in case of dates before beltane
  // but after the new year
  events = events.concat(solar.events(new Date(date.getFullYear() - 1, 0)))
  var past = events.map(function (event) {
    return date.getTime() - event.date.getTime()
  })
  var recent = past.reduce(function (a, b) {
    if (a < 0) return b
    if (b < 0) return a
    return Math.min(a, b)
  })
  var recentIndex = past.indexOf(recent)
  return events[recentIndex]
}

module.exports = solar

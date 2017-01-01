const util = require('./util')
const moonphase = require('astronomia/lib/moonphase')

var lunar = {}

// phases of the moon, in order
lunar.EVENTS = ['new', 'first', 'full', 'last']

// lookup table, phase name to short code
lunar.CODES = {
  'new': 'NEW',
  'first': 'FIRST',
  'full': 'FULL',
  'last': 'LAST'
}

// wrapped astronomia functions
lunar.new = util.wrapAstro(moonphase.new)
lunar.first = util.wrapAstro(moonphase.first)
lunar.full = util.wrapAstro(moonphase.full)
lunar.last = util.wrapAstro(moonphase.last)

// convenience function to return all lunar events
// relative to a given Date
// in the same order as lunar.EVENTS
lunar.events = function (date) {
  return lunar.EVENTS.map(function (name) {
    return toLunarEvent(name, lunar[name](date))
  })
}

// initialize formatting helper
var toLunarEvent = util.codesToEventMaker(lunar.CODES)

// Calculates the date for the nearest upcoming lunar event
// relative to the given Date.
// Returns [eventName, date] ex: `['winter solstice', Date(...)]`
lunar.soonest = function (date) {
  if (!date) date = new Date()
  var events = lunar.events(date)
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

// Calculates the date for the most recent lunar event
// relative to the given Date.
// Returns [eventName, date] ex: `['winter solstice', Date(...)]`
lunar.recent = function (date, month) {
  if (!date) date = new Date()
  // grab events relative to half a lunar month ago
  // cuz we're looking for the most recent,
  // but astronomia only seeks for soonest
  var priorLunarMonth = new Date(date.getTime())
  priorLunarMonth.setDate(date.getDate() - (moonphase.meanLunarMonth / 2))
  var events = lunar.events(priorLunarMonth)
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

module.exports = lunar

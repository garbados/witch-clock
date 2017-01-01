#!/usr/bin/env node

var program = require('commander')
var witch = require('../lib')
var pkg = require('../package.json')

function eventToShortCode (codes, event) {
  var code = codes[event[0]]
  var date = new Date(event[1])
  var daysTil = (date.getTime() - Date.now()) / 1000 / 60 / 60 / 24
  var sep = (daysTil < 0) ? '+' : ''
  return [code, Math.floor(-daysTil)].join(sep)
}

var toLunar = eventToShortCode.bind(null, witch.lunar.CODES)
var toSolar = eventToShortCode.bind(null, witch.solar.CODES)

program
.version(pkg.version)
.usage('[date]')
.option('-v, --verbose', 'display additional information')
.option('-j, --json', 'display dates as JSON')
.parse(process.argv)

var date = program.args[0] ? new Date(program.args[0]) : new Date() // TODO accept argv[1] as date
var events = {
  solar: {
    soonest: witch.solar.soonest(date),
    recent: witch.solar.recent(date)
  },
  lunar: {
    soonest: witch.lunar.soonest(date),
    recent: witch.lunar.recent(date)
  }
}

var eventDetails = {}
Object.keys(events).forEach(function (eventType) {
  eventDetails[eventType] = {}
  Object.keys(events[eventType]).forEach(function (funcType) {
    var event = events[eventType][funcType]
    var details = {
      code: eventToShortCode(witch[eventType].CODES, event),
      name: event[0],
      date: event[1]
    }
    eventDetails[eventType][funcType] = details
  })
})

if (program.json) {
  console.log(JSON.stringify(eventDetails))
} else {
  var toPrint = []
  Object.keys(events).forEach(function (eventType) {
    Object.keys(events[eventType]).forEach(function (funcType) {
      var detail = eventDetails[eventType][funcType]
      if (program.verbose) {
        console.log(detail.code, '|', detail.name, '@', detail.date)
      } else {
        toPrint.push(detail.code)
      }
    })
  })
  if (toPrint.length) console.log(toPrint.join(', '))
}
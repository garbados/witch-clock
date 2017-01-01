#!/usr/bin/env node

var program = require('commander')
var witch = require('../lib')
var pkg = require('../package.json')

program
.version(pkg.version)
.usage('[date]')
.option('-v, --verbose', 'display additional information')
.option('-j, --json', 'display dates as JSON')
.parse(process.argv)

var date = program.args[0] ? new Date(program.args[0]) : new Date() // TODO accept argv[1] as date
var events = witch.events(date)
if (program.json) {
  console.log(JSON.stringify(events))
} else {
  var flatEvents = []
  ;['solar', 'lunar'].forEach(function (group) {
    ['soonest', 'recent'].forEach(function (type) {
      flatEvents.push(events[group][type])
    })
  })

  if (program.verbose) {
    flatEvents.forEach(function (event) {
      console.log(event.code, '|', event.name, '@', event.date)
    })
  } else {
    var toPrint = flatEvents.map(function (event) {
      return event.code
    }).join(', ')
    console.log(toPrint)
  }
}

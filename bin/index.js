#!/usr/bin/env node

var program = require('commander')
var witch = require('../lib')
var pkg = require('../package.json')

function eventToShortCode (codes, event) {
  var code = codes[event[0]]
  var daysTil = (event[1].getTime() - Date.now()) / 1000 / 60 / 60 / 24
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
var solarFuncs = [witch.solar.soonest, witch.solar.recent]
var lunarFuncs = [witch.lunar.soonest, witch.lunar.recent]
if (program.json) {
  var events = {
    solar: {
      soonest: toSolar(witch.solar.soonest(date)),
      recent: toSolar(witch.solar.recent(date))
    },
    lunar: {
      soonest: toLunar(witch.lunar.soonest(date)),
      recent: toLunar(witch.lunar.recent(date))
    }
  }
  console.log(JSON.stringify(events))
} else if (program.verbose) {
  solarFuncs.forEach(function (solarFunc) {
    var event = solarFunc(date)
    var code = toSolar(event)
    console.log(code, '@', event[1])
  })

  lunarFuncs.forEach(function (lunarFunc) {
    var event = lunarFunc(date)
    var code = toLunar(event)
    console.log(code, '@', event[1])
  })
} else {
  var codes = []
  solarFuncs.forEach(function (solarFunc) {
    var event = solarFunc(date)
    var code = toSolar(event)
    codes.push(code)
  })

  lunarFuncs.forEach(function (lunarFunc) {
    var event = lunarFunc(date)
    var code = toLunar(event)
    codes.push(code)
  })

  console.log(codes.join(', '))
}

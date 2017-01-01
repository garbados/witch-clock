/* global describe, it */

const assert = require('assert')
const witch = require('../lib')

const DATES = {
  january: {
    date: new Date('1984-01-16T08:00:00.000Z'),
    solar: {
      soonest: new Date('1984-03-20T10:24:08.303Z'),
      recent: new Date('1983-12-22T10:30:14.609Z')
    },
    lunar: {
      soonest: new Date('1984-01-18T14:05:01.986Z'),
      recent: new Date('1984-01-11T09:48:10.720Z')
    }
  },
  april: {
    date: new Date('1996-04-04T08:00:00.000Z'),
    solar: {
      soonest: new Date('1996-06-21T02:23:36.970Z'),
      recent: new Date('1996-03-20T08:03:13.077Z')
    },
    lunar: {
      soonest: new Date('1996-04-10T23:35:45.065Z'),
      recent: new Date('1996-04-04T00:06:57.695Z')
    }
  },
  august: {
    date: new Date('1988-08-16T08:00:00.000Z'),
    solar: {
      soonest: new Date('1988-09-22T19:29:17.239Z'),
      recent: new Date('1988-06-21T03:56:25.693Z')
    },
    lunar: {
      soonest: new Date('1988-08-20T15:51:24.005Z'),
      recent: new Date('1988-08-12T12:30:55.459Z')
    }
  },
  november: {
    date: new Date('2016-11-08T08:00:00.000Z'),
    solar: {
      soonest: new Date('2016-12-21T10:44:19.494Z'),
      recent: new Date('2016-09-22T14:21:01.044Z')
    },
    lunar: {
      soonest: new Date('2016-11-14T13:52:07.499Z'),
      recent: new Date('2016-11-07T19:51:18.672Z')
    }
  }
}

describe('witch-clock', function () {
  describe('solar', function () {
    it('soonest', function () {
      Object.keys(DATES).forEach(function (month) {
        var date = DATES[month].date
        var answer = DATES[month].solar.soonest
        var event = witch.solar.soonest(date)
        assert.equal(answer.getTime(), event.date.getTime())
      })
    })

    it('recent', function () {
      Object.keys(DATES).forEach(function (month) {
        var date = DATES[month].date
        var answer = DATES[month].solar.recent
        var event = witch.solar.recent(date)
        assert.equal(answer.getTime(), event.date.getTime())
      })
    })
  })

  describe('lunar', function () {
    it('soonest', function () {
      Object.keys(DATES).forEach(function (month) {
        var date = DATES[month].date
        var answer = DATES[month].lunar.soonest
        var event = witch.lunar.soonest(date)
        assert.equal(answer.getTime(), event.date.getTime())
      })
    })

    it('recent', function () {
      Object.keys(DATES).forEach(function (month) {
        var date = DATES[month].date
        var answer = DATES[month].lunar.recent
        var event = witch.lunar.recent(date)
        assert.equal(answer.getTime(), event.date.getTime())
      })
    })
  })
})

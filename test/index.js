/* global describe, it */

const assert = require('assert')
const witch = require('../lib')

describe('witch-clock', function () {
  describe('solar and lunar', function () {
    it('should report nearest events correctly', function () {
      const ANSWERS = {
        january: {
          solar: {
            soonest: [ 'vernal equinox', new Date('1984-03-20T10:24:08.303Z') ],
            recent: [ 'winter solstice', new Date('1983-12-22T10:30:14.609Z') ]
          },
          lunar: {
            soonest: [ 'full', new Date('1984-01-18T14:05:01.986Z') ],
            recent: [ 'first', new Date('1984-01-11T09:48:10.720Z') ]
          }
        },
        april: {
          solar: {
            soonest: [ 'summer solstice', new Date('1996-06-21T02:23:36.970Z') ],
            recent: [ 'vernal equinox', new Date('1996-03-20T08:03:13.077Z') ]
          },
          lunar: {
            soonest: [ 'last', new Date('1996-04-10T23:35:45.065Z') ],
            recent: [ 'full', new Date('1996-04-04T00:06:57.695Z') ]
          }
        },
        august: {
          solar: {
            soonest: [ 'autumnal equinox', new Date('1988-09-22T19:29:17.239Z') ],
            recent: [ 'summer solstice', new Date('1988-06-21T03:56:25.693Z') ]
          },
          lunar: {
            soonest: [ 'first', new Date('1988-08-20T15:51:24.005Z') ],
            recent: [ 'new', new Date('1988-08-12T12:30:55.459Z') ]
          }
        },
        november: {
          solar: {
            soonest: [ 'winter solstice', new Date('2016-12-21T10:44:19.494Z') ],
            recent: [ 'autumnal equinox', new Date('2016-09-22T14:21:01.044Z') ]
          },
          lunar: {
            soonest: [ 'full', new Date('2016-11-14T13:52:07.499Z') ],
            recent: [ 'first', new Date('2016-11-07T19:51:18.672Z') ]
          }
        }
      }

      // test dates against answers
      var dates = {
        january: new Date('1984-01-16T08:00:00.000Z'),
        april: new Date('1996-04-04T08:00:00.000Z'),
        august: new Date('1988-08-16T08:00:00.000Z'),
        november: new Date('2016-11-08T08:00:00.000Z')
      }

      Object.keys(dates).forEach(function (month) {
        var date = dates[month]

        if (ANSWERS[month] === undefined) {
          // for testing new dates
          console.log(month)
          console.log(date)
          console.log(witch.solar.soonest(date))
          console.log(witch.solar.recent(date))
          console.log(witch.lunar.soonest(date))
          console.log(witch.lunar.recent(date))
        } else {
          Object.keys(ANSWERS[month]).forEach(function (key) {
            Object.keys(ANSWERS[month][key]).forEach(function (funcName) {
              var answer = ANSWERS[month][key][funcName]
              var guess = witch[key][funcName](date)
              console.log()
              assert.equal(guess[0], answer[0])
              assert.equal(guess[1].getTime(), answer[1].getTime())
            })
          })
        }
      })
    })
  })
})

import { Moon } from 'lunarphase-js'
import { DAY_IN_MS, MEAN_LUNAR_MONTH, MONTHS, CORPSE, JESTER, NOMAD } from './constants.js'
import { mooninfo } from './phases.js'
import { getSeasons } from './seasons.js'
import { comesafter, comesbefore, firstwhich, lastwhich } from './utils.js'

// first, find the most recent winter solstice
// then, find the first new moon after it (year start)
// then, if you are before the first new moon, it's the corpse
// else, count lunar months since start

export function cycleinfo (datetime) {
  const nearbystarts = [-3, -2, -1, 0, 1].map(i => {
    const d = getSeasons(datetime.getFullYear() + i)[3]
    return new Date(d.getTime() + (mooninfo(d).rem * DAY_IN_MS))
  })
  const yearstart = lastwhich(nearbystarts, d => comesbefore(d, datetime))
  const yearend = firstwhich(nearbystarts, d => comesafter(d, yearstart))
  const monthsSoFar = (datetime - yearstart) / (MEAN_LUNAR_MONTH * DAY_IN_MS)
  const i = Math.floor(monthsSoFar)
  const monthsInYear = (yearend.getTime() - yearstart.getTime()) / (MEAN_LUNAR_MONTH * DAY_IN_MS)
  const month = MONTHS[i] || MONTHS[Math.ceil(monthsInYear) - 1]
  let nextMonth
  if (month === NOMAD) {
    const monthsRemaining = (yearend - datetime) / (MEAN_LUNAR_MONTH * DAY_IN_MS)
    nextMonth = (monthsRemaining > 1) ? CORPSE : JESTER
  } else {
    nextMonth = MONTHS[i + 1] || JESTER
  }
  const yearsince = (datetime.getTime() - yearstart.getTime()) / DAY_IN_MS
  const yeartil = (yearend.getTime() - datetime.getTime()) / DAY_IN_MS
  const p = Moon.lunarAgePercent(datetime)
  const d = Moon.lunarAge(datetime)
  const monthlength = d / p
  const e = monthlength - d
  const monthstart = new Date(datetime.getTime() - (d * DAY_IN_MS))
  const monthend = new Date(datetime.getTime() + (e * DAY_IN_MS))
  return {
    cycle: {
      start: [yearstart, yearsince],
      end: [yearend, yeartil]
    },
    month: {
      current: [month, monthstart, d],
      upcoming: [nextMonth, monthend, e]
    }
  }
}

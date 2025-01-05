import { solstice, moonphase } from 'astronomia'
import { meanSiderealYear } from 'astronomia/base'
import { JDEToDate, Calendar } from 'astronomia/julian'
import { Sunrise } from 'astronomia/sunrise'

const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_MS = 24 * HOUR_IN_MS
const MONTH_IN_MS = moonphase.meanLunarMonth * DAY_IN_MS
const YEAR_IN_MS = meanSiderealYear * DAY_IN_MS

function dateToYearFraction (date) {
  const year = date.getFullYear()
  const yearStart = new Date(year, 0)
  const elapsed = date.getTime() - yearStart.getTime()
  const fraction = elapsed / YEAR_IN_MS
  return (year + fraction)
}

function wrapAstro (func) {
  return function (date) {
    if (!date) date = new Date()
    return JDEToDate(func(dateToYearFraction(date)))
  }
}

export const SEASONS = ['spring', 'summer', 'autumn', 'winter']

const seasons = {
  spring: wrapAstro(solstice.march),
  summer: wrapAstro(solstice.june),
  autumn: wrapAstro(solstice.september),
  winter: wrapAstro(solstice.december)
}

export const PHASES = ['new', 'waxing', 'full', 'waning']

const phases = {
  new: wrapAstro(moonphase.new),
  waxing: wrapAstro(moonphase.first),
  full: wrapAstro(moonphase.full),
  waning: wrapAstro(moonphase.last)
}

function getPhaseInfo (date) {
  return Object.entries(phases).map(([phase, func]) => {
    return [phase, func(new Date(date.toLocaleDateString()))]
  })
}

function getSeasonInfo (date) {
  return Object.entries(seasons).map(([season, func]) => {
    const yearStart = new Date(date.toLocaleDateString())
    yearStart.setFullYear(date.getFullYear())
    yearStart.setMonth(0)
    yearStart.setDate(1 - moonphase.meanLunarMonth)
    return [season, func(yearStart)]
  })
}

export const MONTHS = [
  'Jester',
  'Wizard',
  'Diviner',
  'Monarch',
  'Steward',
  'Hierophant',
  'Lover',
  'Ranger',
  'Warrior',
  'Hermit',
  'Trader',
  'Nomad',
  'Corpse'
]

export function getDateInfo (date, lat, long) {
  if (date === undefined) date = new Date()
  long = -1 * long // astronomia counts westward, which is kinda backwards i guess
  const witchy = {}
  // season info
  const priorYear = new Date(date.getTime() - YEAR_IN_MS)
  const nextYear = new Date(date.getTime() + YEAR_IN_MS)
  const seasonDateInfo = getSeasonInfo(date)
    .concat(getSeasonInfo(priorYear))
    .concat(getSeasonInfo(nextYear))
    .map(([season, seasonDate]) => [season, seasonDate, date - seasonDate])
  const currentSeasonInfo = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta > 0 })
    .toSorted((a, b) => a[2] - b[2])[0].slice(0, 2)
  const upcomingSeasonInfo = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta <= 0 })
    .toSorted((a, b) => b[2] - a[2])[0].slice(0, 2)
  const currentSeasonDate = Math.ceil((date - currentSeasonInfo[1]) / DAY_IN_MS)
  const daysLeftInSeason = Math.floor((upcomingSeasonInfo[1] - date) / DAY_IN_MS)
  witchy.season = {
    current: currentSeasonInfo,
    upcoming: upcomingSeasonInfo,
    date: currentSeasonDate,
    rem: daysLeftInSeason
  }
  // phase info
  const priorLunarMonth = new Date(date.getTime() - MONTH_IN_MS)
  const nextLunarMonth = new Date(date.getTime() + MONTH_IN_MS)
  const phaseDateInfo = getPhaseInfo(date)
    .concat(getPhaseInfo(priorLunarMonth))
    .concat(getPhaseInfo(nextLunarMonth))
    .map(([phase, phaseDate]) => { return [phase, phaseDate, date - phaseDate] })
  const currentPhaseInfo = phaseDateInfo
    .filter(([_phase, _date, delta]) => { return delta > 0 })
    .toSorted((a, b) => a[2] - b[2])[0].slice(0, 2)
  const upcomingPhaseInfo = phaseDateInfo
    .filter(([_phase, _date, delta]) => { return delta <= 0 })
    .toSorted((a, b) => b[2] - a[2])[0].slice(0, 2)
  const currentPhaseDate = Math.ceil((date - currentPhaseInfo[1]) / DAY_IN_MS)
  const daysLeftInPhase = Math.floor((upcomingPhaseInfo[1] - date) / DAY_IN_MS)
  witchy.phase = {
    current: currentPhaseInfo,
    upcoming: upcomingPhaseInfo,
    date: currentPhaseDate,
    rem: daysLeftInPhase
  }
  // month info
  const firstMonthStart = phases.new(new Date(date.getFullYear(), 0, 1))
  const monthsSinceStart = Math.floor((date - firstMonthStart) / MONTH_IN_MS)
  const monthStart = new Date(firstMonthStart.getTime() + (MONTH_IN_MS * monthsSinceStart))
  const monthEnd = new Date(monthStart.getTime() + MONTH_IN_MS)
  const daysSinceMonthStart = Math.ceil((date - monthStart) / DAY_IN_MS)
  const daysLeftInMonth = Math.floor((monthEnd - date) / DAY_IN_MS)
  let nextMonth
  if ((monthsSinceStart === 11) && witchy.season.current[0] === 'winter') {
    nextMonth = MONTHS[0]
  } else {
    nextMonth = MONTHS[monthsSinceStart + 1] || MONTHS[0]
  }
  witchy.month = {
    name: MONTHS[monthsSinceStart],
    next: nextMonth,
    start: monthStart,
    end: monthEnd,
    date: daysSinceMonthStart,
    rem: daysLeftInMonth
  }
  // day info
  const yesterday = new Date(date.getTime() - (DAY_IN_MS / 2))
  const sunrise = new Sunrise(new Calendar(yesterday), lat, long)
  const tomorrow = new Date(date)
  tomorrow.setDate(date.getDate() + 1)
  const nextSunrise = new Sunrise(new Calendar(tomorrow), lat, long)
  witchy.day = {
    rise: sunrise.rise().toDate(),
    set: sunrise.set().toDate(),
    next: nextSunrise.rise().toDate()
  }
  // time info
  const dayHourLength = (witchy.day.set - witchy.day.rise) / 10 // ten sunlight hours
  const nightHourLength = (witchy.day.next - witchy.day.set) / 10 // ten nighttime hours
  let hour, minute, second
  if ((date - witchy.day.rise) < 0) {
    // we're in night
    const nightProgress = ((date - witchy.day.set) / nightHourLength)
    hour = Math.floor(10 + nightProgress)
    const rawMinutes = (nightProgress - Math.floor(nightProgress)).toString().split('.')[1].slice(0, 4)
    minute = rawMinutes.slice(0, 2)
    second = rawMinutes.slice(2, 4)
  } else {
    // we're in day
    const dayProgress = ((date - witchy.day.rise) / dayHourLength)
    hour = Math.floor(dayProgress)
    const rawMinutes = (dayProgress - Math.floor(dayProgress)).toString().split('.')[1].slice(0, 4)
    minute = rawMinutes.slice(0, 2)
    second = rawMinutes.slice(2, 4)
  }
  witchy.time = {
    hour,
    minute: parseInt(minute, 10),
    second: parseInt(second, 10),
    str: `${hour}:${minute}:${second}`
  }
  return witchy
}

function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getDateText (date, lat, long) {
  const witchy = getDateInfo(date, lat, long)
  const txt = '' +
    `It is day ${witchy.season.date} of ${capitalize(witchy.season.current[0])}, ${witchy.season.rem} til ${capitalize(witchy.season.upcoming[0])}.` +
    ' ' +
    `It is day ${witchy.phase.date} of the ${capitalize(witchy.phase.current[0])} Moon, ${witchy.phase.rem} til ${capitalize(witchy.phase.upcoming[0])}.` +
    ' ' +
    `It is day ${witchy.month.date} of the ${witchy.month.name}'s Moon, ${witchy.month.rem} til the ${capitalize(witchy.month.next)}'s.` +
    ' ' +
    `The current time is ${witchy.time.str}, or ${date.toLocaleTimeString()}.`
  return txt
}

import { solstice, moonphase } from "astronomia"
import { meanSiderealYear } from "astronomia/base"
import { JDEToDate, Calendar } from "astronomia/julian"
import { Sunrise } from "astronomia/sunrise"

const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_MS = 24 * HOUR_IN_MS
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

export const seasons = {
  spring: wrapAstro(solstice.march),
  summer: wrapAstro(solstice.june),
  autumn: wrapAstro(solstice.september),
  winter: wrapAstro(solstice.december)
}

export const phases = {
  new: wrapAstro(moonphase.new),
  waxing: wrapAstro(moonphase.first),
  full: wrapAstro(moonphase.full),
  waning: wrapAstro(moonphase.last)
}

function getPhaseInfo (date) {
  return Object.entries(phases).map(([phase, func]) => {
    return [phase, func(date)]
  })
}

function getSeasonInfo (date) {
  return Object.entries(seasons).map(([season, func]) => {
    return [season, func(date)]
  })
}

const months = [
  'Jester',
  'Wizard',
  'Diviner',
  'Monarch',
  'Despot',
  'Hierophant',
  'Lover',
  'Chariot',
  'Justiciar',
  'Hermit',
  'Trader',
  'Nomad',
  'Hanged'
]

export function witchify (date, lat, long) {
  if (date === undefined) date = new Date();
  long = -1 * long // astronomia counts westward, which is kinda backwards i guess
  const witchy = {}
  // season info
  const priorYear = new Date(date.getTime() - YEAR_IN_MS)
  const seasonDateInfo = getSeasonInfo(date).concat(getSeasonInfo(priorYear))
    .map(([season, seasonDate]) => { return [season, seasonDate, date - seasonDate]})
  const [currentSeason, currentSeasonDate] = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta > 0 })
    .toSorted((a, b) => { return a[2] - b[2] })[0].slice(0, 2)
  const [upcomingSeason, upcomingSeasonDate] = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta <= 0 })
    .toSorted((a, b) => { return b[2] - a[2] })[0].slice(0, 2)
  witchy.season = {
    current: [currentSeason, currentSeasonDate],
    upcoming: [upcomingSeason, upcomingSeasonDate]
  }
  // phase info
  const priorLunarMonth = new Date(date.getTime() - (moonphase.meanLunarMonth * DAY_IN_MS))
  const phaseDateInfo = getPhaseInfo(date).concat(getPhaseInfo(priorLunarMonth))
    .map(([phase, phaseDate]) => { return [phase, phaseDate, date - phaseDate]})
  const [currentPhase, currentPhaseDate] = phaseDateInfo
    .filter(([_phase, _date, delta]) => { return delta > 0 })
    .toSorted((a, b) => a[2] - b[2])[0].slice(0, 2)
  const [upcomingPhase, upcomingPhaseDate] = phaseDateInfo
    .filter(([_phase, _date, delta]) => { return delta <= 0 })
    .toSorted((a, b) => b[2] - a[2])[0].slice(0, 2)
  witchy.phase = {
    current: [currentPhase, currentPhaseDate],
    upcoming: [upcomingPhase, upcomingPhaseDate]
  }
  // month info
  const nextLunarMonth = new Date(date.getTime() + (moonphase.meanLunarMonth * DAY_IN_MS))
  const firstMonthStart = phases.new(new Date(date.getFullYear(), 0, 1))
  const monthsSinceStart = Math.floor((date - firstMonthStart) / (moonphase.meanLunarMonth * DAY_IN_MS))
  const [monthStart, monthEnd] = getPhaseInfo(date)
    .concat(getPhaseInfo(priorLunarMonth))
    .concat(getPhaseInfo(nextLunarMonth))
    .map(([phase, phaseDate]) => { return [phase, phaseDate, date - phaseDate]})
    .filter(([phase, ..._rest]) => phase === 'new')
    .toSorted((a, b) => b[2] - a[2])
    .map(([_phase, phaseDate, _delta]) => phaseDate)
    .slice(1, 3)
  const daysSinceMonthStart = Math.floor((date - monthStart) / DAY_IN_MS)
  witchy.month = {
    name: months[monthsSinceStart],
    next: months[monthsSinceStart + 1],
    start: monthStart,
    end: monthEnd,
    date: daysSinceMonthStart
  }
  // day info
  const yesterday = new Date(date)
  yesterday.setDate(date.getDate() - 1)
  const sunrise = new Sunrise(new Calendar(yesterday), lat, long)
  const tomorrow = new Date(date)
  tomorrow.setDate(date.getDate() + 1)
  const nextSunrise = new Sunrise(new Calendar(tomorrow), lat, long)
  witchy.day = {
    rise: sunrise.rise().toDate(),
    set: sunrise.set().toDate(),
    next: nextSunrise.rise().toDate()
  }
  return witchy
}

function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function dateText (date, lat, long) {
  const witchy = witchify(date, lat, long)
  const currentPhaseDate = Math.floor((date - witchy.phase.current[1]) / DAY_IN_MS)
  const daysLeftInPhase = Math.floor((witchy.phase.upcoming[1] - date) / DAY_IN_MS)
  const currentSeasonDate = Math.floor((date - witchy.season.current[1]) / DAY_IN_MS)
  const daysLeftInSeason = Math.floor((witchy.season.upcoming[1] - date) / DAY_IN_MS)
  const daysLeftInMonth = Math.floor((witchy.month.end - date) / DAY_IN_MS)
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
  const txt = ""
    + `It is day ${currentSeasonDate} of ${capitalize(witchy.season.current[0])}, ${daysLeftInSeason} til ${capitalize(witchy.season.upcoming[0])}.`
    + " "
    + `It is day ${currentPhaseDate} of the ${capitalize(witchy.phase.current[0])} Moon, ${daysLeftInPhase} til ${capitalize(witchy.phase.upcoming[0])}.`
    + " "
    + `It is day ${witchy.month.date} of the ${witchy.month.name}'s Moon; ${daysLeftInMonth} til the ${capitalize(witchy.month.next)}'s.`
    + " "
    + `The current time is ${hour}:${minute}:${second}, or ${date.toLocaleTimeString()}.`
  return txt
}
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
    return [season, func(new Date(date.toLocaleDateString()))]
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

export const MAX_ABS_LAT = 72

export function getDateInfo (date, lat, long) {
  if (date === undefined) date = new Date()
  long = -1 * long // astronomia counts westward, which is kinda backwards i guess
  if ((lat > MAX_ABS_LAT) || (lat < -MAX_ABS_LAT)) {
    throw new Error(`Latitude out of bounds: -${MAX_ABS_LAT} - ${MAX_ABS_LAT}: ${lat}`)
  }
  const witchy = {}
  // day info
  let lookaroundLen = 4
  // extremis -- days longer than seasons
  const absLat = Math.abs(lat)
  if (absLat > 60) {
    lookaroundLen = 90
  } else if (absLat > 70) {
    lookaroundLen = 120
  }
  const lookbehind = [...new Array(lookaroundLen).keys()].slice(1).map(i => -1 * i).reverse()
  const lookaround = [...lookbehind, ...new Array(lookaroundLen).keys()].map((i) => {
    return new Sunrise(new Calendar(new Date(date.getTime() + (i * DAY_IN_MS))), lat, long)
  })
  const sunrise = lookaround.slice(0, lookbehind.length + 2) // most recent sunrise
    .map((s) => s.rise().toDate())
    .filter((d) => (d.getTime() - date.getTime()) < 0)
    .toSorted((a, b) => b.getTime() - a.getTime())[0]
  const sunset = lookaround.slice(lookbehind.length, lookbehind.length + lookaroundLen) // nearest sunset after sunrise
    .map((s) => s.set())
    .filter((s) => !!s)
    .map((s) => s.toDate())
    .filter((d) => (d.getTime() - sunrise.getTime()) > 0)
    .toSorted((a, b) => a.getTime() - b.getTime())[0]
  const nextSunrise = lookaround.slice(lookbehind.length) // nearest sunrise after sunset
    .map((s) => s.rise())
    .filter((s) => !!s)
    .map((s) => s.toDate())
    .filter((d) => (d.getTime() - sunset.getTime()) > 0)
    .toSorted((a, b) => a.getTime() - b.getTime())[0]
  witchy.day = {
    rise: sunrise,
    set: sunset,
    next: nextSunrise
  }
  // time info
  const dayLengthMs = witchy.day.next - witchy.day.rise
  const dayHourLength = (witchy.day.set - witchy.day.rise) / 10 // ten sunlight hours
  const nightHourLength = (witchy.day.next - witchy.day.set) / 10 // ten nighttime hours
  let hour, minute, second
  if ((witchy.day.set - date) < 0) {
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
    const rem = (dayProgress - Math.floor(dayProgress)).toString()
    if (rem.includes('.')) {
      const rawMinutes = rem.split('.')[1].slice(0, 4)
      minute = rawMinutes.slice(0, 2)
      second = rawMinutes.slice(2, 4)
    } else {
      minute = '00'
      second = '00'
    }
  }
  witchy.time = {
    hour,
    minute: parseInt(minute, 10),
    second: parseInt(second, 10),
    dayHourLength: dayHourLength / HOUR_IN_MS,
    nightHourLength: nightHourLength / HOUR_IN_MS,
    str: `${hour}:${minute}:${second}`
  }
  // season info
  const priorYear = new Date(date.getTime() - YEAR_IN_MS)
  const nextYear = new Date(date.getTime() + YEAR_IN_MS)
  const seasonDateInfo = getSeasonInfo(priorYear)
    .concat(getSeasonInfo(date))
    .concat(getSeasonInfo(nextYear))
    .map(([season, seasonDate]) => [season, seasonDate, date - seasonDate])
  const currentSeasonInfo = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta > 0 })
    .toSorted((a, b) => a[2] - b[2])[0].slice(0, 2)
  const upcomingSeasonInfo = seasonDateInfo
    .filter(([_season, _date, delta]) => { return delta <= 0 })
    .toSorted((a, b) => b[2] - a[2])[0].slice(0, 2)
  const currentSeasonDate = (date - currentSeasonInfo[1]) / dayLengthMs
  const daysLeftInSeason = (upcomingSeasonInfo[1] - date) / dayLengthMs
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
  const currentPhaseDate = (date - currentPhaseInfo[1]) / dayLengthMs
  const daysLeftInPhase = (upcomingPhaseInfo[1] - date) / dayLengthMs
  witchy.phase = {
    current: currentPhaseInfo,
    upcoming: upcomingPhaseInfo,
    date: currentPhaseDate,
    rem: daysLeftInPhase
  }
  // month info
  const lastWinterSolstice = seasons.winter(priorYear)
  const firstMonthStart = phases.new(lastWinterSolstice)
  const monthsSinceStart = Math.floor((date - firstMonthStart) / MONTH_IN_MS)
  const monthStart = new Date(firstMonthStart.getTime() + (MONTH_IN_MS * monthsSinceStart))
  const monthEnd = new Date(monthStart.getTime() + MONTH_IN_MS)
  const daysSinceMonthStart = Math.ceil((date - monthStart) / dayLengthMs)
  const daysLeftInMonth = Math.floor((monthEnd - date) / dayLengthMs)
  let monthName
  if (monthsSinceStart === -1) {
    // are we in the nomad, or the corpse?
    const priorPriorYear = new Date(priorYear - YEAR_IN_MS)
    const lastLastWinterSolstice = seasons.winter(priorPriorYear)
    const lastFirstMonthStart = phases.new(lastLastWinterSolstice)
    const n = Math.round((firstMonthStart - lastFirstMonthStart) / MONTH_IN_MS)
    if (n === 12) {
      monthName = MONTHS[MONTHS.length - 2]
    } else {
      monthName = MONTHS[MONTHS.length - 1]
    }
  } else {
    monthName = MONTHS[monthsSinceStart]
  }
  witchy.month = {
    current: [monthName, monthStart],
    upcoming: [MONTHS[monthsSinceStart + 1], monthEnd],
    date: daysSinceMonthStart,
    rem: daysLeftInMonth
  }
  return witchy
}

function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function getDateText (date, lat, long) {
  const witchy = getDateInfo(date, lat, long)
  const txt = '' +
    `It is day ${Math.ceil(witchy.season.date)} of ${capitalize(witchy.season.current[0])}, ${Math.floor(witchy.season.rem)} til ${capitalize(witchy.season.upcoming[0])}.` +
    ' ' +
    `It is day ${Math.ceil(witchy.phase.date)} of the ${capitalize(witchy.phase.current[0])} Moon, ${Math.floor(witchy.phase.rem)} til ${capitalize(witchy.phase.upcoming[0])}.` +
    ' ' +
    `It is day ${Math.ceil(witchy.month.date)} of the ${witchy.month.name}'s Moon, ${Math.floor(witchy.month.rem)} til the ${capitalize(witchy.month.next)}'s.` +
    ' ' +
    `The current time is ${witchy.time.str}, or ${date.toLocaleTimeString()}.`
  return txt
}

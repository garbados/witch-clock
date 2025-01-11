import { DateTime } from 'luxon'
import { AUTUMN, DAY_IN_MS, FULL, HOUR_IN_MS, MEAN_LUNAR_MONTH, MONTHS, NEW, SEASONS, SPRING, SUMMER, WANING, WAXING, WINTER } from './constants.js'
import { comesafter, comesbefore, firstwhich, lastwhich } from './utils.js'
import { timeinfo } from './times.js'

function datestr (datetime) {
  return `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate()}`
}

function nistifydate (datetime, latitude, longitude) {
  return `https://aa.usno.navy.mil/api/rstt/oneday?date=${datestr(datetime)}&coords=${latitude},${longitude}`
}

function nistifyphases (datetime) {
  return `https://aa.usno.navy.mil/api/moon/phases/year?year=${datetime.getFullYear()}`
}

function tzdate (year, month, date, hour, minute, tz) {
  return DateTime.local(year, month, date, hour, minute, {
    zone: (tz >= 0) ? `UTC+${tz}` : `UTC-${tz}`
  }).toJSDate()
}

export async function fetchdate (dt, latitude, longitude) {
  const res = await fetch(nistifydate(dt, latitude, longitude))
  const { properties: { data: { sundata, tz } } } = await res.json()
  const tzInt = Math.floor(tz)
  const periods = sundata.reduce((periods, { phen, time }) => {
    periods[phen] = time.split(':').map(s => parseInt(s, 10))
    return periods
  }, {})
  const [rise, set] = [periods.Rise, periods.Set].map(([hour, minute]) => {
    return tzdate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), hour, minute, tzInt)
  })
  return { rise, set }
}

const nistphases = {
  'New Moon': NEW,
  'First Quarter': WAXING,
  'Full Moon': FULL,
  'Last Quarter': WANING
}

export async function fetchphases (dt) {
  const res = await fetch(nistifyphases(dt))
  const json = await res.json()
  return json.phasedata.map(({ year, month, day, time, phase: nistphase }) => {
    const [hour, minute] = time.split(':').map(s => parseInt(s, 10))
    const phase = nistphases[nistphase]
    return [phase, tzdate(year, month, day, hour, minute, 0)]
  })
}

const nistseasons = {
  Solstice: { 6: SUMMER, 12: WINTER },
  Equinox: { 3: SPRING, 9: AUTUMN }
}

export async function fetchseasons (dt) {
  const res = await fetch(`https://aa.usno.navy.mil/api/seasons?year=${dt.getFullYear()}`)
  const { data, tz: tzRaw } = await res.json()
  const tz = Math.floor(tzRaw)
  const seasons = data
    .filter(({ phenom }) => Object.keys(nistseasons).includes(phenom))
    .reduce((events, { year, month, day, time, phenom: nistseason }) => {
      const season = nistseasons[nistseason][month]
      const [hour, minute] = time.split(':').map(s => parseInt(s, 10))
      events[season] = tzdate(year, month, day, hour, minute, tz)
      return events
    }, {})
  return SEASONS.map(name => [name, seasons[name]])
}

export async function fetchnist (dt, latitude, longitude) {
  const todaylux = DateTime.fromJSDate(dt)
  const today = todaylux.toJSDate()
  const yesterday = todaylux.minus({ days: 1 }).toJSDate()
  const tomorrow = todaylux.plus({ days: 1 }).toJSDate()
  const thedayafter = todaylux.plus({ days: 2 }).toJSDate()
  const lastyear = todaylux.minus({ years: 1 }).toJSDate()
  const nextyear = todaylux.plus({ years: 1 }).toJSDate()
  const phasepromise = Promise.all([
    fetchphases(lastyear),
    fetchphases(today),
    fetchphases(nextyear)
  ])
  const seasonpromise = Promise.all([
    fetchseasons(lastyear),
    fetchseasons(today),
    fetchseasons(nextyear)
  ])
  const daypromise = Promise.all([
    fetchdate(yesterday, latitude, longitude),
    fetchdate(today, latitude, longitude),
    fetchdate(tomorrow, latitude, longitude),
    fetchdate(thedayafter, latitude, longitude)
  ])
  const promises = [phasepromise, seasonpromise, daypromise]
  const [phaseyears, seasonyears, days] = await Promise.all(promises)
  const phases = phaseyears.reduce((list, phases) => [...list, ...phases], [])
  const seasons = seasonyears.reduce((list, phases) => [...list, ...phases], [])
  return { phases, seasons, days }
}

export function fromnist (dt, { phases, seasons, days }) {
  // day shit
  const { rise } = lastwhich(days, ({ rise }) => comesbefore(rise, dt))
  const { set } = firstwhich(days, ({ set }) => comesafter(set, rise))
  const { rise: next } = firstwhich(days, ({ rise: next }) => comesafter(next, rise))
  const dayhours = (set.getTime() - rise.getTime()) / HOUR_IN_MS
  const nighthours = (next.getTime() - set.getTime()) / HOUR_IN_MS
  const day = { rise, set, next, dayhours, nighthours }
  // moon shit
  const currentphase = lastwhich(phases, ([_, phase]) => comesbefore(phase, next))
  const upcomingphase = firstwhich(phases, ([_, phase]) => comesafter(phase, next))
  const phasedate = (next.getTime() - currentphase[1].getTime()) / DAY_IN_MS
  const phaserem = (upcomingphase[1].getTime() - next.getTime()) / DAY_IN_MS
  // season shit
  const currentseason = lastwhich(seasons, ([_, season]) => comesbefore(season, next))
  const upcomingseason = firstwhich(seasons, ([_, season]) => comesafter(season, next))
  const seasondate = (next.getTime() - currentseason[1].getTime()) / DAY_IN_MS
  const seasonrem = (upcomingseason[1].getTime() - next.getTime()) / DAY_IN_MS
  // cycle shit
  const winters = seasons.filter(([name, _]) => name === WINTER)
  const newmoons = phases.filter(([name, _]) => name === NEW)
  const lastwinter = lastwhich(winters, ([_, season]) => comesbefore(season, next))
  const nextwinter = firstwhich(winters, ([_, season]) => comesafter(season, next))
  const lastjester = firstwhich(newmoons, ([_, phase]) => comesafter(phase, lastwinter[1]))
  const nextjester = firstwhich(newmoons, ([_, phase]) => comesafter(phase, nextwinter[1]))
  const cycledate = (next.getTime() - lastjester[1].getTime()) / DAY_IN_MS
  const cyclerem = (nextjester[1].getTime() - next.getTime()) / DAY_IN_MS
  // month shit
  const thismonth = lastwhich(newmoons, ([_, phase]) => comesbefore(phase, next))
  const nextmonth = firstwhich(newmoons, ([_, phase]) => comesafter(phase, next))
  const monthdate = (next.getTime() - thismonth[1].getTime()) / DAY_IN_MS
  const monthrem = (nextmonth[1].getTime() - next.getTime()) / DAY_IN_MS
  const i = Math.floor(cycledate / MEAN_LUNAR_MONTH)
  const thismonthname = MONTHS[i]
  const nextmonthname = MONTHS[i + 1] || MONTHS[0]
  return {
    now: dt,
    day,
    time: timeinfo(dt, day),
    cycle: {
      start: [lastjester[1], cycledate],
      end: [nextjester[1], cyclerem]
    },
    month: {
      current: [thismonthname, thismonth[1], monthdate],
      upcoming: [nextmonthname, nextmonth[1], monthrem]
    },
    moon: {
      current: [...currentphase, phasedate],
      upcoming: [...upcomingphase, phaserem]
    },
    season: {
      current: [...currentseason, seasondate],
      upcoming: [...upcomingseason, seasonrem]
    }
  }
}

export async function witchify (dt, latitude, longitude) {
  const { phases, seasons, days } = await fetchnist(dt, latitude, longitude)
  return fromnist(dt, { phases, seasons, days })
}

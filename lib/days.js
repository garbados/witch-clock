import { createTimeOfInterest } from 'astronomy-bundle/time/index.js'
import { createSun } from 'astronomy-bundle/sun/index.js'
import { DAY_IN_MS, HOUR_IN_MS } from './constants.js'

async function getPriorRise (datetime, lat, lon) {
  const toi = createTimeOfInterest.fromDate(datetime)
  const sun = createSun(toi)
  try {
    const sunrise = await sun.getRise({ lat, lon })
    return sunrise.getDate()
  } catch (e) {
    return getPriorRise(new Date(datetime.getTime() - DAY_IN_MS), lat, lon)
  }
}

async function getNextSet (datetime, lat, lon) {
  const toi = createTimeOfInterest.fromDate(datetime)
  const sun = createSun(toi)
  try {
    const sunset = await sun.getSet({ lat, lon })
    if (sunset.jd > toi.jd) {
      return sunset.getDate()
    } else {
      const nexttoi = createTimeOfInterest.fromDate(new Date(datetime.getTime() + DAY_IN_MS))
      const nextsun = createSun(nexttoi)
      const nextsunset = await nextsun.getSet({ lat, lon })
      return nextsunset.getDate()
    }
  } catch (e) {
    return getNextSet(new Date(datetime.getTime() + DAY_IN_MS), lat, lon)
  }
}

async function getNextRise (datetime, lat, lon) {
  const toi = createTimeOfInterest.fromDate(datetime)
  const sun = createSun(toi)
  try {
    const sunrise = await sun.getRise({ lat, lon })
    if (sunrise.jd > toi.jd) {
      return sunrise.getDate()
    } else {
      const nexttoi = createTimeOfInterest.fromDate(new Date(datetime.getTime() + DAY_IN_MS))
      const nextsun = createSun(nexttoi)
      const nextrise = await nextsun.getRise({ lat, lon })
      return nextrise.getDate()
    }
  } catch (e) {
    return getNextRise(new Date(datetime.getTime() + DAY_IN_MS), lat, lon)
  }
}

export async function dayinfo (datetime, lat, lon) {
  const yesterday = new Date(datetime.getTime() - DAY_IN_MS)
  const sunrise = [
    await getPriorRise(yesterday, lat, lon),
    await getPriorRise(datetime, lat, lon)
  ].filter(d => (d.getTime() - datetime.getTime()) < 0).slice(-1)[0]
  const sunset = await getNextSet(sunrise, lat, lon)
  const nextsunrise = await getNextRise(sunset, lat, lon)
  const day = {
    rise: sunrise,
    set: sunset,
    next: nextsunrise
  }
  day.nighthours = (day.next - day.set) / HOUR_IN_MS
  day.dayhours = (day.set - day.rise) / HOUR_IN_MS
  return day
}

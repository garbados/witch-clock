import { Moon } from 'lunarphase-js'
import { DAY_IN_MS, PHASES } from './constants.js'

export function mooninfo (datetime) {
  const p = Moon.lunarAgePercent(datetime)
  const d = Moon.lunarAge(datetime)
  const m = d / p
  const w = m / 4
  const i = Math.floor(d / w)
  const dayssince = d % w
  const datesince = new Date(datetime.getTime() - (dayssince * DAY_IN_MS))
  const daystil = w - dayssince
  const datetil = new Date(datetime.getTime() + (daystil * DAY_IN_MS))
  const phase = PHASES[i]
  const nextphase = PHASES[i + 1] || PHASES[0]
  return {
    current: [phase, datesince, dayssince],
    upcoming: [nextphase, datetil, daystil],
    date: d,
    rem: m - d
  }
}

import { mooninfo } from './phases.js'
import { seasoninfo } from './seasons.js'
import { dayinfo } from './days.js'
import { cycleinfo } from './cycles.js'
import { timeinfo } from './times.js'
import { witchify as nistify1 } from './nist.js'

export async function witchify (datetime, lat, lon) {
  const dayish = await dayinfo(datetime, lat, lon)
  const seasonish = seasoninfo(dayish.next)
  const moonish = mooninfo(dayish.next)
  const { cycle: cycleish, month: monthish } = cycleinfo(dayish.next)
  const timeish = timeinfo(datetime, dayish)
  return {
    now: datetime,
    cycle: cycleish,
    month: monthish,
    season: seasonish,
    moon: moonish,
    day: dayish,
    time: timeish
  }
}

export const nistify = nistify1

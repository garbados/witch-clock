import { HOUR_IN_MS } from './constants.js'
import { comesafter } from './utils.js'

export function timeinfo (datetime, dayish) {
  let hour, minute, second
  const nightHourLengthMs = (dayish.nighthours / 10) * HOUR_IN_MS
  const dayHourLengthMs = (dayish.dayhours / 10) * HOUR_IN_MS
  if (comesafter(datetime, dayish.set)) {
    // we're in night
    const nightProgress = ((datetime.getTime() - dayish.set.getTime()) / nightHourLengthMs)
    hour = Math.floor(10 + nightProgress)
    const hourfraction = (nightProgress - Math.floor(nightProgress)).toString()
    if (hourfraction.includes('.')) {
      const rawMinutes = hourfraction.split('.')[1].slice(0, 4)
      minute = rawMinutes.slice(0, 2)
      second = rawMinutes.slice(2, 4)
    } else {
      minute = '00'
      second = '00'
    }
  } else {
    // we're in day
    const dayProgress = ((datetime - dayish.rise) / dayHourLengthMs)
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
  return {
    hour,
    minute: parseInt(minute, 10),
    second: parseInt(second, 10),
    str: [hour, minute, second].join(':')
  }
}

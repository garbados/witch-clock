import { REFLECTIONS } from './text'
import { CONCLUSIONS, CORPSE, FULL, NOMAD, SEASONS, SNOSAES } from '../lib/constants'

export function explainSeason (witchy, southern = false) {
  const parts = []
  let thisseason = witchy.season.current[0]
  if (southern) thisseason = SNOSAES[SEASONS.indexOf(thisseason)]
  const since = witchy.season.current[2]
  let nextseason = witchy.season.upcoming[0]
  if (southern) nextseason = SNOSAES[SEASONS.indexOf(nextseason)]
  const until = witchy.season.upcoming[2]
  parts.push(`It is day ${Math.ceil(since)} of ${thisseason};`)
  const tilNextSeason = Math.ceil(until)
  if (tilNextSeason === 1) {
    parts.push(`${nextseason} starts tomorrow.`)
  } else {
    parts.push(`${tilNextSeason} til ${nextseason}.`)
  }
  return parts.join(' ')
}

export function explainPhase (witchy) {
  const parts = []
  const thisphase = witchy.moon.current[0]
  const since = witchy.moon.current[2]
  const nextphase = witchy.moon.upcoming[0]
  const until = witchy.moon.upcoming[2]
  parts.push(`It is day ${Math.ceil(since)} of the ${thisphase} Moon;`)
  const tilNextPhase = Math.ceil(until)
  if (tilNextPhase === 1) {
    parts.push(`${nextphase} starts tomorrow.`)
  } else {
    parts.push(`${tilNextPhase} til ${nextphase}.`)
  }
  return parts.join(' ')
}

export function explainMonth (witchy) {
  const parts = []
  const thismonth = witchy.month.current[0]
  const since = witchy.month.current[2]
  const nextmonth = witchy.month.upcoming[0]
  const until = witchy.month.upcoming[2]
  parts.push(`It is day ${Math.ceil(since)} of the ${thismonth}'s Moon;`)
  const tilNextMonth = Math.ceil(until)
  if (tilNextMonth === 1) {
    parts.push(`the ${nextmonth}'s starts tomorrow.`)
  } else {
    parts.push(`${tilNextMonth} til the ${nextmonth}'s.`)
  }
  return parts.join(' ')
}

export function explainTime (witchy) {
  return `The current time is ${witchy.time.str}, or ${witchy.now.toLocaleTimeString()}.`
}

export function explainHolidays (witchy) {
  const holidays = []
  const thismonth = witchy.month.current[0]
  const thisphase = witchy.moon.current[0]
  const phasesince = witchy.moon.current[2]
  const phaseuntil = witchy.moon.upcoming[2]
  const thisseason = witchy.season.current[0]
  const seasonsince = witchy.season.current[2]
  if (thisphase === FULL && Math.ceil(phasesince) === 1) {
    holidays.push(['p', [
      ['strong', `Feast of the ${thismonth}'s Moon!`],
      ' ',
      ['span', REFLECTIONS.months[thismonth]]
    ]])
  }
  if (Math.ceil(seasonsince) === 1) {
    holidays.push(['p', [
      ['strong', `Festival of ${thisseason}!`],
      ' ',
      ['span', REFLECTIONS.seasons[thisseason]]
    ]])
  }
  if ([NOMAD, CORPSE].includes(thismonth) && Math.floor(phaseuntil) === 0) {
    const conclusionType = CONCLUSIONS[thismonth]
    holidays.push(['p', [
      ['strong', `Celebration of the Conclusion, the ${conclusionType}!`],
      ' ',
      ['span', REFLECTIONS.conclusion[conclusionType]]
    ]])
  }
  return holidays.length ? holidays : null
}

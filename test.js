/* global describe, it */
import * as assert from 'assert/strict'
import { witchify, nistify } from './lib/index.js'
import { comesafter, comesbefore } from './lib/utils.js'
import { SEASONS, PHASES, MEAN_LUNAR_MONTH, MONTHS, DAY_IN_MS, JESTER, CORPSE, NOMAD } from './lib/constants.js'
import * as fc from 'fast-check'

const MAX_LAT = 89.6
const MAX_LON = 180.0
const MAX_SEASON = 95 // "2180-09-23T00:00:00.000Z", 93.68125

async function testwitchy (datetime, witchy) {
  // season tests
  const [currentSeason, currentSeasonDate, seasonSince] = witchy.season.current
  assert.ok(SEASONS.includes(currentSeason), `Unknown season: ${currentSeason}`)
  assert.ok(comesafter(witchy.day.next, currentSeasonDate))
  const [upcomingSeason, upcomingSeasonDate, seasonUntil] = witchy.season.upcoming
  assert.ok(SEASONS.includes(upcomingSeason), `Unknown season: ${upcomingSeason}`)
  assert.notStrictEqual(currentSeason, upcomingSeason)
  assert.ok(comesafter(upcomingSeasonDate, witchy.day.rise))
  assert.ok(seasonSince >= 0, seasonSince)
  assert.ok(seasonSince <= MAX_SEASON, seasonSince)
  assert.ok(seasonUntil >= 0, seasonUntil)
  assert.ok(seasonUntil <= MAX_SEASON, seasonUntil)
  // phase tests
  const [currentPhase, currentPhaseDate, sincePhase] = witchy.moon.current
  assert.ok(PHASES.includes(currentPhase), `Unknown season: ${currentPhase}`)
  assert.ok(comesafter(witchy.day.next, currentPhaseDate))
  const [upcomingPhase, upcomingPhaseDate, tilPhase] = witchy.moon.upcoming
  assert.ok(PHASES.includes(upcomingPhase), `Unknown phase: ${upcomingPhase}`)
  assert.notStrictEqual(currentPhase, upcomingPhase)
  assert.ok(comesafter(upcomingPhaseDate, witchy.day.rise))
  assert.ok(sincePhase <= 8, sincePhase)
  assert.ok(tilPhase <= 8, tilPhase)
  // month checks
  assert.ok(MONTHS.includes(witchy.month.current[0]), `Unknown month: ${witchy.month.current[0]}`)
  assert.ok(MONTHS.includes(witchy.month.upcoming[0]), `Unknown month: ${witchy.month.upcoming[0]}`)
  assert.ok(comesafter(witchy.month.upcoming[1], witchy.month.current[1]))
  assert.ok(Math.ceil(witchy.month.current[2] + witchy.month.upcoming[2]) >= 29)
  // cycle checks
  assert.ok(comesafter(witchy.cycle.end[0], witchy.cycle.start[0]))
  const cyclemonths = Math.ceil((witchy.cycle.end[0] - witchy.cycle.start[0]) / (MEAN_LUNAR_MONTH * DAY_IN_MS))
  assert.ok([12, 13].includes(cyclemonths), cyclemonths)
  // day checks
  assert.ok(comesafter(datetime, witchy.day.rise))
  assert.ok(comesafter(witchy.day.set, witchy.day.rise))
  assert.ok(comesafter(witchy.day.next, witchy.day.set))
  // time checks
  if (witchy.time.hour >= 10) {
    assert.ok(comesafter(datetime, witchy.day.set))
  } else {
    assert.ok(comesbefore(datetime, witchy.day.set))
  }
  assert.ok(witchy.time.hour <= 20, `More than 20 hours in a day: ${witchy.time.hour}.`)
  assert.ok(witchy.time.hour >= 0, `Less than zero hours in a day: ${witchy.time.hour}.`)
  assert.ok(witchy.time.minute < 100)
  assert.ok(witchy.time.minute >= 0)
  assert.ok(witchy.time.second < 100)
  assert.ok(witchy.time.second >= 0)
}

describe('witch-clock', function () {
  it('should report corpse and nomad correctly', async function () {
    const testdata = [
      [0, JESTER],
      [1, CORPSE],
      [2, NOMAD],
      [3, JESTER],
      [4, CORPSE],
      [5, JESTER],
      [6, CORPSE]
    ]
    for (const [i, expected] of testdata) {
      const y = 2020 + i
      const d = new Date(2020 + i, 0)
      const w = await witchify(d, 0, 0)
      const m = w.month.current[0]
      assert.strictEqual(m, expected, `${y}: ${m} actual; ${expected} expected`)
    }
  })

  it('should handle arbitrary dates, latitudes, and longitudes', async function () {
    this.timeout(10000)
    const baseOptions = { noNaN: true, noDefaultInfinity: true }
    return fc.assert(
      fc.asyncProperty(
        fc.date({ noInvalidDate: true, min: new Date(1004, 0, 1), max: new Date(2999, 0, 1) }),
        fc.float({ min: Math.fround(-MAX_LAT), max: Math.fround(MAX_LAT), ...baseOptions }),
        fc.float({ min: Math.fround(-MAX_LON), max: Math.fround(MAX_LON), ...baseOptions }),
        async (datetime, lat, lon) => {
          const witchy = await witchify(datetime, lat, lon)
          await testwitchy(datetime, witchy)
        }
      )
    )
  })

  it('should use a remote source ok', async function () {
    this.timeout(5000)
    const datetime = new Date()
    const witchy = await nistify(datetime, 0, 0)
    await testwitchy(datetime, witchy)
  })
})

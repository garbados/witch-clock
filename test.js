/* global describe, it */
import * as assert from 'assert/strict'
import { getDateInfo, SEASONS, PHASES, MONTHS } from './index.js'
import * as fc from 'fast-check'

function isDateValid (d) {
  return !isNaN(d.getTime())
}

describe('witch-clock', function () {
  it('should handle arbitrary dates, latitudes, and longitudes', function () {
    const baseOptions = { noNaN: true, noDefaultInfinity: true, }
    fc.assert(
      fc.property(
        fc.date({ noInvalidDate: true, min: new Date(1000, 0, 1), max: new Date(3000, 0, 1) }),
        fc.float({ min: Math.fround(-89.6), max: Math.fround(89.6), ...baseOptions }),
        fc.float({ min: Math.fround(-179.9), max: Math.fround(179.9), ...baseOptions }),
        (date, lat, long) => {
          const witchy = getDateInfo(date, lat, long)
          // season tests
          const [currentSeason, currentSeasonDate] = witchy.season.current
          assert.ok(SEASONS.includes(currentSeason), `Unknown season: ${currentSeason}`)
          assert.ok(isDateValid(currentSeasonDate))
          const [upcomingSeason, upcomingSeasonDate] = witchy.season.upcoming
          assert.ok(SEASONS.includes(upcomingSeason), `Unknown season: ${upcomingSeason}`)
          assert.ok(isDateValid(upcomingSeasonDate))
          assert.ok(witchy.season.date > 0)
          assert.ok(witchy.season.rem >= 0)
          // phase tests
          const [currentPhase, currentPhaseDate] = witchy.phase.current
          assert.ok(PHASES.includes(currentPhase), `Unknown season: ${currentPhase}`)
          assert.ok(isDateValid(currentPhaseDate))
          const [upcomingPhase, upcomingPhaseDate] = witchy.phase.upcoming
          assert.ok(PHASES.includes(upcomingPhase), `Unknown phase: ${upcomingPhase}`)
          assert.ok(isDateValid(upcomingPhaseDate))
          assert.ok(witchy.phase.date > 0)
          assert.ok(witchy.phase.rem >= 0)
          // month checks
          assert.ok(MONTHS.includes(witchy.month.name), `Unknown month: ${witchy.month.name}`)
          assert.ok(MONTHS.includes(witchy.month.next), `Unknown month: ${witchy.month.next}`)
          assert.ok(witchy.month.end.getTime() > witchy.month.start.getTime())
          assert.ok(witchy.month.date > 0)
          assert.ok(witchy.month.rem >= 0)
          // TODO day checks
          // TODO time checks
        }
      )
    )
  })
})

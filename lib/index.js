const solar = require('./solar')
const lunar = require('./lunar')

var witch = { solar: solar, lunar: lunar }

witch.events = function (date) {
  if (!date) date = new Date()
  return {
    solar: {
      soonest: witch.solar.soonest(date),
      recent: witch.solar.recent(date)
    },
    lunar: {
      soonest: witch.lunar.soonest(date),
      recent: witch.lunar.recent(date)
    }
  }
}

module.exports = witch

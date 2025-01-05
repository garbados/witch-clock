/* global HTMLElement, customElements */
import { getDateInfo } from '.'

async function getLatLong () {
  const resIP = await fetch('https://api.ipify.org?format=json')
  const { ip } = await resIP.json()
  const geoIP = await fetch(`http://ip-api.com/json/${ip}`)
  const { lat, lon } = await geoIP.json()
  return [lat, lon]
}

function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class WitchClock extends HTMLElement {
  constructor () {
    super()
    this.location = null
    this.witchy = null
  }

  async connectedCallback () {
    this.location = await getLatLong()
    this.task = setInterval(() => {
      const date = new Date()
      const witchy = getDateInfo(date, ...this.location)
      let textContent = ''
      textContent += `It is day ${Math.ceil(witchy.season.date)} of ${capitalize(witchy.season.current[0])}; `
      const tilNextSeason = Math.floor(witchy.season.rem)
      if (tilNextSeason === 0) {
        textContent += `${capitalize(witchy.season.upcoming[0])} is tomorrow.`
      } else {
        textContent += `${tilNextSeason} til ${capitalize(witchy.season.upcoming[0])}.`
      }
      textContent += `It is day ${Math.ceil(witchy.phase.date)} of the ${capitalize(witchy.phase.current[0])} Moon; `
      const tilNextPhase = Math.floor(witchy.phase.rem)
      if (tilNextPhase === 0) {
        textContent += `${capitalize(witchy.phase.upcoming[0])} is tomorrow.`
      } else {
        textContent += `${tilNextPhase} til ${capitalize(witchy.phase.upcoming[0])}.`
      }
      textContent += `It is day ${Math.ceil(witchy.month.date)} of the ${witchy.month.name}'s Moon; `
      const tilNextMonth = Math.floor(witchy.month.rem)
      if (tilNextMonth === 0) {
        textContent += `${capitalize(witchy.month.upcoming[0])} is tomorrow.`
      } else {
        textContent += `${tilNextMonth} til ${capitalize(witchy.month.upcoming[0])}.`
      }
      textContent += `The current time is ${witchy.time.str}, or ${date.toLocaleTimeString()}.`
      this.textContent = textContent
    }, 1000)
  }

  disconnectedCallback () {
    clearInterval(this.task)
  }
}

customElements.define('witch-clock', WitchClock)

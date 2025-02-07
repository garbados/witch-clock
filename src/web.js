/* global HTMLElement, customElements */
import { witchify } from '../lib/nist'
import { timeinfo } from '../lib/times'
import { alchemize, snag, listento } from 'html-alchemist'
import { TITLE, HOW_IT_WORKS, REFLECTIONS, GEOLOCATION_ASK, CONCLUSION, SEASONS_WHAT, BUT_WHY, MONTHS_WHAT } from './text'
import { explainHolidays, explainMonth, explainPhase, explainSeason, explainTime } from './explain'
import { MONTHS, SEASONS } from '../lib/constants'
import { comesafter } from '../lib/utils'

// POTIONS

const HEADER = ['h1', TITLE]

const title = x => [
  'section',
  ['hgroup', HEADER, ['p', x]]
]

const heading = x => [
  'section',
  ['h2', x],
  ['hr', '']
]

const p = s => ['p', s]

const explanation = (witchy) => [
  'ul',
  ['li', explainSeason(witchy)],
  ['li', explainPhase(witchy)],
  ['li', explainMonth(witchy)],
  ['li#current-time', explainTime(witchy)]
]

const todayholidays = (holidays) => [
  holidays
    ? [
        ['p', ['strong', 'Today\'s Holidays']],
        ['ul', holidays.map(h => ['li', h])]
      ]
    : ''
]

// GEOLOCATION

async function getCurrentPosition () {
  return new Promise((resolve, reject) => {
    try {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    } catch (e) {
      reject(e)
    }
  })
}

// WITCH CLOCK

class WitchClock extends HTMLElement {
  async connectedCallback () {
    this.loading()
    const permission = await navigator.permissions.query({
      name: 'geolocation'
    })
    if (permission.state === 'granted') {
      try {
        const { coords } = await getCurrentPosition()
        await this.beginTicking(coords)
      } catch (e) {
        this.generalError(e)
      }
    } else {
      this.askForPermission()
    }
  }

  async beginTicking ({ latitude, longitude }) {
    if (this.task) clearInterval(this.task)
    let date = new Date()
    let witchy = await witchify(date, latitude, longitude)
    let holidays = explainHolidays(witchy)
    let trying = false // CONCURRENCY
    console.log(witchy) // i left this here for you freaky console fuckers
    // initial state
    this.innerHTML = alchemize([
      ...title('A lunisolar calendar.'),
      ['div#explainers', explanation(witchy)],
      ['div#holidays', todayholidays(holidays)]
    ])
    // refresh cycle
    const refresh = async () => {
      date = new Date()
      if (comesafter(date, witchy.day.next) && !trying) {
        trying = true
        witchy = await witchify(date, latitude, longitude)
        holidays = explainHolidays(witchy)
        snag('explainers').innerHTML = alchemize(explanation(witchy))
        if (holidays) snag('holidays').innerHTML = alchemize(todayholidays(holidays))
        trying = false
      } else {
        witchy.time = timeinfo(date, witchy.day)
        witchy.now = date
        snag('current-time').innerHTML = alchemize(explainTime(witchy))
      }
    }
    try {
      await refresh()
      this.task = setInterval(refresh, 1000)
    } catch (e) {
      this.generalError(e)
    }
  }

  loading () {
    this.innerHTML = alchemize(title('... is loading!'))
  }

  askForPermission () {
    this.innerHTML = alchemize([
      ...title('... needs your permission!'),
      GEOLOCATION_ASK.map(p),
      ['input#geo-permission', { type: 'button', value: 'OK!' }]
    ])
    this.enterCustomLatlong()
    listento('geo-permission', 'click', async () => {
      this.loading()
      const timeout = setTimeout(() => this.generalError({ message: 'Timeout' }), 10000)
      try {
        const { coords } = await getCurrentPosition()
        this.beginTicking(coords)
      } catch (e) {
        this.userDeniedPermission(e)
      }
      clearTimeout(timeout)
    })
  }

  enterCustomLatlong () {
    const options = { type: 'text', inputmode: 'decimal', value: 0 }
    this.innerHTML += alchemize([
      ['p', 'Or, you can enter a custom latitude and longitude.'],
      ['label', { for: "geo-latitude" }, 'Latitude'],
      ['input#geo-latitude', options],
      ['label', { for: "geo-longitude" }, 'Longitude'],
      ['input#geo-longitude', options],
      ['input#geo-custom', { type: 'button', value: 'OK!' }]
    ])
    listento('geo-custom', 'click', async () => {
      try {
        const { value: latstr } = snag('geo-latitude')
        const { value: lonstr } = snag('geo-longitude')
        const latitude = parseInt(latstr, 10) || 0
        const longitude = parseInt(lonstr, 10) || 0
        await this.beginTicking({ latitude, longitude })
      } catch (e) {
        this.generalError(e)
      }
    })
  }

  userDeniedPermission (error) {
    this.innerHTML = alchemize([
      ...title('... could not obtain your permission!'),
      ['p', error.message]
    ])
    this.enterCustomLatlong()
  }

  generalError (error) {
    console.trace(error)
    this.innerHTML = alchemize([
      ...title('... encountered an unknown problem!'),
      ['p', error.message]
    ])
    this.enterCustomLatlong()
  }

  disconnectedCallback () {
    clearInterval(this.task)
  }
}

class Docs extends HTMLElement {
  async connectedCallback () {
    this.innerHTML = alchemize([
      [
        heading('How it works'),
        ['ul', HOW_IT_WORKS.map(s => ['li', s])]
      ],
      [
        heading('Holidays'),
        ['p', 'Witches are known for their celebrations. Terrifyingly so.'],
        ['h3', 'Seasons'],
        ['p', SEASONS_WHAT],
        ['ul', SEASONS.map(s => ['li', `${s}: ${REFLECTIONS.seasons[s]}`])],
        ['h3', 'Months'],
        ['p', MONTHS_WHAT],
        ['ul', MONTHS.map(m => ['li', `${m}: ${REFLECTIONS.months[m]}`])],
        ['h3', 'The Conclusion'],
        ['p', CONCLUSION],
        ['ul',
          ['li', `Nomad, or the Return: ${REFLECTIONS.conclusion.Return}`],
          ['li', `Corpse, or the Demise: ${REFLECTIONS.conclusion.Demise}`]
        ]
      ],
      [
        ...heading('Q&A'),
        ['h3', 'Why?'],
        p(BUT_WHY),
        ['h3', 'Who are the Witchmothers?'],
        ['p', ['a', { href: 'https://beestungmag.com/issue05/two-short-stories-by-diana-thayer/' }, 'Ghosts.']],
        ['h3', 'Who are you?'],
        ['p', ['a', { href: 'https://blog.bovid.space/' }, 'Diana, a witch.']],
        ['h3', 'Where is the source?'],
        ['p', ['a', { href: 'https://github.com/garbados/witch-clock' }, 'GitHub.']]
      ]
    ])
  }
}

class App extends HTMLElement {
  async connectedCallback () {
    this.innerHTML = alchemize([
      'main.container',
      ['section', ['witch-clock', '']],
      ['section', ['how-and-why', '']]
    ])
  }
}

customElements.define('witch-clock', WitchClock)
customElements.define('how-and-why', Docs)
customElements.define('the-app', App)

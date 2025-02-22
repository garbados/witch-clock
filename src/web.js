/* global HTMLElement, customElements, localStorage */
import { witchify } from '../lib/nist'
import { timeinfo } from '../lib/times'
import { alchemize, snag, listento } from 'html-alchemist'
import { TITLE, HOW_IT_WORKS, REFLECTIONS, GEOLOCATION_ASK, CONCLUSION, SEASONS_WHAT, BUT_WHY, MONTHS_WHAT } from './text'
import { explainHolidays, explainMonth, explainPhase, explainSeason, explainTime } from './explain'
import { MONTHS, SEASONS, SNOSAES } from '../lib/constants'
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

const explanation = (witchy, southern = false) => [
  'ul',
  ['li', explainSeason(witchy, southern)],
  ['li', explainPhase(witchy)],
  ['li', explainMonth(witchy)],
  ['li#current-time', explainTime(witchy)]
]

const todayholidays = (holidays) =>
  holidays
    ? [
        ['p', ['strong', 'Today\'s Holidays']],
        ['ul', holidays.map(h => ['li', h])]
      ]
    : ''

const GEO_REMEMBER = [
  'fieldset',
  ['label',
    { for: 'geo-remember' },
    ['input#geo-remember', {
      type: 'checkbox',
      checked: true
    }],
    'Remember location locally'
  ]
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

async function saveCurrentPosition ({ latitude, longitude, remembered }) {
  localStorage.setItem('_witchy_latlong', JSON.stringify({ latitude, longitude, remembered }))
}

async function recallCurrentPosition () {
  const s = localStorage.getItem('_witchy_latlong')
  if (s) return JSON.parse(s)
}

async function fetchCurrentPosition (remembered) {
  const { coords: { latitude, longitude } } = await getCurrentPosition()
  const position = { latitude, longitude, remembered }
  if (remembered) await saveCurrentPosition(position)
  return position
}

// VIEWS

function loading () {
  this.innerHTML = alchemize(title('... is loading!'))
}

function askForPermission () {
  this.innerHTML = alchemize([
    ...title('... needs your permission!'),
    GEOLOCATION_ASK.map(p),
    GEO_REMEMBER,
    ['input#geo-permission', { type: 'button', value: 'OK!' }]
  ])
  enterCustomLatlong.call(this)
  listento('geo-permission', 'click', async () => {
    const remembered = snag('geo-remember').checked
    loading.call(this)
    const timeout = setTimeout(() => generalError.call(this, { message: 'Timeout' }), 10000)
    try {
      const coords = await fetchCurrentPosition(remembered)
      beginTicking.call(this, coords)
    } catch (e) {
      userDeniedPermission.call(this, e)
    }
    clearTimeout(timeout)
  })
}

function enterCustomLatlong (remembered) {
  const options = { type: 'text', inputmode: 'decimal', value: 0 }
  this.innerHTML += alchemize([
    ['p', 'Or, you can enter a custom latitude and longitude.'],
    ['input#geo-latitude', options],
    ['input#geo-longitude', options],
    GEO_REMEMBER,
    ['input#geo-custom', { type: 'button', value: 'OK!' }],
    ['input#where-am-i', { type: 'button', value: 'Reset location with GPS' }]
  ])
  listento('geo-custom', 'click', async () => {
    try {
      const { value: latstr } = snag('geo-latitude')
      const { value: lonstr } = snag('geo-longitude')
      const remembered = snag('geo-remember').checked
      if (this.task) clearInterval(this.task)
      loading.call(this)
      const latitude = parseFloat(latstr, 10) || 0
      const longitude = parseFloat(lonstr, 10) || 0
      await saveCurrentPosition({ latitude, longitude, remembered })
      window.scroll(0, 0)
      await beginTicking.call(this, { latitude, longitude, remembered })
    } catch (e) {
      window.scroll(0, 0)
      generalError.call(this, e)
    }
  })
  listento('where-am-i', 'click', async () => {
    try {
      const remembered = snag('geo-remember').checked
      if (this.task) clearInterval(this.task)
      loading.call(this)
      const { latitude, longitude } = await fetchCurrentPosition(remembered)
      window.scroll(0, 0)
      await beginTicking.call(this, { latitude, longitude, remembered })
    } catch (e) {
      window.scroll(0, 0)
      generalError.call(this, e)
    }
  })
}

function userDeniedPermission (error) {
  this.innerHTML = alchemize([
    ...title('... could not obtain your permission!'),
    ['p', error.message]
  ])
  enterCustomLatlong.call(this)
}

function generalError (error) {
  console.trace(error)
  this.innerHTML = alchemize([
    ...title('... encountered an unknown problem!'),
    ['p', error.message]
  ])
  enterCustomLatlong.call(this)
}

// DA GUTZ

const explaingrid = (witchy, southern = false) => {
  let thisseason = witchy.season.current[0]
  if (southern) thisseason = SNOSAES[SEASONS.indexOf(thisseason)]
  const seasonsince = witchy.season.current[2]
  const seasonuntil = witchy.season.upcoming[2]
  const thisphase = witchy.moon.current[0]
  const phasesince = witchy.moon.current[2]
  const phaseuntil = witchy.moon.upcoming[2]

  const thismonth = witchy.month.current[0]
  const monthsince = witchy.month.current[2]
  const nextmonth = witchy.month.upcoming[0]
  const monthuntil = witchy.month.upcoming[2]
  return [
    'div.grid',
    { style: 'text-align: center;' },
    ['div', ['article', `${thisseason} ${Math.ceil(seasonsince)} / ${Math.ceil(seasonsince + seasonuntil)}`]],
    ['div', ['article', `${thisphase} ${Math.ceil(phasesince)} / ${Math.ceil(phasesince + phaseuntil)}`]],
    ['div', ['article', { 'data-tooltip': `Next: ${nextmonth}` }, `${thismonth} ${Math.ceil(monthsince)} / ${Math.ceil(monthsince + monthuntil)}`]],
    ['div#grid-time', ['article', { 'data-tooltip': `${witchy.now.toLocaleTimeString()}` }, witchy.time.str]]
  ]
}

async function beginTicking ({ latitude, longitude, remembered }) {
  if (this.task) clearInterval(this.task)
  let date = new Date()
  let witchy = await witchify(date, latitude, longitude)
  console.log(witchy) // i left this here for you freaky console fuckers
  let holidays = explainHolidays(witchy)
  let trying = false // CONCURRENCY
  const southern = (latitude < 0)
  // initial state
  this.innerHTML = alchemize([
    ...title('A lunisolar calendar.'),
    ['div#witch-grid', explaingrid(witchy, southern)],
    ['p', 'That is...'],
    ['div#explainers', explanation(witchy, southern)],
    ['div#holidays', todayholidays(holidays)],
    ['p', 'Reporting on position:'],
    ['ul',
      ['li', `Latitude: ${latitude}`],
      ['li', `Longitude: ${longitude}`]
    ]
  ])
  enterCustomLatlong.call(this, remembered)
  // refresh cycle
  const refresh = async () => {
    date = new Date()
    if (comesafter(date, witchy.day.next) && !trying) {
      trying = true
      witchy = await witchify(date, latitude, longitude)
      holidays = explainHolidays(witchy)
      snag('witch-grid').innerHTML = alchemize(explaingrid(witchy, southern))
      snag('explainers').innerHTML = alchemize(explanation(witchy, southern))
      if (holidays) snag('holidays').innerHTML = alchemize(todayholidays(holidays))
      trying = false
    } else {
      witchy.time = timeinfo(date, witchy.day)
      witchy.now = date
      snag('current-time').innerHTML = alchemize(explainTime(witchy))
      snag('grid-time').innerHTML = alchemize(['article', { 'data-tooltip': `${witchy.now.toLocaleTimeString()}` }, witchy.time.str])
    }
  }
  try {
    await refresh()
    this.task = setInterval(refresh, 1000)
  } catch (e) {
    generalError.call(this, e)
  }
}

// WITCH CLOCK

class WitchClock extends HTMLElement {
  async connectedCallback () {
    loading.call(this)
    try {
      const recalled = await recallCurrentPosition()
      if (recalled) {
        await beginTicking.call(this, recalled)
      } else {
        const permission = await navigator.permissions.query({
          name: 'geolocation'
        })
        if (permission.state === 'granted') {
          try {
            const coords = await fetchCurrentPosition()
            await beginTicking.call(this, coords)
          } catch (e) {
            generalError.call(this, e)
          }
        } else {
          askForPermission.call(this)
        }
      }
    } catch (e) {
      generalError.call(this, e)
    }
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

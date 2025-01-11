# Witch Clock

[![Build and Test](https://github.com/garbados/witch-clock/actions/workflows/test.yml/badge.svg)](https://github.com/garbados/witch-clock/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/garbados/witch-clock/badge.svg?branch=main)](https://coveralls.io/github/garbados/witch-clock?branch=main)

The library behind the [Calendar of the Witchmothers](https://clock.bovid.space), a spooky lunar-solar calendar.
`witch-clock` exports a handful of functions for turning `Date` objects, along with a latitude and longitude,
into "witchy" dates, which include things like the time of the most recent sunrise, the upcoming phase of the moon, etc.

## Rationale

There are two kinds of clocks: stopwatches, and calendars. Machines use stopwatches. Humans use calendars.

Machines want to know about the procession of time, and this is inevitably tricky. Even atomic clocks face the influence of gravity upon time itself, such that a consortium is necessary to derive UTC. The reality of stopwatches is that they can only ever be accurate from the perspective of the watch itself. That accuracy is valuable; UTC is a kind of modern marvel. But it is not what humans have ever done at such scale before.

Humans live on Earth. The Sun rises; the Moon grows full. We have celebrated the heavens since time immemorial. But the heavens, oh, they perplex, and they are so beautiful. Terra and Luna dance in Sol's furious glow, with nuance a ticking device ultimately cannot account for. I want to know when the days grow long. I want to know when the Moon is full. I want to celebrate living on Earth.

So I made a calendar.

(*Errata: There is arguably a third kind of clock, the logical clock. Rather than the procession of physical time, it concerns causality and partial ordering, which belong to a different order of magic, even if it's still all in the domain of machines.*)

## Install

Use NPM or whatever:

```bash
npm i -S witch-clock
```

## Usage, library

Try it in your REPL:

```js
const { witchify, nistify } = await import('witch-clock')

await witchify(new Date(),0,0)
// {
//   now: 2025-01-10T04:00:44.548Z,
//   cycle: {
//     start: [ 2024-12-30T21:14:18.333Z, 9.368248460648148 ],
//     end: [ 2026-01-18T18:46:54.444Z, 374.529391712963 ]
//   },
//   month: {
//     current: [ 'Jester', 2024-12-30T21:14:18.333Z, 9.368248456915323 ],
//     upcoming: [ 'Wizard', 2025-01-29T09:58:21.111Z, 20.162339248844674 ]
//   },
//   season: {
//     current: [ 'Winter', 2024-12-21T09:22:05.000Z, 18.86284722222222 ],
//     upcoming: [ 'Spring', 2025-03-20T09:03:16.000Z, 70.12408564814815 ]
//   },
//   moon: {
//     current: [ 'Waxing', 2025-01-07T06:25:19.027Z, 1.985601530475324 ],
//     upcoming: [ 'Full', 2025-01-14T15:36:19.722Z, 5.397045395964675 ],
//     date: 9.368248456915323,
//     rem: 20.162339248844674
//   },
//   day: {
//     rise: 2025-01-09T06:04:35.000Z,
//     set: 2025-01-09T18:09:50.000Z,
//     next: 2025-01-10T06:05:00.000Z,
//     nighthours: 11.919444444444444,
//     dayhours: 12.0875
//   },
//   time: { hour: 18, minute: 26, second: 25, str: '18:26:25' }
// }

// nistify does the same thing, except
// it queries the Astronomical Applications API
// see: https://aa.usno.navy.mil/data/api
await nistify(new Date(),0,0)
```

## License

GPLv3

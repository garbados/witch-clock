# Witch Clock

[![Build Status](https://travis-ci.org/garbados/witch-clock.svg?branch=master)](https://travis-ci.org/garbados/witch-clock)

Tool for computing dates around solstices and equinoxes, answering questions like, "How many days until the Summer Solstice?"

witch-clock concerns itself with solstices and equinoxes. For more witchy star shit, check out [astronomia](https://www.npmjs.com/package/astronomia).

## Install

As a library: `npm install witch-clock`

As a CLI: `npm install -g witch-clock`; access via `witch-clock`

## Usage, library

```
var witch = require('witch-clock')
var date = new Date(...)
var event = witch.solar.soonest(date)
console.log(event)
> [ 'vernal equinox', 2017-03-20T10:28:52.704Z ]
```

`witch-clock` includes two modules: `solar` and `lunar`, each with two methods: `soonest` and `recent`. They return the nearest upcoming or nearest past solar or lunar event, respectively.

## Usage, CLI

```
$ witch-clock
VE-80, WS+9, FIRST-6, NEW+1
$ witch-clock -v
VE-80 @ 2017-03-20T10:28:52.704Z
WS+9 @ 2016-12-21T10:44:19.494Z
FIRST-6 @ 2017-01-05T19:46:59.933Z
NEW+1 @ 2016-12-29T06:53:18.964Z
```

Format is: `[soonest solar], [recent solar], [soonest lunar], [recent lunar]`.

The format with `-v` presents shortcodes, but also the datetime of the event in question.

## Usage, interpersonal

witch-clock expresses dates like "VE-80" or "SS+12" but telling your friend "it's vee-ee eighty" can be hard to say and easily misheard. So I say it a lil differently:

- VE: "vern", SS: "sum", AE: "auto", WS: "win"
- "-": "sub", "+": "plus"

So "VE-80" becomes "vern sub eighty". Of course, that won't make sense either to someone who doesn't understand the format. "Oh, I mean, eighty days til the vernal equinox."

## License

GPLv3

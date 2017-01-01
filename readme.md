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
> { code:"VE+78", date: 2017-03-20T10:28:52.704Z, name: "vernal equinox"}
```

`witch-clock` exposes more methods than that but I haven't documented them yet. Kick up `node`, `require('witch-clock')` into some throwaway variable, and poke around!

## Usage, CLI

```
$ witch-clock
VE-80, WS+9, FIRST-6, NEW+1

$ witch-clock -v
VE-79 | vernal equinox @ 2017-03-20T10:28:52.704Z
WS+10 | winter solstice @ 2016-12-21T10:44:19.494Z
FIRST-5 | first @ 2017-01-05T19:46:59.933Z
NEW+2 | new @ 2016-12-29T06:53:18.964Z

$ witch-clock -j
{"solar":{"soonest":{"code":"VE-79","name":"vernal equinox","date":"2017-03-20T10:28:52.704Z"},"recent":{"code":"WS+10","name":"winter solstice","date":"2016-12-21T10:44:19.494Z"}},"lunar":{"soonest":{"code":"FIRST-5","name":"first","date":"2017-01-05T19:46:59.933Z"},"recent":{"code":"NEW+2","name":"new","date":"2016-12-29T06:53:18.964Z"}}}

$ witch-clock -j | python -m json.tool
{
    "lunar": {
        "recent": {
            "code": "NEW+2",
            "date": "2016-12-29T06:53:18.964Z",
            "name": "new"
        },
        "soonest": {
            "code": "FIRST-5",
            "date": "2017-01-05T19:46:59.933Z",
            "name": "first"
        }
    },
    "solar": {
        "recent": {
            "code": "WS+10",
            "date": "2016-12-21T10:44:19.494Z",
            "name": "winter solstice"
        },
        "soonest": {
            "code": "VE-79",
            "date": "2017-03-20T10:28:52.704Z",
            "name": "vernal equinox"
        }
    }
}

```

In the default and verbose results, the order of events goes: `[soonest solar], [recent solar], [soonest lunar], [recent lunar]`.

The `-v` option prints the shortcode, name, and date of each event. the `-j` option presents verbose info as JSON.

Or, I mean, you could type `witch-clock -h` to see what's up.

## Usage, interpersonal

witch-clock expresses dates like "VE-80" or "SS+12" but telling your friend "it's vee-ee eighty" can be hard to say and easily misheard. So instead try:

- VE: "vern", SS: "sum", AE: "auto", WS: "win"
- "-": "sub", "+": "plus"

So "VE-80" becomes "vern sub eighty". Of course, that won't make sense either to someone who doesn't understand the format. "Oh, I mean, eighty days til the vernal equinox."

## License

GPLv3

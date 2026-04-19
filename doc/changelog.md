# Changelog

All things change, don't they?

## Cycle 1

- Created the calendar.

## Cycle 2

- Transition the codebase from JavaScript to Clojure.
- Denominate minutes and seconds in 60 rather than 100. (Thank you Uruk)
- Use 24-hour days rather than 20. (Thank you Egypt)
- Extend festival holidays to last two days.
- Added the holiday "Respite" which extends between the end of the Festival of Winter and the Conclusion.
- Use [astronomical calculations](https://github.com/cosinekitty/astronomy) rather than by pinging an observatory.
- List the year's holiday, month, and season dates in advance.
- Add and refine text blurbs.
- Change how the southern hemisphere is handled. Previously, the southern summer solstice was treated as "winter", and only the names of seasons were changed, so that northern and southern calendars diverged not-so-much. However, who cares? Southern witch clocks now celebrate the June solstice as "winter", meaning the Jester's Moon and the beginning of new cycles in the south occurs during the north's summer months.

## Cycle 3 (Speculative)

- Use 8 seasons instead of 4 (solstices, equinoxes, and midpoints).
- Encode state with query strings, allowing users to make and share links of the clock at certain spacetimes.

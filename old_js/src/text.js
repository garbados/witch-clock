export const TITLE = 'The Calendar of the Witchmothers'

export const GEOLOCATION_ASK = `
This is a lunisolar calendar that uses your location to calculate a time and date.
This app runs entirely in your browser, so your location is never sent anywhere.
May I ask you to grant permission for your computer to determine your location?
`.trim().split(/\n/g)

export const HOW_IT_WORKS = `
A season is the time between the nearest solstice and equinox. There are four seasons: Winter, Spring, Summer, and Autumn.
Festivals are celebrated on the first day of each season.
A month is a lunar month, so there are either 12 or 13 months in a year.
The lunar cycle begins on the first new moon after the winter solstice (summer solstice, in the southern hemisphere), beginning with the Jester's Moon.
Each month contains four phases of the moon: New, Waxing, Full, Waning.
Feasts are celebrated on the first day of the full moon of each month.
Conclusions are celebrated on the last day of each cycle, either the Return or the Demise.
Days span from sunrise to sunrise. This means that, at some extreme latitudes, witchy days are much longer than 24-hour days.
There are 20 hours in a day: 10 of sunlight, 10 of nighttime. This means hours are elastic to the time of year.
0:00:00 is sunrise. 5:00:00 is noon. 10:00:00 is sunset. 15:00:00 is midnight.
In an hour, there are 100 minutes, and 100 seconds.
This implementation of the Calendar uses physical observations to track events, via the Astronomical Applications API of the US Naval Observatory Applications Department.
`.trim().split(/\n/g)

export const BUT_WHY = `
Because I think the Gregorian sucks. Are you a calendar or a stopwatch?
Even UTC can only obscure the political nightmare of trying to be both. Leap seconds embody their friction.
I want to live on Earth, under its mystery and grandeur, under its tantalizing patterns and perplexing reality.
So, I made a way of helping me keep track of, and celebrate, celestial splendor.
Who cares if hours or years change length? Isn't that part of the beauty?
`.trim().split(/\n/g).join(' ')

export const SEASONS_WHAT = `
Each solstice and equinox has its own holiday.
These are excellent opportunities for a community to throw a big bash.
`.trim().split(/\n/g).join(' ')

export const MONTHS_WHAT = `
Months begin with the first day of the new moon.
Each is characterized by an archetype or icon.
On the first day of the full moon of each month, a holiday takes place.
Feasting, dancing, storytelling, and other festivities are common.
It is bad luck to work too hard on holidays, lest you outshine the moon.
`.trim().split(/\n/g).join(' ')

const JESTER = `
Deep in the cold of Winter, we remember the purpose of joy.
We tell stories and jokes, and share food and laughter, because no long night nor frigid sky can prevent happiness.
We can carry bright hearts into even the darkest realms.
`.trim().split(/\n/g).join(' ')

const WIZARD = `
Beset by snow and ice, we remember the work, especially the cleverness, that community takes.
The roads, the houses, the meals, the medicine, the cleverness and the caution,
which only our ingenuity preserves against decay and entropy.
`.trim().split(/\n/g).join(' ')

const DIVINER = `
As Winter recedes and Spring glimmers, we remember the strength of spirit that community takes:
the cooperation, the faith, the care, the reflection, the growth, and the willful choices.
`.trim().split(/\n/g).join(' ')

const MONARCH = `
While the climate rouses its domain from wintry slumber, we remember the splendor and sensitivity of dominion.
What are we responsible for, or want to be? What inspires us to exert authority, and how can we administer it wisely?
`.trim().split(/\n/g).join(' ')

const STEWARD = `
As resurgent ecosystems blossom and thrive, we remember our impact and influence.
What helps us thrive? How can one align their influence to help their world blossom?
`.trim().split(/\n/g).join(' ')

const HIEROPHANT = `
Summer dawns, and its splendor runs deep with mysteries.
What do you know? Are you at peace with what you do not know?
`.trim().split(/\n/g).join(' ')

const LOVER = `
Long days glow, and nests chirp with new generations.
To cherish others, is ancient. Who do you hold dear? What does that mean to you?
`.trim().split(/\n/g).join(' ')

const COURIER = `
As Summer closes, it dawns that the cold will return.
The journey may be perilous. What task calls you? How will you prepare?
`.trim().split(/\n/g).join(' ')

const WARRIOR = `
The Earth preparing for Winter, flexes. Its strength exerts, achieves, and transforms.
What are your strengths? How do you use them?
`.trim().split(/\n/g).join(' ')

const HERMIT = `
Alone with oneself, our singularity teems. Do you feel safe with yourself, or whole?
How does it feel to be you? How do you want it to feel?
`.trim().split(/\n/g).join(' ')

const TRADER = `
Fortune comes in many kinds. Everyone needs something, and no one escapes risk.
Sometimes one receives a gift they did not ask for.
What fortunes have come to you? What sort of wealth do you desire?
`.trim().split(/\n/g).join(' ')

const NOMAD = `
The brave wanderer travels in the enduring night's frigid chill. Will they be wise amid danger, or foolish?
Life takes us many places, and our desires many too. Where have you been? Where do you want to go?
`.trim().split(/\n/g).join(' ')

const CORPSE = `
A long cycle invites the long sleep with cold fingers.
Everything ends, and some things never happen.
What have you not let yourself miss? What do you need to grieve for?
`.trim().split(/\n/g).join(' ')

const SPRING = `
Sunlight has returned and the world blossoms.
What seeds sprout for you? How do your petals unfold?
`.trim().split(/\n/g).join(' ')

const SUMMER = `
Days shorten, and even in the light, one cannot avoid the coming darkness.
How will you treasure the time you have?
`.trim().split(/\n/g).join(' ')

const AUTUMN = `
Some trees grow gold. Some stay green and silent, as the domain of midnight grows.
Have you steeled yourself for the challenges ahead?
`.trim().split(/\n/g).join(' ')

const WINTER = `
The cold has come, but the night recedes. The flame that lasts, smolders.
Days start to get longer. Reflect on your hopes, and keep them warm.
`.trim().split(/\n/g).join(' ')

export const CONCLUSION = `
The lunar cycle begins with the first day of the first new moon after the winter solstice.
The day before is called the Conclusion, and varies by the prevailing month.
The Conclusion is a kind of new years celebration, and feasting and festivities are common.
`.trim().split(/\n/g).join(' ')

const RETURN = `
An end of wandering, a time of solidarity and compassion.
The wanderer comes home, or finds one, or builds one.
Reflect on how you have changed, and the journey that remains.
`.trim().split(/\n/g).join(' ')

const DEMISE = `
An end of suffering, a time of loss and grief. The dead return to soil, the gone live on in memory.
Reflect on mortality, ephemerality, and longing.
`.trim().split(/\n/g).join(' ')

export const STILLNESS = `
The period between the winter solstice and the Conclusion is called the Stillness.
It reflects the empty day, snowbound or icebound, where even the sky seems muted.
It is bad luck to work too hard during this period, but it isn't a holiday in itself.
They say that Luna grieves for Terra who has gone to a dreamless sleep,
but like the bear hibernating, she will awaken to thrive once more.
`.trim().split(/\n/g).join(' ')

export const REFLECTIONS = {
  months: {
    Jester: JESTER,
    Wizard: WIZARD,
    Diviner: DIVINER,
    Monarch: MONARCH,
    Steward: STEWARD,
    Hierophant: HIEROPHANT,
    Lover: LOVER,
    Courier: COURIER,
    Warrior: WARRIOR,
    Hermit: HERMIT,
    Trader: TRADER,
    Nomad: NOMAD,
    Corpse: CORPSE
  },
  seasons: {
    Winter: WINTER,
    Spring: SPRING,
    Summer: SUMMER,
    Autumn: AUTUMN
  },
  conclusion: {
    Return: RETURN,
    Demise: DEMISE
  }
}

---
title: How to display Weekday names in your User's language
tags:
  - Refactors
  - utility
image: /images/posts/ternary-cover.png
published: true
---

The other day I came across a tweet from [@trunarla](https://twitter.com/trunarla){:target="_blank"} about how can ternary operators can be made more readable:
![readable ternary operators](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ucjelyyfgigmzvab2czi.png)

_Link to the [tweet](https://twitter.com/trunarla/status/1661132581642076160?t=mRg5ukz3PsHW0gCSwTs9Pw&s=19)_

I know the purpose of this piece of code is to promote ternary operators, but I couldn't help but notice we can refactor this specific code so we don't use ternary operators.


### Refactor 1: Array of Weekdays
If we take a look at the code, we can clearly see we can have an array of weekday names and use the `dayNumber` as an index for that array:

```ts
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getDayName(dayNumber: number) {
    return weekdays[dayNumber] || 'Invalid day number'
}

console.log(getDayName(2)) // Tuesday
```

Great, the code is already looking neater, don't you agree?

### Refactor 2: Multilingual Support
In a real-world scenario, we will probably have to support multiple languages and our current implementation can't do that. Wouldn't it be nice if it could return the weekday name in the user's language.

My idea is to create an object where the keys are the language codes (called "locales"), and the values are the array of weekdays names in that language:

```ts
const weekdays: Record<string, string[]> = {
    'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'fr-FR': ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    // add more locales as needed...
}
function getDayName(locale: string, dayNumber: number) {
    return weekdays[locale][dayNumber] || 'Invalid day number'
}

console.log(getDayName('fr-FR', 2)) // Mardi
```

This change enables us to return the weekday name in different languages based on the user's locale. We can add more locales as needed.

Let's not hardcode the locale and get it directly from the user's browser using the `navigator.language` built-in helper.

```ts
const weekdays: Record<string, string[]> = {
    'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'fr-FR': ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    // add more locales as needed...
}
function getDayName(locale: string, dayNumber: number) {
    return weekdays[locale][dayNumber] || 'Invalid day number'
}

console.log(getDayName(navigator.language, 2)) // Tuesday (my browser is in English)
```

### Refactor 3: Using the `Intl` object
You probably noticed this code will get massive if we want to support all the languages. This is where the built-in `Intl` object comes to the rescue. It provides a standard way to handle internationalization (fancy word for multiple languages) and enables developers to format and manipulate dates, numbers, and strings according to the user's locale.


We can scratch out our entire code and use this instead:

```ts
function getDayName(locale: string, date: Date) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
}

console.log(getDayName(navigator.language, new Date('2023-05-23'))) // Monday
```

Much cleaner. I also replaced the `dayNumber` argument with a `Date` instance since in most cases this is what you will be using.

### Exploring different day names formats
We can play with the `weekday` property of the `DateTimeFormat` function and see different way to display the weekday:

```ts
function getDayName(locale: string, date: Date) {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
}

console.log(getDayName(navigator.language, new Date('2023-05-23'))) // Mon
```

```ts
function getDayName(locale: string, date: Date) {
    return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date)
}

console.log(getDayName(navigator.language, new Date('2023-05-23'))) // M
```

Imagine implementing all of this functionality in your project manually. It's a nightmare.



This final version of our function is much more powerful, flexible, and elegant.

---

That's it from my side. See you in the next one.

---

[//]: # (Twitter: [Ionel Lupu]&#40;https://twitter.com/ionelLupu_&#41;)
[//]: # (Website: [ionel-lupu.com]&#40;https://ionel-lupu.com&#41;)
[//]: # (Twitter at [@TypetronWeb]&#40;https://twitter.com/TypetronWeb&#41;)
[//]: # (Come and leave a question on [Reddit]&#40;https://www.reddit.com/r/typetron&#41;)
[//]: # (Join [the Facebook]&#40;https://www.facebook.com/Typetron-662589810876633/&#41; group)
[//]: # (Let's talk on [Slack]&#40;https://typetron.slack.com&#41;)

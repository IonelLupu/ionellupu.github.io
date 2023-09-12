---
title: "Async/Await Traps: The importance of await in try/catch blocks"
categories:
    - Utility
tags:
    - javascript
    - promises
image: /images/posts/async-await-try-catch.jpg
---

Is the following code going to crash your program or will it execute without any issues? Take your time to make a guess.

```js
async function canParkCar(car) {
    if ( !car.allowed ) {
        throw new Error(`${car.owner} is not allowed to park`)
    }
    
    // some async work
    
    return true
}

function parkCar(car) {
    try {
        return canParkCar(car)
    } catch ( error ) {
        console.log(error.message)
        return false
    }
}

const car1Parked = await parkCar({ owner : 'John', allowed : false })
if ( car1Parked ) {
    console.log(`car 1 parked`)
}

const car2Parked = await parkCar({ owner : 'Mark', allowed : true })
if ( car2Parked ) {
    console.log(`car 2 parked`)
}
```

I was confused to see it's actually crashing EVEN if there is a `try/catch` block intended to handle any thrown errors:

```bash
$ node app.js

file: ./app.js:3
        throw new Error(`${car.owner} is not allowed to park`)
              ^
Error: John is not allowed to park
```

My expectation was to see this in the console:

```bash
$ node app.js

John is not allowed to park
car 2 parked
```

---
One thing you need to be careful regarding `try/catch` blocks and promises is to properly use the `await` keyword
depending on where you want to catch the errors.
In the example above, at this line

```ts
return canParkCar(car)
``` 

the `parkCar` function finished its job by just
returning a promise. The promise wasn't resolved, so no error was thrown.

However, when you use `await` on this line

```ts
await parkCar({owner: 'John', allowed: false})
```

you are now waiting for the promise to resolve and implicitly waiting for any thrown errors. And because there is
no `try/catch` block around this `await` statement, the program crashes. The error bubbled up until the "root" of the
program.

The fix? Just await the `canParkCar` call:

```js
async function parkCar(car) {
    try {
        return await canParkCar(car)
    } catch ( error ) {
        console.log(error.message)
        return false
    }
}
```

Now, the line

```ts
return await canParkCar(car)
```

not only returns a promise, but it also waits for the promise to resolve. Any thrown errors will be handled there by
the `try/catch` block.

The program now has the expected output without any crashes:

```bash
$ node app.js

John is not allowed to park
car 2 parked
```

---
The key takeaway? Be careful when you want to return a promise, or you want to actually resolve it depending on
your `try/catch` blocks.

That's it for this quick tip.



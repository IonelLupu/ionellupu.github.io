---
title: "How I cleaned a ton of if statements from my Angular app"
categories:
  - Angular
tags:
  - Typescript
  - Clean Code
---
Maybe you don't make the same mistakes like I do in Angular, but I wanted to share with you how I removed a lot of `if` statements from my code by simply using parameters in methods.

Let's imagine you have an `UserComponent` that shows the user's name and there is a button to delete it:
```ts
import { Component, OnInit } from '@angular/core';

interface User {
    id: number;
    name: string;
}

@Component({
    selector: 'app-user',
    template: `
        <p>Welcome {{user.name}}!</p>
        <button (click)="removeUser()">Remove user</button>
    `
})
export class UserComponent implements OnInit {

    user?: User;

    async ngOnInit() {
        this.user = await fetchUser(1);
    }

    async removeUser() {
        if (this.user) { // this is what we will remove later
            await removeUser(this.user.id);
        }
    }
}
```

This works fine (assuming we've implemented the `fethUser` and `removeUser` functions) even if we build for prod with `ng build --prod`. 

But when working with Typescript, you will hear everyone saying to enable strict mode to protect developers against common errors. You can do it inside the `tsconfig.json` file:
```json
{
    "compilerOptions": {
        "strict": true
    }
}
```

The app still works, but if we are trying to build for production now, we will get the following error:

```sh
ERROR in src/app/user/user.component.ts.UserComponent.html(2,12): Object is possibly 'undefined'.
```

This is because Angular is trying to protect us against `undefined` values by checking our templates. In this case, the `user` variable has the type `User|undefined`. This is fine. We can fix this by using a condition in the template:
```html
    <ng-container *ngIf="user">
        <p>Welcome {{user.name}}!</p>
        <button (click)="removeUser()">Remove user</button>
    </ng-container>
```

This will fix all the errors, but we have two if conditions in our app and we are trying to get rid of most of them.

Type checking in templates work the same as in typescript: types are narrowed if a condition is used. This means that the `user` variable inside the `ng-container` will only have the type `User` because the `undefined` type was stripped by the `*ngIf` directive.

This means we can now pass the `user` as a parameter to the `removeUser` method and remove the if from there. This is the final component:

```ts
import { Component, OnInit } from '@angular/core';

interface User {
    id: number;
    name: string;
}

@Component({
    selector: 'app-user',
    template: `
        <ng-container *ngIf="user">
            <p>Welcome {{user.name}}!</p>
            <button (click)="removeUser(user)">Remove user</button>
        </ng-container>
    `
})
export class UserComponent implements OnInit {

    user?: User;

    async ngOnInit() {
        this.user = await fetchUser(1);
    }

    async removeUser(user: User) {
        await removeUser(user.id);
    }
}
```

Do you have any other sweet tips like this one? Share them in comments! 😁

_Follow me on [Twitter](https://twitter.com/IonelCLupu) for more awesome stuff like this._
_Check [Typetron](http://typetron.org/), the Node.js framework I am working on._

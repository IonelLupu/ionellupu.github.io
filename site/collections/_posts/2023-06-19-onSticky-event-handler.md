---
title: "'onSticky' Event handler"
categories:
  - Utility
tags:
  - CSS
  - typescript
  - javascript
image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wmtxvmwudbbxict196p8.gif
---

Have you ever wished to change the CSS properties when an element goes in the "sticky" mode on the page?

In this article we will be building an `onSticky` event handler that will trigger a callback when an element goes in and out of "sticky" mode, enabling us to do things like changing the CSS properties of that element.

We will build something similar to this:

![sticky element at the top of a search form](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pyg7utwy5jef2lgodfid.gif)

---

TLDR; If you don't wanna bother with the details, here is the code snippet:
```ts
function onSticky(selector: string, callback: (isSticky: boolean) => void) {
	const element = document.querySelector(selector)

	if (!element) {
		return
	}

	const observer = new IntersectionObserver(
		([event]) => callback(event.intersectionRatio < 1),
		{threshold: [1], rootMargin: '-1px 0px 0px 0px'}
	)
	observer.observe(element)

	return {observer, element}
}
```


---

Now, making an element sticky on the page is pretty straightforward: you just add the `position: sticky` and the `top`, `bottom`, `left` or `right` position CSS properties on your element.

For example, this will make your element stick at the top of the page:
```html
<div style="position: sticky; top: 0;">
    my sticky content
</div>
```

![sticky element at the top](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gffuohtpppcmozte24kw.gif)



You can also make it stick at the bottom of the page:

```html
<div style="position: sticky; bottom: 0;">
    my sticky content
</div>
```

![sticky element at the bottom](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kvzyjty063yyx574setc.gif)


Or, why not both:
```html
<div style="position: sticky; top: 0; bottom: 0;">
    my sticky content
</div>
```

![sticky element at the top and bottom](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hvybpzolmwhs6xil8gz5.gif)

But in some cases, you want to change the CSS properties of the sticky element when it sticks on the page. In my case, the search component had to stretch to fill the entire width of the screen.

This can be easily achieved using the `IntersectionObserver` (more info [here](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)) to check if an element goes in and out of the "sticky mode".

_In truth, to achieve our goal we'll be implementing a clever workaround. Keep reading to discover how we make this happen._


### The code

As you already saw, here is the function:
```ts
function onSticky(selector: string, callback: (isSticky: boolean) => void) {
	const element = document.querySelector(selector)

	if (!element) {
		return
	}

	const observer = new IntersectionObserver(
		([event]) => callback(event.intersectionRatio < 1),
		{threshold: [1], rootMargin: '-1px 0px 0px 0px'}
	)
	observer.observe(element)
	return {observer, element}
}
```

### The explanation

This function takes the CSS selector of the element you want to make sticky and a callback that is called whenever the element goes in and out of the sticky mode.  The `IntersectionObserver` takes two arguments:
- the handler which is called whenever the `threshold` is crossed, and
- a configuration object where you can specify the `threshold` and some other properties

The threshold (a number between 0 and 1) indicates at what percentage of the element's visibility the observer's callback should be executed. All right, this sounds complicated. But basically the callback will be triggered once when the element goes at a bit off screen and once when it gets back on the screen.

Now, you may wonder what is the `rootMargin: '-1px 0px 0px 0px'` about. This is "tricking" the browser to see the element be `top: -1px`. Why do we need it? Let's analyse the situation without it.

As I said above, the callback of the `IntersectionObserver` will be called when the element goes a bit off screen. Having `top: 0` with `position: sticky` will make the element be 100% visible on the screen thus never making the `IntersectionObserver` call the callback.

Adding `rootMargin: '-1px 0px 0px 0px'` will be used in calculating the position of the element making it seem the element is 1px off screen at the top. It won't change the position's margin on the page.


### Adding animations
With the onSticky event's callback, I can control which classes to toggle:
```ts
onSticky('.searchContainer', isSticky => {
	document.querySelector('.searchContainer')?.classList.toggle('stickyContainer', isSticky)
	document.querySelector('.searchComponent')?.classList.toggle('stickySearchComponent', isSticky)
})
```

```scss
.stickySearchComponent {
    border-radius: 0;
    padding: 12px 46px;
    box-shadow: 0 0 10px 18px rgba(0, 0, 0, 0.3);
}
.searchContainer {
    position: sticky;
    top: 0;
    transition: 0.1s all ease-in-out;
}
.stickyContainer {
    max-width: 100%;
}

```

I also added different animation times for the search component and it's parent container. This will give that nice effect of bounciness.

## Going deeper
#### Fixing the memory leak
In a real-world case, you may run into a memory leak issue if you use the example above. This is because we are not `.unobserving()` the element when our element is removed from the screen. It's not the case in the above example because we are not observing the element many times.

This issue is more common if you are using a frontend library or framework which destroys and re-renders the elements on the page many times. This will make the event handler run many times and add multiple observers on the target element.

You probably noticed this function returns an object with the observer and the element we are observing. We can use these to trigger the `.unobserve()` method, thereby freeing the memory and solving the memory leak:

```ts
const sticky = onSticky('.searchContainer', isSticky => {
    // "sticky" event handler
})

// use this to "unobserve" the element to free up the memory
sticky?.observer.unobserve(sticky.element)

```

#### Improving the DX (Developer Experience)

We can go even further and improve the DX of this function a bit by making it accept either a CSS selector string or an HTML Element instance as its first argument:

```ts
function onSticky(selector: string | HTMLElement, callback: (isSticky: boolean) => void) {
	const element = typeof selector === 'string' ? document.querySelector(selector) : selector

	if (!element) {
		return
	}

	const observer = new IntersectionObserver(
		([event]) => callback(event.intersectionRatio < 1),
		{threshold: [1], rootMargin: '-1px 0px 0px 0px'}
	)
	observer.observe(element)

	return {observer, element}
}
```

We will explore how to implement a custom hook on React, Angular and Vue in upcoming articles.

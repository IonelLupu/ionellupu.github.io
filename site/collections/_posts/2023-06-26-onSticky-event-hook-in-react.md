---
title: "'onSticky' Event hook in React"
categories:
  - Utility
tags:
  - react
  - CSS
  - typescript
  - javascript
image: /images/posts/sticky-react.jpg
---

In the previous article we discussed creating a custom event handler for the "element is sticky" event, which allowed us to do change the style of some elements, giving us this effect:

![final result](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wmtxvmwudbbxict196p8.gif)

--- 

In this article we will take that knowledge and create a custom React hook for handling the "element is sticky" event.

_TLDR, give me the code. I don't need the explanation:_
```tsx
function useSticky() {
	const ref = useRef<HTMLDivElement>(null)

	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		if (!ref.current) {
			return
		}

		const observer = new IntersectionObserver(
			([event]) => setIsSticky(event.intersectionRatio < 1),
			{threshold: [1], rootMargin: '-1px 0px 0px 0px',}
		)
		observer.observe(ref.current)

		return () => observer.disconnect()
	}, [])

	return {ref, isSticky}
}

// in your component

function MyPageComponent() {

	const {ref, isSticky} = useSticky()

	return (
		<div ref={ref} className={`${isSticky ? 'someClass' : ''}`}>
			{isSticky ? 'I am sticky' : 'I am not sticky'}
		</div>
	)
}
```

Looks rather similar with the vanilla one, but let's get into the explanation. There are some important differences.


---
### Going from vanilla to React
You can almost take the exact same vanilla function and use this directly in a React component like this:
```tsx
function MyPageComponent() {
	onSticky('.searchContainer', isSticky => {
		document.querySelector('.searchContainer')?.classList.toggle('stickyContainer', isSticky)
	})

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className="searchContainer">
				my sticky content
			</div>
		</div>
	)
}

```

But it won't work. This is because the `onSticky` function runs before any HTML is rendered on the page, making the code not find the element you are looking for.

To solve this issue, we can use the `useEffect` hook with no dependencies which will be called once, after the first render of the component:

```tsx
function MyPageComponent() {
	useEffect(() => {
		onSticky('.searchContainer', isSticky => {
			document.querySelector('.searchContainer')?.classList.toggle('stickyContainer', isSticky)
		})
	}, [])

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className="searchContainer">
				my sticky content
			</div>
		</div>
	)
}
```

Now, you probably noticed we are still using the native Javascript way of changing the classes of our elements. This is not wrong, but to preserve the consistency of a project that uses React, let's use the React's features instead. The React way is to add dynamic classes directly in the JXS code  similar to `<div className={isSticky ? 'someClass' : ''}></div>` where `isSticky` is just a boolean that will tell us if an element is sticky or not at the top of the screen.

Let's create some state for this boolean and use our callback to change its value:

```tsx

function MyPageComponent() {

	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		onSticky('.searchContainer', isStickyValue => {
			setIsSticky(isStickyValue)
		})
	}, [])

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className={`searchContainer ${isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
		</div>
	)
}
```

By adding the `isSticky` state in our code, we are able to remove the native Javascript class toggle code and use the `isSticky` variable to add or remove the `stickyContainer` class on our element.


> Quick refactor: Since we are only calling `setIsSticky(isStickyValue)` in the `onSticky` handler, we can refactor it to this: `onSticky('.searchContainer', setIsSticky)` to make the code a bit shorter.



## Going deeper

#### Fixing the memory leak

So far this looks pretty clean. We still have the same problem as we found in the previous article: the memory leak. If we were to use this code in a component that is removed and rendered many times, it will register the observer many many times, for each re-render. In order to fix this issue we need to unobserve our element once the main component is "destroyed". We can use the destructure feature of the useEffect to unobserve the element:

```tsx
function MyPageComponent() {

	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		const sticky = onSticky('.searchContainer', setIsSticky)
		
		return () => sticky?.observer.unobserve(sticky?.element)
	}, [])

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className={`searchContainer ${isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
		</div>
	)
}
```


#### Creating the custom hook

Now, we can keep this functionality as is, but we will always write the same boilerplate code when multiple sticky elements are in the project. Let's look at an example with two sticky elements:
```tsx
function MyPageComponent() {

	const [isSticky, setIsSticky] = useState(false)
	const [isAnotherSticky, setIsAnotherSticky] = useState(false)

	useEffect(() => {
		const sticky = onSticky('.searchContainer', setIsSticky)
		const anotherSticky = onSticky('.anotherSearchContainer', setIsAnotherSticky)

		return () => {
			sticky?.observer.unobserve(sticky?.element)
			anotherSticky?.observer.unobserve(anotherSticky?.element)
		}
	}, [])

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className={`searchContainer ${isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
			<div className={`anotherSearchContainer ${isAnotherSticky ? 'anotherStickyContainer' : ''}`}>
				another sticky content
			</div>
		</div>
	)
}
```

It doesn't look that bad, but we can do better. Let's extract the `useEffect` in our custom hook. This should clean our component a bit:

```tsx
function useSticky(selector: Parameters<typeof onSticky>[0]){
	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		const sticky = onSticky(selector, setIsSticky)

		return () => sticky?.observer.unobserve(sticky?.element)
	}, [selector])

	return isSticky
}

function MyPageComponent() {

	const isSticky = useSticky('.searchContainer')
	const isAnotherSticky = useSticky('.anotherSearchContainer')

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div className={`searchContainer ${isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
			<div className={`anotherSearchContainer ${isAnotherSticky ? 'anotherStickyContainer' : ''}`}>
				another sticky content
			</div>
		</div>
	)
}
```

This looks a lot better. We can now easily write and read what elements are sticky because the code is only one line.

#### Using refs instead of class names

One other improvement to make is to use React element references ([refs](https://react.dev/reference/react/useRef)) in order to not depend on having a class name on our element. In this case, a ref's value will be the same as having an element returned by `document.querySelector` method, but without using a class name:


```tsx
function useSticky(){
	const ref = useRef<HTMLDivElement>(null)
	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		if(!ref.current){
			return
		}
		const sticky = onSticky(ref.current, setIsSticky)

		return () => sticky?.observer.unobserve(sticky?.element)
	}, [])

	return {isSticky, ref}
}

function MyPageComponent() {

	const container = useSticky()
	const anotherContainer = useSticky()

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div ref={container.ref} className={`${container.isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
			<div ref={anotherContainer.ref} className={`${anotherContainer.isSticky ? 'anotherStickyContainer' : ''}`}>
				another sticky content
			</div>
		</div>
	)
}
```

As you can see, we don't need the `searchContainer` and `anotherSearchContainer` classes names anymore.

This final hook looks almost the same as the example in the TLDR section. The only difference is that the TLDR example has the `onSticky` function written directly, inline, in the hook.

#### Going even deeper
In our last example with refs, we introduced a small issue. If we inspect the Typescript type of the "ref" we will see it has the `HTMLDivElement` as its generic. Which means we can use our hook only on `div` HTML tags. This is not a problem when using class names, but if you want to keep the hook with ref, you might run into issues when you want to make some other HTML tag sticky: headings, paragraphs, spans, etc.

The fix is quite simple: let the developer choose the type of the element by making our hook accept a generic:
```tsx
function useSticky<Target extends HTMLElement>(){
	const ref = useRef<Target>(null)
	const [isSticky, setIsSticky] = useState(false)

	useEffect(() => {
		if(!ref.current){
			return
		}
		const sticky = onSticky(ref.current, setIsSticky)

		return () => sticky?.observer.unobserve(sticky?.element)
	}, [])

	return {isSticky, ref}
}

function MyPageComponent() {

	const container = useSticky<HTMLDivElement>()
	const anotherContainer = useSticky<HTMLSpanElement>()

	return (
		<div style={{height: 5000}}> {/* just so we can scroll a bit */}
			<div>Some header</div>
			<div ref={container.ref} className={`searchContainer ${container.isSticky ? 'stickyContainer' : ''}`}>
				my sticky content
			</div>
			<span ref={anotherContainer.ref} className={`anotherSearchContainer ${anotherContainer.isSticky ? 'anotherStickyContainer' : ''}`}>
				another sticky content
			</span>
		</div>
	)
}
```

Notice now we used a `span` for the second sticky container whereas it wasn't possible with our previous hook setup.

You can argue this looks a bit worse that the "class name" example above, but I will leave the decision to you about what version to use.

## Conclusion
Making elements sticky is usually straight forward, but if you keep an eye on the details, things might get complicated.

I believe we learned a lot of things in this article:
- using vanilla Javascript in React
- protecting against memory leaks
- did some quick refactoring
- used React refs
- and fixed the Typescript types.

Overall, a complex journey which improved our knowledge more than just making sticky elements.

[//]: # (---)

[//]: # ()
[//]: # (That's it from my side. See you in the next one where I will be building a similar thing in Angular, then Vue.)

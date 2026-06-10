# React Fundamentals

## What React Is

React is a JavaScript library for building user interfaces with components.

A component is a reusable piece of UI.

Example:

```tsx
function ProductCard() {
  return <div>Product</div>;
}
```

React helps manage:

- UI composition
- state-driven rendering
- reusable components
- event handling
- declarative updates

## Declarative UI

React is declarative.

Instead of telling the browser every DOM step:

```text
create div
set text
append button
attach listener
update text manually
```

You describe what UI should look like for a given state:

```tsx
function Counter({ count }: { count: number }) {
  return <p>Count: {count}</p>;
}
```

React updates the DOM when state changes.

## Components

Components should be:

- focused
- reusable
- predictable
- named clearly

Example:

```tsx
type ProductCardProps = {
  name: string;
  price: number;
};

function ProductCard({ name, price }: ProductCardProps) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{price}</p>
    </article>
  );
}
```

## Props

Props are inputs passed from parent to child.

```tsx
<ProductCard name="Handmade Bowl" price={1500} />
```

Props should be treated as read-only.

Interview answer:

> Props pass data down from parent components. They make components reusable and predictable.

## State

State is data that changes over time and causes UI updates.

Example:

```tsx
const [quantity, setQuantity] = useState(1);
```

When state changes, React re-renders the component.

Use state for:

- form values
- toggles
- selected tabs
- loading flags
- UI filters

Do not use state for values that can be derived from props or existing state.

## Events

React handles browser events:

```tsx
function AddToCartButton() {
  return (
    <button onClick={() => console.log("added")}>
      Add to cart
    </button>
  );
}
```

Common events:

- `onClick`
- `onChange`
- `onSubmit`
- `onBlur`

## Hooks

Hooks let function components use React features.

Common hooks:

- `useState`
- `useEffect`
- `useMemo`
- `useCallback`
- `useRef`

## `useEffect`

`useEffect` runs side effects.

Examples:

- subscribing to events
- syncing with browser APIs
- running code after render
- cleanup on unmount

Example:

```tsx
useEffect(() => {
  document.title = `Cart (${items.length})`;
}, [items.length]);
```

Do not put every data fetch in `useEffect` automatically in Next.js. Next.js has server-side and framework-level data-fetching patterns too.

## Derived State

Avoid storing values that can be calculated.

Bad:

```tsx
const [total, setTotal] = useState(price * quantity);
```

Better:

```tsx
const total = price * quantity;
```

## Component Composition

Composition means building complex UI from smaller components.

Example:

```tsx
<ProductPage>
  <ProductGallery />
  <ProductInfo />
  <AddToCartForm />
</ProductPage>
```

Composition is better than one giant component.

## Controlled Components

Controlled input:

```tsx
const [email, setEmail] = useState("");

return (
  <input
    value={email}
    onChange={(event) => setEmail(event.target.value)}
  />
);
```

React state controls the input value.

Useful for forms and validation.

## Common React Mistakes

- using state for derived values
- missing keys in lists
- putting too much logic in components
- fetching data in too many places
- ignoring loading/error states
- mutating state directly
- overusing global state
- making components too large

## Interview Explanation

If asked "What is React?", say:

> React is a component-based UI library. Components receive props, manage state, and render UI declaratively. When state changes, React re-renders the affected component tree. Hooks let function components use state, side effects, refs, memoization, and other React features.

## Connection To Artistry Cart

React appears throughout:

- product cards and lists
- navigation components
- seller dashboard tables
- forms for products, discounts, and events
- profile and checkout flows
- AI Vision interactive UI
- shared UI components

